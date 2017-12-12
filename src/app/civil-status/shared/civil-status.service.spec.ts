/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CivilStatusService } from './civil-status.service';

describe('CivilStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CivilStatusService]
    });
  });

  it('should ...', inject([CivilStatusService], (service: CivilStatusService) => {
    expect(service).toBeTruthy();
  }));
});
