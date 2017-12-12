/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TypeSocietyService } from './type-society.service';

describe('TypeSocietyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypeSocietyService]
    });
  });

  it('should ...', inject([TypeSocietyService], (service: TypeSocietyService) => {
    expect(service).toBeTruthy();
  }));
});
