import {Component, OnInit, Input} from '@angular/core';
import {Menu, MenuType} from 'security-angular/src/app/menu';
import {SecurityService} from 'security-angular/src/app/security';
import {TranslateService} from "ng2-translate";
import {Location} from '@angular/common';
import {NavigationService} from '../shared/services/navigation.service';
import {Router} from "@angular/router";
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {WebFormName} from '../shared/webform-name';
import {NotificationsService} from 'angular2-notifications';

declare var $: any;

@Component({
  selector: 'cancel-confirmation',
  templateUrl: './cancel-confirmation.component.html',
  styleUrls: ['./cancel-confirmation.component.css']
})
export class CancelConfirmationComponent implements OnInit {

  @Input() account: boolean = false;

  constructor(private navigation: NavigationService, private router: Router,private _partialPersistService: PartialPersistService,
      private notificationService: NotificationsService,public translate: TranslateService,
      private _securityService: SecurityService) {


  }

  ngOnInit() {

  }

  public acceptConfirm() {
    $('#confirmModal').modal('hide');
    this.navigation.client.natural = false;
    this.navigation.client.legal = false;
    if (this.account) {
      this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CUENTA]).catch(e => this.handleError(e));
      this.navigation.account = JSON.parse(JSON.stringify(this.navigation.cleanAccount));
      this._securityService.deleteCookie('accountNumber');
      this._securityService.deleteCookie('client_signature');
      this._securityService.deleteCookie('client_mancomunado');
      this._securityService.deleteCookie('account_mancomunado');
      this._securityService.deleteCookie('account_signature');
      this.router.navigate(['/portalClients']);
    } else {
      this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).catch(e => this.handleError(e));
      this.router.navigate(['/create']);
    }
  }

  public cancelConfirm() {
    $('#confirmModal').modal('hide');
  }
  
  handleError(error) {
      const err = JSON.parse(error._body);
      const tr = this.translate.instant('exceptionace.' + err.code);
  }

}

