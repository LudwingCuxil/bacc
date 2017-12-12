/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoutryService } from './coutry.service';

describe('CoutryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoutryService]
    });
  });

  it('should ...', inject([CoutryService], (service: CoutryService) => {
    expect(service).toBeTruthy();
  }));
});
