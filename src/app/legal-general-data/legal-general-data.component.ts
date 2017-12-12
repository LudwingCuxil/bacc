import {
  Component,
  OnInit,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CountrySelectComponent} from '../country/country-select.component';
import {CountryService} from '../country/shared/country.service';
import {AccountOfficerService} from '../account-officer/shared/account-officer.service';
import {TypeSocietyService} from '../type-society/shared/type-society.service';
import {SalesLevelService} from '../sales-level/shared/sales-level.service';
import {isObject} from 'util';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlParameter} from '../pl-parameter/shared/pl-parameter';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {DatePickerComponent} from 'ng2-datepicker/src/ng2-datepicker/ng2-datepicker.component';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {ClienteDto} from '../shared/client/cliente-dto';
import {FormBuilder, FormGroup, Validators, FormControl, AbstractControl} from '@angular/forms';
import {DatosGeneralesPersonaJuridica} from '../shared/client/datos-generales-persona-juridica';
import {ValidationsService} from '../shared/services/validations.service';
import {NotificationsService} from 'angular2-notifications';
import {Location} from '@angular/common';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {Nacionalidad} from '../shared/client/nacionalidad';
import {Moneda} from '../shared/client/moneda';
import {GeneralDataLegalService} from './shared/general-data-legal.service';
import * as moment from 'moment'
import {DatePipe} from '@angular/common';
import {FormSectionInterface} from '../shared/form-section-interface';
declare var $: any;
import {Navigation} from '../shared/navigation';
import {Section} from '../shared/section';
import {NavigationService} from '../shared/services/navigation.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {WebFormName} from '../shared/webform-name';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {SecurityService} from 'security-angular/src/app';

@Component({
  selector: 'pl-legal-general-data',
  templateUrl: './legal-general-data.component.html',
  styleUrls: ['./legal-general-data.component.css'],
  providers: [GeneralDataLegalService, PlParameterService]
})
export class LegalGeneralDataComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  public client = new ClienteDto();
  @ViewChild(DatePickerComponent) datePicker: DatePickerComponent;

  private authorization: Authorization;
  private identification: string;
  private disabledField = true;
  private formGroup: FormGroup;
  private optionsRegistrationDate: DatePickerOptions;
  private optionsStartDate: DatePickerOptions;
  private optionsDate: DatePickerOptions;
  private validCountry: boolean = true;
  private busy: Promise<any>;
  private reload: boolean;
  public plParameters: PlParameter[];
  public plParameter = new PlParameter();
  private countryDefault = new Nacionalidad();
  private authorized: Authorized = new Authorized();
  private tempClient;

  @Input() editMode = false;

  startDate: any;
  maxDateStart: any;
  minDateStart: any;
  registerDate: any;
  maxDateRegister: any;
  minDateRegister: any;


  registroMercantilNumero: AbstractControl;
  registroMercantilTomo: AbstractControl;
  registroMercantilPagina: AbstractControl;
  patenteComercio: AbstractControl;
  puntoActa: AbstractControl;
  siglas: AbstractControl;
  numeroEscrituraPermisoOperaciones: AbstractControl;
  razonSocial: AbstractControl;
  nombreComercial: AbstractControl;
  country: AbstractControl;
  accountOfficer: AbstractControl;
  salesLevel: AbstractControl;
  fechaRegistro: AbstractControl;
  typeSociety: AbstractControl;
  enFormacion: AbstractControl;
  fechaInicioOperaciones: AbstractControl;


  constructor(public translate: TranslateService, private router: Router, private formBuilder: FormBuilder,
              private _validationService: ValidationsService,
              private notificationService: NotificationsService,
              private _location: Location,
              private _securityService: SecurityService,
              private _changeDetectorRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private _generalDataLegalService: GeneralDataLegalService,
              private _navigationService: NavigationService, private _partialPersistService: PartialPersistService, private plParameterService: PlParameterService) {
    this.setUpForm();


  }

  verField() {
    this.client.datosGeneralesPersonaJuridica.razonSocial;
  }

  ngOnInit() {
    if (this.editMode) {
      this.client = new ClienteDto();
      this.client.datosGeneralesPersonaJuridica = new DatosGeneralesPersonaJuridica();
      this.identification = this._securityService.getCookie('identification');//'        8847848682';
      this.busy = this._generalDataLegalService.getGeneralDataLegal(this.identification);
      this.busy.then((client) => {
        this.setValues(client);
        this.tempClient = <ClienteDto> JSON.parse(JSON.stringify(client));
      });
      this.change();
    } else {
      this.enableControls();
      if (this._partialPersistService.data) {
        this.setValues(this._partialPersistService.data);
      }
      if (!this.client.identificacion) {
        this.loadPartial();
      }
    }


  }

  initCustom() {


  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  enableControls(): void {
//    this.disabledField = false;
//    this.gender.enable();
//    this.basicAccountProfile.enable();
//    this.surname.enable();
//    this.gender.enable();
//    this.secondSurname.enable();
//    this.firstName.enable();
//    this.secondName.enable();
//    this.marriedSurname.enable();
//    this.spouse.enable();
//    this.birthdate.enable();
//    this.licence.enable();
//    this.country.enable();
//    this.accountOfficer.enable();
//    this.nationality.enable();
//    this.residence.enable();
  }


  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'DATOS_GENERALES';
      if (this.client.autorizaciones === null)
      this.client.autorizaciones = [];
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
      this.bindHide();

    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      registroMercantilNumero:  [{disabled: this.disabledField}, [Validators.required]],
      registroMercantilTomo:  [{disabled: this.disabledField}, [Validators.required]],
      registroMercantilPagina:  [{disabled: this.disabledField}, [Validators.required]],
      patenteComercio:  [{disabled: this.disabledField}, []],
      puntoActa:  [{disabled: this.disabledField}, []],
      siglas:  [{disabled: this.disabledField}, []],
      numeroEscrituraPermisoOperaciones:  [{disabled: this.disabledField}, [Validators.required]],
      razonSocial:  [{disabled: this.disabledField}, [Validators.required]],
      nombreComercial:  [{disabled: this.disabledField}, [Validators.required]],
      country:  [{disabled: this.disabledField}, [Validators.required]],
      accountOfficer:  [{disabled: this.disabledField}, [Validators.required]],
      salesLevel:  [{disabled: this.disabledField}, [Validators.required]],
      typeSociety:  [{disabled: this.disabledField}, [Validators.required]],
      fechaRegistro:  [{disabled: this.disabledField}, [Validators.required]],
      enFormacion:  [{disabled: this.disabledField}, []],
      fechaInicioOperaciones:  [{disabled: this.disabledField}, [Validators.required]]
    });

    this.registroMercantilNumero = this.formGroup.controls['registroMercantilNumero'];
    this.registroMercantilTomo = this.formGroup.controls['registroMercantilTomo'];
    this.registroMercantilPagina = this.formGroup.controls['registroMercantilPagina'];
    this.patenteComercio = this.formGroup.controls['patenteComercio'];
    this.puntoActa = this.formGroup.controls['puntoActa'];
    this.siglas = this.formGroup.controls['siglas'];
    this.numeroEscrituraPermisoOperaciones = this.formGroup.controls['numeroEscrituraPermisoOperaciones'];
    this.razonSocial = this.formGroup.controls['razonSocial'];
    this.nombreComercial = this.formGroup.controls['nombreComercial'];
    this.country = this.formGroup.controls['country'];
    this.accountOfficer = this.formGroup.controls['accountOfficer'];
    this.salesLevel = this.formGroup.controls['salesLevel'];
    this.typeSociety = this.formGroup.controls['typeSociety'];
    this.fechaRegistro = this.formGroup.controls['fechaRegistro'];
    this.enFormacion = this.formGroup.controls['enFormacion'];
    this.fechaInicioOperaciones = this.formGroup.controls['fechaInicioOperaciones'];

  }

  changeDateRegister(date): void {
    if (date) {
      this.client.datosGeneralesPersonaJuridica.fechaRegistro = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  changeDateStart(date): void {
    if (date) {
      this.client.datosGeneralesPersonaJuridica.fechaInicioOperaciones = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  changeFormation(value) {
    if (this.client.datosGeneralesPersonaJuridica.enFormacion || (value == true)) {
      this.registroMercantilNumero.setValidators([]);
      this.registroMercantilNumero.updateValueAndValidity();
      this.registroMercantilTomo.setValidators([]);
      this.registroMercantilTomo.updateValueAndValidity();
      this.registroMercantilPagina.setValidators([]);
      this.registroMercantilPagina.updateValueAndValidity();
    }
    else {
      this.registroMercantilNumero.setValidators([Validators.required]);
      this.registroMercantilNumero.updateValueAndValidity();
      this.registroMercantilTomo.setValidators([Validators.required]);
      this.registroMercantilTomo.updateValueAndValidity();
      this.registroMercantilPagina.setValidators([Validators.required]);
      this.registroMercantilPagina.updateValueAndValidity();
    }
  }


  selectCountry(originCountry): void {
    if (this.client.paisOrigen && originCountry) {
      if (this.client.paisOrigen.codigo !== originCountry.codigo) {
        this.client.paisOrigen.codigo = originCountry.codigo;
      }
      this.client.paisOrigen.moneda = originCountry.moneda;
      this.client.paisOrigen.nombre = originCountry.nombre;
      this.client.paisOrigen.nacionalidad = originCountry.nacionalidad;
    }
  }

  selectModelCountry(event: any): void {
    this.client.paisOrigen = event;
  }

  selectAccountOfficer(event: any): void {
    this.client.oficialDeCuentas = event;
  }


  selectTypeSociety(event: any): void {
    this.client.datosGeneralesPersonaJuridica.tipoSociedad = event;
  }

  selectSalesLevel(event: any): void {
    this.client.datosGeneralesPersonaJuridica.nivelVentas = event;
  }


  eventSubmit(event) {

    this.client.datosGeneralesPersonaJuridica.fechaInicioOperaciones = new Date(this.startDate);
    this.client.datosGeneralesPersonaJuridica.fechaRegistro = new Date(this.registerDate);


    this._validationService.validationForm(this.client, "?seccion=DATOS_GENERALES")
      .then((valid: any) => {
          if (valid) {
            this.router.navigate(['/economic-profile']);
          }
        }, (e: any) => this.handleError(e)
      );
  }

  public  cancel() {
      if(!this.editMode){
          $('#confirmModal').modal('show');
      }else{
          this.setValues(JSON.parse(JSON.stringify(this.tempClient)));
          this.change();
      }

  }

  public callDate() {
    $('#fechaInicio').datepicker({autoclose: true});
  }

  public callDateRegistro() {
    $('#fechaRegistro').datepicker({autoclose: true});
  }


  handleError(error) {
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
    let err = JSON.parse(error._body);
    let tr = this.translate.instant('exceptionace.' + err.code);
    this.notificationService.error('', '');
    }
  }

  change() {
    this.disabledField = !this.disabledField;
    this.disabledField ?
      this.formGroup.controls['registroMercantilNumero'].enable() :
      this.formGroup.controls['registroMercantilNumero'].disable();
    this.disabledField ?
      this.formGroup.controls['registroMercantilTomo'].enable() :
      this.formGroup.controls['registroMercantilTomo'].disable();
    this.disabledField ?
      this.formGroup.controls['registroMercantilPagina'].enable() :
      this.formGroup.controls['registroMercantilPagina'].disable();
    this.disabledField ?
      this.formGroup.controls['patenteComercio'].enable() :
      this.formGroup.controls['patenteComercio'].disable();
    this.disabledField ?
      this.formGroup.controls['puntoActa'].enable() :
      this.formGroup.controls['puntoActa'].disable();
    this.disabledField ?
      this.formGroup.controls['numeroEscrituraPermisoOperaciones'].enable() :
      this.formGroup.controls['numeroEscrituraPermisoOperaciones'].disable();
    this.disabledField ?
      this.formGroup.controls['razonSocial'].enable() :
      this.formGroup.controls['razonSocial'].disable();
    this.disabledField ?
      this.formGroup.controls['nombreComercial'].enable() :
      this.formGroup.controls['nombreComercial'].disable();
    this.disabledField ?
      this.formGroup.controls['country'].enable() :
      this.formGroup.controls['country'].disable();
    this.disabledField ?
      this.formGroup.controls['accountOfficer'].enable() :
      this.formGroup.controls['accountOfficer'].disable();
    this.disabledField ?
      this.formGroup.controls['salesLevel'].enable() :
      this.formGroup.controls['salesLevel'].disable();
    this.disabledField ?
      this.formGroup.controls['typeSociety'].enable() :
      this.formGroup.controls['typeSociety'].disable();
    this.disabledField ?
      this.formGroup.controls['fechaRegistro'].enable() :
      this.formGroup.controls['fechaRegistro'].disable();
    this.disabledField ?
      this.formGroup.controls['enFormacion'].enable() :
      this.formGroup.controls['enFormacion'].disable();
    this.disabledField ?
      this.formGroup.controls['fechaInicioOperaciones'].enable() :
      this.formGroup.controls['fechaInicioOperaciones'].disable();

    this.disabledField ?
      this.formGroup.controls['siglas'].enable() :
      this.formGroup.controls['siglas'].disable();


  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
    } else {

      this._navigationService.navigateTo(Section.legalGeneralData, Section.economicProfile, true);


    }
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

  loadPartial() {
    this.busy = this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]);
    this.busy.then((client) => {
      if (client) {
        this.setValues(client);
      } else {
        this.client = new ClienteDto();
      }
    }).catch((e) =>
      this.defaultParameters()
    );
  }

  partialSave(): void {
    console.log(this.client);
    if (this.editMode) {
      this.busy = this._generalDataLegalService.putGeneralDataLegal(this.client, this.identification);
      this.busy.then((client) => {
      this.bindHide();
     // this.client = client;
      client.autorizaciones = [];
      this.setValues(client);
      this.change();
      let title = this.translate.instant('messages.update-data-general-title');
      let mess = this.translate.instant('messages.update-data-general-message');
      this.successUpdate(title, mess);
      }, (e: any) => this.handleError(e));
    } else {
      this.busy = this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client);  
      this.busy.then((response) => {
        this.next();
      });
    }
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  over() {
    // console.log('over');
  }

  defaultParameters() {
    this.plParameterService.getplParameter({number: 0, size: 1500}, 'PARAM_PAISDE')
      .then((plParameters: any) => {
//        this.plParameter = plParameters;
//        console.log(this.plParameter);
        let paisOrigen = new Nacionalidad();
        paisOrigen.codigo = plParameters.valor;
        this.client.paisOrigen = paisOrigen;
        //this.country.setValue(this.plParameters);
      });
  }


  setValues(client) {
    this.client = client;
    const today = new Date();
    const parsedR = new Date(client.datosGeneralesPersonaJuridica.fechaRegistro);
    this.registerDate = {year: parsedR.getFullYear(), month: (parsedR.getMonth() + 1), day: parsedR.getUTCDate()};
    const parsedS = new Date(client.datosGeneralesPersonaJuridica.fechaInicioOperaciones);
    this.startDate = {year: parsedS.getFullYear(), month: (parsedS.getMonth() + 1), day: parsedS.getUTCDate()};
    this.changeFormation(client.datosGeneralesPersonaJuridica.enFormacion);
    this.maxDateStart = {
      year: today.getFullYear(),
      month: parseInt(('0' + (today.getMonth() + 1)).slice(-2), 10),
      day: parseInt(('0' + (today.getUTCDate() + 1)).slice(-2), 10)
    };
    this.minDateStart = {
      year: 1920,
      month: 1,
      day: 1
    };
    this.maxDateRegister = {
      year: today.getFullYear(),
      month: parseInt(('0' + (today.getMonth() + 1)).slice(-2), 10),
      day: parseInt(('0' + (today.getUTCDate() + 1)).slice(-2), 10)
    };
    this.minDateRegister = {
      year: 1920,
      month: 1,
      day: 1
    };

    console.log(this.maxDateRegister);
    if(!client.paisOrigen.codigo) {
      this.defaultParameters();
    }

  }

}
