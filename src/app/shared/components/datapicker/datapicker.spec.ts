import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datapicker } from './datapicker';

describe('Datapicker', () => {
  let component: Datapicker;
  let fixture: ComponentFixture<Datapicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datapicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datapicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
