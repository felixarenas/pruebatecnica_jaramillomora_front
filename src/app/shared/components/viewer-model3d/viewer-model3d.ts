import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import * as OBC from '@thatopen/components';
import type { FragmentsModel, ItemAttribute, ItemData } from '@thatopen/fragments';
import * as THREE from 'three';
import * as WEBIFC from 'web-ifc';
import type {
  IfcElementNonGraphical,
  IfcMaterialInfo,
  IfcModelNonGraphicalData,
  IfcModelNonGraphicalSummary,
  IfcNonGraphicalExport,
  IfcPropertyMap,
} from './viewer-model3d.models';
import { environment } from '../../../../environments/environment';

/**
 * Máximo que el binding WASM de web-ifc acepta para `MEMORY_LIMIT`
 * (`unsigned int` → [0, 4294967295]). 4 GiB exactos (4294967296) desborda.
 */
const WEB_IFC_UINT32_MAX = 0xffffffff;
/** Default de web-ifc si el env no es usable. */
const WEB_IFC_MEMORY_LIMIT_DEFAULT = 2 * 1024 * 1024 * 1024;

const gbToMemoryLimitBytes = (gb: number): number => {
  const bytes = Math.floor(Number(gb) * 1024 * 1024 * 1024);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return WEB_IFC_MEMORY_LIMIT_DEFAULT;
  }
  return Math.min(bytes, WEB_IFC_UINT32_MAX);
};

type ViewerWorld = OBC.SimpleWorld<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>;

const PROPERTY_DATA_BATCH_SIZE = 250;

/** WASM de web-ifc servido vía angular.json → /web-ifc/ */
const WEB_IFC_WASM_PATH = '/web-ifc/';
/** Worker de fragments servido vía angular.json → /fragments-worker/ */
const FRAGMENTS_WORKER_URL = '/fragments-worker/worker.mjs';

/**
 * Límite de heap de web-ifc al abrir el modelo.
 * Debe caber en `unsigned int` WASM; ver {@link gbToMemoryLimitBytes}.
 */
const WEB_IFC_MEMORY_LIMIT_BYTES = gbToMemoryLimitBytes(environment.maxMemoryRender);

/**
 * En apps empaquetadas (Angular/esbuild) el build multi-thread de web-ifc
 * crea `new Worker(undefined)` porque `_scriptDirectory` no existe →
 * `http://localhost:4200/undefined` (HTML) → Unexpected token '<'.
 * Forzamos single-thread; el WASM sigue sirviéndose desde {@link WEB_IFC_WASM_PATH}.
 */
let webIfcSingleThreadPatched = false;
function ensureWebIfcSingleThread(): void {
  if (webIfcSingleThreadPatched) {
    return;
  }
  const proto = WEBIFC.IfcAPI.prototype as WEBIFC.IfcAPI & {
    Init: (
      customLocateFileHandler?: WEBIFC.LocateFileHandlerFn,
      forceSingleThread?: boolean,
    ) => Promise<void>;
  };
  const originalInit = proto.Init;
  proto.Init = function (
    this: WEBIFC.IfcAPI,
    customLocateFileHandler?: WEBIFC.LocateFileHandlerFn,
    _forceSingleThread?: boolean,
  ): Promise<void> {
    return originalInit.call(this, customLocateFileHandler, true);
  };
  webIfcSingleThreadPatched = true;
}

const QUANTITY_VALUE_KEYS = [
  'LengthValue',
  'AreaValue',
  'VolumeValue',
  'CountValue',
  'WeightValue',
  'TimeValue',
  'NominalValue',
] as const;

/**
 * Visor IFC reutilizable basado en That Open Engine (`@thatopen/components`).
 *
 * - Carga modelos por URL HTTP
 * - Navegación de cámara (orbit / pan / zoom)
 * - Grid, fit-to-view, reset y fullscreen
 * - Extracción de Property Sets / datos no gráficos (`apiGetPropertySets`)
 */
@Component({
  selector: 'app-viewer-model3d',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzSpinModule, NzTooltipModule],
  templateUrl: './viewer-model3d.html',
  styleUrl: './viewer-model3d.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerModel3d implements OnDestroy {
  /** URL HTTP del archivo IFC (p. ej. http://host/storage/modelo.ifc) */
  readonly modelUrl = input<string | null>(null);
  /** Altura del contenedor 3D */
  readonly height = input<string>('560px');
  /** Muestra la barra de herramientas */
  readonly showToolbar = input(true);
  /** Color de fondo de la escena */
  readonly backgroundColor = input('#f5f5f5');

  readonly loaded = output<void>();
  readonly error = output<string>();
  readonly loadingChange = output<boolean>();
  /** Emite el JSON de datos no gráficos tras una extracción exitosa. */
  readonly propertySetsExtracted = output<IfcNonGraphicalExport>();

  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('viewerContainer');
  private readonly hostRef = viewChild<ElementRef<HTMLElement>>('viewerHost');

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isFullscreen = signal(false);
  readonly hasModel = signal(false);
  /** Último resultado de {@link apiGetPropertySets}. */
  readonly propertySetsData = signal<IfcNonGraphicalExport | null>(null);

  readonly loadingProgress = signal<number | null>(null);

  private components: OBC.Components | null = null;
  private world: ViewerWorld | null = null;
  private fragments: OBC.FragmentsManager | null = null;
  private ifcLoader: OBC.IfcLoader | null = null;
  private initialized = false;
  private loadSeq = 0;
  private cameraUpdateHandler: (() => void) | null = null;
  private fullscreenHandler = () => this.syncFullscreenState();

  constructor() {
    afterNextRender(() => {
      void this.initViewer().then(() => {
        const url = this.modelUrl();
        if (url) {
          void this.loadModel(url);
        }
      });
    });

    effect(() => {
      const url = this.modelUrl();
      if (!this.initialized) {
        return;
      }
      void this.loadModel(url);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    this.teardownViewer();
  }

  async fitToView(): Promise<void> {
    if (!this.world || !this.hasModel()) {
      return;
    }
    await this.world.camera.fitToItems();
  }

  async resetCamera(): Promise<void> {
    if (!this.world) {
      return;
    }
    await this.world.camera.controls.setLookAt(12, 8, 12, 0, 0, 0);
    if (this.hasModel()) {
      await this.world.camera.fitToItems();
    }
  }

  async toggleFullscreen(): Promise<void> {
    const host = this.hostRef()?.nativeElement;
    if (!host) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await host.requestFullscreen();
  }

  /**
   * Extrae Property Sets, cantidades, materiales y ubicación espacial
   * de todos los elementos con geometría del modelo cargado.
   *
   * @returns JSON tipado listo para persistir en BD / estadísticas, o `null` si no hay modelo.
   */
  async apiGetPropertySets(): Promise<IfcNonGraphicalExport | null> {
    if (!this.fragments || !this.hasModel()) {
      this.setError('No hay un modelo cargado para extraer Property Sets.');
      return null;
    }

    this.setLoading(true);
    try {
      const modelsData: IfcModelNonGraphicalData[] = [];

      for (const model of this.fragments.list.values()) {
        modelsData.push(await this.extractModelNonGraphicalData(model));
      }

      const exportData: IfcNonGraphicalExport = {
        extractedAt: new Date().toISOString(),
        sourceUrl: this.modelUrl(),
        models: modelsData,
        summary: this.mergeSummaries(modelsData.map((m) => m.summary)),
      };

      this.propertySetsData.set(exportData);
      this.propertySetsExtracted.emit(exportData);
      return exportData;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al extraer Property Sets del modelo';
      this.setError(message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  private async extractModelNonGraphicalData(
    model: FragmentsModel,
  ): Promise<IfcModelNonGraphicalData> {
    const localIds = await model.getItemsIdsWithGeometry();
    const categoryById = await this.buildCategoryMap(model);
    const elements: IfcElementNonGraphical[] = [];

    for (let i = 0; i < localIds.length; i += PROPERTY_DATA_BATCH_SIZE) {
      const batch = localIds.slice(i, i + PROPERTY_DATA_BATCH_SIZE);
      const itemsData = await model.getItemsData(batch, {
        attributesDefault: false,
        attributes: ['Name', 'GlobalId', 'Description', 'ObjectType', 'Tag'],
        relations: {
          IsDefinedBy: { attributes: true, relations: true },
          DefinesOccurrence: { attributes: false, relations: false },
          HasAssociations: { attributes: true, relations: true },
          AssociatedTo: { attributes: false, relations: false },
          ContainedInStructure: { attributes: true, relations: false },
        },
      });

      for (let j = 0; j < batch.length; j++) {
        const localId = batch[j];
        const data = itemsData[j];
        if (!data) {
          continue;
        }

        const propertySets = this.formatPropertySets(
          (data['IsDefinedBy'] as ItemData[] | undefined) ?? [],
        );
        const materials = this.formatMaterials(
          (data['HasAssociations'] as ItemData[] | undefined) ?? [],
        );
        const storey = this.resolveStoreyName(
          (data['ContainedInStructure'] as ItemData[] | undefined) ?? [],
        );

        elements.push({
          localId,
          globalId: this.asNullableString(this.attrValue(data['GlobalId'])),
          name: this.asNullableString(this.attrValue(data['Name'])),
          description: this.asNullableString(this.attrValue(data['Description'])),
          objectType: this.asNullableString(this.attrValue(data['ObjectType'])),
          tag: this.asNullableString(this.attrValue(data['Tag'])),
          category: categoryById.get(localId) ?? 'UNKNOWN',
          storey,
          propertySets,
          materials,
        });
      }
    }

    return {
      modelId: model.modelId,
      summary: this.buildSummary(elements),
      elements,
    };
  }

  private async buildCategoryMap(model: FragmentsModel): Promise<Map<number, string>> {
    const map = new Map<number, string>();
    const categories = await model.getCategories();
    if (!categories.length) {
      return map;
    }

    const byCategory = await model.getItemsOfCategories(
      categories.map((category) => new RegExp(`^${this.escapeRegExp(category)}$`)),
    );

    for (const [category, ids] of Object.entries(byCategory)) {
      for (const id of ids) {
        map.set(id, category);
      }
    }

    return map;
  }

  private formatPropertySets(rawPsets: ItemData[]): Record<string, IfcPropertyMap> {
    const result: Record<string, IfcPropertyMap> = {};

    for (const pset of rawPsets) {
      const psetName = this.asNullableString(this.attrValue(pset['Name']));
      if (!psetName) {
        continue;
      }

      const props: IfcPropertyMap = {};
      this.collectNamedValues(pset['HasProperties'], props);
      this.collectNamedValues(pset['Quantities'], props, true);

      if (Object.keys(props).length > 0) {
        result[psetName] = props;
      }
    }

    return result;
  }

  private collectNamedValues(
    items: ItemAttribute | ItemData[] | undefined,
    target: IfcPropertyMap,
    preferQuantityKeys = false,
  ): void {
    if (!Array.isArray(items)) {
      return;
    }

    for (const item of items) {
      const name = this.asNullableString(this.attrValue(item['Name']));
      if (!name) {
        continue;
      }

      const value = preferQuantityKeys
        ? this.readQuantityValue(item)
        : (this.attrValue(item['NominalValue']) ?? this.readQuantityValue(item));

      if (value !== undefined) {
        target[name] = value as string | number | boolean | null;
      }
    }
  }

  private readQuantityValue(item: ItemData): unknown {
    for (const key of QUANTITY_VALUE_KEYS) {
      const value = this.attrValue(item[key]);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  private formatMaterials(associations: ItemData[]): IfcMaterialInfo[] {
    const materials: IfcMaterialInfo[] = [];
    const seen = new Set<string>();

    for (const assoc of associations) {
      const relating = assoc['RelatingMaterial'];
      const candidates = Array.isArray(relating)
        ? relating
        : relating
          ? [relating as unknown as ItemData]
          : [];

      for (const material of candidates) {
        this.collectMaterialInfo(material, materials, seen);
      }
    }

    return materials;
  }

  private collectMaterialInfo(
    material: ItemData,
    out: IfcMaterialInfo[],
    seen: Set<string>,
  ): void {
    const name = this.asNullableString(this.attrValue(material['Name']));
    const category = this.asNullableString(this.attrValue(material['Category']));
    const layerThickness = this.asNullableNumber(
      this.attrValue(material['LayerThickness']),
    );

    if (name && !seen.has(name)) {
      seen.add(name);
      out.push({
        name,
        ...(category ? { category } : {}),
        ...(layerThickness !== null ? { layerThickness } : {}),
      });
    }

    // Capas / conjuntos de materiales anidados
    for (const key of ['Materials', 'MaterialLayers', 'ForLayerSet'] as const) {
      const nested = material[key];
      if (!Array.isArray(nested)) {
        continue;
      }
      for (const child of nested) {
        this.collectMaterialInfo(child, out, seen);
        const nestedMaterial = child['Material'];
        if (Array.isArray(nestedMaterial)) {
          for (const m of nestedMaterial) {
            this.collectMaterialInfo(m, out, seen);
          }
        }
      }
    }
  }

  private resolveStoreyName(containedIn: ItemData[]): string | null {
    for (const spatial of containedIn) {
      const name = this.asNullableString(this.attrValue(spatial['Name']));
      if (name) {
        return name;
      }
    }
    return null;
  }

  private buildSummary(elements: IfcElementNonGraphical[]): IfcModelNonGraphicalSummary {
    const byCategory: Record<string, number> = {};
    const byStorey: Record<string, number> = {};
    const psetNames = new Set<string>();
    const numericPropertyStats: IfcModelNonGraphicalSummary['numericPropertyStats'] = {};

    for (const el of elements) {
      byCategory[el.category] = (byCategory[el.category] ?? 0) + 1;

      const storeyKey = el.storey ?? 'Sin nivel';
      byStorey[storeyKey] = (byStorey[storeyKey] ?? 0) + 1;

      for (const [psetName, props] of Object.entries(el.propertySets)) {
        psetNames.add(psetName);
        for (const [propName, value] of Object.entries(props)) {
          if (typeof value !== 'number' || Number.isNaN(value)) {
            continue;
          }
          const key = `${psetName}.${propName}`;
          const current = numericPropertyStats[key];
          if (!current) {
            numericPropertyStats[key] = { count: 1, sum: value, min: value, max: value };
          } else {
            current.count += 1;
            current.sum += value;
            current.min = Math.min(current.min, value);
            current.max = Math.max(current.max, value);
          }
        }
      }
    }

    return {
      totalElements: elements.length,
      byCategory,
      byStorey,
      propertySetNames: [...psetNames].sort(),
      numericPropertyStats,
    };
  }

  private mergeSummaries(summaries: IfcModelNonGraphicalSummary[]): IfcModelNonGraphicalSummary {
    const merged: IfcModelNonGraphicalSummary = {
      totalElements: 0,
      byCategory: {},
      byStorey: {},
      propertySetNames: [],
      numericPropertyStats: {},
    };
    const psetNames = new Set<string>();

    for (const summary of summaries) {
      merged.totalElements += summary.totalElements;

      for (const [key, count] of Object.entries(summary.byCategory)) {
        merged.byCategory[key] = (merged.byCategory[key] ?? 0) + count;
      }
      for (const [key, count] of Object.entries(summary.byStorey)) {
        merged.byStorey[key] = (merged.byStorey[key] ?? 0) + count;
      }
      for (const name of summary.propertySetNames) {
        psetNames.add(name);
      }
      for (const [key, stats] of Object.entries(summary.numericPropertyStats)) {
        const current = merged.numericPropertyStats[key];
        if (!current) {
          merged.numericPropertyStats[key] = { ...stats };
        } else {
          current.count += stats.count;
          current.sum += stats.sum;
          current.min = Math.min(current.min, stats.min);
          current.max = Math.max(current.max, stats.max);
        }
      }
    }

    merged.propertySetNames = [...psetNames].sort();
    return merged;
  }

  private attrValue(data: ItemAttribute | ItemData[] | undefined): unknown {
    if (!data || Array.isArray(data)) {
      return undefined;
    }
    return 'value' in data ? data.value : undefined;
  }

  private asNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private asNullableNumber(value: unknown): number | null {
    return typeof value === 'number' && !Number.isNaN(value) ? value : null;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async initViewer(): Promise<void> {
    const container = this.containerRef()?.nativeElement;
    if (!container || this.initialized) {
      return;
    }

    if (!this.hasWebGLSupport()) {
      // En entornos sin WebGL (p. ej. tests) no bloqueamos la UI con un fatal hard crash.
      if (this.modelUrl()) {
        this.setError('WebGL no está disponible en este entorno.');
      }
      return;
    }

    try {
      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>();

      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, container);
      world.camera = new OBC.SimpleCamera(components);

      components.init();

      world.scene.setup({
        backgroundColor: new THREE.Color(this.backgroundColor()),
      });

      await world.camera.controls.setLookAt(12, 8, 12, 0, 0, 0);

      components.get(OBC.Grids).create(world);

      const fragments = components.get(OBC.FragmentsManager);
      // Worker local (evita unpkg + COEP). Misma origin → compatible con require-corp.
      fragments.init(FRAGMENTS_WORKER_URL);

      fragments.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        void fragments.core.update(true);
      });

      this.cameraUpdateHandler = () => {
        void fragments.core.update();
      };
      world.camera.controls.addEventListener('update', this.cameraUpdateHandler);

      ensureWebIfcSingleThread();

      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          // Servido desde node_modules/web-ifc vía angular.json → /web-ifc/
          path: WEB_IFC_WASM_PATH,
          absolute: true,
        },
        webIfc: {
          COORDINATE_TO_ORIGIN: true,
          MEMORY_LIMIT: WEB_IFC_MEMORY_LIMIT_BYTES,
        },
      });

      this.components = components;
      this.world = world;
      this.fragments = fragments;
      this.ifcLoader = ifcLoader;
      this.initialized = true;

      document.addEventListener('fullscreenchange', this.fullscreenHandler);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo inicializar el visor 3D';
      this.setError(message);
    }
  }

  private hasWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private async loadModel(url: string | null): Promise<void> {
    if (!this.initialized || !this.ifcLoader || !this.fragments || !this.world) {
      return;
    }

    const seq = ++this.loadSeq;
    await this.clearModels();

    if (!url?.trim()) {
      this.hasModel.set(false);
      this.setLoading(false);
      return;
    }

    this.setLoading(true);
    this.errorMessage.set(null);
    this.loadingProgress.set(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el IFC (${response.status})`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/html')) {
        throw new Error(
          'La URL no devolvió un IFC (recibió HTML). Comprueba que modelUrl apunte a /storage/….ifc',
        );
      }

      const raw = await response.arrayBuffer();
      const buffer = new Uint8Array(raw.byteLength);
      buffer.set(new Uint8Array(raw));

      if (!this.looksLikeIfc(buffer)) {
        throw new Error(
          'El archivo descargado no parece un IFC válido (cabecera ISO-10303-21 ausente).',
        );
      }

      if (seq !== this.loadSeq) {
        return;
      }

      const name = this.fileNameFromUrl(url);
      await this.ifcLoader.load(buffer, true, name, {
        processData: {
          // Callback de progreso
          progressCallback: (progress: number) => {
            // El progreso viene en decimal (0.0 a 1.0)
            const progressPercent = Math.round(progress * 100);
            this.loadingProgress.set(progressPercent);
            //this.loadingProgressSubject.next(progressPercent); //------------------------------>>>>>>>>>>>>>>><

            console.log(`📊 Progreso: ${progressPercent}%`);
          },
        }
      });

      if (seq !== this.loadSeq) {
        return;
      }

      this.hasModel.set(true);
      await this.world.camera.fitToItems();
      this.loaded.emit();
    } catch (err) {
      if (seq !== this.loadSeq) {
        return;
      }
      const message = this.formatLoadError(err);
      this.hasModel.set(false);
      this.setError(message);
    } finally {
      if (seq === this.loadSeq) {
        this.setLoading(false);
      }
    }
  }

  private async clearModels(): Promise<void> {
    if (!this.fragments) {
      return;
    }

    const models = [...this.fragments.list.values()];
    await Promise.all(
      models.map(async (model) => {
        this.world?.scene.three.remove(model.object);
        await model.dispose();
      }),
    );
  }

  private teardownViewer(): void {
    if (this.world && this.cameraUpdateHandler) {
      this.world.camera.controls.removeEventListener('update', this.cameraUpdateHandler);
    }
    this.cameraUpdateHandler = null;

    void this.clearModels().finally(() => {
      this.components?.dispose();
      this.components = null;
      this.world = null;
      this.fragments = null;
      this.ifcLoader = null;
      this.initialized = false;
    });
  }

  private formatLoadError(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err ?? '');
    const lower = raw.toLowerCase();
    if (
      lower.includes('bad_alloc') ||
      lower.includes('aborted') ||
      lower.includes('out of memory') ||
      lower.includes('memory access out of bounds')
    ) {
      return (
        'No hay memoria suficiente para procesar este IFC en el navegador. ' +
        'Prueba con un modelo más ligero o cierra otras pestañas.'
      );
    }
    if (lower.includes('index out of bounds')) {
      return (
        'Error al interpretar el IFC (índice fuera de rango). ' +
        'Suele ocurrir si la URL no apunta al archivo real o el IFC está corrupto.'
      );
    }
    return raw || 'Error al cargar el modelo IFC';
  }

  /** Comprueba cabecera STEP típica de IFC (`ISO-10303-21`). */
  private looksLikeIfc(buffer: Uint8Array): boolean {
    if (buffer.byteLength < 16) {
      return false;
    }
    const head = new TextDecoder('utf-8', { fatal: false })
      .decode(buffer.subarray(0, Math.min(buffer.byteLength, 128)))
      .trimStart()
      .toUpperCase();
    return head.startsWith('ISO-10303-21');
  }

  private setLoading(value: boolean): void {
    this.loading.set(value);
    this.loadingChange.emit(value);
  }

  private setError(message: string): void {
    this.errorMessage.set(message);
    this.error.emit(message);
  }

  private fileNameFromUrl(url: string): string {
    try {
      const path = new URL(url, window.location.origin).pathname;
      const base = path.split('/').pop() || 'modelo.ifc';
      return decodeURIComponent(base.replace(/\.[^.]+$/, '')) || 'modelo';
    } catch {
      return 'modelo';
    }
  }

  private syncFullscreenState(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }
}
