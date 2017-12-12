import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {isObject} from 'util';
import {SecurityService} from 'security-angular/src/app';

import {RepresetanteLegalTutor} from '../shared/client/representante-legal-tutor';

import {TypeDocumentSelectComponent} from '../type-document/type-document-select.component';
import {TypedocService} from 'backoffice-ace/src/app/core/typedoc/shared/typedoc.service';
import {environment} from '../../environments/environment';

import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {ChangeService} from '../shared/services/change.service';
import {TypePersonEnum} from '../person-type/shared/person-type.enum';
import {PerfilEconomico} from '../shared/client/perfil-economico';

declare var $: any;
@Component({
  selector: 'pl-legal-representative',
  templateUrl: './legal-representative.component.html',
  styleUrls: ['./legal-representative.component.css'],
  providers: [TypedocService, DatePipe]
})
export class LegalRepresentativeComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Output() validProfile = new EventEmitter();
  @ViewChild('docType') tipeDoc: TypeDocumentSelectComponent;

  legalRepresentative: RepresetanteLegalTutor;
  typeDocument2URL = environment.apiUrl + '/api/';

  public tipoPersona: any;
  public mask = [];
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  private identification: string;
  private usaRepresentante = false;
  private tempIdentificiacion = '';
  authorization: Authorization;
  authorized: Authorized;
  isCopy = true;
  requiredLegal = false;

  client: ClienteDto;
  personType = TypePersonEnum;
  bornDate: any;
  minDate: any;
  maxDate: any;
  formGroup: FormGroup;

  surname: AbstractControl;
  secondSurname: AbstractControl;
  marriedSurname: AbstractControl;
  firstName: AbstractControl;
  secondName: AbstractControl;
  phone: AbstractControl;
  phone2: AbstractControl;
  address: AbstractControl;
  appointmentDates: AbstractControl;
  profession: AbstractControl;
  useRepresentative: AbstractControl;
  identificacion: AbstractControl;
  identificationType: AbstractControl;
  name: AbstractControl;

  busy: Promise<any>;

  constructor(private router: Router,
              private translate: TranslateService,
              private formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private datePipe: DatePipe,
              private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private validationService: ValidationsService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _securityService: SecurityService,
              private changeService: ChangeService) {
    this.setUpForm();
    if (this.partialPersistService.data) {
      this.client = this.partialPersistService.data;
      this.setDate();
    }
    const today = new Date();
    this.maxDate = {
      year: today.getFullYear(),
      month: parseInt(('0' + (today.getMonth() + 1)).slice(-2), 10),
      day: parseInt(('0' + (today.getUTCDate())).slice(-2), 10)
    };
    this.minDate = {
      year: 1920,
      month: 1,
      day: 1
    };
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      surname: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondSurname: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      marriedSurname: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      firstName: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondName: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      identificacion: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      phone: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(12)])],
      phone2: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(12)])],
      address: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(300)])],
      appointmentDates: [{
        value: '',
        disabled: this.editMode
      }],
      profession: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      useRepresentative: [{
        value: false,
        disabled: this.editMode
      }],
      identificationType: [{
        disabled: this.editMode
      }, [Validators.required]],
      name: [{
        disabled: true
      }]
    });
    this.surname = this.formGroup.controls['surname'];
    this.secondSurname = this.formGroup.controls['secondSurname'];
    this.marriedSurname = this.formGroup.controls['marriedSurname'];
    this.firstName = this.formGroup.controls['firstName'];
    this.secondName = this.formGroup.controls['secondName'];
    this.phone = this.formGroup.controls['phone'];
    this.phone2 = this.formGroup.controls['phone2'];
    this.address = this.formGroup.controls['address'];
    this.appointmentDates = this.formGroup.controls['appointmentDates'];
    this.profession = this.formGroup.controls['profession'];
    this.useRepresentative = this.formGroup.controls['useRepresentative'];
    this.identificacion = this.formGroup.controls['identificacion'];
    this.identificationType = this.formGroup.controls['identificationType'];
    this.name = this.formGroup.controls['name'];
  }

  validateUseRepresentative(): boolean {
    if (this.client.tipoPersona === 'J' || this.navigationService.client.thirdOld || this.navigationService.client.minorOld) {
      this.requiredLegal = true;
      this.client.representanteLegalTutor.registraRepresentanteLegal = true;
      return false;
    }
    this.requiredLegal = false;
    return true;
  }

  disableControl(param? : string) {
    for (let key in this.formGroup.controls) {
      if (key != param)
        this.formGroup.controls[key].disable();
    }
  }

  enableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].enable();
    }
    this.name.disable();
  }

  validateField(): boolean {
    if (this.client.tipoPersona === 'J' || this.usaRepresentante || this.navigationService.client.thirdOld || this.navigationService.client.minorOld) {
      this.surname.setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)]);
      this.surname.updateValueAndValidity();
      this.firstName.setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)]);
      this.firstName.updateValueAndValidity();
//      this.identificationType.setValidators([Validators.required]);
//      this.identificationType.updateValueAndValidity();
      this.identificacion.setValidators([Validators.required]);
      this.identificacion.updateValueAndValidity();
      this.phone.setValidators([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(12)]);
      this.phone.updateValueAndValidity();
      return true;
    } else {
      this.surname.setValidators([Validators.maxLength(15), Validators.pattern(this.pattern)]);
      this.surname.updateValueAndValidity();
      this.firstName.setValidators([Validators.maxLength(15), Validators.pattern(this.pattern)]);
      this.firstName.updateValueAndValidity();
//      this.identificationType.setValidators([]);
//      this.identificationType.updateValueAndValidity();
      this.identificacion.setValidators([]);
      this.identificacion.updateValueAndValidity();
      this.phone.setValidators([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(12)]);
      this.phone.updateValueAndValidity();
    }
    return false;
  }

  /*validateLastSection(): boolean {
    if (this.client.tipoPersona === 'J' || this.client.perfilEconomico.relacionEconomica === 2 || this.client.perfilEconomico.relacionEconomica === 3) {
      this.address.setValidators([Validators.required, Validators.maxLength(300)]);
      this.profession.setValidators(Validators.required);
      return true;
    } else {
      this.address.setValidators([Validators.maxLength(300)]);
      this.profession.setValidators([]);
    }
    this.address.updateValueAndValidity();
    this.profession.updateValueAndValidity();
    return false;
  }*/

//  changeComponent() {
//    this.documentComponent = TypeDocumentSelectComponent;
//  }

  ngOnInit() {
    if (this.editMode) {
      this.changeControl(); 
      this.disableControl();
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSection(this.identification, 'representanteLegal');
      this.busy.then((client) => {
        this.client = client;
        if (!this.client.representanteLegalTutor) {
          this.client.representanteLegalTutor = new RepresetanteLegalTutor();
        } else if (this.client.representanteLegalTutor.primerNombre) {
          this.usaRepresentante = true;
        }
        this.setDate();
//        this.legalRepresentative = JSON.parse(JSON.stringify(this.client.representanteLegalTutor));
      }).catch(e => {
        if (e.status === 404) {
          this.client = new ClienteDto();
        }
      });
    } else {
      if (!this.client) {
        this.loadPartial();
      }else {
        if (this.client.representanteLegalTutor.primerNombre) {
          this.usaRepresentante = true;
        }
        if (this.client.representanteLegalTutor.primerNombre === '') {
          if (this.tipeDoc) {
            this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
          }
        }
      }
      this.enableControl();
    }
  }
  
  copyClient() {
    this.client.representanteLegalTutor.primerNombre = this.client.datosGeneralesPersonaNatural.primerNombre;
    this.client.representanteLegalTutor.segundoNombre = this.client.datosGeneralesPersonaNatural.segundoNombre;
    this.client.representanteLegalTutor.primerApellido = this.client.datosGeneralesPersonaNatural.primerApellido;
    this.client.representanteLegalTutor.segundoApellido = this.client.datosGeneralesPersonaNatural.segundoApellido;
    this.client.representanteLegalTutor.apellidoCasada = this.client.datosGeneralesPersonaNatural.apellidoCasada;
    this.client.representanteLegalTutor.tipoIdentificacion = this.client.tipoIdentificacion;
    this.client.representanteLegalTutor.identificacion = this.client.identificacion;
    this.tempIdentificiacion = this.client.representanteLegalTutor.identificacion;
    this.valuechange(this.tempIdentificiacion, undefined);
    this.client.representanteLegalTutor.profesion = this.client.datosGeneralesPersonaNatural.profesion;
    this.isCopy = false;
  }
  
  isValidCopy(): boolean {
    if (!this.navigationService.client.thirdOld && !this.navigationService.client.minorOld && this.client.tipoPersona === 'N' && this.usaRepresentante) {
      return true;
    }
    return false;
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  cancel() {
    $('#confirmModal').modal('show');
  }

  changeAppointmentDate(date): void {
    if (isObject(date.data)) {
      // TODO generate object to set data example: this.Cliente.legalGeneralData.startDate = new Date(parseInt(date.data.year), parseInt(date.data.month) - 1, parseInt(date.data.day));
    }
  }

  selectTypedoc(event: any): void {
    if (event) {
      if (this.client) {
        this.client.representanteLegalTutor.tipoIdentificacion = event;
      }
      if (event.mascara) {
        this.valuechange(this.client.representanteLegalTutor.identificacion, null);
      }
    }
  }

  valuechange(newValue, status) {
    if (newValue) {
      const ob = this.tipeDoc.obtainRegex();
      this.identificacion.setValidators([Validators.required, Validators.pattern(ob)]);
      this.identificacion.updateValueAndValidity();
    }

    if (newValue) {
      this.tempIdentificiacion = newValue.toUpperCase();
      this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion;
    }


  }
  
  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.identificacion.setValue(value);
      this.identificacion.updateValueAndValidity();
      this.tempIdentificiacion = value.toUpperCase();
      this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion;
    }
  }

  selectProfession(profession): void {
    this.client.representanteLegalTutor.profesion = profession;
  }

  changeDate(date): void {
    if (date) {
      this.client.representanteLegalTutor.fechaNombramiento = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
      if (!this.legalRepresentative && this.editMode){
        this.legalRepresentative = JSON.parse(JSON.stringify(this.client.representanteLegalTutor));
        this.legalRepresentative.fechaNombramiento = this.client.representanteLegalTutor.fechaNombramiento;
      }
    } else {
      if (!this.legalRepresentative && this.editMode)
        this.legalRepresentative = JSON.parse(JSON.stringify(this.client.representanteLegalTutor));
      this.client.representanteLegalTutor.fechaNombramiento = null;
    }
  }

  setDate() {
    if (this.client.representanteLegalTutor.fechaNombramiento) {
      const parsedDay = new Date(this.client.representanteLegalTutor.fechaNombramiento);
      const a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
      this.bornDate = a;
    } else {
      this.bornDate = '';
    }
  }

  changeRepresentative() {
    if (!this.usaRepresentante) {
      this.client.representanteLegalTutor.registraRepresentanteLegal = false;
      this.client.representanteLegalTutor = new RepresetanteLegalTutor();
      this.disableControl('useRepresentative');
    } else if (!this.editMode) {
      this.enableControl();
    }
    if (this.usaRepresentante){
      if (!this.client.representanteLegalTutor.primerNombre)
        this.client.representanteLegalTutor = new RepresetanteLegalTutor();
      
      this.client.representanteLegalTutor.registraRepresentanteLegal = true;
      if (this.legalRepresentative)
        this.client.representanteLegalTutor = JSON.parse(JSON.stringify(this.legalRepresentative));
      if (this.useRepresentative.enabled && this.editMode)
        this.enableControl();
    }
  }

  changeControl() {
    for (let key in this.formGroup.controls) {
        this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
    }
    this.name.disable();
  }
  
  cancelLegal() {
   this.changeControl();
   if (!this.legalRepresentative)
     this.legalRepresentative = new RepresetanteLegalTutor();
   this.client.representanteLegalTutor = JSON.parse(JSON.stringify(this.legalRepresentative));
//   this.usaRepresentante = this.client.representanteLegalTutor.registraRepresentanteLegal;
   this.setDate();
  }
  
  isValidCancel() : boolean {
    if (this.legalRepresentative) {
      if (this.client.representanteLegalTutor.tipoIdentificacion && this.legalRepresentative.tipoIdentificacion) {
        if (this.client.representanteLegalTutor.primerNombre === this.legalRepresentative.primerNombre &&
          this.client.representanteLegalTutor.segundoNombre === this.legalRepresentative.segundoNombre &&
          this.client.representanteLegalTutor.primerApellido === this.legalRepresentative.primerApellido && 
          this.client.representanteLegalTutor.segundoApellido === this.legalRepresentative.segundoApellido &&
          this.client.representanteLegalTutor.apellidoCasada === this.legalRepresentative.apellidoCasada && 
          this.client.representanteLegalTutor.tipoIdentificacion.codigo === this.legalRepresentative.tipoIdentificacion.codigo && 
          this.client.representanteLegalTutor.identificacion === this.tempIdentificiacion.toUpperCase() && 
          this.client.representanteLegalTutor.telefono1 === this.legalRepresentative.telefono1 && 
          this.client.representanteLegalTutor.telefono2 === this.legalRepresentative.telefono2 && 
          this.client.representanteLegalTutor.direccion === this.legalRepresentative.direccion && 
          this.client.representanteLegalTutor.profesion.id === this.legalRepresentative.profesion.id && 
          this.client.representanteLegalTutor.fechaNombramiento === this.legalRepresentative.fechaNombramiento) {
            return true; 
        }
      }
    }
    return false;
  }

  loadPartial() {
    this.client = new ClienteDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
        if (this.client.representanteLegalTutor.primerNombre) {
          this.usaRepresentante = true;
        }
        this.setDate();
      } else {
        this.client = new ClienteDto();
      }
    }).catch((e) => this.client = new ClienteDto());
  }

  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      if (this.tempIdentificiacion) {
        this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion.toUpperCase();
      }
      this.validationService.validationForm(this.client, ClientFormSection[ClientFormSection.REPRESENTANTE_LEGAL]).then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  next(): void {
    if (this.editMode) {
      this.validProfile.emit();
    } else {
      this.navigationService.navigateTo(Section.legalRepresentative, Section.additionalData, true);
    }
  }

  partialSave() {
    if (this.editMode) {
      if (this.tempIdentificiacion) {
        this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion.toUpperCase();
      }
      this.busy = this.changeService.putSection(this.client, this.identification, 'representanteLegal');
      this.busy.then((client) => {
        this.client = this.client;
        this.legalRepresentative = JSON.parse(JSON.stringify(this.client.representanteLegalTutor));
        this.bindHide();
        this.disableControl();
        this.client.autorizaciones = [];
        this.successUpdate('messages.success.representative', 'messages.success.update');
        this.next();
      }, (e: any) => this.handleError(e));
    } else {
      if (this.tempIdentificiacion) {
        this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion.toUpperCase();
      }
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.next();
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
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'REPRESENTANTE_LEGAL';
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


}
