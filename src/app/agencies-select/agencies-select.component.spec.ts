import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciesSelectComponent } from './agencies-select.component';

describe('AgenciesSelectComponent', () => {
  let component: AgenciesSelectComponent;
  let fixture: ComponentFixture<AgenciesSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgenciesSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgenciesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
