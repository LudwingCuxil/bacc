import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsSupervisorComponent } from './operations-supervisor.component';

describe('OperationsSupervisorComponent', () => {
  let component: OperationsSupervisorComponent;
  let fixture: ComponentFixture<OperationsSupervisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsSupervisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
