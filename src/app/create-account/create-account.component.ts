import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ClientComponent} from 'backoffice-ace/src/app/core/client-core/client.component';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

import {SecurityService} from 'security-angular/src/app/security';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {WebFormName} from '../shared/webform-name';
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {LockServices} from '../shared/services/lock.service';
declare var $: any;
@Component({
  selector: 'pl-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [LockServices]
})
export class CreateAccountComponent implements OnInit {

  private clientURL = environment.apiUrl + '/api/'; // URL to web api

  @ViewChild(ClientComponent) buscador: ClientComponent;

  clientsEmpty = false;

  constructor(private router: Router,
              private _securityService: SecurityService,
              private partialPersistService: PartialPersistService,
              private notificationService: NotificationsService,
              private lockService: LockServices,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.buscador.setEndPoint(this.clientURL);
    this.buscador.update(this.clientURL, 'A');
    this.checkForPartial();
    this.lockService.deleteAllLock();
  }

  checkForPartial(): void {
    this.partialPersistService.checkPartial(WebFormName[WebFormName.WEBFORM_CUENTA]).then(response => {
      let clientSummary = this._securityService.getCookie('client_signature');
      let clientSummaryJoint = this._securityService.getCookie('client_mancomunado');
      if (clientSummary || clientSummaryJoint) {
//        this.loadPartial();
      } else {
        $('#loadPartialModal').modal('show');
      }
    }).catch((e) => {
      if (e.status !== 404) {
        this.handleError(e);
      }
    });
  }

  loadPartial(): void {
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      this._securityService.setCookie('exist_account', JSON.stringify(true), <any>'Session');
      let identification = this._securityService.getCookie('identification');
      if (!identification) {
        this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
          if (account) {
            this._securityService.setCookie('identification', account.cliente.id.identificacion, <any>'Session');
            this.router.navigate(['/portalCreateAccount']);
          }
        }).catch(e => {
          this.handleError(e);
        });
      } else {
        this.router.navigate(['/portalCreateAccount']);
      }
    }).catch(e => {
      this.handleError(e);
    });
  }

  deletePartial() {
    this.partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CUENTA]).catch(e => this.handleError);
  }

  clientSelection(event) {
    this.lockService.aquireLock(event.id).then((item) => {
      this.router.navigate(['/portalClients']);
      this._securityService.setCookie('identification', event.id.identificacion, <any>'Session');
    }).catch(e => this.handleError(e));
  }

  toCreateClient() {
    let joint = this._securityService.getCookie('account_mancomunado');
    let param = joint ? joint : this._securityService.getCookie('account_signature');
    if (param) {
      let link = ['/portalCreateClient', param];
      this.router.navigate(link);
    } else {
      this.router.navigate(['/portalCreateClient']);
    }
  }

  tableEmpty($event) {
    const clients = $event;
    this.clientsEmpty = (clients.length >= 0);
  }

  handleError(error: any): void {
    if (error.status === 428) {
    } else if (error.status === 403) {
      if (error._body !== '' && JSON.parse(error._body).code === 'core.clientes.exception.0100153') {
        if (!($('#continueModal').data('bs.modal') || {}).isShown) {
          $('#continueModal').modal('show');
        }
      }
      return;
    } else if (error._body !== '') {
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
      return;
    } else if (error.status === 404) {
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

}
