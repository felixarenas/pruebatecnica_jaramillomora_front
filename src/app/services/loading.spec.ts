import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should toggle isLoading via signal', () => {
    service.isLoading.set(true);
    expect(service.isLoading()).toBe(true);

    service.isLoading.set(false);
    expect(service.isLoading()).toBe(false);
  });
});
