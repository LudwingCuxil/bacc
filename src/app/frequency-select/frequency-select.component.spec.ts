import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencySelectComponent } from './frequency-select.component';

describe('FrequencySelectComponent', () => {
  let component: FrequencySelectComponent;
  let fixture: ComponentFixture<FrequencySelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrequencySelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequencySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
