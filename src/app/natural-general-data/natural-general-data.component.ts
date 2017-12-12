import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';

import {SecurityService} from 'security-angular/src/app';

import {GeneralDataNaturalService} from './shared/general-data-natural.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {Country} from '../country/shared/country';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {AccountOfficer} from '../account-officer/shared/account-officer';
import {NavigationService} from '../shared/services/navigation.service';
import {ClienteDto} from '../shared/client/cliente-dto';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ValidationsService} from '../shared/services/validations.service';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PersonRegistry} from './shared/person-registry';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';

declare var $: any;
@Component({
  selector: 'pl-natural-general-data',
  templateUrl: './natural-general-data.component.html',
  styles: [``],
  providers: [GeneralDataNaturalService, PlParameterService]
})
export class NaturalGeneralDataComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  identification: string;
  disabledField = true;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  MAYOEDAD = 'MAYOEDAD';
  MENOEDAD = 'MENOEDAD';
  NEXISRPE = 'NEXISRPE';
  MODREGPE = 'MODREGPE';
  DOCLISNE = 'DOCLISNE';
  PARAM_CODIGO_CEDULA = 'PARAM_CODIGO_CEDULA';
  authorization: Authorization;
  authorized: Authorized;
  bornDate: any;
  maxDate: any;
  minDate: any;
  existsInPersonRegistry = false;
  allowEditPersonRegistry = false;
  allowEditData = false;
  identityCodeParameter = '';
  busy: Promise<any>;
  client: ClienteDto;
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
  gender: AbstractControl;
  civilStatus: AbstractControl;
  basicAccountProfile: AbstractControl;
  surname: AbstractControl;
  secondSurname: AbstractControl;
  firstName: AbstractControl;
  secondName: AbstractControl;
  marriedSurname: AbstractControl;
  birthdate: AbstractControl;
  licence: AbstractControl;
  spouse: AbstractControl;
  country: AbstractControl;
  accountOfficer: AbstractControl;
  residence: AbstractControl;
  nationality: AbstractControl;
  profession: AbstractControl;

  constructor(private formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _securityService: SecurityService,
              private _generalDataNaturalService: GeneralDataNaturalService,
              private _partialPersistService: PartialPersistService,
              private _navigationService: NavigationService,
              private _validationService: ValidationsService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _plService: PlParameterService) {

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
    }
    this.busy = this._plService.getplParameter('', this.PARAM_CODIGO_CEDULA).then(value => {
      this.identityCodeParameter = value.valor;
    });
  }

  ngOnInit() {
    if (this.editMode) {
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._generalDataNaturalService.getGeneralDataNatural(this.identification);
      this.busy.then((client) => {
        this.client = client;
        const parsedDay = new Date(this.client.datosGeneralesPersonaNatural.fechaNacimientoCreacion);
        this.bornDate = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
      });
      this.disableControls();
    } else {
      this.enableControls();
      if (!this.client) {
        this.loadPartial();
      } else {
        const parsedDay = new Date(this.client.datosGeneralesPersonaNatural.fechaNacimientoCreacion);
        this.bornDate = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
        this.selectCivilStatus(this.client.datosGeneralesPersonaNatural.estadoCivil);
        this.setUpNacionality();
      }
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  valueChangeBasicProfile(basicAccount): void {
  }

  setUpNacionality(): void {
    this.busy = this._plService.getplParameter('', this.PARAM_CODIGO_CEDULA).then(value => {
      if (value.valor === this.client.tipoIdentificacion.codigo) {
        if (!this.client.autorizaciones.find(item => item.permiso === this.NEXISRPE)) {
          this.loadPersonRegistry();
        }
        this.nationality.disable();
      } else {
        this.nationality.enable();
      }
    });
  }

  loadPersonRegistry(): void {
    this.busy = this._generalDataNaturalService.getPersonRegistryInfo(this.client.tipoIdentificacion.codigo, this.client.identificacion);
    this.busy.then((data: PersonRegistry) => {
      this.client.datosGeneralesPersonaNatural.primerNombre = data.primerNombre;
      this.client.datosGeneralesPersonaNatural.segundoNombre = data.segundoNombre;
      this.client.datosGeneralesPersonaNatural.primerApellido = data.primerApellido;
      this.client.datosGeneralesPersonaNatural.segundoApellido = data.segundoApellido;
      this.client.datosGeneralesPersonaNatural.apellidoCasada = data.apellidoCasada;
      this.client.datosGeneralesPersonaNatural.genero = data.genero;
      this.client.datosGeneralesPersonaNatural.fechaNacimientoCreacion = new Date(data.fecha);
      const parsedDay = new Date(this.client.datosGeneralesPersonaNatural.fechaNacimientoCreacion);
      this.bornDate = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
      this.disablePersonRegistryFields();
      this.existsInPersonRegistry = true;
    });
  }

  disablePersonRegistryFields(): void {
    this.firstName.disable();
    this.secondName.disable();
    this.surname.disable();
    this.secondSurname.disable();
    this.marriedSurname.disable();
    this.gender.disable();
    this.birthdate.disable();
  }

  enablePersonRegistryFields(): void {
    this.firstName.enable();
    this.secondName.enable();
    this.surname.enable();
    this.secondSurname.enable();
    this.marriedSurname.enable();
    this.gender.enable();
    this.birthdate.enable();
  }

  selectCivilStatus(civilStatus): void {
    if (civilStatus) {
      this.client.datosGeneralesPersonaNatural.estadoCivil = civilStatus;
      if (civilStatus === 'C' || civilStatus === 'U') {
        this.spouse.setValidators([Validators.required]);
        // this.marriedSurname.enable();
        this.marriedSurname.setValidators([Validators.maxLength(15), Validators.pattern(this.pattern)]);
      } else {
        this.marriedSurname.clearValidators();
        this.spouse.clearValidators();
        this.marriedSurname.reset();
        this.marriedSurname.setValue('');
        this.spouse.reset();
        this.spouse.setValue('');
        this.client.datosGeneralesPersonaNatural.apellidoCasada = '';
        this.client.datosGeneralesPersonaNatural.conyuge = '';
      }

      if (this.client.datosGeneralesPersonaNatural.genero === 'F' && (civilStatus === 'S' || civilStatus === 'V' || civilStatus === 'D')) {
        this.client.datosGeneralesPersonaNatural.apellidoCasada = '';
      }
    }
  }

  requestEditPersonRegistry(): void {
    if (this.client.autorizaciones.find(item => item.permiso === this.MODREGPE)) {
      this.enablePersonRegistryFields();
      this.allowEditPersonRegistry = true;
    } else {
      this.busy = this._generalDataNaturalService.authorizeChangePersonRegistry();
      this.busy.then(() => {
        this.enablePersonRegistryFields();
        this.allowEditPersonRegistry = true;
      }).catch((e) => this.handleError(e));
    }
  }

  selectNationality(nationality): void {
    if (this.client.datosGeneralesPersonaNatural.nacionalidad && nationality) {
      if (this.client.datosGeneralesPersonaNatural.nacionalidad.codigo !== nationality.codigo) {
        this.client.datosGeneralesPersonaNatural.nacionalidad.codigo = nationality.codigo;
        this.client.datosGeneralesPersonaNatural.nacionalidad.moneda = nationality.moneda;
        this.client.datosGeneralesPersonaNatural.nacionalidad.nombre = nationality.nombre;
        if (this.client.datosGeneralesPersonaNatural.nacionalidad.codigo !== nationality.codigo) {
          this.client.datosGeneralesPersonaNatural.nacionalidad.codigo = nationality.codigo;
        }
        this.client.datosGeneralesPersonaNatural.nacionalidad.nacionalidad = nationality.nacionalidad;
      }
    }
  }

  selectProfession(profession): void {
    this.client.datosGeneralesPersonaNatural.profesion = profession;
  }

  selectCountry(originCountry): void {
    if (this.client.paisOrigen && originCountry) {
      if (this.client.paisOrigen.codigo !== originCountry.codigo) {
        this.client.paisOrigen.codigo = originCountry.codigo;
        this.client.paisOrigen.moneda = originCountry.moneda;
        this.client.paisOrigen.nombre = originCountry.nombre;
        this.client.paisOrigen.nacionalidad = originCountry.nacionalidad;
      }
    }
  }

  selectResidence(residenceCountry): void {
    if (this.client.datosGeneralesPersonaNatural.paisResidencia && residenceCountry) {
      if (this.client.datosGeneralesPersonaNatural.paisResidencia.codigo !== residenceCountry.codigo) {
        this.client.datosGeneralesPersonaNatural.paisResidencia.codigo = residenceCountry.codigo;
        this.client.datosGeneralesPersonaNatural.paisResidencia.moneda = residenceCountry.moneda;
        this.client.datosGeneralesPersonaNatural.paisResidencia.nombre = residenceCountry.nombre;
        this.client.datosGeneralesPersonaNatural.paisResidencia.nacionalidad = residenceCountry.nacionalidad;
      }
    }
  }

  selectAccountOfficer(accountOfficer): void {
    if (this.client.oficialDeCuentas && accountOfficer) {
      this.client.oficialDeCuentas.id = accountOfficer.id;
      this.client.oficialDeCuentas.descripcion = accountOfficer.descripcion;
      this.client.oficialDeCuentas.estado = accountOfficer.estado;
      this.client.oficialDeCuentas.tipo = accountOfficer.tipo;
    }
  }

  changeDate(date): void {
    if (date) {
      this.client.datosGeneralesPersonaNatural.fechaNacimientoCreacion = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
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

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = ClientFormSection[ClientFormSection.DATOS_GENERALES];
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      if (this.authorized.permiso === this.MODREGPE) {
        this.enablePersonRegistryFields();
        this.bindHide();
      } else {
        this.validateForm();
      }
    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
      $('.modal-backdrop').remove();
    }
  }

  change(cancel?: boolean) {
    if (cancel) {
      this.ngOnInit();
      return;
    }
    this.disabledField = !this.disabledField;
    this.gender.disabled ? this.gender.enable() : this.gender.disable();
    this.basicAccountProfile.disabled ? this.basicAccountProfile.enable() : this.basicAccountProfile.disable();
    this.civilStatus.disabled ? this.civilStatus.enable() : this.civilStatus.disable();
    this.birthdate.disabled ? this.birthdate.enable() : this.birthdate.disable();
    this.licence.disabled ? this.licence.enable() : this.licence.disable();
    this.country.disabled ? this.country.enable() : this.country.disable();
    this.nationality.disabled ? this.nationality.enable() : this.nationality.disable();
    this.residence.disabled ? this.residence.enable() : this.residence.disable();
    this.marriedSurname.disabled ? this.marriedSurname.enable() : this.marriedSurname.disable();
    this.spouse.disabled ? this.spouse.enable() : this.spouse.disable();
    this.accountOfficer.disabled ? this.accountOfficer.enable() : this.accountOfficer.disable();
    this.profession.disabled ? this.profession.enable() : this.profession.disable();
  }

  cancel() {
    $('#confirmModal').modal('show');
  }

  loadPartial() {
    this.client = new ClienteDto();
    this.client.datosGeneralesPersonaNatural.genero = 'F';
    this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
        this.setUpNacionality();
      }
    }).catch((e) => {
      console.error(e);
      this.client = new ClienteDto();
      this.client.datosGeneralesPersonaNatural.genero = 'F';
    });
  }

  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      this._validationService.validationForm(this.client, ClientFormSection[ClientFormSection.DATOS_GENERALES]).then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
    } else {
      // this.changeView.emit({prevSection: Section.naturalGeneralData, section: Section.economicProfile, status: true});
      this._navigationService.navigateTo(Section.naturalGeneralData, Section.dependentReference, true);
    }
  }

  partialSave(pass?: boolean): void {
    this.bindHide();
    if (this.client.autorizaciones) {
      this._navigationService.client.minorOld = false;
      this._navigationService.client.thirdOld = false;
      this.client.autorizaciones.forEach((item) => {
        if (item.permiso === this.MENOEDAD) {
          this._navigationService.client.minorOld = true;
        }
        if (item.permiso === this.MAYOEDAD) {
          this._navigationService.client.thirdOld = true;
        }
      });
    }
    if (this.editMode) {
      if (pass) {
        if (!this.client.autorizaciones) {
          this.client.autorizaciones = [];
        }
        this.client.autorizaciones.push(new Authorized(AccountFormSection[AccountFormSection.DATOS_GENERALES], 'ANINOCOI'));
      }
      this.busy = this._generalDataNaturalService.putGeneralDataNatural(this.client, this.identification);
      this.busy.then((client) => {
        this.bindHide();
        this.client = client;
        this.client.autorizaciones = [];
        this.change();
        this.successUpdate('Datos Generales Actualizados', 'Se actualizo correctamente');
      }, (e: any) => this.handleError(e));
    } else {
      this._navigationService.currentSections[0].status = true;
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.client.autorizaciones = [];
        this.next();
      }).catch((e) => {
        this.handleError(e);
        this._navigationService.currentSections[0].status = false;
      });
    }
  }

  handleError(error: any): void {
    this.allowEditPersonRegistry = false;
    if (error.status === 428) {
      let authorization = '';
      if (error._body !== '') {
        try {
          authorization = JSON.parse(error._body);
          this.authorization = authorization;
          $('#authorizationModal').modal('show');
          return;
        } catch (e) {
          authorization = error._body;
        }
      }
    } else if (error.status === 403) {
      if (error._body !== '' && JSON.parse(error._body).code === 'core.clientes.exception.0100153') {
        if (!($('#continueModal').data('bs.modal') || {}).isShown) {
          $('#continueModal').modal('show');
        }
      } else {
        if (error._body !== '') {
          this.notificationService.error('', JSON.parse(error._body).message);
        }
      }
    } else if (error._body !== '') {
      this.bindHide();
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
      return;
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

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      gender: [{
        value: 'F',
        disabled: this.disabledField
      }, Validators.required],
      civilStatus: [{
        value: undefined,
        disabled: this.disabledField
      }, Validators.required],
      basicAccountProfile: [{disabled: this.disabledField}],
      surname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondSurname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      marriedSurname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      firstName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      spouse: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(40), Validators.pattern(this.pattern)])],
      birthdate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.required],
      licence: [{value: '', disabled: this.disabledField}, Validators.maxLength(15)],
      country: [{value: new Country(), disabled: this.disabledField}, Validators.required],
      accountOfficer: [{value: new AccountOfficer(), disabled: this.disabledField}, Validators.required],
      nationality: [{value: '', disabled: this.disabledField}, Validators.required],
      residence: [{value: '', disabled: this.disabledField}, Validators.required],
      profession: [{
        value: '',
        disabled: this.disabledField
      }, Validators.required]
    });
    this.gender = this.formGroup.controls['gender'];
    this.civilStatus = this.formGroup.controls['civilStatus'];
    this.basicAccountProfile = this.formGroup.controls['basicAccountProfile'];
    this.surname = this.formGroup.controls['surname'];
    this.secondSurname = this.formGroup.controls['secondSurname'];
    this.firstName = this.formGroup.controls['firstName'];
    this.secondName = this.formGroup.controls['secondName'];
    this.marriedSurname = this.formGroup.controls['marriedSurname'];
    this.spouse = this.formGroup.controls['spouse'];
    this.birthdate = this.formGroup.controls['birthdate'];
    this.licence = this.formGroup.controls['licence'];
    this.country = this.formGroup.controls['country'];
    this.accountOfficer = this.formGroup.controls['accountOfficer'];
    this.nationality = this.formGroup.controls['nationality'];
    this.residence = this.formGroup.controls['residence'];
    this.profession = this.formGroup.controls['profession'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.gender.enable();
    this.civilStatus.enable();
    this.basicAccountProfile.enable();
    this.surname.enable();
    this.gender.enable();
    this.secondSurname.enable();
    this.firstName.enable();
    this.secondName.enable();
    this.marriedSurname.enable();
    this.spouse.enable();
    this.birthdate.enable();
    this.licence.enable();
    this.country.enable();
    this.profession.enable();
    this.accountOfficer.enable();
    this.nationality.enable();
    this.residence.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.gender.disable();
    this.civilStatus.disable();
    this.basicAccountProfile.disable();
    this.surname.disable();
    this.gender.disable();
    this.secondSurname.disable();
    this.firstName.disable();
    this.secondName.disable();
    this.marriedSurname.disable();
    this.spouse.disable();
    this.birthdate.disable();
    this.licence.disable();
    this.country.disable();
    this.profession.disable();
    this.accountOfficer.disable();
    this.nationality.disable();
    this.residence.disable();
  }
}
