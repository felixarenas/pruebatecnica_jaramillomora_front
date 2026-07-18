import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTable, InputTableRow } from './input-table';

describe('InputTable', () => {
  let component: InputTable;
  let fixture: ComponentFixture<InputTable>;

  const data: InputTableRow[] = [
    {
      nombre_grupo: '01 - Entry Level',
      tipo_agrupacion: 'Nivel/Piso',
      tipo_elemento: 'Barandilla',
      nombre_elemento: 'Barandilla:900mm Pipe',
      cuantos: 7,
    },
    {
      nombre_grupo: '01 - Entry Level',
      tipo_agrupacion: 'Nivel/Piso',
      tipo_elemento: 'Columna',
      nombre_elemento: 'M_Concrete-Round-Column:300mm',
      cuantos: 55,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTable],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('empareja encabezados con las claves del json', () => {
    fixture.componentRef.setInput('columns', ['Nombre', 'Tipo', 'Grupo', 'Cantidad']);
    fixture.componentRef.setInput('values', [
      'nombre_elemento',
      'tipo_elemento',
      'tipo_agrupacion',
      'cuantos',
    ]);
    fixture.detectChanges();

    expect(component['headers']()).toEqual([
      { label: 'Nombre', key: 'nombre_elemento' },
      { label: 'Tipo', key: 'tipo_elemento' },
      { label: 'Grupo', key: 'tipo_agrupacion' },
      { label: 'Cantidad', key: 'cuantos' },
    ]);
  });

  it('renderiza una fila por cada registro del json', () => {
    fixture.componentRef.setInput('title', 'Elementos por nivel');
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('columns', ['Nombre', 'Cantidad']);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('devuelve cadena vacía para claves inexistentes', () => {
    expect(component['cellValue'](data[0], 'inexistente')).toBe('');
    expect(component['cellValue'](data[0], 'nombre_elemento')).toBe('Barandilla:900mm Pipe');
  });
});
