/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AccountantDataService } from './accountant-data.service';

describe('AccountantDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountantDataService]
    });
  });

  it('should ...', inject([AccountantDataService], (service: AccountantDataService) => {
    expect(service).toBeTruthy();
  }));
});
