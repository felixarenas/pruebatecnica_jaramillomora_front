/**
 * Estructura JSON de datos no gráficos de un modelo IFC
 * (Property Sets, cantidades, materiales, ubicación espacial).
 * Pensada para persistencia en BD y generación de estadísticas.
 */

export interface IfcPropertyMap {
  [propertyName: string]: string | number | boolean | null;
}

export interface IfcMaterialInfo {
  name: string;
  category?: string;
  layerThickness?: number | null;
}

export interface IfcElementNonGraphical {
  localId: number;
  globalId?: string | null;
  name?: string | null;
  description?: string | null;
  objectType?: string | null;
  tag?: string | null;
  category: string;
  storey?: string | null;
  /** Property Sets y Quantity Sets: { "Pset_WallCommon": { IsExternal: true }, ... } */
  propertySets: Record<string, IfcPropertyMap>;
  materials: IfcMaterialInfo[];
}

export interface IfcModelNonGraphicalSummary {
  totalElements: number;
  byCategory: Record<string, number>;
  byStorey: Record<string, number>;
  propertySetNames: string[];
  /** Conteo de valores numéricos por nombre de propiedad (útil para stats) */
  numericPropertyStats: Record<
    string,
    { count: number; sum: number; min: number; max: number }
  >;
}

export interface IfcModelNonGraphicalData {
  modelId: string;
  summary: IfcModelNonGraphicalSummary;
  elements: IfcElementNonGraphical[];
}

export interface IfcNonGraphicalExport {
  extractedAt: string;
  sourceUrl: string | null;
  models: IfcModelNonGraphicalData[];
  /** Resumen agregado de todos los modelos del visor */
  summary: IfcModelNonGraphicalSummary;
}
