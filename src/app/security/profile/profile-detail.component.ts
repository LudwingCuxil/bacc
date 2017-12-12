import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {ProfileService} from './shared/profile.service';
import {RoleService} from '../role/shared/role.service';
import {Profile} from './shared/profile';
import {AbstractControl, FormGroup} from '@angular/forms';

@Component({

  selector: 'pl-detail-profiles',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})

export class ProfileDetailComponent implements OnInit {
  @Input() profile: Profile;
  @Input() modeView = true;
  @Input() modeEdit = false;
  @Input() modeCreate = false;
  @Input() modeDelete = false;
  @Input() individual = false;
  @Input() formGroup: FormGroup;
  private iterableRolesAdd: Array<number> = [];
  name: AbstractControl;
  description: AbstractControl;
  active: AbstractControl;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private profileService: ProfileService) {
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      const id = +params['id'];
      if (!isNaN(id)) {
        this.profileService.getDetailProfile(id)
          .then((profile: Profile) => this.profile = profile);
        this.individual = true;
        this.modeView = true;
      } else if (this.modeCreate) {
        // this.profile = new Profile();
      }
    });
    this.setupForm();
  }

  goBack(): void {
    this.location.back();
  }

  createProfile(): void {
    this.profileService.createProfile(this.profile)
      .then((profile: Profile) => this.ngOnInit());
  }

  setupForm(): void {
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.active = this.formGroup.controls['active'];
  }

}
