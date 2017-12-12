/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EconomicSectorService } from './economic-sector.service';

describe('EconomicSectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EconomicSectorService]
    });
  });

  it('should ...', inject([EconomicSectorService], (service: EconomicSectorService) => {
    expect(service).toBeTruthy();
  }));
});
