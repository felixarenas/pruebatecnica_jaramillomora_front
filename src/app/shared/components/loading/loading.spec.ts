import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingService } from '../../../services/loading';
import { Loading } from './loading';

describe('Loading', () => {
  let component: Loading;
  let fixture: ComponentFixture<Loading>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loading],
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    loadingService.isLoading.set(false);

    fixture = TestBed.createComponent(Loading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide overlay when isLoading is false', () => {
    loadingService.isLoading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading-overlay')).toBeNull();
  });

  it('should show overlay when isLoading is true', () => {
    loadingService.isLoading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading-overlay')).toBeTruthy();
  });
});
