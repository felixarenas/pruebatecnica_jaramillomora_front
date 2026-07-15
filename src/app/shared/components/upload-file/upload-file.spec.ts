import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CloudUploadOutline, CloseOutline } from '@ant-design/icons-angular/icons';

import { UploadFile } from './upload-file';

describe('UploadFile', () => {
  let component: UploadFile;
  let fixture: ComponentFixture<UploadFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFile],
      providers: [provideNzIcons([CloudUploadOutline, CloseOutline])],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show selected plain file name', () => {
    const file = new File(['contenido'], 'datos.txt', { type: 'text/plain' });
    component.writeValue(file);
    fixture.detectChanges();

    expect(component.fileName()).toBe('datos.txt');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.upload-file__name');
    expect(input.value).toBe('datos.txt');
  });
});
