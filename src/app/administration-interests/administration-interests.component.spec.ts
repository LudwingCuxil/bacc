import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationInterestsComponent } from './administration-interests.component';

describe('AdministrationInterestsComponent', () => {
  let component: AdministrationInterestsComponent;
  let fixture: ComponentFixture<AdministrationInterestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationInterestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationInterestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
