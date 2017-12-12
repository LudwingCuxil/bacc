import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCustomerComponent } from './data-customer.component';

describe('DataCustomerComponent', () => {
  let component: DataCustomerComponent;
  let fixture: ComponentFixture<DataCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
