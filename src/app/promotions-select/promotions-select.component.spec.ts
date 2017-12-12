import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionsSelectComponent } from './promotions-select.component';

describe('PromotionsSelectComponent', () => {
  let component: PromotionsSelectComponent;
  let fixture: ComponentFixture<PromotionsSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionsSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
