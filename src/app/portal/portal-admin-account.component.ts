import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';

import {AccountInformationService} from './portal-header/shared/account-information.service';
import {SecurityService} from 'security-angular/src/app';
import {isUndefined} from 'util';
import {ClientInformationService} from './portal-header/shared/client-information.service';
import {AvatarInformationService} from './portal-header/shared/avatar-information.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {AccountDto} from '../shared/account/account-dto';
import {PlParameterService} from 'app/pl-parameter/shared/pl-parameter.service';
import {PlatformParameters} from '../shared/platform-parameters.enum';

@Component({
  selector: 'pl-portal-admin-account',
  templateUrl: './portal-admin-account.component.html',
  styleUrls: ['./portal-admin.component.css'],
  providers: [AccountInformationService,
    ClientInformationService,
    AvatarInformationService,
    PlParameterService],
  encapsulation: ViewEncapsulation.None
})
export class PortalAdminAccountComponent implements OnInit {

  private accountNumber: string;
  accountInformation: any = {};

  clientAvatar: any = {};
  clientInformation: any = {};
  validClientInformation: any = {};
  private identification: string;
  busy: Promise<any>;

  constructor(private route: ActivatedRoute,
              private accountInformationService: AccountInformationService,
              private clientInformationService: ClientInformationService,
              private avatarInformationService: AvatarInformationService,
              private _securityService: SecurityService,
              private _partialPersistServce: PartialPersistService,
              private _parameterService: PlParameterService) {
  }

  async ngOnInit() {
    this.identification = this._securityService.getCookie('identification');
    this.accountNumber = this._securityService.getCookie('accountNumber');
    this.busy = this.accountInformationService.getAccountSummay(this.accountNumber);
    this.busy.then(accountSummary => {
      this.accountInformation = accountSummary;
    });
    this.clientInformationService.getInformationByClient(this.identification);
    this.busy.then(identification => {
      this.validClientInformation = identification;
    });
    const business = await this._parameterService.getParameter(PlatformParameters.PARAM_EMPRSA);
    const response = await this.clientInformationService.getInformationClient(this.identification);
    this._partialPersistServce.data = new AccountDto();
    this._partialPersistServce.data.clientInformation = response;
    if (business) {
      this._partialPersistServce.data.business = business;
    }
  }
}
