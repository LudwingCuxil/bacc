import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodPaymentComponent } from './method-payment.component';

describe('MethodPaymentComponent', () => {
  let component: MethodPaymentComponent;
  let fixture: ComponentFixture<MethodPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MethodPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MethodPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
