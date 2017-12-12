import { Component, Input, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Currency} from 'backoffice-ace/src/app/currency/shared/currency.model';
import {Account} from 'backoffice-ace/src/app/core/deposits-core/shared/account';
import {MethodPayment} from '../method-payment/shared/method-payment.model';
import {Section} from '../shared/section';
import {SecurityService} from 'security-angular/src/app';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {NavigationService} from '../shared/services/navigation.service';
import {NotificationsService} from 'angular2-notifications';
import { AccountDto } from '../shared/account/account-dto';
import { FormSectionInterface } from '../shared/form-section-interface';
import { AccountsServices } from '../shared/services/accounts.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import { WebFormName } from '../shared/webform-name';
import { Frecuencia } from '../shared/account/frequency';
import { PlParameterService } from '../pl-parameter/shared/pl-parameter.service';
import { PlatformParameters } from 'app/shared/platform-parameters.enum';
import { forceDestructuring } from '../util/destructuring';
import { AccountFormSection } from '../shared/account/accountFormSection.enum';
declare var $: any;

@Component({
  selector: 'pl-administration-interests',
  templateUrl: './administration-interests.component.html',
  styleUrls: ['./administration-interests.component.css'],
  providers: [AccountsServices, PlParameterService]
})
export class AdministrationInterestsComponent implements OnInit, FormSectionInterface {
  @Input() editMode = false;
  @Input() cancelAccount = false;
  busy: Promise<any>;
  account: AccountDto;
  tmpAccount: AccountDto;
  currency: Currency;
  authorization: Authorization;
  authorized: Authorized;
  disabledField = false;
  accountNumber: string;
  productSelection: any;

  param_plfijo: number = 3;
  param_notcre: number = 2;

  // FormProperties
  formGroup: FormGroup;
  methodPayment: AbstractControl;
  accountPayment: AbstractControl;
  frequency: AbstractControl;

  constructor(private formBuilder: FormBuilder,
              private partialPersistService: PartialPersistService,
              private securityService: SecurityService,
              private navigationService: NavigationService,
              private accountService: AccountsServices,
              private parameterService: PlParameterService,
              private notificationService: NotificationsService) {

    this.parameterService.getParameter(PlatformParameters.PARAM_PLFIJO).then(param => {
      this.param_plfijo = +(param.valor);
    });

    this.parameterService.getParameter(PlatformParameters.PARAM_NOTCRE).then(param => {
      this.param_notcre = +(param.valor);
    });

    this.setUpForm();
    if (this.partialPersistService.data) {
      this.account = this.partialPersistService.data;
      if (this.account.producto && this.account.producto.id) {
        this.productSelection = {product: this.account.producto.id.producto, subProduct: this.account.producto.id.subProducto, currency: this.account.producto.moneda};
      }
    }
  }

  async ngOnInit() {
    if (this.editMode) {
      this.account = new AccountDto();
      this.accountNumber = this.securityService.getCookie('accountNumber');
      let account = await this.accountService.getAccountBySection(this.accountNumber, 'datoInteres');
      if (account) {
        this.tmpAccount = <AccountDto> JSON.parse(JSON.stringify(account));
        this.account = account;
        this.productSelection = {product: this.account.producto.id.producto, subProduct: this.account.producto.id.subProducto, currency: this.account.producto.moneda, accountId: this.account.datoInteres.cuentaPago.id};
        this.change();
      }
    } else {
      if (!this.account) {
        this.loadPartial();
      }
    }
  }

  // Form
  setUpForm() {
    this.formGroup = this.formBuilder.group({
      accountPayment: [{value: new Account(), disabled: this.disabledField}, Validators.required],
      methodPayment: [{value: new MethodPayment(), disabled: this.disabledField}, Validators.required],
      frequency: [{value: new Frecuencia(), disabled: this.disabledField}]
    });
    const {controls} = this.formGroup;
    this.methodPayment = controls['methodPayment'];
    this.accountPayment = controls['accountPayment'];
    this.frequency = controls['frequency'];
  }

  enableControls() {
    this.disabledField = false;
    this.methodPayment.enable();
    this.accountPayment.enable();
    this.frequency.enable();
  }

  // Form Section Interface
  next(): void {
    if (!this.editMode) {
      if (Section.administrationInterests === this.partialPersistService.extraData['accountSection'][0])
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      this.navigationService.navigateTo(Section.administrationInterests, this.partialPersistService.extraData['accountSection'][0], true);
    }
  }

  validateForm(): void {
    this.partialSave();
  }

  change(): void {
    forceDestructuring(this.formGroup.controls, this);

    this.disabledField = !this.disabledField;
    if (this.disabledField) {
      this.methodPayment.disable();
      this.accountPayment.disable();
    } else {
      this.methodPayment.enable();
      this.accountPayment.enable();
    }
    this.frequency.disable();
  }

  cancel() {
    if (!this.editMode) {
      $('#confirmModal').modal('show');
    } else {
      this.account = JSON.parse(JSON.stringify(this.tmpAccount));
      this.change();
    }
  }

  loadPartial(): void {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      if (account) {
        this.account = account;
      } else {
        this.partialPersistService.data = new AccountDto();
        this.account = this.partialPersistService.data;
      }
    }).catch(e => {
      this.account = new AccountDto();
    });
  }

  partialSave(): void {
    if (this.editMode) {
      this.busy = this.accountService.putAccountBySection(this.account, this.accountNumber, 'datoInteres');
      this.busy.then((account) => {
        this.bindHide();
        this.account = account;
        this.change();
        this.successUpdate('Administration Interests', 'Has been updated successfully');
      }, (e: any) => this.handleError(e));
    } else {
      this.navigationService.currentSections.find(item => item.section === Section.administrationInterests).status = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then(() => {
        this.next();
      }).catch(e => {
        this.handleError(e);
        this.navigationService.currentSections.find(item => item.section === Section.administrationInterests).status = false;
      });
    }
  }

  // Error Handling
  handleError(error: any): void {
    if (error.status === 428) {
      let authorization = '';
      if (error._body !== '') {
        try {
          this.authorization = JSON.parse(error._body);
          if (!($('#authorizationModal').data('bs.modal') || {}).isShown) {
            $('#authorizationModal').modal('show');
          }
        } catch (e) {
          authorization = error._body;
        }
      }
    } else if (error._body !== '') {
      this.bindHide();
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  // Event Handling
  onAccountChange(account: Account) {
    if (account) {
      this.account.datoInteres.cuentaPago = account;
    }
  }

  onFrequencyChange(frequency: Frecuencia) {
    if (frequency) {
      this.account.datoInteres.frecuencia = frequency;
    }
  }

  onMethodChange(method: MethodPayment) {
    if (method) {
      if (this.accountPayment.invalid) {
        this.accountPayment.setErrors(null);
      }
      this.account.datoInteres.formaPago = method;
    }
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.DATO_INTERES];
      if (this.account.autorizaciones === null)
        this.account.autorizaciones = [];
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
    } else {
      this.account.autorizaciones = [];
      this.bindHide();
    }
  }
}
