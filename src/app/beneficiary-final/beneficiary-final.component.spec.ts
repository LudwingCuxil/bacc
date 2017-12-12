import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryFinalComponent } from './beneficiary-final.component';

describe('BeneficiaryFinalComponent', () => {
  let component: BeneficiaryFinalComponent;
  let fixture: ComponentFixture<BeneficiaryFinalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeneficiaryFinalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiaryFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
