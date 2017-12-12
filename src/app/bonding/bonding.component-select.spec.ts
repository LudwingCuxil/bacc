/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BondingComponent } from './account-officer.component';

describe('BondingComponent', () => {
  let component: BondingComponent;
  let fixture: ComponentFixture<BondingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BondingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BondingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
