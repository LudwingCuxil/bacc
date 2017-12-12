/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BusinessExecutiveService } from './business-executive.service';

describe('BusinessExecutiveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BusinessExecutiveService]
    });
  });

  it('should ...', inject([BusinessExecutiveService], (service: BusinessExecutiveService) => {
    expect(service).toBeTruthy();
  }));
});
