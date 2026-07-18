import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CloseOutline, CompressOutline, ExpandOutline } from '@ant-design/icons-angular/icons';

import { InputGraficBar } from './input-grafic-bar';

interface ChartPoint {
  label: string;
  value: number;
}

interface ChartGeometry {
  bars: { label: string; height: number }[];
  nodes: { label: string; y: number }[];
  linePath: string;
}

describe('InputGraficBar', () => {
  let component: InputGraficBar;
  let fixture: ComponentFixture<InputGraficBar>;

  const datos = [
    { nombre_elemento: 'Barandilla', cuantos: 7 },
    { nombre_elemento: 'Barandilla', cuantos: 6 },
    { nombre_elemento: 'Columna 300mm', cuantos: 55 },
    { nombre_elemento: 'Columna 450mm', cuantos: 6 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGraficBar],
      providers: [
        provideNoopAnimations(),
        provideNzIcons([ExpandOutline, CompressOutline, CloseOutline]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputGraficBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrega los valores por categoría del eje X', () => {
    fixture.componentRef.setInput('data', datos);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    const points = (component as unknown as { points: () => ChartPoint[] }).points();
    expect(points.length).toBe(3);
    const barandilla = points.find((p) => p.label === 'Barandilla');
    expect(barandilla?.value).toBe(13);
  });

  it('ordena el resumen por los valores más pronunciados', () => {
    fixture.componentRef.setInput('data', datos);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    const summary = (component as unknown as { summary: () => ChartPoint[] }).summary();
    expect(summary[0].label).toBe('Columna 300mm');
    expect(summary[0].value).toBe(55);
  });

  it('genera la ruta de la curva en modo lineas', () => {
    fixture.componentRef.setInput('data', datos);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.componentRef.setInput('tipo', 'lineas');
    fixture.detectChanges();

    const chart = (component as unknown as { chart: () => ChartGeometry }).chart();
    expect(chart.linePath.startsWith('M')).toBe(true);
    expect(chart.linePath).toContain('C');
    expect(chart.nodes.length).toBe(3);
  });

  it('no genera geometría cuando faltan datos', () => {
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    expect((component as unknown as { hasData: () => boolean }).hasData()).toBe(false);
  });

  it('alterna la pantalla completa y la cierra con Escape', () => {
    const api = component as unknown as {
      isFullscreen: () => boolean;
      toggleFullscreen: () => void;
      onEscape: () => void;
    };

    expect(api.isFullscreen()).toBe(false);
    api.toggleFullscreen();
    expect(api.isFullscreen()).toBe(true);

    api.onEscape();
    expect(api.isFullscreen()).toBe(false);
  });
});
