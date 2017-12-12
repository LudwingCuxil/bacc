import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {ClienteDto} from '../shared/client/cliente-dto';
import {ValidationsService} from '../shared/services/validations.service';
import {NotificationsService} from 'angular2-notifications';
import {NavigationService} from '../shared/services/navigation.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {Authorization} from '../authorization/shared/authorization';
import {Section} from '../shared/section';
import {WebFormName} from '../shared/webform-name';
import {AccountDto} from '../shared/account/account-dto';
import {Router} from '@angular/router';
import {CatalogService} from '../shared/services/catalog.service';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlatformParameters} from '../shared/platform-parameters.enum';


@Component({
  selector: 'pl-account-created',
  templateUrl: './account-created.component.html',
  styleUrls: ['./account-created.component.css'],
  providers: [CatalogService]
})
export class AccountCreatedComponent implements OnInit {

  @Input() editMode = false;
  client: ClienteDto;
  authorization: Authorization;
  private busy: Promise<any>;
  account: AccountDto = new AccountDto();
  heading: string[] = ['account-response.identification', 'account-response.name', 'account-response.relation'];
  values: string[] = ['numeroIdentificacion', 'nombre', 'relacion'];

  constructor(public translate: TranslateService,
              private _validationService: ValidationsService,
              private notificationService: NotificationsService,
              private _navigationService: NavigationService,
              private _partialPersistService: PartialPersistService,
              private plParameterService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef,
              private catalogService: CatalogService,
              private router: Router) {
    if (this._partialPersistService.data) {
      this.account = this._partialPersistService.data;
      this.generateReport();
    }
  }

  ngOnInit() {
  }
  generateReport() {
    
     this.busy = this.plParameterService.getParameter(PlatformParameters.PARAM_EMPRSA);
     this.busy.then(business => {
      if (business) {
      this.busy = this.catalogService.getReportPost(this.account.accountResponse, business.valor);
      this.busy.then((response: any) => {
          console.log(response);
          window.open('data:application/pdf;base64,' + response._body);
      });
      }
    });
 
      
  }

  next(): void {
    if (this.editMode) {
    } else {
      this._navigationService.navigateTo(Section.customerCreated, Section.reference, true);
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.client);
    }
  }
  endAccount () {
    this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CUENTA]).catch(e => this.handleError(e));
    this.router.navigate(['/portalClients']);
  }
  handleError(error) {
    const err = JSON.parse(error._body);
    const tr = this.translate.instant('exceptionace.' + err.code);
  }

}
