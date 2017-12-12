import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {AccountReferenceService} from './shared/account.service';
import {Authorization, Authorized} from '../../authorization/shared/authorization';
import {ClienteDto} from '../../shared/client/cliente-dto';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {NavigationService} from '../../shared/services/navigation.service';
import {ValidationsService} from '../../shared/services/validations.service';
import {ClientFormSection} from '../../shared/clientFormSection.enum';
import {WebFormName} from '../../shared/webform-name';
import {Section} from '../../shared/section';
import {Mode} from '../../shared/client/referenceDTO';
import {PlParameterService} from '../../pl-parameter/shared/pl-parameter.service';
import {TranslateService} from 'ng2-translate';
import {TipoInstitucion} from '../../shared/client/tipo-institucion';
import {Institucion} from '../../shared/client/institucion';
import {ReferenciaCuenta} from '../../shared/client/referencia-cuenta';
import {InstitutionService} from '../../institution/shared/institution.service';
import {TypeInstitutionService} from '../../type-institution/shared/type-institution.service';
import {ReferencesComponent} from '../references.component';
import {CatalogService} from '../../shared/services/catalog.service';

declare var $: any;

@Component({
  selector: 'pl-account-reference',
  templateUrl: './account.component.html',
  styles: [``],
  providers: [AccountReferenceService, PlParameterService, TypeInstitutionService, InstitutionService],
})
export class AccountReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy = [];
  heading: string[] = ['referencias-cuenta.tipo', 'referencias-cuenta.institucion', 'referencias-cuenta.numero-cuenta'];
  headingEdit: string[] = ['referencias-cuenta.tipo', 'referencias-cuenta.institucion', 'referencias-cuenta.numero-cuenta', 'table.actions'];
  values: string[] = ['tipoInstitucion.descripcion', 'institucion.descripcion', 'numeroCuenta'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  type: TipoInstitucion;
  subType: Institucion;
  openingDate: any;
  maxDate: any;
  minDate: any;
  accountClasses = [];
  referenceList = [];
  busy: Promise<any>;
  client: ClienteDto;
  account: ReferenciaCuenta = new ReferenciaCuenta();
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

  formGroup: FormGroup;
  typeSelect: AbstractControl;
  subTypeSelect: AbstractControl;
  accountClass: AbstractControl;
  accountInput: AbstractControl;
  approximateOpeningDate: AbstractControl;

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _securityService: SecurityService,
              private _institutionService: InstitutionService,
              private _institutionTypeService: TypeInstitutionService,
              private _partialPersistService: PartialPersistService,
              private _translateService: TranslateService,
              private _navigationService: NavigationService,
              private _validationService: ValidationsService,
              private _plService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _catalogService: CatalogService) {
    this.setUpForm();
    const today = new Date();
    this.maxDate = {
      year: today.getFullYear(),
      month: (today.getMonth() + 1),
      day: today.getDate()
    };
    this.minDate = {
      year: 1920,
      month: 1,
      day: 1
    };
    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
      if (!this.client.referencias.referenciasCuentas) {
        this.client.referencias.referenciasCuentas = [];
      }
    }
    this.getReferenceList();
    this._plService.getplParameter(undefined, 'PARAM_PLCLCT').then((response) => this.accountClasses = response.valores).catch(e => this.handleError(e));
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._institutionTypeService.getTypeInstitutionService();
      if (this.changeMode) {
        this.disableControls();
      }
      this.busy.then(response => {
        this.referenceListCopy = this.client.referencias.referenciasCuentas.slice(0);
        this.client.referencias.referenciasCuentas.forEach(account => account.tipoInstitucion.descripcion = response.find(item => item.codigo === account.tipoInstitucion.codigo).descripcion);
      });
      this.client.referencias.referenciasCuentas.forEach(account => {
        this.busy = this._institutionService.getInstitutionService(account.tipoInstitucion.codigo + '');
        this.busy.then(institutions => {
          account.institucion.descripcion = institutions.find(item => item.codigo === account.institucion.codigo).descripcion;
        });
      });
    } else {
      this.enableControls();
      if (!this.client) {
        this.loadPartial();
      }
    }
  }

  getReferenceList(): void {
    this._catalogService.getCatalogParam(ReferencesComponent.LIST_REFERENCE_CATALOG, ReferencesComponent.PERSON_TYPE_PARAM, this.client ? this.client.tipoPersona : 'J').then((list) => {
      this.referenceList = list;
    });
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  selectAccountClass(account): void {
    this.account.tipo = account;
  }


  selectSector(sector): void {
    if (sector) {
      this.type = sector;
      this.account.tipoInstitucion = sector;
    }
    if (!this.edit) {
      this.subTypeSelect.setValue(new Institucion());
    }

  }

  selectSubSector(subSector): void {
    this.subType = subSector;
    if (subSector) {
      this.account.institucion = subSector;
    }
  }

  changeApproximateOpeningDate(date): void {
    if (date) {
      this.account.aperturaAproximada = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  restoreReference(account: ReferenciaCuenta): void {
    const accountFound = this.client.referencias.referenciasCuentas.find((item) => (item.codigoNumeroCuenta === account.codigoNumeroCuenta || item.numeroCuenta === account.numeroCuenta)
      && (item.tipoInstitucion.codigo === account.tipoInstitucion.codigo || item.codigoTipoInstitucion === account.codigoTipoInstitucion)
      && (item.institucion.codigo === account.institucion.codigo || item.codigoInstitucion === account.codigoTipoInstitucion)
    );
    if (account.modalidad === this.mode.I) {
      this.client.referencias.referenciasCuentas.splice(this.client.referencias.referenciasCuentas.indexOf(accountFound), 1);
    } else {
      const accountRestore = this.referenceListCopy.filter((item) => item.codigoNumeroCuenta === account.codigoNumeroCuenta
        && item.codigoInstitucion === account.codigoInstitucion
        && item.codigoTipoInstitucion === account.codigoTipoInstitucion
      )[0];
      if (accountRestore) {
        accountRestore.modalidad = undefined;
        this.client.referencias.referenciasCuentas[this.client.referencias.referenciasCuentas.indexOf(accountFound)] = JSON.parse(JSON.stringify(accountRestore));
      }
    }
    this.clean();
  }

  selectRecord(account: ReferenciaCuenta) {
    this.edit = true;
    this.account = JSON.parse(JSON.stringify(account));
    this.type = account.tipoInstitucion;
    this.subType = account.institucion;
    this.account.aperturaAproximada = new Date(account.aperturaAproximada);
    this.openingDate = {
      year: this.account.aperturaAproximada.getFullYear(),
      month: this.account.aperturaAproximada.getMonth() + 1,
      day: this.account.aperturaAproximada.getDate()
    };
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = ClientFormSection[ClientFormSection.DATOS_ADICIONALES];
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
  }

  removeReference(): void {
    if (this.account.modalidad !== this.mode.I) {
      this.client.referencias.referenciasCuentas.find(item => item.codigoNumeroCuenta === this.account.codigoNumeroCuenta
        && item.codigoTipoInstitucion === this.account.codigoTipoInstitucion
        && item.codigoInstitucion === this.account.codigoInstitucion
      ).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasCuentas.find(item => this.account.codigoNumeroCuenta === this.account.codigoNumeroCuenta
        && item.codigoInstitucion === this.account.codigoInstitucion
        && item.codigoTipoInstitucion === this.account.codigoTipoInstitucion
      );
      this.client.referencias.referenciasCuentas.splice(this.client.referencias.referenciasCuentas.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.edit) {
      const account = this.client.referencias.referenciasCuentas.find(item => this.account.codigoNumeroCuenta === this.account.codigoNumeroCuenta
        && item.codigoInstitucion === this.account.codigoInstitucion
        && item.codigoTipoInstitucion === this.account.codigoTipoInstitucion
      );
      this.client.referencias.referenciasCuentas[this.client.referencias.referenciasCuentas.indexOf(account)] = JSON.parse(JSON.stringify(this.account));
      if (this.account.modalidad !== this.mode.I) {
        this.client.referencias.referenciasCuentas.find(item => item.codigoNumeroCuenta === this.account.codigoNumeroCuenta
          && item.codigoTipoInstitucion === this.account.codigoTipoInstitucion
          && item.codigoInstitucion === this.account.codigoInstitucion
        ).modalidad = this.mode.U;
      }
      this.clean();
    } else {
      if (this.validateReference()) {
        this.account.modalidad = this.mode.I;
        if (this.client.referencias.referenciasCuentas.length === 0) {
          this.account.correlativoReferencia = 0;
        } else {
          this.account.correlativoReferencia = this.client.referencias.referenciasCuentas[this.client.referencias.referenciasCuentas.length - 1].correlativoReferencia + 1;
        }
        this.client.referencias.referenciasCuentas.push(JSON.parse(JSON.stringify(this.account)));
        this.clean();
      }
    }
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'CUENTAS');
      if (reference.maximo <= this.client.referencias.referenciasCuentas.length) {
        this._translateService.get('exceptionace.core.clientes.referencias.maximo').subscribe((item) => {
          this.notificationService.alert(item, reference.maximo);
        });
        return false;
      }
      if (this.client.referencias.referenciasCuentas.find(item => item.codigoNumeroCuenta === this.account.numeroCuenta
        && item.codigoTipoInstitucion === this.account.tipoInstitucion.codigo
        && item.codigoInstitucion === this.account.institucion.codigo
        )) {
        this._translateService.get('validations.reference-exist').subscribe((item) => {
          this.notificationService.alert(item, reference.maximo);
        });
        return false;
      }
      return true;
    }
    this._translateService.get('exceptionace.core.clientes.exception.0100165').subscribe((item) => {
      this.notificationService.error('Error al recuperar parametrización', item);
    });
    return false;
  }

  isInvalidChange() {
    if (this.client.referencias.referenciasCuentas.find(item => item.correlativoReferencia === this.account.correlativoReferencia)) {
      return false;
    }
    return true;
  }

  getAddressTypeParam(type: string): Promise<any> {
    return this._plService.getplParameter(undefined, type).catch((e) => this.handleError(e));
  }

  cancel() {
    $('#confirmModal').modal('show');
  }

  loadPartial() {
    this.client = new ClienteDto();
    this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
      }
    }).catch((e) => {
      console.error(e);
      this.client = new ClienteDto();
    });
  }

  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      this._validationService.validationForm(this.client, ClientFormSection[ClientFormSection.REFERENCIAS]).then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
    } else {
      // this.changeView.emit({prevSection: Section.naturalGeneralData, section: Section.economicProfile, status: true});
      this._navigationService.navigateTo(Section.addressInformation, Section.customerCreated, true);
    }
  }

  partialSave(): void {
    console.log(this.client);
    if (this.editMode) {
      /*this.busy = this._generalDataNaturalService.putGeneralDataNatural(this.client, this.identification);
       this.busy.then((client) => {
       this.bindHide();
       this.client = client;
       this.client.autorizaciones = [];
       this.change();
       this.successUpdate('Datos Generales Actualizados', 'Se actualizo correctamente');
       }, (e: any) => this.handleError(e));*/
    } else {
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
      }).catch(er => this.handleError(er));
    }
  }

  handleError(error: any): void {
    if (error.status === 428
    ) {
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
      this._translateService.get('exceptionace.' + JSON.parse(error._body).code).subscribe(title => {
        this.notificationService.error('An error occurred, status: ' + error.status, title);
      });
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

  successCreate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  successDelete(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  clean(): void {
    this.edit = false;
    this.account = new ReferenciaCuenta();
    this.subTypeSelect.setValue(new TipoInstitucion());
    this.typeSelect.setValue(new Institucion());
    this.accountClass.setValue('');
    this.accountInput.setValue('');
    this.approximateOpeningDate.setValue(undefined);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      typeSelect: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      subTypeSelect: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      accountClass: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      accountInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15)])],
      approximateOpeningDate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])]
    });
    this.subTypeSelect = this.formGroup.controls['subTypeSelect'];
    this.typeSelect = this.formGroup.controls['typeSelect'];
    this.accountClass = this.formGroup.controls['accountClass'];
    this.accountInput = this.formGroup.controls['accountInput'];
    this.approximateOpeningDate = this.formGroup.controls['approximateOpeningDate'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.subTypeSelect.enable();
    this.typeSelect.enable();
    this.accountClass.enable();
    this.accountInput.enable();
    this.approximateOpeningDate.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.subTypeSelect.disable();
    this.typeSelect.disable();
    this.accountClass.disable();
    this.accountInput.disable();
    this.approximateOpeningDate.disable();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes !== undefined && changes['changeMode'] !== undefined) {
      if (changes['changeMode'].currentValue) {
        this.ngOnInit();
        this.setUpForm();
        this.disableControls();
      } else {
        this.enableControls();
      }
    }
  }
}
