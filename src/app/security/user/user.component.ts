import { Component, OnInit } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';

/**
 * Dependencias locales
 */
import { environment } from '../../../environments/environment';
import { ProfileService } from '../profile/shared/profile.service';
import { PromiseErrorHandlerService } from '../shared/promise-error-handler';


declare var $: any;

@Component({
  selector: 'pl-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [ProfileService, PromiseErrorHandlerService],
})
export class UserComponent implements OnInit {
  public settings = environment.basicMaintenance.users;
  public resourcePath = `${environment.apiUrl}${this.settings.resourcePath}`;

  constructor(
    private profileService: ProfileService,
    private promiseErrorHandlerService: PromiseErrorHandlerService,
    private notificationService: NotificationsService,
  ) { }

  private mapToValidOptions(profile) {
    return {
      key: profile.nombre,
      value: profile.nombre,
    };
  }

  ngOnInit(): void {
    const schema = environment.basicMaintenance.users.schema;
    const profiles = <any>schema[schema.length - 1];

    this.profileService.getProfiles({number: 0, size: 1500})
      .then((response: any) => response.content.map(this.mapToValidOptions))
      .then((profilesResponse) => profiles.options = profilesResponse);
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
