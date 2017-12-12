import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginFundsSelectComponent } from './origin-funds-select.component';

describe('OriginFundsSelectComponent', () => {
  let component: OriginFundsSelectComponent;
  let fixture: ComponentFixture<OriginFundsSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OriginFundsSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginFundsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
