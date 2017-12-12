import {
  AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';
import {isObject} from 'util';
import {TranslateService} from 'ng2-translate';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {ShareholderReferenceService} from './shared/shareholder.service';
import {Authorization, Authorized} from '../../authorization/shared/authorization';
import {ClienteDto} from '../../shared/client/cliente-dto';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {NavigationService} from '../../shared/services/navigation.service';
import {ValidationsService} from '../../shared/services/validations.service';
import {ClientFormSection} from '../../shared/clientFormSection.enum';
import {WebFormName} from '../../shared/webform-name';
import {Section} from '../../shared/section';
import {Neighborhood} from '../../neighborhood/shared/neighborhood';
import {TipoDireccion} from '../../shared/client/tipo-direccion';
import {Mode} from '../../shared/client/referenceDTO';
import {PlParameterService} from '../../pl-parameter/shared/pl-parameter.service';
import {ReferenciaAccionista} from '../../shared/client/referencia-accionista';
import {Nacionalidad} from '../../shared/client/nacionalidad';
import {TypeDocumentSelectComponent} from '../../type-document/type-document-select.component';
import {CatalogService} from '../../shared/services/catalog.service';
import {ReferencesComponent} from '../references.component';

declare var $: any;

@Component({
  selector: 'pl-shareholder-reference',
  templateUrl: './shareholder.component.html',
  styles: [``],
  providers: [ShareholderReferenceService, PlParameterService],
})
export class ShareholderReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  @ViewChild(TypeDocumentSelectComponent) typeDoc: TypeDocumentSelectComponent;
  identification: string;
  edit = false;
  mode = Mode;
  documentSelected;

  referenceListCopy = [];
  referenceList = [];
  heading: string[] = ['referencias-accionistas.apellidos', 'referencias-accionistas.nombres', 'referencias-accionistas.cargo', 'referencias-accionistas.documentos-identificacion'];
  headingEdit: string[] = ['referencias-accionistas.apellidos', 'referencias-accionistas.nombres', 'referencias-accionistas.cargo',
    'referencias-accionistas.documentos-identificacion', 'table.actions'];
  values: string[] = ['apellidos', 'nombres', 'cargo', 'identificacion'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  ingressDate: any;
  egressDate: any;
  maxDate: any;
  minDate: any;
  busy: Promise<any>;
  client: ClienteDto;
  shareholder: ReferenciaAccionista = new ReferenciaAccionista();
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
  lastName: AbstractControl;
  firstName: AbstractControl;
  documentType: AbstractControl;
  identificationInput: AbstractControl;
  country: AbstractControl;
  economicActivity: AbstractControl;
  shareholderType: AbstractControl;
  charge: AbstractControl;
  participation: AbstractControl;
  ingressDateInput: AbstractControl;
  egressDateInput: AbstractControl;

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _securityService: SecurityService,
              private _translateService: TranslateService,
              private _catalogService: CatalogService,
              private _partialPersistService: PartialPersistService,
              private _navigationService: NavigationService,
              private _validationService: ValidationsService,
              private _plService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef) {
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
      if (!this.client.referencias.referenciasAccionistas) {
        this.client.referencias.referenciasAccionistas = [];
      }
    }
    this.getReferenceList();
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.referenceListCopy = this.client.referencias.referenciasAccionistas;
      if (this.changeMode) {
        this.disableControls();
      }
    } else {
      this.enableControls();
      this.typeDoc.updateTypeDocument('', 'N');
      if (!this.client) {
        this.loadPartial();
      }
    }
  }

  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.identificationInput.setValue(value);
      this.identificationInput.updateValueAndValidity();
      this.shareholder.identificacion = value.toUpperCase();
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  getReferenceList(): void {
    this._catalogService.getCatalogParam(ReferencesComponent.LIST_REFERENCE_CATALOG, ReferencesComponent.PERSON_TYPE_PARAM, this.client ? this.client.tipoPersona : 'J').then((list) => {
      this.referenceList = list;
    });
  }

  checkReferences(): void {
    if (!this.client.referencias.referenciasVehiculos) {
      this.client.referencias.referenciasVehiculos = [];
    }
    if (!this.client.referencias.referenciasCredito) {
      this.client.referencias.referenciasCredito = [];
    }
    if (!this.client.referencias.referenciasAccionistas) {
      this.client.referencias.referenciasAccionistas = [];
    }
    if (!this.client.referencias.referenciasSeguros) {
      this.client.referencias.referenciasSeguros = [];
    }
    if (!this.client.referencias.referenciasPersonalesFamiliares) {
      this.client.referencias.referenciasPersonalesFamiliares = [];
    }
    if (!this.client.referencias.referenciasCuentas) {
      this.client.referencias.referenciasCuentas = [];
    }
    if (!this.client.referencias.referenciasPropiedades) {
      this.client.referencias.referenciasPropiedades = [];
    }
    if (!this.client.referencias.referenciasTarjetasCredito) {
      this.client.referencias.referenciasTarjetasCredito = [];
    }
  }

  changeDocumentType(document): void {
    if (document && isObject(document)) {
      this.shareholder.documentoIdentificacion = document;
    }
  }

  selectCountry(originCountry): void {
    this.shareholder.nacionalidad = originCountry;
  }

  selectEconomicActivity(economicActivity): void {
    this.shareholder.actividadEconomica = economicActivity;
  }

  changeDateIngress(date): void {
    if (date) {
      this.shareholder.fechaIngreso = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  changeDateEgress(date): void {
    if (date) {
      this.shareholder.fechaEgreso = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  restoreReference(shareholder: ReferenciaAccionista): void {
    const shareholderFound = this.client.referencias.referenciasAccionistas.find((item) => shareholder.correlativoReferencia === item.correlativoReferencia);
    if (shareholder.modalidad === this.mode.I) {
      this.client.referencias.referenciasAccionistas.splice(this.client.referencias.referenciasAccionistas.indexOf(shareholderFound), 1);
    } else {
      const shareholderRestore = this.referenceListCopy.filter(item => item.correlativoReferencia === shareholder.correlativoReferencia)[0];
      if (shareholderRestore) {
        this.client.referencias.referenciasAccionistas[this.client.referencias.referenciasAccionistas.indexOf(shareholderFound)] = JSON.parse(JSON.stringify(shareholderRestore));
      }
    }
    this.clean();
  }

  selectRecord(shareholder: ReferenciaAccionista) {
    this.edit = true;
    this.shareholder = JSON.parse(JSON.stringify(shareholder));
    this.shareholder.fechaIngreso = new Date(shareholder.fechaIngreso);
    if (this.shareholder.documentoIdentificacion && this.shareholder.documentoIdentificacion != null) {
      this.documentSelected = this.shareholder.documentoIdentificacion.codigo;
    }

    if (this.shareholder.nacionalidad == null) {
      this.shareholder.nacionalidad = new Nacionalidad();
    }
    this.ingressDate = {
      year: this.shareholder.fechaIngreso.getFullYear(),
      month: this.shareholder.fechaIngreso.getMonth() + 1,
      day: this.shareholder.fechaIngreso.getDate()
    };
    if (this.shareholder.fechaEgreso) {
      this.shareholder.fechaEgreso = new Date(shareholder.fechaEgreso);
      this.egressDate = {
        year: this.shareholder.fechaEgreso.getFullYear(),
        month: this.shareholder.fechaEgreso.getMonth() + 1,
        day: this.shareholder.fechaEgreso.getDate()
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
    if (this.shareholder.modalidad !== this.mode.I) {
      this.client.referencias.referenciasAccionistas.find(a => this.shareholder.correlativoReferencia === a.correlativoReferencia).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasAccionistas.find(a => this.shareholder.correlativoReferencia === a.correlativoReferencia);
      this.client.referencias.referenciasAccionistas.splice(this.client.referencias.referenciasAccionistas.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.validatePercentage(this.shareholder.porcentajeParticipacion)) {
      if (this.edit) {
        const shareholder = this.client.referencias.referenciasAccionistas.find((item) => this.shareholder.correlativoReferencia === item.correlativoReferencia);
        this.client.referencias.referenciasAccionistas[this.client.referencias.referenciasAccionistas.indexOf(shareholder)] = JSON.parse(JSON.stringify(this.shareholder));
        if (this.shareholder.modalidad !== this.mode.I) {
          this.client.referencias.referenciasAccionistas.find(item => item.correlativoReferencia === this.shareholder.correlativoReferencia).modalidad = this.mode.U;
        }
      } else {
        if (this.validateReference()) {
          this.shareholder.modalidad = this.mode.I;
          if (this.client.referencias.referenciasAccionistas.length === 0) {
            this.shareholder.correlativoReferencia = 0;
          } else {
            this.shareholder.correlativoReferencia = this.client.referencias.referenciasAccionistas[this.client.referencias.referenciasAccionistas.length - 1].correlativoReferencia + 1;
          }
          this.client.referencias.referenciasAccionistas.push(JSON.parse(JSON.stringify(this.shareholder)));
        }
      }
      this.clean();
    }
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'ACCIONISTAS');
      if (reference.maximo <= this.client.referencias.referenciasAccionistas.length) {
        this._translateService.get('exceptionace.core.clientes.referencias.maximo').subscribe((item) => {
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

  validatePercentage(newPercentage: number): boolean {
    newPercentage = parseInt(newPercentage + '', 10);
    let percentageParticipation = 0;
    if (this.client.referencias.referenciasAccionistas.length === 0 && newPercentage < 100) {
      return true;
    }
    this.client.referencias.referenciasAccionistas.forEach((item) => {
      percentageParticipation += parseInt(item.porcentajeParticipacion + '', 10);
    });
    if (this.edit) {
      percentageParticipation -= parseInt(this.client.referencias.referenciasAccionistas.find(share =>
        share.correlativoReferencia === this.shareholder.correlativoReferencia).porcentajeParticipacion + '', 10);
    }
    if (percentageParticipation + newPercentage > 100) {
      this._translateService.get('referencias-accionistas.participacion-supera-100').subscribe(value => {
        this.notificationService.error('Error de validacion', value);
      });
      return false;
    }
    return true;
  };

  isInvalidChange() {
    if (this.client.referencias.referenciasAccionistas.find(item => item.correlativoReferencia === this.shareholder.correlativoReferencia)) {
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
        // TODO show messages
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
    this.documentSelected = '';
    this.shareholder = new ReferenciaAccionista();
    this.firstName.setValue('');
    this.lastName.setValue('');
    this.documentType.setValue(undefined);
    this.shareholderType.setValue(new TipoDireccion());
    this.country.setValue(new Nacionalidad());
    this.economicActivity.setValue(new Neighborhood());
    this.charge.setValue('');
    this.shareholderType.setValue('');
    this.participation.setValue('');
    this.ingressDateInput.setValue(undefined);
    this.egressDateInput.setValue(undefined);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      lastName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.pattern)])],
      firstName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern(this.pattern)])],
      documentType: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      identificationInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      shareholderType: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      country: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      economicActivity: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      charge: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(0)])],
      participation: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(2)])],
      ingressDateInput: [{value: '', disabled: this.disabledField}, Validators.required],
      egressDateInput: [{value: '', disabled: this.disabledField}],
    });
    this.firstName = this.formGroup.controls['firstName'];
    this.lastName = this.formGroup.controls['lastName'];
    this.documentType = this.formGroup.controls['documentType'];
    this.identificationInput = this.formGroup.controls['identificationInput'];
    this.country = this.formGroup.controls['country'];
    this.economicActivity = this.formGroup.controls['economicActivity'];
    this.shareholderType = this.formGroup.controls['shareholderType'];
    this.charge = this.formGroup.controls['charge'];
    this.participation = this.formGroup.controls['participation'];
    this.ingressDateInput = this.formGroup.controls['ingressDateInput'];
    this.egressDateInput = this.formGroup.controls['egressDateInput'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.firstName.enable();
    this.lastName.enable();
    this.documentType.enable();
    this.identificationInput.enable();
    this.country.enable();
    this.economicActivity.enable();
    this.shareholderType.enable();
    this.charge.enable();
    this.participation.enable();
    this.ingressDateInput.enable();
    this.egressDateInput.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.firstName.disable();
    this.lastName.disable();
    this.documentType.disable();
    this.identificationInput.disable();
    this.country.disable();
    this.economicActivity.disable();
    this.shareholderType.disable();
    this.charge.disable();
    this.participation.disable();
    this.ingressDateInput.disable();
    this.egressDateInput.disable();
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
