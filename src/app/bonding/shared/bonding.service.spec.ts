/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AccountOfficerService } from './account-officer.service';

describe('AccountOfficerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountOfficerService]
    });
  });

  it('should ...', inject([AccountOfficerService], (service: AccountOfficerService) => {
    expect(service).toBeTruthy();
  }));
});
