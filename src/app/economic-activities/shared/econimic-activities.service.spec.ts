/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EconimicActivitiesService } from './econimic-activities.service';

describe('EconimicActivitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EconimicActivitiesService]
    });
  });

  it('should ...', inject([EconimicActivitiesService], (service: EconimicActivitiesService) => {
    expect(service).toBeTruthy();
  }));
});
