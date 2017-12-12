/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TypeInstitutionService } from './type-institution.service';

describe('TypeInstitutionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypeInstitutionService]
    });
  });

  it('should ...', inject([TypeInstitutionService], (service: TypeInstitutionService) => {
    expect(service).toBeTruthy();
  }));
});
