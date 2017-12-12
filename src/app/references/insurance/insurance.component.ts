import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {InsuranceService} from './shared/insurance.service';
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
import {TipoInstitucion} from '../../shared/client/tipo-institucion';
import {Institucion} from '../../shared/client/institucion';
import {ReferenciaSeguro} from '../../shared/client/referencia-seguro';
import {Currency} from '../../currency-select/shared/currency.model';
import {TypeInstitutionService} from '../../type-institution/shared/type-institution.service';
import {InstitutionService} from '../../institution/shared/institution.service';
import {TranslateService} from 'ng2-translate';
import {CatalogService} from '../../shared/services/catalog.service';
import {ReferencesComponent} from '../references.component';

declare var $: any;

@Component({
  selector: 'pl-insurance-reference',
  templateUrl: './insurance.component.html',
  styles: [``],
  providers: [InsuranceService, PlParameterService, InstitutionService, TypeInstitutionService],
})
export class InsuranceReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  private static PARAM_TPINAS = 'PARAM_TPINAS';
  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy = [];
  referenceList = [];
  heading: string[] = ['referencias-seguro.tipo-institucion', 'referencias-seguro.codigo-aseguradora', 'referencias-seguro.poliza'];
  headingEdit: string[] = ['referencias-seguro.tipo-institucion', 'referencias-seguro.codigo-aseguradora', 'referencias-seguro.poliza', 'table.actions'];
  values: string[] = ['tipoInstitucion.descripcion', 'institucion.descripcion', 'poliza'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  type: TipoInstitucion;
  subType: Institucion;
  expire: any;
  maxDate: any;
  maxDateExpire: any;
  minDate: any;
  busy: Promise<any>;
  client: ClienteDto;
  insurance: ReferenciaSeguro = new ReferenciaSeguro();
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
  policy: AbstractControl;
  policyType: AbstractControl;
  endorsement: AbstractControl;
  certificate: AbstractControl;
  currency: AbstractControl;
  coverage: AbstractControl;
  expireDate: AbstractControl;

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _securityService: SecurityService,
              private _translateService: TranslateService,
              private _institutionService: InstitutionService,
              private _institutionTypeService: TypeInstitutionService,
              private _partialPersistService: PartialPersistService,
              private _navigationService: NavigationService,
              private _validationService: ValidationsService,
              private _plService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _catalogService: CatalogService) {
    this.setUpForm();
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: (today.getMonth() + 1),
      day: today.getDate()
    };
    this.maxDateExpire = {
      year: today.getFullYear() + 50,
      month: (today.getMonth() + 1),
      day: today.getDate()
    };
    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
      if (!this.client.referencias.referenciasSeguros) {
        this.client.referencias.referenciasSeguros = [];
      }
    }
    this.getReferenceList();
  }

  async ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      if (this.changeMode) {
        this.disableControls();
      }
      this.referenceListCopy = this.client.referencias.referenciasSeguros;
      this.client.referencias.referenciasSeguros.forEach(insurance => {
        if (!insurance.tipoInstitucion || insurance.tipoInstitucion == null || insurance.tipoInstitucion) {
          insurance.tipoInstitucion = new TipoInstitucion();
        }
      });
    } else {
      this.enableControls();
      if (!this.client) {
        this.loadPartial();
      }
    }
    const value = await this._plService.getplParameter('', InsuranceReferenceComponent.PARAM_TPINAS);
    this.type = new TipoInstitucion();
    this.type.codigo = parseInt(value.valor, 10);
    this.typeSelect.disable();
    this.client.referencias.referenciasSeguros.forEach(insurance => {
      if (!insurance.tipoInstitucion || insurance.tipoInstitucion == null || insurance.tipoInstitucion) {
        insurance.tipoInstitucion = this.type;
      }
    });
    this.busy = this._institutionTypeService.getTypeInstitutionService();
    this.busy.then(response => {
      this.client.referencias.referenciasSeguros.forEach(insurance => {
        if (response.find(item => item.codigo === insurance.tipoInstitucion.codigo)) {
          insurance.tipoInstitucion.descripcion = response.find(item => item.codigo === insurance.tipoInstitucion.codigo).descripcion;
        }
      });
    });
    this.client.referencias.referenciasSeguros.forEach(insurance => {
      this.busy = this._institutionService.getInstitutionService(insurance.tipoInstitucion.codigo + '');
      this.busy.then(institutions => {
        insurance.institucion.descripcion = institutions.find(item => item.codigo === insurance.institucion.codigo).descripcion;
      });
    });
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  getReferenceList(): void {
    this._catalogService.getCatalogParam(ReferencesComponent.LIST_REFERENCE_CATALOG, ReferencesComponent.PERSON_TYPE_PARAM, this.client ? this.client.tipoPersona : 'J').then((list) => {
      this.referenceList = list;
    });
  }

  selectSector(sector): void {
    if (sector) {
      this.type = sector;
      this.insurance.tipoInstitucion = sector;
    }
    if (this.edit) {
      this.subTypeSelect.setValue(new Institucion());
    }
  }

  onCurrencyChange(currency: Currency) {
    this.insurance.moneda = currency;
  }

  selectSubSector(subSector): void {
    this.subType = subSector;
    if (subSector) {
      this.insurance.institucion = subSector;
    }
  }

  changeDateExpire(date): void {
    if (date) {
      this.insurance.fechaVencimiento = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  restoreReference(insurance: ReferenciaSeguro): void {
    const insuranceFound = this.client.referencias.referenciasSeguros.find((item) => insurance.codigoAseguradora === item.codigoAseguradora);
    if (insurance.modalidad === this.mode.I) {
      this.client.referencias.referenciasSeguros.splice(this.client.referencias.referenciasSeguros.indexOf(insuranceFound), 1);
    } else {
      const insuranceRestore = this.referenceListCopy.filter(item => insurance.codigoAseguradora === item.codigoAseguradora)[0];
      if (insuranceRestore) {
        this.client.referencias.referenciasSeguros[this.client.referencias.referenciasSeguros.indexOf(insuranceFound)] = JSON.parse(JSON.stringify(insuranceRestore));
      }
    }
    this.clean();
  }

  selectRecord(insurance: ReferenciaSeguro) {
    this.edit = true;
    this.insurance = JSON.parse(JSON.stringify(insurance));
    this.insurance.tipoInstitucion = this.type;
    this.subType = this.insurance.institucion;
    if (this.insurance.fechaVencimiento) {
      this.insurance.fechaVencimiento = new Date(insurance.fechaVencimiento);
      this.expire = {
        year: this.insurance.fechaVencimiento.getFullYear(),
        month: this.insurance.fechaVencimiento.getMonth() + 1,
        day: this.insurance.fechaVencimiento.getDate()
      };
    }
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
    if (this.insurance.modalidad !== this.mode.I) {
      this.client.referencias.referenciasSeguros.find(a => this.insurance.codigoAseguradora === a.codigoAseguradora).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasSeguros.find(a => this.insurance.codigoAseguradora === a.codigoAseguradora);
      this.client.referencias.referenciasSeguros.splice(this.client.referencias.referenciasSeguros.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.edit) {
      const insurance = this.client.referencias.referenciasSeguros.find((item) => this.insurance.codigoAseguradora === item.codigoAseguradora);
      this.client.referencias.referenciasSeguros[this.client.referencias.referenciasSeguros.indexOf(insurance)] = JSON.parse(JSON.stringify(this.insurance));
      if (this.insurance.modalidad !== this.mode.I) {
        this.client.referencias.referenciasSeguros.find(item => this.insurance.codigoAseguradora === item.codigoAseguradora).modalidad = this.mode.U;
      }
      this.clean();
    } else {
      if (this.validateReference()) {
        this.insurance.tipoInstitucion = this.type;
        this.insurance.modalidad = this.mode.I;
        this.client.referencias.referenciasSeguros.push(JSON.parse(JSON.stringify(this.insurance)));
        this.clean();
      }
    }
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'SEGUROS');
      if (reference.maximo <= this.client.referencias.referenciasSeguros.length) {
        this._translateService.get('exceptionace.core.clientes.referencias.maximo').subscribe((item) => {
          this.notificationService.alert(item, reference.maximo);
        });
        return false;
      }
      if (this.client.referencias.referenciasSeguros.find(item => item.codigoAseguradora === this.insurance.institucion.codigo)) {
        this._translateService.get('validations.reference-exist').subscribe((item) => {
          this.notificationService.alert(item, reference.maximo);
        });
        return false;
      }
      return true;
    }
    this._translateService.get('exceptionace.core.  clientes.exception.0100165').subscribe((item) => {
      this.notificationService.error('Error al recuperar parametrización', item);
    });
    return false;
  }

  isInvalidChange() {
    return false;
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
    this.insurance = new ReferenciaSeguro();
    this.insurance.tipoInstitucion = this.type;
    this.subTypeSelect.setValue(new TipoInstitucion());
    this.policy.setValue('');
    this.policyType.setValue('');
    this.endorsement.setValue('');
    this.certificate.setValue('');
    this.expireDate.setValue(undefined);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      typeSelect: [{
        value: this.type,
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      subTypeSelect: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      policy: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(20)])],
      policyType: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(10)])],
      endorsement: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(10)])],
      certificate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(10)])],
      expireDate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      currency: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      coverage: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])]
    });
    this.subTypeSelect = this.formGroup.controls['subTypeSelect'];
    this.typeSelect = this.formGroup.controls['typeSelect'];
    this.policy = this.formGroup.controls['policy'];
    this.policyType = this.formGroup.controls['policyType'];
    this.endorsement = this.formGroup.controls['endorsement'];
    this.certificate = this.formGroup.controls['certificate'];
    this.expireDate = this.formGroup.controls['expireDate'];
    this.currency = this.formGroup.controls['currency'];
    this.coverage = this.formGroup.controls['coverage'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.subTypeSelect.enable();
    // this.typeSelect.enable();
    this.policy.enable();
    this.policyType.enable();
    this.endorsement.enable();
    this.certificate.enable();
    this.expireDate.enable();
    this.currency.enable();
    this.coverage.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.subTypeSelect.disable();
    // this.typeSelect.disable();
    this.policy.disable();
    this.policyType.disable();
    this.endorsement.disable();
    this.certificate.disable();
    this.expireDate.disable();
    this.currency.disable();
    this.coverage.disable();
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
