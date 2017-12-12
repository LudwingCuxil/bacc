import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {AbstractControl, FormGroup} from '@angular/forms';
import {RoleService} from './shared/role.service';
import {Role, TypeRole} from './shared/role';
@Component({
  selector: 'pl-detail-roles',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})

export class RoleDetailComponent implements OnInit, OnChanges {
  @Input() role: Role;
  @Input() modeView = true;
  @Input() modeEdit = false;
  @Input() modeCreate = false;
  @Input() modeDelete = false;
  @Input() individual = false;
  @Input() formGroup: FormGroup;
  controlName = 'type';
  typeRole = TypeRole;
  name: AbstractControl;
  description: AbstractControl;
  type: AbstractControl;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private roleService: RoleService) {
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      const id = +params['id'];
      if (!isNaN(id)) {
        this.roleService.getDetailRole(id)
          .then(role => this.role = role);
        this.individual = true;
        this.modeView = true;
      } else if (this.modeCreate) {
        // this.role = new Role();
      }
    });
    this.setupForm();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  goBack(): void {
    this.location.back();
  }

  createRole(): void {
    this.roleService.createRole(this.role)
      .then(role => this.ngOnInit());
  }

  setupForm(): void {
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
  }
}
