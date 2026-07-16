import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AimOutline, CompressOutline, ExpandOutline, ReloadOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ViewerModel3d } from './viewer-model3d';

describe('ViewerModel3d', () => {
  let component: ViewerModel3d;
  let fixture: ComponentFixture<ViewerModel3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerModel3d],
      providers: [
        provideNoopAnimations(),
        provideNzIcons([AimOutline, ReloadOutline, ExpandOutline, CompressOutline]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerModel3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when modelUrl is null', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Seleccione un archivo IFC');
  });

  it('apiGetPropertySets should return null when no model is loaded', async () => {
    const result = await component.apiGetPropertySets();
    expect(result).toBeNull();
    expect(component.errorMessage()).toContain('No hay un modelo cargado');
  });
});
