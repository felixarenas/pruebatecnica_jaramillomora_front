import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SaveOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { Button } from './button';

@Component({
  standalone: true,
  imports: [Button],
  template: `
    <app-button
      [label]="label()"
      [icon]="icon()"
      [loading]="loading()"
      [disabled]="disabled()"
      [loadingText]="loadingText()"
      (clicked)="onClicked()"
    >
      Proyectado
    </app-button>
  `,
})
class HostButton {
  readonly label = signal('Guardar');
  readonly icon = signal('save');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly loadingText = signal('Procesando…');
  clickedCount = 0;

  onClicked(): void {
    this.clickedCount += 1;
  }
}

describe('Button', () => {
  let fixture: ComponentFixture<HostButton>;
  let host: HostButton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostButton],
      providers: [provideNoopAnimations(), provideNzIcons([SaveOutline])],
    }).compileComponents();

    fixture = TestBed.createComponent(HostButton);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should render label and projected content', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Guardar');
    expect(text).toContain('Proyectado');
  });

  it('should emit clicked when enabled', () => {
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', new MouseEvent('click'));
    expect(host.clickedCount).toBe(1);
  });

  it('should not emit clicked when disabled', async () => {
    host.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', new MouseEvent('click'));
    expect(host.clickedCount).toBe(0);
  });

  it('should show loading text while loading', async () => {
    host.loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Procesando…');
    expect(text).not.toContain('Guardar');
  });
});
