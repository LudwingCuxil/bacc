/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SubSectorService } from './sub-sector.service';

describe('SubSectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubSectorService]
    });
  });

  it('should ...', inject([SubSectorService], (service: SubSectorService) => {
    expect(service).toBeTruthy();
  }));
});
