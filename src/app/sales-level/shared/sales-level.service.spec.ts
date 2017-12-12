/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SalesLevelService } from './sales-level.service';

describe('SalesLevelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesLevelService]
    });
  });

  it('should ...', inject([SalesLevelService], (service: SalesLevelService) => {
    expect(service).toBeTruthy();
  }));
});
