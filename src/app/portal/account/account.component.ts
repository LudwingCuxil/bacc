import {Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';

import {ProductType} from 'backoffice-ace/src/app/product/shared/product-type.model';
import {AccountCustom} from 'backoffice-ace/src/app/core/deposits-core/shared/account-custon.model';

import {SecurityService} from 'security-angular/src/app';

import {AccountSummary} from '../../shared/account/account-summary';

import {AccountsService} from './shared/accounts.service';
import {ProductTypeClientService} from './shared/product-type-account.service';

import {AccountRelationship} from 'backoffice-ace/src/app/core/deposits-core/shared/account-relationship.enum';

import {AccountsComponent as ParentPortalDetailComponent} from 'backoffice-ace/src/app/core/deposits-core/accounts/accounts.component';
import { PlParameterService } from '../../pl-parameter/shared/pl-parameter.service';
import { PlatformParameters } from 'app/shared/platform-parameters.enum';
import {NavigationService} from '../../shared/services/navigation.service';
declare var $: any;

@Component({
  selector: 'pl-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [AccountsService, ProductTypeClientService]
})
export class AccountComponent extends ParentPortalDetailComponent implements OnInit {

  @Output() notifyFixed = new EventEmitter();
  @Input() accountCustom: AccountCustom[] = undefined;
  @Input() inactive = false;
  param_plfijo: number = 3;

  public accountSumamry: AccountSummary[] = [];

  public identification;
  // @Input() identification: string = '1';
  @Input() currency = 'LPS,DLS';

  accordionFill: { productType: ProductType, accounts: AccountSummary[] }[] = [];
  public accountRelationShip = AccountRelationship;
  public productTypes;
  public estadoDetalle: string;

  constructor(private router: Router,
              private accountsClientService: AccountsService,
              private detailProductService: ProductTypeClientService,
              private detailNotification: NotificationsService,
              private detailtranslate: TranslateService,
              private _securityService: SecurityService,
              private parameterService: PlParameterService,
              private navigationService: NavigationService) {
    super(accountsClientService, detailProductService, detailNotification, detailtranslate);
  }

  ngOnInit() {
    super.ngOnInit();

    const status = new AccountCustom(1, 'status', null);
    const number = new AccountCustom(2, 'number', null);
    const name = new AccountCustom(3, 'name', null);
    const relation = new AccountCustom(4, 'relation', null);
    const productType = new AccountCustom(5, 'product-type', null);
    const currency = new AccountCustom(6, 'currency', null);
    // let availableBalance = new AccountCustom(5, "availableBalance", null);
    // let totalBalance = new AccountCustom(6, "totalBalance", null);

    this.accountCustom = [status, number, name, relation, productType, currency];
    this.fixedTerm();
  }

  loadAll(): void {
    this.identification = this._securityService.getCookie('identification');
    this.busy = this.accountsClientService.getAccountsByClient(this.identification, this.currency);
    this.busy.then((accounts) => {
      this.accounts = accounts;
      this.accountsOriginal = accounts;
      this.accountSumamry = accounts;
      this.detailProductService.getProductType().then(productTypes => {
        this.productTypes = productTypes;
        this.fillAccordion();
      });
    }, (e: any) => this.handleError(e));
  }

  fillAccordion(): void {
    // console.log(this.productTypes);

    this.accordionFill = [];
    for (const product of this.productTypes) {
      const newproduct = new ProductType();
      newproduct.clase = 0;
      newproduct.codigo = product.codigo;
      newproduct.descripcion = '';
      newproduct.etiqueta = 0;
      newproduct.id = product.digitoIdentificador;
      newproduct.institucionId = 0;
      newproduct.logo = 0;
      newproduct.mascara = '';
      newproduct.nombre = product.descripcion;
      newproduct.sistemaOrigenId = 0;


      this.accordionFill.push({
        productType: newproduct, accounts: this.accountSumamry.filter(acct => {
          return acct.tipoProducto === parseInt(newproduct.codigo, 10);
        })
      });
    }
  }

  getProductTypeDescription(productType: number): string {
    const find = this.productTypes.find(type => {
      return parseInt(type.codigo, 10) === productType;
    });
    return find !== undefined ? find.descripcion : productType + '';
  }

  getDetail($event) {
    const link = ['/product-selection'];
    this.router.navigate(link).then(() => {
    });
  }

  goToAccount(accountSummary: AccountSummary): void {
    if (accountSummary.tipoProducto == this.param_plfijo) {
        this.navigationService.account.fixed = true;
    } else { 
        this.navigationService.account.fixed = false;
    }
    this.router.navigate(['/portalAccounts']);
    this._securityService.setCookie('accountNumber', accountSummary.numeroCuenta, <any>'Session');
    this._securityService.setCookie('accountId', JSON.stringify(accountSummary.id), <any>'Session');
  }

  toCreateAccount() {
    this.router.navigate(['/portalCreateAccount']);
  }
  
  fixedTerm(){
    this.parameterService.getParameter(PlatformParameters.PARAM_PLFIJO).then(param => {
      this.param_plfijo = +(param.valor);
    });   
  }
}
