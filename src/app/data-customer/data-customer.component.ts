import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, AfterViewInit, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';
import {FormSectionInterface} from '../shared/form-section-interface';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {AccountDto} from '../shared/account/account-dto';
import {SecurityService} from 'security-angular/src/app';
import {NavigationService} from '../shared/services/navigation.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Section} from '../shared/section';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import {NotificationsService} from 'angular2-notifications';
import {WebFormName} from '../shared/webform-name';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {CatalogService} from '../shared/services/catalog.service';
import {PlanFuturoCrece} from '../shared/account/plan-futuro-crece';
import {ChangeService} from '../shared/services/change.service';
import {forceDestructuring} from '../util/destructuring';
import {ProductSelectionComponent} from '../product-selection/product-selection.component';
import {ProductService} from '../product-select/shared/product.service';
import {DatoChequera} from '../shared/account/checkbook-data';
import {DatoInteres} from '../shared/account/data-interest';
import {PlazoFijo} from '../shared/account/fixed-term';
import {Firma} from '../shared/account/sign';
import {DatoGeneral} from '../shared/account/data-general';
import { PlParameterService } from '../pl-parameter/shared/pl-parameter.service';
import { PlatformParameters } from 'app/shared/platform-parameters.enum';
declare var $: any;
import 'script.js';
declare var applyMoneyPattern: any;

@Component({
  selector: 'pl-data-customer',
  templateUrl: './data-customer.component.html',
  styleUrls: ['./data-customer.component.css'],
  providers: [CatalogService, ChangeService, ProductService, PlParameterService]
})
export class DataCustomerComponent implements OnInit, FormSectionInterface, AfterViewChecked, AfterViewInit {
  // Component Properties
  @Input() business = '2';
  @Input() editMode = false;
  @Input() cancelAccount = false;
  @Input() openingDate: Date = new Date();
  
  @Output() validSectAccount = new EventEmitter();

  // Properties
  identificacion = '';
  busy: Promise<any>;
  account: AccountDto;
  disabledField = true;
  authorization: Authorization;
  authorized: Authorized;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  // Form Properties
  formGroup: FormGroup;
  private sectionAccount: Section[] = [];
  private listaMonto: PlanFuturoCrece[] = [];
  heading: string[] = ['encabezado-tabla.col-descripcion', 'encabezado-tabla.col-plazo', 'encabezado-tabla.col-penalizacion', 'encabezado-tabla.col-valor', 'encabezado-tabla.col-seguro'];
  values: string[] = ['descripcion', 'plazo', 'porcentajePenalizacion', 'valorApertura', 'valorSeguro'];
  dataCustomerCopy: DatoGeneral;
  hideGroup = true;
  param_cheque: number = 1;
  param_ahorro: number = 2;
  param_plfijo: number = 3;
  bornDate: any;
  minDate: any;
  maxDate: any;

  private description = null;
  private term = null;
  private penalty = null;
  private value = null;
  private insurance = null;
  private productSelectionComponent : ProductSelectionComponent;
  

  constructor(private formBuilder: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private partialPersistService: PartialPersistService,
              private securityService: SecurityService,
              private navigationService: NavigationService,
              private validationService: ValidationsService,
              private notificationService: NotificationsService,
              private route: ActivatedRoute,
              private catalogService: CatalogService,
              private changeService: ChangeService,
              private translate: TranslateService,
              private productService: ProductService,
              private parameterService: PlParameterService) {
    if (this.partialPersistService.data) {
      this.account = this.partialPersistService.data;
      if (this.account && this.account.business) {
        this.business = this.account.business.valor;
        if (this.account.datoGeneral.planFuturoCrece) {
          if (this.account.datoGeneral.planFuturoCrece.codigo !== 0) {
            this.navigationService.account.futuroCrece = true;
          } else {
            if (this.account.subProducto != null) {
              if (this.account.subProducto.futuroCrece) {
                this.navigationService.account.futuroCrece = true;
              }
            }
          }
        }
        this.setDate();
      }
    }
    this.setUpForm();
    this.parameterService.getParameter(PlatformParameters.PARAM_AHORRO).then(param => {
      this.param_ahorro = +(param.valor);
    });
    this.parameterService.getParameter(PlatformParameters.PARAM_CHEQUE).then(param => {
      this.param_cheque = +(param.valor);
    });
    this.parameterService.getParameter(PlatformParameters.PARAM_PLFIJO).then(param => {
      this.param_plfijo = +(param.valor);
    });
//    this.setOpeningDate();
  }
  
  setOpeningDate() {
    const today = new Date(this.openingDate);
    this.maxDate = {
      year: today.getFullYear(),
      month: parseInt(('0' + (today.getMonth() + 2)).slice(-2), 10),
      day: parseInt(('0' + (today.getUTCDate() - 1)).slice(-2), 10)
    };
    this.minDate = {
      year: today.getFullYear(),
      month: parseInt(('0' + (today.getMonth() + 1)).slice(-2), 10),
      day: parseInt(('0' + (today.getUTCDate())).slice(-2), 10)
    };
    this.account.datoGeneral.fechaInicio = today;
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit() {
    applyMoneyPattern($('#openingValue')[0], '');
//    $('#openingValue').trigger('blur');
    applyMoneyPattern($('#depositAmount')[0], '');
//    $('#depositAmount').trigger('blur');
  }

  ngOnInit() {
    if (this.navigationService.account.futuroCrece) {
      this.requiredInitialDate();
    } else {
      if (this.account.subProducto){
        if (this.account.subProducto.futuroCrece) {
          this.requiredInitialDate();
        } else {
            this.notRequiredInitialDate();
        }
      } else {
        this.notRequiredInitialDate();
      }
    }
    if (this.editMode) {
      this.account = new AccountDto();
      let accountSignature = this.securityService.getCookie('account_signature');
      let accountJoint = this.securityService.getCookie('account_mancomunado');
      let accountNumber = this.securityService.getCookie('accountNumber');
      if (accountSignature && accountNumber) {
        let accountSign = JSON.parse(accountSignature);
        if (accountSign.editMode) {
          this.navigationService.selectEditNavigation(Section.signature);
        }
      } else {
        this.navigationService.account = JSON.parse(JSON.stringify(this.navigationService.cleanAccount));
        this.identificacion = this.securityService.getCookie('accountNumber');
        this.busy = this.changeService.getSectionAccount(this.identificacion, 'datoGeneral');
        this.busy.then((account) => {
          this.account = account;
          if (this.account.datoGeneral.fechaInicio){
            this.setDate();
          }
          this.dataCustomerCopy = JSON.parse(JSON.stringify(this.account.datoGeneral));
          this.productService.getProductDetail(this.account.producto.id.producto, this.account.producto.id.subProducto)
          .then((subProduct) => {
            this.account.subProducto = subProduct;
            this.validateNavigation();
          });
          this.account.clientInformation = this.partialPersistService.data.clientInformation;
          this.account.business = this.partialPersistService.data.business;
          this.disableControl();
        });
      }
    } else {
      if (!this.account) {
        this.loadPartial();
      } else {
        this.loadDataClient();
      }
      if (this.navigationService.account.dataCustomer)
        this.disableControl();
    }
  }

// Form Section Methods
  loadPartial(): void {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      if (account) {
        this.account = account;
        this.loadDataClient();
      } else {
        this.account = new AccountDto();
      }
    }).catch((e) => this.account = new AccountDto());
  }

  partialSave(): void {
    if (!this.editMode) {
      this.navigationService.currentSections.find(item => item.section === Section.dataCustomer).status = true;
      if (this.account.subProducto.tipoForma === null || this.account.subProducto.tipoForma == '0') {
        this.account.datoGeneral.productoCampo1 = null
      } else {
        this.account.datoGeneral.productoCampo1 = +this.account.datoGeneral.productoCampo1;
      }
      this.navigationService.account.dataCustomer = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then(response => {
        this.bindHide();
        this.next();
      }).catch(e => {
        this.handleError(e);
        this.navigationService.currentSections.find(item => item.section === Section.dataCustomer).status = false;
      });
    } else {
      this.busy = this.changeService.putSectionAccount(this.account, this.identificacion, 'datoGeneral');
      this.busy.then((account) => {
        this.account = account;
        this.navigationService.account.joint = this.account.datoGeneral.cuentaMancomunada;
        this.dataCustomerCopy = JSON.parse(JSON.stringify(this.account.datoGeneral));
        this.bindHide();
        this.account.autorizaciones = [];
        this.disableControl();
        this.successUpdate('messages.success.data-customer', 'messages.success.update');
        this.next();
        if (this.navigationService.account.joint) {
          this.changeService.getSectionAccount(this.identificacion, 'personasAsociadas').then((dto : AccountDto) => {
            if (dto.personasAsociadas) {
              if (dto.personasAsociadas.length === 0) {
                this.navigationService.account.jointRequired = true;
                this.navigationService.navigateTo(Section.dataCustomer, Section.jointAccount, true);
              }
            } else {
              this.navigationService.account.jointRequired = true;
              this.navigationService.navigateTo(Section.dataCustomer, Section.jointAccount, true);
            }
          });
        }
      }).catch(e => this.handleError(e));
    }
  }

  validateForm(): void {
    if (this.account.subProducto.futuroCrece){
      this.account.datoGeneral.valorApertura = this.account.datoGeneral.planFuturoCrece.valorApertura;
    }
    if (this.account.datoGeneral.valorApertura.toString() == '')
      this.account.datoGeneral.valorApertura = 0;
    if (this.editMode) {
      this.partialSave();
    } else {
      this.busy = this.validationService.validationFormAccount(this.account, this.account.business.valor, AccountFormSection[AccountFormSection.DATOS_GENERALES]);
      this.busy.then(response => {
        this.validateNavigation();
        this.partialSave();
      }).catch(e => this.handleError(e));
    }
  }

  validateNavigation() {
    this.sectionAccount = [];
    if (this.account.datoGeneral.cuentaMancomunada) {
      this.sectionAccount.push(Section.jointAccount);
      this.navigationService.account.joint = true;
    }
    if (this.account.subProducto.codigoTasaInteres != null) {
      if (this.account.subProducto.codigoTasaInteres.trim() != '') {
        this.sectionAccount.push(Section.administrationInterests);
        this.navigationService.account.interest = true;
      }
    }
    if (this.account.tipoProducto.codigo === this.param_ahorro || this.account.tipoProducto.codigo === this.param_cheque) {
      this.busy = this.changeService.getSpecialProduct();
      this.busy.then((response) => {
        this.navigationService.account.specialProduct = response.permiteTraslados;
      }).catch((e:any) => this.navigationService.account.specialProduct = false);
      if (this.account.subProducto.permiteTraslados) {
          this.sectionAccount.push(Section.transferAccount);
          this.navigationService.account.transferAccount = true;
          if (this.editMode) {
            this.busy = this.changeService.getSectionAccount(this.identificacion, 'cuentasTraslados');
            this.busy.then((account) => {
              if (!account.cuentasTraslados)
                this.navigationService.account.transferRequired = true;
            }).catch((e:any) => this.handleError(e));
          }
      }
    }
    if (this.account.tipoProducto.codigo == this.param_cheque) {
      this.sectionAccount.push(Section.administrationCheckbooks);
      this.navigationService.account.checkbook = true;
    }
    if (this.account.tipoProducto.codigo == this.param_plfijo) {
      this.sectionAccount.push(Section.fixedTerm);
      this.navigationService.account.fixed = true;
    }
    if (this.account.subProducto.parametros != null) {
      if (this.account.subProducto.parametros.find((item) => item.id.codigo == 'CAPBENEF' && item.valor != 'N')) {
        this.sectionAccount.push(Section.beneficiaries);
        this.navigationService.account.beneficiaries = true;
      }
    }
    this.sectionAccount.push(Section.signature);
    this.sectionAccount.push(Section.electronicService);
    if (this.editMode) {
      this.changeService.finalBeneficiaries(this.identificacion).then((response) => {
        if (!response) 
          this.navigationService.account.beneficiariesFinal = true;
        let accountJoint = this.securityService.getCookie('account_mancomunado');
        let accountNumber = this.securityService.getCookie('accountNumber');
        if (accountJoint && accountNumber){
          let accountJo = JSON.parse(accountJoint);
          if (accountJo.editMode){
            this.navigationService.selectEditNavigation(Section.jointAccount);
          }
        }
      });
    }
    this.sectionAccount.push(Section.accountCreated);
    if (this.partialPersistService.extraData) {
      if (this.partialPersistService.extraData['accountSection']) {
        this.navigationService.currentSections = this.partialPersistService.extraData['currentSection'];
        this.navigationService.availableSections = this.partialPersistService.extraData['availableSection'];
      }
      this.partialPersistService.extraData = {
        ['accountSection']: JSON.parse(JSON.stringify(this.sectionAccount)),
        ['currentSection']: JSON.parse(JSON.stringify(this.navigationService.currentSections)),
        ['availableSection']: JSON.parse(JSON.stringify(this.navigationService.availableSections))
      };
    }
  }

  next(): void {
    if (!this.editMode) {
      this.navigationService.navigateTo(Section.dataCustomer, this.partialPersistService.extraData['accountSection'][0], true);
    } else {
      this.validSectAccount.emit();
    }
  }

  // Form Methods
  setUpForm() {
    this.formGroup = this.formBuilder.group({
      customerName: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(180)])],
      customerDirection: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      openingValue: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(13)])],
      jointAccount: [{
        value: false,
        disabled: this.editMode
      }],
      economicSector: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      economicActivity: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      individualBank: [{
        value: false,
        disabled: this.editMode
      }],
      isrAffection: [{
        value: true,
        disabled: this.editMode
      }],
      originFund: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      accountPurpose: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      depositAmount: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(13)])],
      observations: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(80)])],
      promotions: [{
        value: '',
        disabled: this.editMode
      }],
      agencies: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      operationsSupervisor: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      businessExecutive: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      accountManagementCharge: [{
        value: true,
        disabled: this.editMode
      }],
      savingsBook: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(7)])],
      economicGroup: [{
        value: '',
        disabled: this.editMode
      }],
      initialDate: [{
        value: '',
        disabled: this.editMode
      }]
    });
    forceDestructuring(this.formGroup.controls, this);
  }

  enableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].enable();
    }
  }

  disableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].disable();
    }
  }

  changeControl() {
    for (let key in this.formGroup.controls) {
      if (key != 'openingValue' && key != 'savingsBook' && key != 'customerName' && key != 'initialDate')
        this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
    }
  }

  changeTag(): string {
    if (this.account.datoGeneral.bancaEmpresarialPyme) {
      return 'create-account.data.customer.economic-profile.pyme';
    }

    return 'create-account.data.customer.economic-profile.individual';
  }

  selectEconomicSector(economicSector) {
    this.account.datoGeneral.sectorEconomico = economicSector;
  }

  selectEconomicActivities(economicActivities) {
    this.account.datoGeneral.actividadEconomica = economicActivities;
  }
  
  selectEconomicGroup(economicGroup) {
    if (economicGroup) {
      this.account.datoGeneral.grupoEconomico = economicGroup;
      this.hideGroup = true;
    } else {
      this.hideGroup = false;
    }
  }

  selectOriginFunds(originFunds) {
    this.account.datoGeneral.abrirLaCuenta = originFunds;
  }

  selectAccountPurpose(accountPurpose) {
    this.account.datoGeneral.utilizarEnCuenta = accountPurpose;
  }

  selectAgency(agency) {
    this.account.datoGeneral.envioEstadoCuenta = agency;
  }

  selectOperationsSupervisor(operationSupervisor) {
    this.account.datoGeneral.funcionarioResponsable = operationSupervisor;
  }

  selectAccountOfficer(accountOfficer) {
    this.account.datoGeneral.oficialCuentas = accountOfficer;
  }

  selectAddress(address) {
    this.account.datoGeneral.direccion = address;
  }
  
  selectPromotion(promotion) {
    this.account.datoGeneral.promocion = promotion;
  }

  loadDataClient() {
    if (this.navigationService.currentSections.find(item => item.section === Section.dataCustomer && !item.status) && !this.editMode) {
      this.account.datoGeneral.afectaIsr = this.account.clientInformation.afectoISR;
      this.account.datoGeneral.actividadEconomica.codigo = this.account.clientInformation.actividadEconomica;
      this.account.datoGeneral.sectorEconomico.codigo = this.account.clientInformation.sectorEconomico;
      this.account.datoGeneral.oficialCuentas.id.codigo = this.account.clientInformation.ejecutivoNegocio;
      this.account.datoGeneral.nombre = this.account.clientInformation.nombre;
    }
    if (this.account.datoGeneral.valorApertura == null) {
      if (this.account.subProducto.futuroCrece) {
        this.formGroup.controls['openingValue'].disable();
        this.loadFuturoCrece();
      }
    }
    if (this.account.subProducto.futuroCrece) {
      this.formGroup.controls['openingValue'].disable();
    }
//    if (this.account.subProducto.habilitarValorApertura)
//      this.formGroup.controls['openingValue'].disable();
  }

  loadFuturoCrece() {
    this.catalogService.getCatalogParam('cuentas/planes/ahorros/futuroCrece', 'moneda', this.account.moneda.codigo)
      .then((montos: PlanFuturoCrece[]) => {
        this.listaMonto = montos;
        if (!($('#futuroCreceModal').data('bs.modal') || {}).isShown) {
          $('#futuroCreceModal').modal('show');
        }
        applyMoneyPattern($('#openingValue')[0], '');
        applyMoneyPattern($('#depositAmount')[0], '');
      });
  }

  amountSelect(monto) {
    this.account.datoGeneral.valorApertura = monto.valorAperturaMascara;
    this.account.datoGeneral.montoDepositos = monto.valorApertura;
    this.account.datoGeneral.planFuturoCrece = monto;
    if (($('#futuroCreceModal').data('bs.modal') || {}).isShown) {
      $('#futuroCreceModal').modal('hide');
    }
    applyMoneyPattern($('#openingValue')[0], '');
    applyMoneyPattern($('#depositAmount')[0], '');
  }

  changeDate(date): void {
    if (date) {
      this.account.datoGeneral.fechaInicio = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  setDate() {
    if (this.account.datoGeneral.fechaInicio) {
      const parsedDay = new Date(this.account.datoGeneral.fechaInicio);
      const a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
      this.bornDate = a;
    } else {
      this.bornDate = '';
    }
  }

  // Error Handling
  handleError(error: any) {
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
    } else if (!error._body) {
      this.bindHide()
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    } else if (error.status === 403 && error._body) {
      this.bindHide();
      this.notificationService.error(JSON.parse(error._body).message, '');
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
  }
  
  restoreData () {
    this.disableControl();
    this.account.datoGeneral = JSON.parse(JSON.stringify(this.dataCustomerCopy));
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.DATOS_GENERALES];
      if (this.account.autorizaciones === null)
        this.account.autorizaciones = [];
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      if (!this.editMode)
        this.validateNavigation();
      this.validateForm();
    } else {
      this.account.autorizaciones = [];
      this.bindHide();
    }
  }

  requiredInitialDate() {
    this.setOpeningDate();
    this.setDate();
    this.formGroup.controls['initialDate'].setValidators([Validators.required]);
    this.formGroup.controls['initialDate'].updateValueAndValidity();
  }

  notRequiredInitialDate() {
    this.formGroup.controls['initialDate'].setValidators([]);
    this.formGroup.controls['initialDate'].updateValueAndValidity();
  }

  searchMethod(): void {
    this.listaMonto.filter((amount) => (amount.valorSeguro.toLowerCase().indexOf(this.insurance.toLowerCase()) > -1));
//    this.depositParameter.listaMonto.filter((amount) => (amount.descripcion.toLowerCase().indexOf(this.description.toLowerCase()) > -1 &&
//        amount.plazo == this.term.toLowerCase &&
//        amount.porcentajePenalizacion.toLowerCase().indexOf(this.penalty.toLowerCase()) > -1 &&
//        amount.valorApertura.toLowerCase().indexOf(this.value.toLowerCase()) > -1 &&
//        amount.valorSeguro.toLowerCase().indexOf(this.insurance.toLowerCase()) > -1
//        ));
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }

  cancelModal() {
    $('#confirmModal').modal('show');
  }

  showEdit() {
    $('#editModal').modal('show');
  }

  editSection() {
    if (this.partialPersistService.extraData) {
      if (this.partialPersistService.extraData['accountSection']) {
        this.navigationService.currentSections = this.partialPersistService.extraData['currentSection'];
        this.navigationService.availableSections = this.partialPersistService.extraData['availableSection'];
        this.navigationService.account.dataCustomer = false;
        this.account.personasAsociadas = [];
        this.account.datoChequera = new DatoChequera();
        this.account.datoInteres = new DatoInteres();
        let tasaInteres = JSON.parse(JSON.stringify(this.account.plazoFijo.tasaPenalizacion));
        this.account.plazoFijo = new PlazoFijo();
        this.account.plazoFijo.tasaPenalizacion = tasaInteres;
        this.account.firma = new Firma();
        this.account.serviciosElectronicos = [];
        this.account.beneficiarios = [];
        this.account.beneficiariosFinales = [];
      }
    }
    this.enableControl();
    if (this.account.subProducto.futuroCrece) {
      this.formGroup.controls['openingValue'].disable();
      this.loadFuturoCrece();
    }
  }
}
