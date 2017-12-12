import { Component } from '@angular/core';

/**
 * Dependencias de terceros
 */
import { NotificationsService } from 'angular2-notifications';
import { TranslateService } from 'ng2-translate';

/**
 * Dependencias internas
 */
import { SearchDataType } from '@byte/ng-components';

/**
 * Dependencias locales
 */
import { PromiseErrorHandlerService } from '../shared/promise-error-handler';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'pl-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  providers: [PromiseErrorHandlerService],
})
export class RoleComponent {
  public settings = environment.basicMaintenance.roles;
  public resourcePath = `${environment.apiUrl}${this.settings.resourcePath}`;

  constructor(
    private promiseErrorHandlerService: PromiseErrorHandlerService,
    private notificationService: NotificationsService,
    private translate: TranslateService) { }

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
