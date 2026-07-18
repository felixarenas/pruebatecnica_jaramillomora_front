import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CloseOutline, CompressOutline, ExpandOutline } from '@ant-design/icons-angular/icons';

import { InputGraficCircle } from './input-grafic-circle';

interface PieSlice {
  label: string;
  value: number;
  percent: number;
  path: string;
  color: string;
}

describe('InputGraficCircle', () => {
  let component: InputGraficCircle;
  let fixture: ComponentFixture<InputGraficCircle>;

  const datos = [
    { nombre_elemento: 'Barandilla', cuantos: 7 },
    { nombre_elemento: 'Barandilla', cuantos: 3 },
    { nombre_elemento: 'Columna', cuantos: 30 },
    { nombre_elemento: 'Losa', cuantos: 10 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGraficCircle],
      providers: [
        provideNoopAnimations(),
        provideNzIcons([ExpandOutline, CompressOutline, CloseOutline]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputGraficCircle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrega valores y calcula porcentajes de cada porción', () => {
    fixture.componentRef.setInput('data', datos);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    const slices = (component as unknown as { slices: () => PieSlice[] }).slices();
    expect(slices.length).toBe(3);
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    expect(total).toBe(50);
    const barandilla = slices.find((s) => s.label === 'Barandilla');
    expect(barandilla?.value).toBe(10);
    expect(barandilla?.percent).toBe(20);
    expect(slices.every((s) => s.path.length > 0)).toBe(true);
  });

  it('ordena el resumen por los valores más pronunciados', () => {
    fixture.componentRef.setInput('data', datos);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    const summary = (component as unknown as { summary: () => PieSlice[] }).summary();
    expect(summary[0].label).toBe('Columna');
    expect(summary[0].value).toBe(30);
  });

  it('no genera porciones cuando faltan datos', () => {
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
