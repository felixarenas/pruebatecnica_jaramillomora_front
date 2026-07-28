import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTableGroupby } from './input-table-groupby';

describe('InputTableGroupby', () => {
  let component: InputTableGroupby;
  let fixture: ComponentFixture<InputTableGroupby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTableGroupby],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTableGroupby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrupa las filas por el campo indicado en groupby', () => {
    fixture.componentRef.setInput('data', [
      { nombre_nivel: '01 - Entry Level', nombre_elemento: 'Barandilla', cuantos: 7 },
      { nombre_nivel: '01 - Entry Level', nombre_elemento: 'Borde de losa', cuantos: 2 },
      { nombre_nivel: '02 - Second Level', nombre_elemento: 'Curved Beam', cuantos: 1 },
    ]);
    fixture.componentRef.setInput('columns', ['nombre', 'cantidad']);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.componentRef.setInput('groupby', ['nombre_nivel']);
    fixture.detectChanges();

    const groups = (component as unknown as { groups: () => { label: string; rows: unknown[] }[] }).groups();
    expect(groups.length).toBe(2);
    expect(groups[0].label).toBe('01 - Entry Level');
    expect(groups[0].rows.length).toBe(2);
    expect(groups[1].label).toBe('02 - Second Level');
    expect(groups[1].rows.length).toBe(1);
  });

  it('devuelve un único grupo sin etiqueta cuando no hay groupby', () => {
    fixture.componentRef.setInput('data', [
      { nombre_elemento: 'Barandilla', cuantos: 7 },
    ]);
    fixture.componentRef.setInput('groupby', []);
    fixture.detectChanges();

    const groups = (component as unknown as { groups: () => { label: string; rows: unknown[] }[] }).groups();
    expect(groups.length).toBe(1);
    expect(groups[0].label).toBe('');
    expect(groups[0].rows.length).toBe(1);
  });

  it('oculta las filas al cargar cuando groupsCollapsedByDefault es true', () => {
    fixture.componentRef.setInput('data', [
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'A', cuantos: 1 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'B', cuantos: 2 },
    ]);
    fixture.componentRef.setInput('groupby', ['nombre_nivel']);
    fixture.componentRef.setInput('groupsCollapsedByDefault', true);
    fixture.detectChanges();

    const cmp = component as unknown as {
      groups: () => { label: string; rows: unknown[] }[];
      paginatedRows: (group: { label: string; rows: unknown[] }) => unknown[];
      isGroupCollapsed: (group: { label: string; rows: unknown[] }) => boolean;
    };
    const group = cmp.groups()[0];

    expect(cmp.isGroupCollapsed(group)).toBe(true);
    expect(cmp.paginatedRows(group).length).toBe(0);
  });

  it('muestra las filas al cargar cuando groupsCollapsedByDefault es false', () => {
    fixture.componentRef.setInput('data', [
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'A', cuantos: 1 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'B', cuantos: 2 },
    ]);
    fixture.componentRef.setInput('groupby', ['nombre_nivel']);
    fixture.componentRef.setInput('groupsCollapsedByDefault', false);
    fixture.detectChanges();

    const cmp = component as unknown as {
      groups: () => { label: string; rows: unknown[] }[];
      paginatedRows: (group: { label: string; rows: unknown[] }) => unknown[];
      isGroupCollapsed: (group: { label: string; rows: unknown[] }) => boolean;
    };
    const group = cmp.groups()[0];

    expect(cmp.isGroupCollapsed(group)).toBe(false);
    expect(cmp.paginatedRows(group).length).toBe(2);
  });

  it('pagina las filas de cada grupo según pageSize', () => {
    fixture.componentRef.setInput('data', [
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'A', cuantos: 1 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'B', cuantos: 2 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'C', cuantos: 3 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'D', cuantos: 4 },
    ]);
    fixture.componentRef.setInput('columns', ['nombre', 'cantidad']);
    fixture.componentRef.setInput('values', ['nombre_elemento', 'cuantos']);
    fixture.componentRef.setInput('groupby', ['nombre_nivel']);
    fixture.componentRef.setInput('pageSize', 2);
    fixture.componentRef.setInput('groupsCollapsedByDefault', false);
    fixture.detectChanges();

    const cmp = component as unknown as {
      groups: () => { label: string; rows: unknown[] }[];
      paginatedRows: (group: { label: string; rows: unknown[] }) => unknown[];
      setGroupPage: (group: { label: string; rows: unknown[] }, page: number) => void;
    };
    const group = cmp.groups()[0];

    expect(cmp.paginatedRows(group).length).toBe(2);

    cmp.setGroupPage(group, 2);
    fixture.detectChanges();

    expect(cmp.paginatedRows(group).length).toBe(2);
    expect((cmp.paginatedRows(group)[0] as { nombre_elemento: string }).nombre_elemento).toBe('C');
  });

  it('expande las filas del grupo al pulsar el botón de toggle', () => {
    fixture.componentRef.setInput('data', [
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'A', cuantos: 1 },
      { nombre_nivel: 'Nivel 1', nombre_elemento: 'B', cuantos: 2 },
    ]);
    fixture.componentRef.setInput('groupby', ['nombre_nivel']);
    fixture.componentRef.setInput('groupsCollapsedByDefault', true);
    fixture.detectChanges();

    const cmp = component as unknown as {
      groups: () => { label: string; rows: unknown[] }[];
      toggleGroupCollapse: (group: { label: string; rows: unknown[] }) => void;
      paginatedRows: (group: { label: string; rows: unknown[] }) => unknown[];
      isGroupCollapsed: (group: { label: string; rows: unknown[] }) => boolean;
    };
    const group = cmp.groups()[0];

    expect(cmp.paginatedRows(group).length).toBe(0);

    cmp.toggleGroupCollapse(group);
    fixture.detectChanges();

    expect(cmp.isGroupCollapsed(group)).toBe(false);
    expect(cmp.paginatedRows(group).length).toBe(2);

    cmp.toggleGroupCollapse(group);
    fixture.detectChanges();

    expect(cmp.isGroupCollapsed(group)).toBe(true);
    expect(cmp.paginatedRows(group).length).toBe(0);
  });
});
