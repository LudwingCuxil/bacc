import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificationsService} from 'angular2-notifications';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {NavigationService} from '../shared/services/navigation.service';
import {AccountDto} from '../shared/account/account-dto';
import {Section} from '../shared/section';
import {Currency} from '../currency-select/shared/currency.model';
import {WebFormName} from '../shared/webform-name';
import {AccountsServices} from '../shared/services/accounts.service';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import {TranslateService} from 'ng2-translate';
import { Authorization, Authorized } from '../authorization/shared/authorization';
import {ProductType} from '../type-product-select/shared/product-type.model';
import {Product} from '../shared/account/product';
import {ProductService} from '../product-select/shared/product.service';
import {Mode} from '../shared/client/referenceDTO';
import {SecurityService} from 'security-angular/src/app';
import { DatoGeneral } from '../shared/account/data-general';
import { DatoChequera } from '../shared/account/checkbook-data';
import { DatoInteres } from '../shared/account/data-interest';
import { PlazoFijo } from '../shared/account/fixed-term';
import { Firma } from '../shared/account/sign';
declare var $: any;

@Component({
  selector: 'pl-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css'],
  providers: [AccountsServices, ProductService]
})
export class ProductSelectionComponent implements OnInit, FormSectionInterface, AfterViewChecked {
  busy: Promise<any>;
  account: AccountDto;
  @Input() editMode = false;
  @Output() changeView: EventEmitter<any>;
  disabledField = false;
  authorization: Authorization;
  productSelection: any;
  authorized: Authorized;
  private accountSections: any = [];

  // FormProperties
  formGroup: FormGroup;
  currency: AbstractControl;
  product: AbstractControl;
  productType: AbstractControl;

  constructor(private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private accountService: AccountsServices,
              private notificationService: NotificationsService,
              private changeDetectorRef: ChangeDetectorRef,
              private translate: TranslateService,
              private formBuilder: FormBuilder,
              private productService: ProductService,
              private _securityService: SecurityService) {
    this.changeView = new EventEmitter();
    if (this.partialPersistService.data) {
      this.account = this.partialPersistService.data;
    }
    this.setUpForm();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    if (!this.editMode) {
      if (!this.account && !this.navigationService.account.product) {
        this.account = new AccountDto();
      }
      if (!this.account.producto || !this.account.producto.id) {
        this.checkForPartial();
      }
      if(this.navigationService.account.product) {
        this.disableControls();
      }
    }
  }

  // Event Management
  onCurrencyChange(curren: Currency) {
    if (curren && curren.codigo.length > 1) {
      this.account.moneda = curren;
      if (this.account.tipoProducto && this.account.tipoProducto.codigo) {
        this.productSelection = {currency: this.account.moneda, productType: this.account.tipoProducto};
      }
    }
  }

  onProductTypeChange(type: ProductType) {
    if (type && type.codigo) {
      this.account.tipoProducto = type;
      if (this.account.moneda && this.account.moneda.codigo) {
        this.productSelection = {currency: this.account.moneda, productType: this.account.tipoProducto};
      }
    }
  }

  onProductChange(prod: Product) {
    if (prod && prod.id) {
      this.account.producto = prod;
    }
  }

  // Form Section Interface
  next(): void {
    if (!this.editMode) {
      this.navigationService.navigateTo(Section.productSelection, Section.dataCustomer, true);
    }
  }

  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      this.busy = this.accountService.validationForm(this.account.business.valor, AccountFormSection[AccountFormSection.CLIENTE_PRODUCTO], this.account);
      this.busy.then(() => {
        if (this.navigationService.currentSections.find((item) => item.section === Section.productSelection && item.status === true)) {
          this.navigationService.currentSections = this.partialPersistService.extraData['currentSection'];
          this.navigationService.availableSections = this.partialPersistService.extraData['availableSection'];
        }
        this.accountSections = {['currentSection']: JSON.parse(JSON.stringify(this.navigationService.currentSections)),
                                ['availableSection']: JSON.parse(JSON.stringify(this.navigationService.availableSections))};
        this.partialSave();
      }).catch(e => this.handleError(e));
    }
  }

  getOpeningValue(): void {
    this.productService.getProductDetail(this.account.producto.id.producto, this.account.producto.id.subProducto)
    .then((subProducto) => {
      this.account.subProducto = subProducto;
      this.productService.getField('campos','VALOR_APERTURA', this.account.producto.id.producto, this.account.producto.id.subProducto)
      .then((response) => {
        console.log(response);
        this.account.subProducto.futuroCrece = true;
        this.account.subProducto.habilitarValorApertura = !response.habilitado;
        this.validateForm();
      }).catch(() => {
        this.account.subProducto.futuroCrece = false;
        this.account.subProducto.habilitarValorApertura = false;
        this.account.datoGeneral.valorApertura = subProducto.saldoMinimoApertura;
        this.validateForm();
      });
      this.account.plazoFijo.tasaPenalizacion = subProducto.tasaPenalizacion;
    }).catch(() => {
      this.validateForm();
    });
  }

  // Partial Management

  loadPartial(): void {
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      if (account) {
        this.account = this.partialPersistService.data;
        this.productSelection = {currency: this.account.moneda, productType: this.account.tipoProducto};
        this.changeView.emit();
      } else {
        this.partialPersistService.data = new AccountDto();
        this.account = this.partialPersistService.data;
      }
    }).catch(e => {
      this.handleError(e);
    });
  }

  partialSave(): void {
    if (!this.editMode) {
      this.navigationService.currentSections.find(item => item.section === Section.productSelection).status = true;
      this.account.modalidad = Mode.I;
      this.navigationService.account.product = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.accountSections).then(() => {
        this.disableControls();
        this.bindHide();
        this.next();
      }).catch(e => {
        this.handleError(e);
        this.navigationService.currentSections.find(item => item.section === Section.productSelection).status = false;
      });
    }
  }

  checkForPartial(): void {
    this.partialPersistService.checkPartial(WebFormName[WebFormName.WEBFORM_CUENTA]).then(response => {
      let clientSummary = this._securityService.getCookie('client_signature');
      let clientSummaryJoint = clientSummary? clientSummary : this._securityService.getCookie('client_mancomunado');
      let param = clientSummaryJoint? clientSummaryJoint : this._securityService.getCookie('exist_account');
      if (param) {
        this._securityService.deleteCookie('exist_account');
        this.loadPartial();
      } else {
        $('#loadPartialModal').modal('show');
      }
    }).catch(e => {
      this.initialValues();
    });
  }

  deletePartial() {
    this.initialValues();
    this.partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CUENTA]).catch(e => this.handleError);
  }

  initialValues(): void {
    if (!this.partialPersistService.data) {
      this.partialPersistService.data = new AccountDto();
      this.account = this.partialPersistService.data;
    }
  }

  cancel() {
    $('#confirmModal').modal('show');
  }

  showEdit() {
    $('#editModal').modal('show');
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
    } else {
      const err = JSON.parse(error._body);
      const tr = this.translate.instant('exceptionace.' + err.code);
      this.notificationService.error('', tr);
    }
  }

  // Form Management
  setUpForm() {
    this.formGroup = this.formBuilder.group({
      currency: [{value: new Currency(), disabled: this.disabledField}, Validators.required],
      productType: [{value: new ProductType(), disabled: this.disabledField}, Validators.required],
      product: [{value: new Product(), disabled: this.disabledField}, Validators.required]
    });
    const {controls} = this.formGroup;
    this.currency = controls['currency'];
    this.product = controls['product'];
    this.productType = controls['productType'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.currency.enable();
    this.product.enable();
    this.productType.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.currency.disable();
    this.product.disable();
    this.productType.disable();
  }

  editSection() {
    if (this.partialPersistService.extraData) {
      if (this.partialPersistService.extraData['currentSection']) {
        this.navigationService.currentSections = this.partialPersistService.extraData['currentSection'];
        this.navigationService.availableSections = this.partialPersistService.extraData['availableSection'];
        this.navigationService.currentSections.map((item, index) => {
          if (item.section === Section.productSelection)
            item.status = false;
          if (item.section === Section.dataCustomer)
            this.navigationService.currentSections.splice(index, 1);
        });
        if (!this.navigationService.availableSections.find((item) => item.section === Section.dataCustomer))
          this.navigationService.availableSections.push({section: Section.dataCustomer, status: false});
        this.navigationService.account.dataCustomer = false;
        this.account.datoGeneral = new DatoGeneral();
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
    this.navigationService.account.product = false;
    this.enableControls();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.CLIENTE_PRODUCTO];
      if (this.account.autorizaciones === null)
        this.account.autorizaciones = [];
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
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

}
