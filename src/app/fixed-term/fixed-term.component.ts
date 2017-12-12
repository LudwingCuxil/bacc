import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, AfterViewInit, DoCheck } from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {CatalogService} from '../shared/services/catalog.service';
import {OpeningDocument, OpeningDocumentService, OpeningDocumentMod} from '../shared/client/documento-apertura';
import {SecurityService} from 'security-angular/src/app';
import {ChangeService} from '../shared/services/change.service';
import {PerfilEconomico} from '../shared/client/perfil-economico';
import {ServicioElectronico} from '../shared/account/electronic-service';
import {AccountDto} from '../shared/account/account-dto';
import {AccountsServices} from '../shared/services/accounts.service';
import { FormaPagoInteres } from '../shared/account/interest-method-payment';
import {AccountSummary} from '../shared/account/account-summary';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import { PlParameterService } from '../pl-parameter/shared/pl-parameter.service';
import { PlatformParameters } from 'app/shared/platform-parameters.enum';
import {PlazoFijo} from '../shared/account/fixed-term';
import {ProductService} from '../product-select/shared/product.service';
declare var $: any;
import 'script.js';
declare var {applyMoneyPattern, applyPercentPattern}: any;

@Component({
  selector: 'pl-fixed-term',
  templateUrl: './fixed-term.component.html',
  styleUrls: ['./fixed-term.component.css'],
  providers: [CatalogService, AccountsServices, PlParameterService, ProductService]
})
export class FixedTermComponent implements OnInit, FormSectionInterface, AfterViewChecked, AfterViewInit, DoCheck {

  @Input() editMode = false;
  @Input() cancelAccount = false;

  account: AccountDto;
  client: ClienteDto;
  authorization: Authorization;
  authorized: Authorized;
  fixedTermCopy: PlazoFijo;

  electronicServices: ServicioElectronico[] = [];

  openingDocuments: OpeningDocumentMod[] = [];
  openingDocumentsCopy: OpeningDocument[] = [];
  openingDocumentMod: OpeningDocumentMod = new OpeningDocumentMod();
  formGroup: FormGroup;
  deadline: AbstractControl;
  expired: AbstractControl;
  rate: AbstractControl;
  debit: AbstractControl;
  accountDebit: AbstractControl;
  amount: AbstractControl;
  penalty: AbstractControl;
  automaticRenov: AbstractControl;
  paymentForm: AbstractControl;
  accountCapital: AbstractControl;
  beneficiary: AbstractControl;
  bornDate: any;
  minDate: any;
  maxDate: any;
  paymentFormList : FormaPagoInteres[] = [];
  finalbeneficiary : boolean = true;
  param_notcre: number = 2;
  validLoad = false;

  private identification: string;

  public options = {
    timeOut: 5000,
    lastOnBottom: true,
    clickToClose: true,
    maxLength: 0,
    maxStack: 7,
    showProgressBar: true,
    pauseOnHover: true,
    preventDuplicates: false,
    preventLastDuplicates: 'visible',
    rtl: false,
    animate: 'scale',
    position: ['right', 'top']
  };

  busy: Promise<any>;

  constructor(private router: Router,
              public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private validationService: ValidationsService,
              private catalogService: CatalogService,
              private changeService: ChangeService,
              private _securityService: SecurityService,
              private _changeDetectorRef: ChangeDetectorRef,
              private translate: TranslateService,
              private accountsServices: AccountsServices,
              private parameterService: PlParameterService,
              private productService: ProductService) {
      this.setUpForm();
      if (this.partialPersistService.data){
        this.account = this.partialPersistService.data;
        if (this.navigationService.currentSections.find((item) => item.section === Section.fixedTerm && item.status)) {
          this.fixedTermCopy = JSON.parse(JSON.stringify(this.account.plazoFijo));
        }
      }
      this.parameterService.getParameter(PlatformParameters.PARAM_NOTCRE).then(param => {
        this.param_notcre = +(param.valor);
      });
      const today = new Date();
      this.maxDate = {
        year: today.getFullYear(),
        month: ('0' + (today.getMonth() + 1)).slice(-2),
        day: ('0' + (today.getUTCDate() + 1)).slice(-2)
      };
      this.minDate = {
        year: 1920,
        month: 1,
        day: 1
      };
  }

  setUpForm() {
      this.formGroup = this.formBuilder.group({
       deadline: [{
         value: '',
         disabled: this.editMode
       }, Validators.required],
       expired: [{
         value: '',
         disabled: true
       }],
       rate: [{
         value: '',
         disabled: this.editMode
       }, Validators.compose([Validators.required, Validators.maxLength(11)])],
       debit: [{
         value: '',
         disabled: this.editMode
       }],
       accountDebit: [{
         value: '',
         disabled: this.editMode
       }, Validators.required],
       amount: [{
         value: '',
         disabled: this.editMode
       }, Validators.compose([Validators.required, Validators.maxLength(16)])],
       automaticRenov: [{
         value: '',
         disabled: this.editMode
       }],
       penalty: [{
         value: '',
         disabled: true
       }, Validators.maxLength(10)],
       paymentForm: [{
         value: '',
         disabled: this.editMode
       }],
       accountCapital: [{
         value: '',
         disabled: this.editMode
       }, Validators.required],
       beneficiary: [{
         value: true,
         disabled: this.editMode
       }]
      });
      this.deadline = this.formGroup.controls['deadline'];
      this.expired = this.formGroup.controls['expired'];
      this.rate = this.formGroup.controls['rate'];
      this.debit = this.formGroup.controls['debit'];
      this.accountDebit = this.formGroup.controls['accountDebit'];
      this.amount = this.formGroup.controls['amount'];
      this.automaticRenov = this.formGroup.controls['automaticRenov'];
      this.penalty = this.formGroup.controls['penalty'];
      this.paymentForm = this.formGroup.controls['paymentForm'];
      this.accountCapital = this.formGroup.controls['accountCapital'];
      this.beneficiary = this.formGroup.controls['beneficiary'];
  }

  ngAfterViewInit() {
    applyPercentPattern($('#rate')[0], '');
    applyPercentPattern($('#penalty')[0], '');
    applyMoneyPattern($('#amount')[0], '');
    $('#amount').trigger('blur');
  }

  ngOnInit() {
//    this.getPlazoDias();
    if (this.editMode) {
      this.identification = this._securityService.getCookie('accountNumber');
      this.busy = this.changeService.getSectionAccount(this.identification, 'plazoFijo');
      this.busy.then((account) => {
        this.account = account;
        this.getPayFormCapital();
        if (this.account.plazoFijo.vencimiento) {
            const parsedDay = new Date(this.account.plazoFijo.vencimiento);
            const a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
            this.bornDate = a;
        }
        this.validLoad = true;
        this.account.plazoFijo.tasa = this.account.plazoFijo['tasaMascara'];
        this.account.plazoFijo.tasaPenalizacion = this.account.plazoFijo['tasaPenalizacionMascara'];
        this.disableControl();
      }).catch((e) => this.disableControl());
    } else {
      this.validLoad = true;
      if (!this.account) {
        this.loadPartial();
      } else {
        this.getPaymentForm();
      }
    }
  }
  
  getPayFormCapital(): void {
      this.productService.getProductDetail(this.account.producto.id.producto, this.account.producto.id.subProducto)
      .then((subProducto) => {
        this.account.subProducto = subProducto;
        this.account.moneda = this.account.subProducto.moneda;
        this.getPaymentForm();
        this.validateNavigation();
      }).catch(() => {
        this.validateForm();
      });
    }
  
  validateNavigation() {
    this.navigationService.account.interest = false;
    if (this.account.subProducto.codigoTasaInteres != null) {
      if (this.account.subProducto.codigoTasaInteres.trim() != '') {
        this.navigationService.account.interest = true;
      }
    }
    this.navigationService.account.beneficiaries = false;
    if (this.account.subProducto.parametros != null) {
      if (this.account.subProducto.parametros.find((item) => item.id.codigo == 'CAPBENEF' && item.valor != 'N')) {
//        this.sectionAccount.push(Section.beneficiaries);
        this.navigationService.account.beneficiaries = true;
      }
    }
    this.busy = this.changeService.getSectionAccount(this.identification, 'datoGeneral');
    this.busy.then((account) => {
      this.navigationService.account.joint = account.datoGeneral.cuentaMancomunada;
    });
    this.changeService.finalBeneficiaries(this.identification).then((response) => {
      this.navigationService.account.beneficiariesFinal = false;
      if (!response) 
        this.navigationService.account.beneficiariesFinal = true;
      let accountJoint = this._securityService.getCookie('account_mancomunado');
      let accountNumber = this._securityService.getCookie('accountNumber');
      if (accountJoint && accountNumber){
        let accountJo = JSON.parse(accountJoint);
        if (accountJo.editMode){
          this.navigationService.selectEditNavigation(Section.jointAccount);
        }
      }
    });
  }

  selectDeadline(deadline) {
    this.account.plazoFijo.plazoDias = +deadline.valor;
    if (!this.editMode)
      this.getRate();
  }

  getRate() {
    this.accountsServices.getRate(this.account, this.account.business.valor)
    .then((response) => {
      if (this.navigationService.currentSections.find((item) => item.section === Section.fixedTerm && !item.status) || this.validRate())
        this.account.plazoFijo.tasa = response.tasaInteres;
      if (response.vencimiento) {
        const parsedDay = new Date(response.vencimiento);
        const a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
        this.bornDate = a;
      }
    });
  }
  
  validRate() : boolean {
    if (this.fixedTermCopy) {
      if (this.fixedTermCopy.plazoDias === this.account.plazoFijo.plazoDias) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  changeExpired(date): void {
    if (date) {
      this.account.plazoFijo.vencimiento = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  ngDoCheck() {
  }

  debitValue() {
    if (this.account.plazoFijo.debita) {
      if (!this.editMode){
        this.amount.enable();
        this.accountDebit.enable();
      }
    } else {
      this.account.plazoFijo.debitarCuenta = new AccountSummary();
      this.amount.disable();
      this.accountDebit.disable();
    }
    if (!this.editMode)
        this.account.plazoFijo.monto = this.account.datoGeneral.valorApertura;
  }
  
  disableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].disable();
    }
  }

  automaticRenovation() {
    if (this.account.plazoFijo.renovacionAutomatica) {
      this.account.plazoFijo.formaPagoCapital = new FormaPagoInteres();
      this.account.plazoFijo.cuentaPagoCapital = new AccountSummary();
      this.paymentForm.disable();
      this.accountCapital.disable();
    } else {
      this.paymentForm.enable();
      if (!this.editMode)
          this.getPaymentForm();
    }
  }

  getPaymentForm() {
    this.paymentFormList = this.account.subProducto.formasPagoInteres;
    if (this.account.plazoFijo.formaPagoCapital.id.tipo.codigo === 0 || this.account.plazoFijo.formaPagoCapital.id.tipo.codigo === null) {
      this.changePaymentList();
      this.paymentFormList[0].id.tipo.selected = true;
      this.account.plazoFijo.formaPagoCapital = this.paymentFormList[0];
      this.changePaymentForm(this.account.plazoFijo.formaPagoCapital);
      if (this.account.plazoFijo.formaPagoCapital.id.tipo.codigo === this.param_notcre) {
        this.accountCapital.enable();
      } else {
        this.accountCapital.disable();
      }
    } else {
      this.changePaymentList(this.account.plazoFijo.formaPagoCapital);
    }
  }

  changePaymentList(param?: FormaPagoInteres) {
    this.paymentFormList.map((item) => {
      item.id.tipo.selected = item.id.tipo.codigo === (param? param.id.tipo.codigo : 0);
    });
  }

  changePaymentForm(payForm: FormaPagoInteres) {
    this.changePaymentList(payForm);
    this.account.plazoFijo.formaPagoCapital = payForm;
    if (this.account.plazoFijo.formaPagoCapital.id.tipo.codigo === this.param_notcre) {
      this.accountCapital.enable();
    } else {
      this.account.plazoFijo.cuentaPagoCapital = new AccountSummary();
      this.accountCapital.disable();
    }
  }

  selectAccountDebit(accountDebit) {
    this.account.plazoFijo.debitarCuenta = accountDebit;
  }

  selectAccountCapital(accountCapital) {
    this.account.plazoFijo.cuentaPagoCapital = accountCapital;
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  cancelDocuments(){
    if (this.openingDocumentsCopy) {
      this.client.documentosApertura = JSON.parse(JSON.stringify(this.openingDocumentsCopy));
    } else {
      this.client.documentosApertura = [];
    }
  }

  loadPartial() {
      this.client = new ClienteDto();
      this.account = new AccountDto();
      this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
         if(account) {
           this.account = account;
           this.getPaymentForm();
         }  else {
             this.account = new AccountDto();
         }
      }).catch((e) => this.client = new ClienteDto());
  }

  validateForm(): void {
    if(this.editMode) {
      this.partialSave();
    } else {
      if (this.account.plazoFijo.renovacionAutomatica)
        this.account.plazoFijo.formaPagoCapital = new FormaPagoInteres();
      this.busy = this.validationService.validationFormAccount(this.account, this.account.business.valor, AccountFormSection[AccountFormSection.PLAZO_FIJO]);
      this.busy.then((response) => {
        this.partialSave();
      }).catch(e => this.handleError(e));
    }
  }

  next() : void {
      if (this.editMode) {

      } else {
        if (Section.fixedTerm === this.partialPersistService.extraData['accountSection'][0]) {
          this.partialPersistService.extraData['accountSection'].splice(0,1);
        }
        this.navigationService.navigateTo(Section.fixedTerm, this.partialPersistService.extraData['accountSection'][0], true);
      }
  }

  partialSave() {
      if (this.editMode) {
      } else {
        this.navigationService.currentSections.find(item => item.section === Section.fixedTerm).status = true;
        this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then(() => {
          this.bindHide();
          this.next();
        }).catch(e => {
          this.handleError(e);
          this.navigationService.currentSections.find(item => item.section === Section.fixedTerm).status = false;
        });
      }
  }

  handleError(error: any): void {
      if (error.status === 428) {
          let authorization = '';
          if (error._body !== '') {
            try {
              authorization = JSON.parse(error._body);
              this.authorization = authorization;
              if (!($('#authorizationModal').data('bs.modal') || {}).isShown) {
                $('#authorizationModal').modal('show');
              }
            } catch (e) {
              authorization = error._body;
            }
          }
      } else if (error._body !== '') {
          this.bindHide();
          this.notificationService.error('', JSON.parse(error._body).message);
      } else if (error.status === 404) {
          this.bindHide();
          this.notificationService.alert('No found 404!', 'The server response 404 error');
      } else if (error.status === 500) {
          this.bindHide();
          this.notificationService.error('Internal Error', 'The server response 500 error');
      }
  }

  changeAuthorization (event) {
    if(event) {
        this.authorized = event;
        this.authorized.seccion = 'PLAZO_FIJO';
        if (this.account.autorizaciones === null)
            this.account.autorizaciones = [];
        this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
        this.validateForm(); 
    } else {
        this.account.autorizaciones = [];
        this.bindHide();
    }
  }

    bindHide() {
      if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
        $('#authorizationModal').modal('hide');
      }
    }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }
  
  public  cancel() {
    $('#confirmModal').modal('show');
  }
}
