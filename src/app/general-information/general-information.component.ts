import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../shared/form-section-interface';
import {GeneralInformationService} from './shared/general-information.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {Address} from '../neighborhood/shared/address';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {NavigationService} from '../shared/services/navigation.service';
import {ValidationsService} from '../shared/services/validations.service';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {Section} from '../shared/section';
import {Direccion} from '../shared/client/direccion';
import {Region} from '../region/shared/region';
import {Department} from '../department/shared/department';
import {Municipality} from '../municipality/shared/municipality';
import {Neighborhood} from '../neighborhood/shared/neighborhood';
import {TipoDireccion} from '../shared/client/tipo-direccion';
import {Zona} from '../shared/client/zona';
import {Ruta} from '../shared/client/ruta';
import {Mode} from '../shared/client/referenceDTO';
import {SaveService} from '../shared/services/save-service';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {DepartmentService} from '../department/shared/department.service';
import {MunicipalityService} from '../municipality/shared/municipality.service';
import {TypePersonEnum} from '../person-type/shared/person-type.enum';
import {TranslateService} from 'ng2-translate';
import {AddressTypeService} from '../address-type-select/shared/address-type.service';
import {isUndefined} from 'util';
import {PlatformParameters} from '../shared/platform-parameters.enum';

declare var $: any;

@Component({
  selector: 'pl-general-information',
  templateUrl: './general-information.component.html',
  styles: [``],
  providers: [GeneralInformationService, SaveService, PlParameterService, DepartmentService, MunicipalityService, AddressTypeService],
})
export class GeneralInformationComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  static DIR_PARAM_TYPE = 'PARAM_TIPDID';
  static DIR_PARAM_TYPE_WORK = 'PARAM_CODIGO_TIPO_DIRECCION_TRABAJO';
  static DIR_PARAM_TYPE_COMMERCE = 'PARAM_CODIGO_TIPO_DIRECCION_COMERCIO';
  ECONOMIC_RELATIONSHIP_INFORMAL;
  ECONOMIC_RELATIONSHIP_SALARIED;
  ECONOMIC_RELATIONSHIP_MERCHANT;
  ECONOMIC_RELATIONSHIP_BOTH;
  @Input() editMode;
  @Output() notifyHeader = new EventEmitter();
  withoutNeighborhood = false;
  identification: string;
  neighborhoodName: string;
  region: Region = new Region();
  department: Department = new Department();
  municipality: Municipality = new Municipality();
  neighborhood: Neighborhood = new Neighborhood();
  riskLevel: string;
  addressTypeSelected = undefined;
  edit = false;
  mode = Mode;
  homeAddressType: number;
  workAddressType: number;
  commerceAddressType: number;
  addressName;

  heading: string[] = ['general-information.address-type', 'general-information.address'];
  headingEdit: string[] = ['general-information.address-type', 'general-information.address', 'table.actions'];
  values: string[] = ['tipoDireccion.descripcion', 'direccion'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  oldDate: any;
  maxDate: any;
  minDate: any;
  busy: Promise<any>;
  client: ClienteDto;
  addressSearch: Address = new Address();
  address: Direccion = new Direccion();
  addressListCopy: Direccion[] = [];
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
  nameNeighborhood: AbstractControl;
  withoutNeighborhoodControl: AbstractControl;
  regionSelect: AbstractControl;
  departmentSelect: AbstractControl;
  municipalitySelect: AbstractControl;
  neighborhoodSelect: AbstractControl;
  addressTypeSelect: AbstractControl;
  addressInput: AbstractControl;
  postalMail: AbstractControl;
  postalCode: AbstractControl;
  phone1: AbstractControl;
  phone2: AbstractControl;
  fax: AbstractControl;
  extension: AbstractControl;
  zone: AbstractControl;
  email: AbstractControl;
  route: AbstractControl;
  oldDateInput: AbstractControl;

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _translateService: TranslateService,
              private _securityService: SecurityService,
              private _generalInformation: GeneralInformationService,
              private _partialPersistService: PartialPersistService,
              private _navigationService: NavigationService,
              private _validationService: ValidationsService,
              private _saveService: SaveService,
              private _plService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _departmentService: DepartmentService,
              private _municipalityService: MunicipalityService,
              private _addressTypeService: AddressTypeService) {
    this.setUpForm();
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
    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
    }
  }

  async ngOnInit() {
    if (this.editMode) {
      this.disableControls();
      this.setUpForm();
      this.client = new ClienteDto();
      this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE).then(response => {
        if (response && response.id && response.codigo) {
          this.homeAddressType = parseInt(response.valor, 10);
        }
      });
      this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE_WORK).then(response => {
        if (response && response.id && response.codigo) {
          this.workAddressType = parseInt(response.valor, 10);
        }
      });
      this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE_COMMERCE).then(response => {
        if (response && response.id && response.codigo) {
          this.commerceAddressType = parseInt(response.valor, 10);
        }
      });
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._addressTypeService.getAddressTypes().then((addressTypes) => {
        this.busy = this._generalInformation.getAddressByClient(this.identification);
        this.busy.then((response) => {
          this.client = response;
          if (this.client.referencias != null && this.client.referencias !== undefined) {
            if (this.client.referencias.referenciasComerciante == null || this.client.referencias.referenciasComerciante === undefined) {
              this.client.referencias.referenciasComerciante = [];
            }
            if (this.client.referencias.referenciasLaborales == null || this.client.referencias.referenciasLaborales === undefined) {
              this.client.referencias.referenciasLaborales = [];
            }
          }
          this.client.direcciones.forEach(address => address.tipoDireccion.descripcion = addressTypes.find(item => item.codigo === address.tipoDireccion.codigo).descripcion);
          this.addressListCopy = JSON.parse(JSON.stringify(this.client.direcciones));
          this.setUpReference();
        }).catch(e => this.handleError(e));
      }).catch(e => this.handleError(e));
    } else {
      this.enableControls();
      if (!this.client) {
        this.loadPartial();
      } else {
        this.setUpReference();
      }
    }
    const informal = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_OTROS);
    this.ECONOMIC_RELATIONSHIP_INFORMAL = parseInt(informal.valor, 10);
    const merchant = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_COMERCIANTE);
    const both = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_AMBOS);
    const salaried = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_ASALARIADO);
    this.ECONOMIC_RELATIONSHIP_MERCHANT = parseInt(merchant.valor, 10);
    this.ECONOMIC_RELATIONSHIP_BOTH = parseInt(both.valor, 10);
    this.ECONOMIC_RELATIONSHIP_SALARIED = parseInt(salaried.valor, 10);
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  validateEmail(input: FormControl) {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])+(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
    if (input.value) {
      if (EMAIL_REGEXP.test(input.value)) {
        return null;
      }
    }
    return {
      'email': true
    };
  }

  valueChangeWithoutNeighborhood(status): void {
    if (!status) {
      this.neighborhoodName = '';
      this.address.nivelGeografico1 = undefined;
      this.address.nivelGeografico2 = undefined;
      this.address.nivelGeografico3 = undefined;
      this.address.nivelGeografico4 = undefined;
      this.region = new Region();
      this.department = new Department();
      this.municipality = new Municipality();
      this.neighborhood = new Neighborhood();
      this.regionSelect.disable();
      this.departmentSelect.disable();
      this.municipalitySelect.disable();
      this.neighborhoodSelect.disable();
    } else {
      this.neighborhoodName = '';
      this.address.nivelGeografico1 = undefined;
      this.address.nivelGeografico2 = undefined;
      this.address.nivelGeografico3 = undefined;
      this.address.nivelGeografico4 = undefined;
      this.regionSelect.enable();
      this.departmentSelect.enable();
      this.municipalitySelect.enable();
      this.neighborhoodSelect.disable();
    }
  }

  selectAddress(address: Address) {
    this.addressSearch = address;
    this.neighborhoodName = address.nombreLugar4;
    this.address.nivelGeografico1 = parseInt(address.nivelGeografico01, 10);
    this.address.nivelGeografico2 = address.nivelGeografico22;
    this.address.nivelGeografico3 = address.nivelGeografico33;
    this.address.nivelGeografico4 = address.nivelGeografico44;
    this._generalInformation.getRiskLevel(this.address.nivelGeografico1, this.address.nivelGeografico2, this.address.nivelGeografico3, this.address.nivelGeografico4)
      .then(riskLevel => this.riskLevel = riskLevel[0] ? riskLevel[0].nivelRiesgo.trim() : undefined)
      .catch(e => this.handleError(e));
    $('#neighborhoodSearchModal').modal('hide');
  }

  selectRegion(region): void {
    if (region) {
      this.region = region;
      if (this.address.nivelGeografico1 !== this.region.id.codigo) {
        this.address.nivelGeografico1 = this.region.id.codigo;
      }
    }
  }

  selectDepartment(department): void {
    if (department) {
      this.department = department;
      if (this.address.nivelGeografico2 !== this.department.id.codigo) {
        this.address.nivelGeografico2 = this.department.id.codigo;
      }
    }
  }

  selectMunicipality(municipality): void {
    if (municipality) {
      this.municipality = municipality;
      if (this.address.nivelGeografico3 !== this.municipality.id.codigo) {
        this.address.nivelGeografico3 = this.municipality.id.codigo;
        this.address.nivelGeografico4 = 99;
      }
    }
  }

  selectNeighborhood(neighborhood): void {
    if (neighborhood && this.region && this.department && this.municipality) {
      this.neighborhood = neighborhood;
      if (this.address.nivelGeografico4 !== this.neighborhood.id.codigo) {
        this.address.nivelGeografico4 = this.neighborhood.id.codigo;
        if (this.address.nivelGeografico4 !== 99) {
          this.neighborhoodName = this.neighborhood.descripcion;
        }
      }
      if (this.neighborhood.id.codigo && this.region.id.codigo && this.department.id.codigo && this.municipality.id.codigo) {
        this._generalInformation.getRiskLevel(this.region.id.codigo, this.department.id.codigo, this.municipality.id.codigo, this.neighborhood.id.codigo)
          .then(riskLevel => this.riskLevel = riskLevel[0].nivelRiesgo)
          .catch(e => this.handleError(e));
      }
    }
  }

  selectAddressType(addressType: TipoDireccion): void {
    this.address.tipoDireccion = addressType;
    if (addressType) {
      this.addressTypeSelected = addressType.codigo;
    }
    if (this.address.tipoDireccion.codigo === this.workAddressType) {
      this.email.setValidators(Validators.compose([Validators.maxLength(80)]));
      this.email.updateValueAndValidity();
    } else {
      this.email.clearValidators();
    }
  }

  selectAddressZone(zone: Zona) {
    if (zone) {
      this.address.zona = zone;
    }
  }

  selectAddressRoute(route: Ruta) {
    this.address.ruta = route;
  }

  changeDate(date): void {
    if (date) {
      this.address.antiguedad = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    } else {
      this.address.antiguedad = undefined;
    }
  }

  numbersOnly(event) {
    if (event) {
      // Allow special chars + arrows
      if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 9
        || event.keyCode === 27 || event.keyCode === 13
        || (event.keyCode === 65 && event.ctrlKey === true)
        || (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
      } else {
        // If it's not a number stop the keypress
        if (event.shiftKey || (event.altKey && ((event.keycode >= 49 && event.keycode <= 57)
          || (event.keycode >= 96 && event.keycode <= 105))) || event.keyCode === 17 || event.keyCode === 225
          || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
          event.preventDefault();
        }
      }
    }
  }

  restoreAddress(address: Direccion): void {
    const addressFound = this.client.direcciones.find((item) => address.correlativoDireccion === item.correlativoDireccion);
    if (address.modalidad === this.mode.I) {
      this.client.direcciones.splice(this.client.direcciones.indexOf(addressFound), 1);
    } else {
      const addressRestore = this.addressListCopy.filter(item => item.correlativoDireccion === address.correlativoDireccion)[0];
      if (addressRestore) {
        this.client.direcciones[this.client.direcciones.indexOf(addressFound)] = JSON.parse(JSON.stringify(addressRestore));
      }
    }
    this.clean();
  }

  selectRecord(address: Direccion): void {
    this.edit = true;
    if (address.nivelGeografico4 === 99) {
      this.withoutNeighborhoodControl.setValue(true);
    }
    this.address = JSON.parse(JSON.stringify(address));
    if (address.antiguedad) {
      this.address.antiguedad = new Date(address.antiguedad);
      this.oldDate = {
        year: this.address.antiguedad.getFullYear(),
        month: this.address.antiguedad.getMonth() + 1,
        day: this.address.antiguedad.getUTCDate()
      };
    }
    this.addressSearch = new Address();
    this.addressSearch.nivelGeografico44 = address.nivelGeografico4;
    this.addressSearch.nivelGeografico43 = address.nivelGeografico3;
    this.addressSearch.nivelGeografico42 = address.nivelGeografico2;
    this.addressSearch.nivelGeografico41 = address.nivelGeografico1;
    this.addressSearch.nivelGeografico33 = address.nivelGeografico3;
    this.addressSearch.nivelGeografico32 = address.nivelGeografico2;
    this.addressSearch.nivelGeografico31 = address.nivelGeografico1;
    this.addressSearch.nivelGeografico22 = address.nivelGeografico2;
    this.addressSearch.nivelGeografico21 = address.nivelGeografico1;
    this.addressSearch.nivelGeografico01 = address.nivelGeografico1 + '';
    this.addressTypeSelected = address.tipoDireccion.codigo;
    if (this.address.tipoDireccion.codigo === this.workAddressType) {
      this.email.setValue(this.address.email);
      this.email.setValidators(Validators.compose([Validators.maxLength(80)]));
      this.email.updateValueAndValidity();
    } else {
      this.email.clearValidators();
      this.email.setValue(this.address.email);
    }
    this._departmentService.getDepartmentsById(this.address.nivelGeografico1).then((departments) => {
      this.department = departments.find(item => item.id.codigo === this.address.nivelGeografico2 && item.id.codigoRegion === this.address.nivelGeografico1);
    });
    this._municipalityService.getMunicipalityById(this.address.nivelGeografico2).then((municipalities) => {
      this.municipality = municipalities.find(item => item.id.codigo === this.address.nivelGeografico3 && item.id.codigoRegion === this.address.nivelGeografico1
      && item.id.codigoDepartamento === this.address.nivelGeografico2);
    });
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = ClientFormSection[ClientFormSection.DIRECCIONES];
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

  removeAddress(): void {
    if (this.address.modalidad !== this.mode.I) {
      let tmp = JSON.parse(JSON.stringify(this.address)); // create tmp for don't lose current reference address
      this.busy = this._generalInformation.existsAddressAssociatedToAccount(this.identification, tmp.correlativoDireccion);
      this.busy.then((response) => {
        this.address = tmp;
        this.client.direcciones.find(a => this.address.correlativoDireccion === a.correlativoDireccion).modalidad = this.mode.D;
      }).catch(e => this.handleError(e));
    } else {
      const ref = this.client.direcciones.find(a => this.address.correlativoDireccion === a.correlativoDireccion);
      this.client.direcciones.splice(this.client.direcciones.indexOf(ref), 1);
    }
    this.clean();
  }

  addAddress(): void {
    if (this.edit) {
      const address = this.client.direcciones.find((item) => this.address.correlativoDireccion === item.correlativoDireccion);
      this.client.direcciones[this.client.direcciones.indexOf(address)] = JSON.parse(JSON.stringify(this.address));
      if (this.address.modalidad !== this.mode.I) {
        this.client.direcciones.find(item => item.correlativoDireccion === this.address.correlativoDireccion).modalidad = this.mode.U;
      }
    } else {
      this.address.modalidad = this.mode.I;
      if (this.client.direcciones.length === 0) {
        this.address.correlativoDireccion = 0;
      } else {
        this.address.correlativoDireccion = this.client.direcciones[this.client.direcciones.length - 1].correlativoDireccion + 1;
      }
      this.client.direcciones.push(JSON.parse(JSON.stringify(this.address)));
      if (this.address.tipoDireccion.codigo === this.workAddressType) {
        for (let i = 0; i < this.client.referencias.referenciasLaborales.length; i++) {
          if (this.client.referencias.referenciasLaborales[i]) {
            this.client.referencias.referenciasLaborales[i].direccion = this.address;
          }
        }
      }
      if (this.address.tipoDireccion.codigo === this.commerceAddressType) {
        for (let i = 0; i < this.client.referencias.referenciasComerciante.length; i++) {
          if (this.client.referencias.referenciasComerciante[i]) {
            this.client.referencias.referenciasComerciante[i].direccion = this.address;
          }
        }
      }
    }
    this.clean();
  }

  isInvalidChange() {
    if (this.client.direcciones.find(item => item.correlativoDireccion === this.address.correlativoDireccion && item.tipoDireccion.codigo === this.address.tipoDireccion.codigo)) {
      return false;
    }
    return true;
  }

  setUpReference(): void {
    setTimeout(() => {
      if (this.ECONOMIC_RELATIONSHIP_INFORMAL !== this.client.perfilEconomico.relacionEconomica) {
        if (this.client.tipoPersona === TypePersonEnum[TypePersonEnum.J]) {
          if (!this.commerceAddressType) {
            this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE_COMMERCE).then(response => {
              if (response && response.id && response.codigo) {
                this.commerceAddressType = parseInt(response.valor, 10);
                if (!this.client.direcciones.find(item => item.tipoDireccion.codigo === this.commerceAddressType)) {
                  this.addressTypeSelected = this.commerceAddressType;
                  if (this.client.datosGeneralesPersonaJuridica && this.client.datosGeneralesPersonaJuridica != null) {
                    this.setUpNameAndDisableAddressType(this.client.datosGeneralesPersonaJuridica.nombreComercial);
                    return;
                  }
                }
              }
            });
          } else {
            if (!this.client.direcciones.find(item => item.tipoDireccion.codigo === this.commerceAddressType)) {
              this.addressTypeSelected = this.commerceAddressType;
              this.setUpNameAndDisableAddressType(this.client.datosGeneralesPersonaJuridica.nombreComercial);
              return;
            }
          }
        } else {
          if (this.client.referencias.referenciasComerciante && this.client.referencias.referenciasComerciante.length > 0) {
            if (this.ECONOMIC_RELATIONSHIP_SALARIED === this.client.perfilEconomico.relacionEconomica) {
              return;
            }
            if (this.client.referencias.referenciasComerciante[0].nombreNegocio) {
              if (!this.commerceAddressType) {
                this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE_COMMERCE).then(response => {
                  if (response && response.id && response.codigo) {
                    this.commerceAddressType = parseInt(response.valor, 10);
                    if (this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.commerceAddressType).length < this.client.referencias.referenciasComerciante.length) {
                      this.addressTypeSelected = this.commerceAddressType;
                      const index = this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.commerceAddressType).length;
                      this.setUpNameAndDisableAddressType(this.client.referencias.referenciasComerciante[index === undefined ? 0 : index].nombreNegocio);
                      return;
                    }
                  }
                });
              } else {
                if (this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.commerceAddressType).length < this.client.referencias.referenciasComerciante.length) {
                  this.addressTypeSelected = this.commerceAddressType;
                  const index = this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.commerceAddressType).length;
                  this.setUpNameAndDisableAddressType(this.client.referencias.referenciasComerciante[index === undefined ? 0 : index].nombreNegocio);
                  return;
                }
              }
            }
          }
          if (this.client.referencias.referenciasLaborales && this.client.referencias.referenciasLaborales.length > 0) {
            if (this.ECONOMIC_RELATIONSHIP_MERCHANT === this.client.perfilEconomico.relacionEconomica) {
              return;
            }
            if (this.client.referencias.referenciasLaborales[0].nombre) {
              if (!this.workAddressType) {
                this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE_WORK).then(response => {
                  if (response && response.id && response.codigo) {
                    this.workAddressType = parseInt(response.valor, 10);
                    if (this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.workAddressType).length < this.client.referencias.referenciasLaborales.length) {
                      this.addressTypeSelected = this.workAddressType;
                      this.email.setValidators(Validators.compose([Validators.maxLength(80)]));
                      this.email.updateValueAndValidity();
                      const index = this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.workAddressType).length;
                      this.setUpNameAndDisableAddressType(this.client.referencias.referenciasLaborales[index === undefined ? 0 : index].nombre);
                      return;
                    }
                  }
                });
              } else {
                if (this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.workAddressType).length < this.client.referencias.referenciasLaborales.length) {
                  this.addressTypeSelected = this.workAddressType;
                  this.email.setValidators(Validators.compose([Validators.maxLength(80)]));
                  this.email.updateValueAndValidity();
                  const index = this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.workAddressType).length;
                  this.setUpNameAndDisableAddressType(this.client.referencias.referenciasLaborales[index === undefined ? 0 : index].nombre);
                  return;
                }
              }
            }
          }
        }
      }
      this.setUpDefaultTypeAddress();
    }, 500);
  }

  setUpDefaultTypeAddress(): void {
    this.email.clearValidators();
    this.email.reset();
    this.email.setValue(this.address.email);
    this.addressName = '';
    if (!this.homeAddressType) {
      this.getAddressTypeParam(GeneralInformationComponent.DIR_PARAM_TYPE).then(response => {
        if (response && response.id && response.codigo) {
          this.homeAddressType = parseInt(response.valor, 10);
        }
      });
    } else {
      this.addressTypeSelected = this.homeAddressType;
    }
    if (!this.editMode) {
      this.addressTypeSelect.enable();
    }

    if (this.disabledField) {
      this.addressTypeSelect.disable();
    }

  }

  setUpNameAndDisableAddressType(name: string): void {
    this.addressName = name;
    this.addressTypeSelect.disable();
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
        this.setUpReference();
      }
    }).catch((e) => {
      console.error(e);
      this.client = new ClienteDto();
    });
  }

  validateForm(): void {
    if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH
      || this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_SALARIED) {
      if (this.client.referencias.referenciasLaborales.length === 0
        || this.client.referencias.referenciasLaborales.length > this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.workAddressType).length) {
        this._translateService.get('exceptionace.core.clientes.exception.0100174').subscribe(value => {
          this._translateService.get('exceptionace.core.depositos.exception.0100298').subscribe(title => {
            this.notificationService.error(title, value);
          });
        });
        return;
      }
    }
    if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH
      || this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_MERCHANT && !this.client.referencias.referenciasComerciante) {
      if (this.client.referencias.referenciasComerciante.filter(item => item.contador !== undefined || item.contador != null).length === 0
        || this.client.referencias.referenciasComerciante.filter(item => item.contador !== undefined
        && item.contador != null).length > this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.commerceAddressType).length) {
        this._translateService.get('exceptionace.core.clientes.exception.0100174').subscribe(value => {
          this._translateService.get('exceptionace.core.depositos.exception.0100298').subscribe(title => {
            this.notificationService.error(title, value);
          });
        });
        return;
      }
    }
    if (this.client.tipoPersona === TypePersonEnum[TypePersonEnum.N]) {
      if (this.client.direcciones.filter(item => item.tipoDireccion.codigo === this.homeAddressType).length < 1) {
        this._translateService.get('exceptionace.core.clientes.exception.0100174').subscribe(value => {
          this._translateService.get('exceptionace.core.depositos.exception.0100298').subscribe(title => {
            this.notificationService.error(title, value);
          });
        });
        return;
      }
    }
    if (this.editMode) {
      this.partialSave();
    } else {
      this.busy = this._validationService.validationForm(this.client, ClientFormSection[ClientFormSection.DIRECCIONES]);
      this.busy.then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
      this.notifyHeader.emit();
    } else {
      this.notifyHeader.emit();
      // this.changeView.emit({prevSection: Section.naturalGeneralData, section: Section.economicProfile, status: true});
      this._navigationService.navigateTo(Section.addressInformation, Section.customerCreated, true);
    }
  }

  partialSave(): void {
    console.log(this.client);
    if (this.editMode) {
      this.busy = this._generalInformation.putAddress(this.client, this.identification);
      this.busy.then((client) => {
        this.bindHide();
        this.client = client;
        this.client.autorizaciones = [];
        this.successUpdate('Informacion General Actualizada', 'Se actualizo correctamente');
        this.ngOnInit();
        this.notifyHeader.emit();
      }, (e: any) => this.handleError(e));
    } else {
      this.busy = this._plService.getplParameter(undefined, 'PARAM_EMPRSA');
      this.busy.then((data) => {
        this.busy = this._saveService.saveClient(this.client, parseInt(data.valor, 10));
        this.busy.then((client) => {
          this.client = client;
          this._navigationService.currentSections.find(item => item.section === Section.addressInformation).status = true;
          this.next();
          this.busy = this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client);
          this.busy.then((response) => {
          }).catch(er => this.handleError(er));
        }).catch(e => this.handleError(e));
      }).catch(e => this.handleError(e));
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
      if (isUndefined(JSON.parse(error._body).code)) {
        this.notificationService.error('', JSON.parse(error._body).message);
      } else {
        this._translateService.get('exceptionace.' + JSON.parse(error._body).code).subscribe(title => {
          this.notificationService.error('', title);
        });
      }
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

  valueChangeEmail(event) {
    if (event.value && event.value.length > 0) {
      this.email.setValidators(Validators.compose([this.validateEmail, Validators.maxLength(80)]));
      this.email.updateValueAndValidity();
    } else {
      this.email.clearValidators();
      this.email.setValue(this.address.email);
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
    this.withoutNeighborhood = false;
    this.addressTypeSelected = undefined;
    this.addressSearch = new Address();
    this.address = new Direccion();
    this.nameNeighborhood.setValue('');
    this.nameNeighborhood.disable();
    this.withoutNeighborhoodControl.setValue(false);
    this.regionSelect.setValue(new Region());
    this.departmentSelect.setValue(new Department());
    this.addressTypeSelect.setValue(new TipoDireccion());
    this.municipalitySelect.setValue(new Municipality());
    this.neighborhoodSelect.setValue(new Neighborhood());
    this.addressInput.setValue('');
    this.postalMail.setValue('');
    this.postalCode.setValue('');
    this.phone1.setValue('');
    this.phone2.setValue('');
    this.fax.setValue('');
    this.extension.setValue('');
    this.email.setValue('');
    this.zone.setValue(new Zona());
    this.route.setValue(new Ruta());
    this.oldDateInput.setValue(undefined);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.setUpReference();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      nameNeighborhood: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.maxLength(30), Validators.minLength(0)])],
      withoutNeighborhoodControl: [{value: false}],
      regionSelect: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required])],
      departmentSelect: [{
        value: new Department(),
        disabled: true
      }, Validators.compose([Validators.required])],
      addressTypeSelect: [{
        value: '',
      }, Validators.compose([Validators.required])],
      municipalitySelect: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required])],
      neighborhoodSelect: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required])],
      addressInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(120), Validators.minLength(10)])],
      postalMail: [{value: '', disabled: this.disabledField}, Validators.maxLength(10)],
      postalCode: [{value: '', disabled: this.disabledField}, Validators.maxLength(10)],
      phone1: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(12), Validators.required])],
      phone2: [{value: '', disabled: this.disabledField}, Validators.maxLength(12)],
      fax: [{value: '', disabled: this.disabledField}, Validators.maxLength(12)],
      extension: [{value: '', disabled: this.disabledField}, Validators.maxLength(4)],
      email: [{
        value: undefined,
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(80)])],
      zone: [{
        value: new Zona(),
        disabled: this.disabledField
      }],
      route: [{value: new Ruta(), disabled: this.disabledField}],
      oldDateInput: [{
        value: '',
        disabled: this.disabledField
      }],
    });
    this.nameNeighborhood = this.formGroup.controls['nameNeighborhood'];
    this.withoutNeighborhoodControl = this.formGroup.controls['withoutNeighborhoodControl'];
    this.regionSelect = this.formGroup.controls['regionSelect'];
    this.departmentSelect = this.formGroup.controls['departmentSelect'];
    this.municipalitySelect = this.formGroup.controls['municipalitySelect'];
    this.neighborhoodSelect = this.formGroup.controls['neighborhoodSelect'];
    this.addressTypeSelect = this.formGroup.controls['addressTypeSelect'];
    this.addressInput = this.formGroup.controls['addressInput'];
    this.postalMail = this.formGroup.controls['postalMail'];
    this.postalCode = this.formGroup.controls['postalCode'];
    this.phone1 = this.formGroup.controls['phone1'];
    this.phone2 = this.formGroup.controls['phone2'];
    this.fax = this.formGroup.controls['fax'];
    this.extension = this.formGroup.controls['extension'];
    this.email = this.formGroup.controls['email'];
    this.route = this.formGroup.controls['route'];
    this.oldDateInput = this.formGroup.controls['oldDateInput'];
    this.zone = this.formGroup.controls['zone'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.nameNeighborhood.disable();
    if (this.addressTypeSelected === this.commerceAddressType || this.addressTypeSelected === this.workAddressType) {
      this.addressTypeSelect.disable();
    } else {
      this.addressTypeSelect.enable();
    }
    this.withoutNeighborhoodControl.enable();
    this.regionSelect.disable();
    this.departmentSelect.disable();
    this.municipalitySelect.disable();
    this.neighborhoodSelect.disable();
    this.addressInput.enable();
    this.postalMail.enable();
    this.postalCode.enable();
    this.phone1.enable();
    this.phone2.enable();
    this.fax.enable();
    this.extension.enable();
    this.email.enable();
    this.oldDateInput.enable();
    this.zone.enable();
    this.route.enable();
  }


  disableControls(cancel?: boolean): void {
    if (cancel) {
      this.ngOnInit();
      return;
    }
    this.disabledField = true;
    this.nameNeighborhood.disable();
    this.addressTypeSelect.disable();
    this.withoutNeighborhoodControl.disable();
    this.regionSelect.disable();
    this.departmentSelect.disable();
    this.municipalitySelect.disable();
    this.neighborhoodSelect.disable();
    this.addressTypeSelect.disable();
    this.addressInput.disable();
    this.postalMail.disable();
    this.postalCode.disable();
    this.phone1.disable();
    this.phone2.disable();
    this.zone.disable();
    this.route.disable();
    this.fax.disable();
    this.extension.disable();
    this.email.disable();
    this.oldDateInput.disable();
  }
}
