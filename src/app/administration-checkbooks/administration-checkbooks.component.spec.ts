import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationCheckbooksComponent } from './administration-checkbooks.component';

describe('AdministrationCheckbooksComponent', () => {
  let component: AdministrationCheckbooksComponent;
  let fixture: ComponentFixture<AdministrationCheckbooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationCheckbooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationCheckbooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
