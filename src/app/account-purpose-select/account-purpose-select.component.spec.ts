import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPurposeSelectComponent } from './account-purpose-select.component';

describe('AccountPurposeSelectComponent', () => {
  let component: AccountPurposeSelectComponent;
  let fixture: ComponentFixture<AccountPurposeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPurposeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPurposeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
