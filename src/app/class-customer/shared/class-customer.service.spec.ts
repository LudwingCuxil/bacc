/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClassCustomerService } from './class-customer.service';

describe('ClassCustomerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClassCustomerService]
    });
  });

  it('should ...', inject([ClassCustomerService], (service: ClassCustomerService) => {
    expect(service).toBeTruthy();
  }));
});
