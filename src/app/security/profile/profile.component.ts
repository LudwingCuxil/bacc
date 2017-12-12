import { ChangeDetectorRef, Component, ViewChild, OnInit } from '@angular/core';

/**
 * Dependencias de terceros
 */
import { NotificationsService } from 'angular2-notifications';
import { TranslateService } from 'ng2-translate';


/**
 * Dependencias Internas
 */
import { BasicMaintenanceComponent } from '@byte/ng-forms/src/forms/basic-maintenance/basic-maintenance.component';

/**
 * Dependencias locales
 */
import { Profile } from './shared/profile';
import { ProfileService } from './shared/profile.service';
import { environment } from '../../../environments/environment';
import { RoleDualListComponent } from '../role/role-dual-list.component';
import { PromiseErrorHandlerService } from '../shared/promise-error-handler';

declare var $: any;

@Component({
  selector: 'pl-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ ProfileService, PromiseErrorHandlerService ],
})
export class ProfileComponent implements OnInit {
  @ViewChild(RoleDualListComponent) roleDualList;
  @ViewChild(BasicMaintenanceComponent) basicMaintenanceComponent;

  public settings = environment.basicMaintenance.profiles;
  public resourcePath = `${environment.apiUrl}${this.settings.resourcePath}`;
  profile: Profile;
  updateSucessful = false;
  associatedRoles: number[] = [];
  newRoles: number[] = [];
  removedRoles: number[] = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private profileService: ProfileService,
    private translate: TranslateService,
    private promiseErrorHandlerService: PromiseErrorHandlerService,
    private notificationService: NotificationsService,) { }

  ngOnInit() {
    $('#associateRolesModal').on('show.bs.modal', () => {
      this.getRolesByProfile();
    });
  }

  getRolesByProfile(): void {
    this.associatedRoles = [];

    this.profileService.getRolesByProfile(this.profile.id).then(roles => {
      for (const value of roles) {
        this.associatedRoles.push(value.id as number);
      }

      this.roleDualList.loadAll();
    });
  }

  getDetail(profile: Profile): void {


    this.profile = JSON.parse(JSON.stringify(profile));
  }

  reset(): void {
    this.profile = undefined;
    this.updateSucessful = false;
    this.newRoles = [];
    this.removedRoles = [];
  }

  associateRoles() {

    if (this.newRoles.length > 0) {
      this.profileService.addRoles(this.profile.id, this.newRoles).then(response => {
        this.notificationService.success('Rol Asociado!', 'El Rol Se asocio correctamente');
        this.basicMaintenanceComponent.loadResources();

        this.reset();
      }, this.promiseErrorHandlerService.getHTTPErrorHandler());
    }

    if (this.removedRoles.length > 0) {
      this.profileService.deleteRoles(this.profile.id, this.removedRoles).then(response => {
        this.notificationService.success('Canal Desasociado!', 'Los canales se han desasociado correctamente');
        this.basicMaintenanceComponent.loadResources();

        this.reset();
      }, this.promiseErrorHandlerService.getHTTPErrorHandler());
    }
  }

  onRoleAdded(event: any) {
    const foundIndex = this.removedRoles.findIndex(data => data === event.id);

    if (foundIndex !== -1) {
      this.removedRoles.splice(foundIndex, 1);
    }

    const currentListIndex = this.associatedRoles.findIndex(data => data === event.id);
    const currentNewListIndex = this.newRoles.findIndex(data => data === event.id);

    if (currentListIndex === -1 && currentNewListIndex === -1) {
      this.newRoles.push(event.id);
    }

    this._changeDetectorRef.detectChanges();
  }

  onRoleRemoved(event: any) {
    const foundIndex = this.newRoles.findIndex(data => data === event.id);

    if (foundIndex !== -1) {
      this.newRoles.splice(foundIndex, 1);
    }

    const currentListIndex = this.associatedRoles.findIndex(data => data === event.id);
    const currentNewListIndex = this.removedRoles.findIndex(data => data === event.id);

    if (currentListIndex !== -1 && currentNewListIndex === -1) {
      this.removedRoles.push(event.id);
    }

    this._changeDetectorRef.detectChanges();
  }

  onNotify(event) {
    switch (event.eventName) {
      case 'create':
      case 'update':
      case 'delete':
        this.notificationService.success('', 'Operacion completada exitosamente');
        break;
      case 'error':
        this.promiseErrorHandlerService.handleHTTPError(event.data && event.data.error);
        break;
    }
  }
}
