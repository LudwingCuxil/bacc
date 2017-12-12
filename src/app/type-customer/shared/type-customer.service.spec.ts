/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TypeCustomerService } from './type-customer.service';

describe('TypeCustomerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypeCustomerService]
    });
  });

  it('should ...', inject([TypeCustomerService], (service: TypeCustomerService) => {
    expect(service).toBeTruthy();
  }));
});
