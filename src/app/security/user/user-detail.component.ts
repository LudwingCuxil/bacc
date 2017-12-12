import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {UserService} from './shared/user.service';
import {User} from './shared/user';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Profile} from '../profile/shared/profile';
@Component({
  selector: 'pl-detail-users',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})

export class UserDetailComponent implements OnInit {
  @Input() user: User;
  @Input() modeView = true;
  @Input() modeEdit = false;
  @Input() modeCreate = false;
  @Input() modeDelete = false;
  @Input() individual = false;

  @Input() formGroup: FormGroup;
  username: AbstractControl;
  firstName: AbstractControl;
  secondName: AbstractControl;
  surname: AbstractControl;
  secondSurname: AbstractControl;
  email: AbstractControl;
  password: AbstractControl;
  status: AbstractControl;
  profile: AbstractControl;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private userService: UserService,
              public formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      const id = +params['id'];
      if (!isNaN(id)) {
        this.userService.getDetailUser(id)
          .then((user: User) => this.user = user);
        this.individual = true;
        this.modeView = true;
      } else if (this.modeCreate) {
        // this.user = new User();
      }
    });
    this.setUpForm();
  }

  selectProfile(profile: Profile): void {
    console.log(profile);
    if (profile.nombre) {
      this.user.defaultProfileName = profile.nombre;
    }
  }

  goBack(): void {
    this.location.back();
  }

  createUser(): void {
    this.userService.createUser(this.user)
      .then((user: User) => this.ngOnInit());
  }

  setUpForm() {
    this.username = this.formGroup.controls['username'];
    this.firstName = this.formGroup.controls['firstName'];
    this.secondName = this.formGroup.controls['secondName'];
    this.surname = this.formGroup.controls['surname'];
    this.secondSurname = this.formGroup.controls['secondSurname'];
    this.email = this.formGroup.controls['email'];
    this.password = this.formGroup.controls['password'];
    this.status = this.formGroup.controls['status'];
    this.profile = this.formGroup.controls['profile'];
  }

}
