import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessGraficIfc } from './process-grafic-ifc';

describe('ProcessGraficIfc', () => {
  let component: ProcessGraficIfc;
  let fixture: ComponentFixture<ProcessGraficIfc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessGraficIfc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessGraficIfc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
