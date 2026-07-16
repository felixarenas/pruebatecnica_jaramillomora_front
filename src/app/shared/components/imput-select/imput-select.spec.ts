import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ImputSelect } from './imput-select';

@Component({
  standalone: true,
  imports: [ImputSelect, ReactiveFormsModule],
  template: `
    <app-imput-select
      label="Tipo"
      [options]="options"
      [formControl]="control"
    />
  `,
})
class HostSelect {
  options = [
    { value: 1, label: 'CC' },
    { value: 2, label: 'NIT' },
  ];
  control = new FormControl<number | null>(null);
}

describe('ImputSelect', () => {
  let fixture: ComponentFixture<HostSelect>;
  let host: HostSelect;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostSelect],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostSelect);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should write form control value into the select', async () => {
    host.control.setValue(2);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('app-imput-select');
    expect(select).toBeTruthy();
    expect(host.control.value).toBe(2);
  });

  it('should respect disabled state from the form control', async () => {
    host.control.disable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.control.disabled).toBe(true);
  });
});
