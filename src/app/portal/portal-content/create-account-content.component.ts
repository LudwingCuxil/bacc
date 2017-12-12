import {
  AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap-byte';
import {NavigationService} from '../../shared/services/navigation.service';
import {Subject} from 'rxjs/Subject';
import {SecurityService} from 'security-angular/src/app';
import {ClientService} from '../../client/shared/client.service';
import {Navigation} from '../../shared/navigation';
import {CreateAccountHeaderComponent} from '../portal-header/create-account-header.component';
import {Section} from '../../shared/section';
import {isUndefined} from 'util';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {PlParameterService} from 'app/pl-parameter/shared/pl-parameter.service';
import {ClientInformationService} from '../portal-header/shared/client-information.service';
import {AccountsServices} from '../../shared/services/accounts.service';
import {AccountDto} from '../../shared/account/account-dto';
import {PlatformParameters} from '../../shared/platform-parameters.enum';

@Component({
  selector: 'pl-create-account-content',
  templateUrl: './create-account-content.component.html',
  styleUrls: ['./portal-content.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbTabset, ClientService, PlParameterService, ClientInformationService, AccountsServices]
})
export class CreateAccountContentComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild(NgbTabset) accountTab;
  @ViewChild(CreateAccountHeaderComponent) header: CreateAccountHeaderComponent;
  subscription: Subject<any>;
  identification;
  section = Section;
  account: AccountDto;
  openingDate: Date;

  constructor(private config: NgbTabset, private _navigationService: NavigationService, private _partialPersistServce: PartialPersistService,
              private clientInformation: ClientInformationService,
              private _accountsService: AccountsServices,
              private _parameterService: PlParameterService,
              private _securityService: SecurityService,
              private _changeDetectorRef: ChangeDetectorRef) {
    config.destroyOnHide = false;
    _navigationService.cleanUp();

    this._partialPersistServce.data = new AccountDto();
    this.account = this._partialPersistServce.data;
    this.identification = this._securityService.getCookie('identification');
    this.clientInformation.getInformationByClient(this.identification).then((response) => {
      this.account.cliente = response;
      this.notifyHeader();
    }).catch(e => console.error(e));

    this.clientInformation.getInformationClient(this.identification).then((response) => {
      this.account.clientInformation = response;
      this.notifyHeader();
    }).catch(e => console.error(e));

    this._parameterService.getParameter(PlatformParameters.PARAM_EMPRSA).then(business => {
      if (business) {
        this.account.business = business;
        this._accountsService.getOperationDate(business.valor).then(operation => {
          if (operation) {
            this.header.fechaAlta = operation;
            this.openingDate = operation;
            this.notifyHeader();
          }
        });
      }
    });

  }

  ngOnInit() {
    if (this._navigationService) {
      this.subscription = this._navigationService.navigationChange.subscribe(navigation => {
        this.accountTab.select(navigation.section);
        this.header.updateAccount();
      });
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActiveSection(section: Section): Navigation {
    if (!isUndefined(section)) {
      // this.portal.select('natural');
      // this.personType

      const navigationObject = this._navigationService.isActiveSection(section);
      if (!navigationObject) {
        return;
      }
      return navigationObject;
    }
  }

  navigateSection(navigate: any) {
    this._navigationService.navigateTo(navigate.prevSection, navigate.section, navigate.status);
    this.accountTab.select(navigate.section);
  }


  notifyHeader(): void {
    this.header.updateAccount();
  }
}
