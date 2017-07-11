import { TestBed, inject } from '@angular/core/testing';

import { BreakpointsService } from './breakpoints.service';

describe('BreakpointsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BreakpointsService]
    });
  });

  it('should be created', inject([BreakpointsService], (service: BreakpointsService) => {
    expect(service).toBeTruthy();
  }));
});
