import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {VehicleService} from './shared/vehicle.service';
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
import {ReferenciaVehiculo} from '../../shared/client/referencia-vehiculo';
import {CatalogService} from '../../shared/services/catalog.service';
import {ReferencesComponent} from '../references.component';

declare var $: any;

@Component({
  selector: 'pl-vehicle-reference',
  templateUrl: './vehicle.component.html',
  styles: [``],
  providers: [VehicleService, PlParameterService],
})
export class VehicleReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy = [];
  referenceList = [];
  heading: string[] = ['referencias-vehiculo.empresa', 'referencias-vehiculo.datos-vehiculo.marca', 'referencias-vehiculo.datos-vehiculo.modelo'];
  headingEdit: string[] = ['referencias-vehiculo.empresa', 'referencias-vehiculo.datos-vehiculo.marca', 'referencias-vehiculo.datos-vehiculo.modelo', 'table.actions'];
  values: string[] = ['empresaFinancia', 'marca', 'modelo'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  maxDate: any;
  maxDateExpire: any;
  minDate: any;
  busy: Promise<any>;
  client: ClienteDto;
  vehicle: ReferenciaVehiculo = new ReferenciaVehiculo();
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
  businessFinancing: AbstractControl;
  balance: AbstractControl;
  licencePlate: AbstractControl;
  brand: AbstractControl;
  model: AbstractControl;

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
    this.maxDateExpire = {
      year: today.getFullYear() + 50,
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
      if (!this.client.referencias.referenciasVehiculos) {
        this.client.referencias.referenciasVehiculos = [];
      }
    }
    this.getReferenceList();
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.referenceListCopy = this.client.referencias.referenciasVehiculos.slice(0);
      if (this.changeMode) {
        this.disableControls();
      }
    } else {
      this.enableControls();
      if (!this.client) {
        this.loadPartial();
      }
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

  restoreReference(vehicle: ReferenciaVehiculo): void {
    const vehicleFound = this.client.referencias.referenciasVehiculos.find((item) => vehicle.placa === item.placa);
    if (vehicle.modalidad === this.mode.I) {
      this.client.referencias.referenciasVehiculos.splice(this.client.referencias.referenciasVehiculos.indexOf(vehicleFound), 1);
    } else {
      const vehicleRestore = this.referenceListCopy.filter(item => vehicle.placa === item.placa)[0];
      if (vehicleRestore) {
        vehicleRestore.modalidad = undefined;
        this.client.referencias.referenciasVehiculos[this.client.referencias.referenciasVehiculos.indexOf(vehicleFound)] = JSON.parse(JSON.stringify(vehicleRestore));
      }
    }
    this.clean();
  }

  selectRecord(vehicle: ReferenciaVehiculo) {
    this.edit = true;
    this.vehicle = JSON.parse(JSON.stringify(vehicle));
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
    if (this.vehicle.modalidad !== this.mode.I) {
      this.client.referencias.referenciasVehiculos.find(a => this.vehicle.placa === a.placa).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasVehiculos.find(a => this.vehicle.placa === a.placa);
      this.client.referencias.referenciasVehiculos.splice(this.client.referencias.referenciasVehiculos.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (!this.vehicle.saldoFinanciamiento || this.vehicle.saldoFinanciamiento == null) {
      this.vehicle.saldoFinanciamiento = 0;
    }
    if (!this.vehicle.empresaFinancia || this.vehicle.empresaFinancia == null) {
      this.vehicle.empresaFinancia = '';
    }
    if (this.edit) {
      const vehicle = this.client.referencias.referenciasVehiculos.find((item) => this.vehicle.placa === item.placa);
      if (!this.vehicle.saldoFinanciamiento || this.vehicle.saldoFinanciamiento == null) {
        this.vehicle.saldoFinanciamiento = 0;
      }
      this.client.referencias.referenciasVehiculos[this.client.referencias.referenciasVehiculos.indexOf(vehicle)] = JSON.parse(JSON.stringify(this.vehicle));
      if (this.vehicle.modalidad !== this.mode.I) {
        this.client.referencias.referenciasVehiculos.find(item => item.placaVehiculo === this.vehicle.placaVehiculo).modalidad = this.mode.U;
      }
    } else {
      if (this.validateReference()) {
        this.vehicle.modalidad = this.mode.I;
        this.client.referencias.referenciasVehiculos.push(JSON.parse(JSON.stringify(this.vehicle)));
      }
    }
    this.clean();
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'VEHICULOS');
      if (reference.maximo <= this.client.referencias.referenciasVehiculos.length) {
        this._translateService.get('exceptionace.core.clientes.referencias.maximo').subscribe((item) => {
          this.notificationService.alert(item, reference.maximo);
        });
        return false;
      }
      if (this.client.referencias.referenciasVehiculos.find(item => item.placaVehiculo === this.vehicle.placaVehiculo)) {
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
    // if (this.client.referencias.referenciasVehiculos.find(item => item.placaVehiculo === this.vehicle.placaVehiculo)) {
    // return false;
    // }
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
    this.vehicle = new ReferenciaVehiculo();
    this.balance.setValue('');
    this.businessFinancing.setValue('');
    this.licencePlate.setValue('');
    this.model.setValue('');
    this.brand.setValue('');
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      businessFinancing: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(30)])],
      balance: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15)])],
      licencePlate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15)])],
      brand: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(25)])],
      model: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(4)])],
    });
    this.balance = this.formGroup.controls['balance'];
    this.businessFinancing = this.formGroup.controls['businessFinancing'];
    this.licencePlate = this.formGroup.controls['licencePlate'];
    this.brand = this.formGroup.controls['brand'];
    this.model = this.formGroup.controls['model'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.balance.enable();
    this.businessFinancing.enable();
    this.licencePlate.enable();
    this.brand.enable();
    this.model.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.balance.disable();
    this.businessFinancing.disable();
    this.licencePlate.disable();
    this.brand.disable();
    this.model.disable();
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
