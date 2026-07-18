import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTableGroupby } from './input-table-groupby';

describe('InputTableGroupby', () => {
  let component: InputTableGroupby;
  let fixture: ComponentFixture<InputTableGroupby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTableGroupby]
    })
    .compileComponents();

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
});
