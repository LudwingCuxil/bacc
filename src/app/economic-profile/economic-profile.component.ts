import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {ClassCustomerService} from '../class-customer/shared/class-customer.service';
import {TypeCustomerService} from '../type-customer/shared/type-customer.service';
import {TypeInstitutionService} from '../type-institution/shared/type-institution.service';
import {InstitutionService} from '../institution/shared/institution.service';
import {InstitutionSelectComponent} from '../institution/institution.select.component';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {ValidationsService} from '../shared/services/validations.service';
import {NotificationsService} from 'angular2-notifications';
import {Router} from '@angular/router';
import {SectorEconomico} from '../shared/client/sector-economico';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {SecurityService} from 'security-angular/src/app';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlParameter} from '../pl-parameter/shared/pl-parameter';
import {EmploymentSituation} from '../pl-parameter/shared/employment-situation';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {NavigationService} from '../shared/services/navigation.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {WebFormName} from '../shared/webform-name';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {Institucion} from '../shared/client/institucion';
import {TipoInstitucion} from '../shared/client/tipo-institucion';
import {EmpleadosNoClientes} from '../shared/client/empleados-no-clientes';
import {ReferenciaParentescoEmpleado} from '../shared/client/referencia-parentesco-empleado';
import {Referencia} from '../shared/client/referencia';
import {Mode} from '../shared/client/referenceDTO';
import {TypeReference} from '../shared/typeReference';
import {CatalogService} from '../shared/services/catalog.service';
import {PlatformParameters} from '../shared/platform-parameters.enum';
import {EconomicProfileService} from './shared/economic-profile.service';
import {PersonType} from '../shared/account/electronic-service';

declare var $: any;


@Component({
  selector: 'pl-economic-profile',
  templateUrl: './economic-profile.component.html',
  styleUrls: ['./economic-profile.component.css'],
  providers: [ClassCustomerService, TypeCustomerService, TypeInstitutionService, InstitutionService, PlParameterService, CatalogService, EconomicProfileService]
})
export class EconomicProfileComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  formGroup: FormGroup;
  formGroupRelationShip: FormGroup;
  heading: string[] = ['references.laboral.code', 'references.laboral.description', 'economic-profile.relationship', 'references.merchant.mode'];
  headingUpdate: string[] = ['references.laboral.code', 'references.laboral.description', 'economic-profile.relationship', 'references.merchant.mode'];
  values: string[] = ['empleado.id.codigo', 'empleado.descripcion', 'parentesco.descripcion'];
  ECONOMIC_RELATIONSHIP_MERCHANT;
  ECONOMIC_RELATIONSHIP_BOTH;
  ECONOMIC_RELATIONSHIP_SALARIED;
  ECONOMIC_RELATIONSHIP_INFORMAL;

  @Input() editMode = false;
  @Output() notifyHeader = new EventEmitter();
  @Output() validProfile = new EventEmitter();
  @ViewChild('intitutionSelect') institutionSelect: InstitutionSelectComponent;
  client;
  natural = false;
  relationship = false;
  private identification: string;
  private busy: Promise<any>;
  private disabledField = true;
  public plParameter = new PlParameter();
  private relacionesEconomicas: EmploymentSituation[] = [];
  private authorization: Authorization;
  actividadEconomica: AbstractControl;
  afectoISR: AbstractControl;
  claseCliente: AbstractControl;
  codigoEmpleado: AbstractControl;
  generadorDivisas: AbstractControl;
  parentescoEmpleadoBanco: AbstractControl;
  perteneceGrupoEconomico: AbstractControl;
  relacionEconomica: AbstractControl;
  rtn: AbstractControl;
  sectorEconomico: AbstractControl;
  tin: AbstractControl;
  tipoInstitucion: AbstractControl;
  institucion: AbstractControl;
  tipoCliente: AbstractControl;
  relEmpleado: AbstractControl;
  parentesco: AbstractControl;
  empleadoReferencia: EmpleadosNoClientes;
  referenciaParentescoEmpleado = new ReferenciaParentescoEmpleado();
  referenciaParentescoTemp = new ReferenciaParentescoEmpleado();
  typeReference = TypeReference;
  private edit = false;
  private modifying = false;
  private mode = Mode;
  private index: number;
  private invalidReference = true;
  private nationalityTin;
  private codigo = 0;
  private classClient;
  private authorized: Authorized = new Authorized();
  max = 0;
  min = 0;
  private tempTipoInstitucion = new TipoInstitucion();
  private tempInstitucion = new Institucion();
  private tempClient;
  private tempEconomicRelation = new EmploymentSituation();
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


  constructor(public translate: TranslateService, private router: Router,
              private formBuilder: FormBuilder, private _validationService: ValidationsService,
              private notificationService: NotificationsService, private _securityService: SecurityService,
              private _economicProfileService: EconomicProfileService,
              private _navigationService: NavigationService, private _partialPersistService: PartialPersistService,
              private plParameterService: PlParameterService, private _changeDetectorRef: ChangeDetectorRef, private catalogService: CatalogService) {
    this.plParameterService.getParameter(PlatformParameters.PARAM_CCLEM)
      .then((parameter: any) => {
        this.classClient = parameter.valor;
      });
    this.setUpForm();

    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
      this.tempTipoInstitucion.codigo = this.client.perfilEconomico.tipoInstitucion;
      this.tempInstitucion.codigo = this.client.perfilEconomico.institucion;
      this.codigo = this.client.perfilEconomico.relacionEconomica;
      this.tempEconomicRelation.codigo = this.client.perfilEconomico.relacionEconomica;
      this.relacionEconomica.setValue(this.codigo);
      this.empleadoReferencia = new EmpleadosNoClientes();
      this.empleadoReferencia.codigo = this.client.perfilEconomico.codigoEmpleado;
      this.loadIncomeReference();

      if (this.client.tipoPersona === 'J') {
        this.legalSetUpForm();
      }
      if (!this.client.perfilEconomico.sectorEconomico.codigo) {
        this.defaultParameters();
      }
    }
  }

  async ngOnInit() {
    if (this.editMode) {
      this.invalidReference = true;
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._economicProfileService.getEconomicProfile(this.identification);
      this.busy.then((client) => {
        this.tempClient = <ClienteDto> JSON.parse(JSON.stringify(client));
        this.tempTipoInstitucion.codigo = client.perfilEconomico.tipoInstitucion;
        this.tempInstitucion.codigo = client.perfilEconomico.institucion;
        this.codigo = client.perfilEconomico.relacionEconomica;
        this.tempEconomicRelation.codigo = client.perfilEconomico.relacionEconomica;
        this.empleadoReferencia = new EmpleadosNoClientes();
        this.empleadoReferencia.codigo = client.perfilEconomico.codigoEmpleado;
        this.institutionSelect.selectInstitutions(this.tempTipoInstitucion.codigo);
        this.client = client;
        if (this.client.perfilEconomico.perteneceGrupoEconomico === undefined || this.client.perfilEconomico.perteneceGrupoEconomico === null) {
          this.client.perfilEconomico.perteneceGrupoEconomico = false;
        }
        this.relacionEconomica.setValidators([]);
        this.relacionEconomica.updateValueAndValidity();
        if (this.client.tipoPersona === PersonType[PersonType.J]) {
          this.tin.setValidators([Validators.minLength(9), Validators.maxLength(9), Validators.required]);
          this.rtn.setValidators([Validators.minLength(14), Validators.maxLength(14), Validators.required]);
          this.tin.updateValueAndValidity();
          this.rtn.updateValueAndValidity();
        }
      });
      this.change();
    } else {
      if (!this.client) {
        this.loadPartial();
      } else {
        this.defaultParameters();
        if (this.client.tipoPersona === PersonType[PersonType.J]) {
          this.tin.setValidators([Validators.minLength(9), Validators.maxLength(9), Validators.required]);
          this.rtn.setValidators([Validators.minLength(14), Validators.maxLength(14), Validators.required]);
          this.tin.updateValueAndValidity();
          this.rtn.updateValueAndValidity();
        }
      }
    }
    const merchant = await this.plParameterService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_COMERCIANTE);
    const both = await this.plParameterService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_AMBOS);
    const salaried = await this.plParameterService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_ASALARIADO);
    const informal = await this.plParameterService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_OTROS);
    this.ECONOMIC_RELATIONSHIP_MERCHANT = parseInt(merchant.valor, 10);
    this.ECONOMIC_RELATIONSHIP_BOTH = parseInt(both.valor, 10);
    this.ECONOMIC_RELATIONSHIP_SALARIED = parseInt(salaried.valor, 10);
    this.ECONOMIC_RELATIONSHIP_INFORMAL = parseInt(informal.valor, 10);
    this.employmentSituation();
  }

  selectEconomicActivities(event: any): void {
    this.client.perfilEconomico.actividadEconomica = event;
  }

  selectEconomicSector(event: any): void {
    this.client.perfilEconomico.sectorEconomico = event;
  }

  selectEconomicRelation(event: any): void {
    if (event) {
      if (event.codigo) {
        this.tempEconomicRelation = event;
        this.client.perfilEconomico.relacionEconomica = event.codigo;
      }
    }
  }


  selectClassCustomer(event: any): void {
    this.client.perfilEconomico.claseCliente = event;
    if (event.codigo === this.classClient) {
    } else {
      this.codigoEmpleado.setValidators([]);
      this.codigoEmpleado.updateValueAndValidity();
    }
  }

  selectTypeCustomer(event: any): void {
    this.client.perfilEconomico.tipoCliente = event;
  }


  selectInstitution(event: any): void {
    this.client.perfilEconomico.institucion = event.codigo;
  }

  selectNoCustomersEmployee(event: any): void {
    this.client.perfilEconomico.codigoEmpleado = event.codigo;
  }

  selectEmployeeRelationship(event: any): void {

    this.relEmpleado.setValidators([Validators.required]);
    this.relEmpleado.updateValueAndValidity();
    this.parentesco.setValidators([Validators.required]);
    this.parentesco.updateValueAndValidity();
    this.referenciaParentescoEmpleado.empleado.id.codigo = event.codigo;
    this.referenciaParentescoEmpleado.empleado.descripcion = event.nombre;
    if (this.referenciaParentescoEmpleado && this.referenciaParentescoEmpleado.empleado && this.referenciaParentescoEmpleado.empleado.id.codigo
      && this.referenciaParentescoEmpleado.empleado.id && this.referenciaParentescoEmpleado && this.referenciaParentescoEmpleado.parentesco
      && this.referenciaParentescoEmpleado.parentesco.codigo !== '') {
      this.invalidReference = false;
    } else {
      this.invalidReference = true;
    }


  }

  changeRtn(event) {
    if (event.value && event.value.length > 0) {
      this.rtn.setValidators([Validators.minLength(14), Validators.maxLength(14), Validators.required]);
    } else {
      if (this.client.tipoPersona !== PersonType[PersonType.J]) {
        this.rtn.setValidators([Validators.minLength(14), Validators.maxLength(14)]);
      }
    }
    this.rtn.updateValueAndValidity();
  }

  changeTin(event) {
    if (event.value && event.value.length > 0) {
      this.tin.setValidators([Validators.minLength(9), Validators.maxLength(9), Validators.required]);
    } else {
      if (this.client.tipoPersona !== PersonType[PersonType.J]) {
        this.tin.setValidators([Validators.minLength(9), Validators.maxLength(9)]);
      }
    }
    this.tin.updateValueAndValidity();
  }

  selectBonding(event: any): void {
    if (event && event.codigo) {
      this.relEmpleado.setValidators([Validators.required]);
      this.relEmpleado.updateValueAndValidity();
      this.parentesco.setValidators([Validators.required]);
      this.parentesco.updateValueAndValidity();
      this.referenciaParentescoEmpleado.parentesco = event;
      if (this.referenciaParentescoEmpleado && this.referenciaParentescoEmpleado.empleado && this.referenciaParentescoEmpleado.empleado.id.codigo
        && this.referenciaParentescoEmpleado.empleado.id && this.referenciaParentescoEmpleado && this.referenciaParentescoEmpleado.parentesco
        && this.referenciaParentescoEmpleado.parentesco.codigo !== '') {
        this.invalidReference = false;
      } else {
        this.invalidReference = true;
      }
    }

  }

  enableBelongsGroups(event: any): void {
    if (this.client.perfilEconomico.perteneceGrupoEconomico === undefined || this.client.perfilEconomico.perteneceGrupoEconomico === null) {
      this.client.perfilEconomico.perteneceGrupoEconomico = false;
    } else {
      this.client.perfilEconomico.perteneceGrupoEconomico = !this.client.perfilEconomico.perteneceGrupoEconomico;
    }
  }

  selectTypeInstitution(event: any): void {
    if (event != null) {
      this.client.perfilEconomico.tipoInstitucion = event.codigo;
      this.institutionSelect.selectInstitutions(event.codigo);
    }

  }

  eventSubmit(event) {
    this._validationService.validationForm(this.client, 'PERFIL_ECONOMICO')
      .then((valid: any) => {
          console.log(valid);

          if (valid) {
            this.router.navigate(['/business-data-legal']);
          }
        }, (e: any) => this.handleError(e)
      );
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
      if(error._body !== '') {
        if(JSON.parse(error._body).override) {
          this.notificationService.error('', JSON.parse(error._body).message);
        } else {
          const err = JSON.parse(error._body);
          const tr = this.translate.instant('exceptionace.' + err.code);
          this.notificationService.error('', tr);
        }
      }
    }
  }

  cancel() {
    this.invalidReference = true;
    this.clean();
    if (!this.editMode) {
      $('#confirmModal').modal('show');
    } else {
      this.client = this.tempClient;
      this.invalidReference = true;
      this.tempTipoInstitucion.codigo = this.client.perfilEconomico.tipoInstitucion;
      this.tempInstitucion.codigo = this.client.perfilEconomico.institucion;
      this.codigo = this.client.perfilEconomico.relacionEconomica;
      this.tempEconomicRelation.codigo = this.client.perfilEconomico.relacionEconomica;
      this.relacionEconomica.setValue(this.client.perfilEconomico.relacionEconomica);

//      this.empleadoReferencia = new EmpleadosNoClientes();
//      this.empleadoReferencia.codigo = this.client.perfilEconomico.codigoEmpleado;
      this.relacionEconomica.setValidators([]);
      this.relacionEconomica.updateValueAndValidity();
      this.change();
    }
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do notify to header to get new info
      this.notifyHeader.emit();
      this.validProfile.emit(); 
    } else {
      if (this.client.tipoPersona === 'J') {
        this._navigationService.navigateTo(Section.economicProfile, Section.businessDataLegal, true);
      } else if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_SALARIED || this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH) {
        if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_SALARIED) {
          this._navigationService.navigateTo(Section.economicProfile, Section.laboralReference, true);
          this._navigationService.removeSections([Section.businessDataLegal]);
          this._navigationService.removeSections([Section.legalRepresentative]);
        }
        this._navigationService.navigateTo(Section.economicProfile, Section.laboralReference, true);
      } else if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_MERCHANT) {
        this.client.referencias.referenciasLaborales = [];
        this._navigationService.navigateTo(Section.economicProfile, Section.businessDataLegal, true);
        this._navigationService.removeSections([Section.laboralReference]);
        this._navigationService.removeSections([Section.legalRepresentative]);
      } else {
        this.client.referencias.referenciasComerciante = [];
        this.client.referencias.referenciasLaborales = [];
        this._navigationService.removeSections([Section.legalRepresentative]);
        this._navigationService.navigateTo(Section.economicProfile, Section.legalRepresentative, true);
        this._navigationService.removeSections([Section.businessDataLegal, Section.laboralReference]);
      }
    }
  }


  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      this._validationService.validationForm(this.client, ClientFormSection[ClientFormSection.PERFIL_ECONOMICO]).then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  loadPartial() {
    this.client = new ClienteDto();
    this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
        this.tempTipoInstitucion.codigo = this.client.perfilEconomico.tipoInstitucion;
        this.tempInstitucion.codigo = this.client.perfilEconomico.institucion;
        this.codigo = client.perfilEconomico.relacionEconomica;
        this.tempEconomicRelation.codigo = client.perfilEconomico.relacionEconomica;
        this.empleadoReferencia = new EmpleadosNoClientes();
        this.empleadoReferencia.codigo = this.client.perfilEconomico.codigoEmpleado;
        this.loadIncomeReference();
        if (this.client.tipoPersona === 'J') {
          this.legalSetUpForm();
        }
      } else {
        this.client = new ClienteDto();
      }
    }).catch((e) => this.client = new ClienteDto());
  }

  partialSave(): void {
    console.log(this.client);
    if (this.editMode) {
      this.busy = this._economicProfileService.putEconomicProfile(this.client, this.identification);
      this.busy.then((client) => {
        this.bindHide();
        this.client = client;
        this.client.autorizaciones = [];
        this.change();
        this.successUpdate('Datos Generales Actualizados', 'Se actualizo correctamente');
        this.next();
      }, (e: any) => this.handleError(e));
    } else {
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.next();
      });
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  change() {
    this.tempClient = <ClienteDto> JSON.parse(JSON.stringify(this.client));
    this.loadIncomeReference();
    this.parentescoEmpleadoBanco = this.formGroup.controls['parentescoEmpleadoBanco'];
    this.perteneceGrupoEconomico.disabled ? this.perteneceGrupoEconomico.enable() : this.perteneceGrupoEconomico.disable();
    this.relacionEconomica = this.formGroup.controls['relacionEconomica'];
    this.rtn = this.formGroup.controls['rtn'];
    this.sectorEconomico = this.formGroup.controls['sectorEconomico'];
    this.tin = this.formGroup.controls['tin'];
    this.tipoInstitucion = this.formGroup.controls['tipoInstitucion'];
    this.institucion = this.formGroup.controls['institucion'];
    this.tipoCliente = this.formGroup.controls['tipoCliente'];
    this.invalidReference = true;
    this.disabledField = !this.disabledField;
    this.disabledField ?
      this.formGroup.controls['actividadEconomica'].enable() :
      this.formGroup.controls['actividadEconomica'].disable();
    this.disabledField ?
      this.formGroup.controls['afectoISR'].enable() :
      this.formGroup.controls['afectoISR'].disable();
    this.disabledField ?
      this.formGroup.controls['claseCliente'].enable() :
      this.formGroup.controls['claseCliente'].disable();
    this.disabledField ?
      this.formGroup.controls['codigoEmpleado'].enable() :
      this.formGroup.controls['codigoEmpleado'].disable();
    this.disabledField ?
      this.formGroup.controls['generadorDivisas'].enable() :
      this.formGroup.controls['generadorDivisas'].disable();
    this.disabledField ?
      this.formGroup.controls['parentescoEmpleadoBanco'].enable() :
      this.formGroup.controls['parentescoEmpleadoBanco'].disable();
    this.disabledField ?
      this.formGroup.controls['relacionEconomica'].enable() :
      this.formGroup.controls['relacionEconomica'].disable();
    this.disabledField ?
      this.formGroup.controls['rtn'].enable() :
      this.formGroup.controls['rtn'].disable();
    this.disabledField ?
      this.formGroup.controls['sectorEconomico'].enable() :
      this.formGroup.controls['sectorEconomico'].disable();
    this.disabledField ?
      this.formGroup.controls['tin'].enable() :
      this.formGroup.controls['tin'].disable();
    this.disabledField ?
      this.formGroup.controls['tipoInstitucion'].enable() :
      this.formGroup.controls['tipoInstitucion'].disable();
    this.disabledField ?
      this.formGroup.controls['institucion'].enable() :
      this.formGroup.controls['institucion'].disable();
    this.disabledField ?
      this.formGroup.controls['tipoCliente'].enable() :
      this.formGroup.controls['tipoCliente'].disable();
    this.disabledField ?
      this.relEmpleado.enable() :
      this.relEmpleado.disable();
    this.disabledField ?
      this.parentesco.enable() :
      this.parentesco.disable();
    this.relEmpleado.setValidators([]);
    this.relEmpleado.updateValueAndValidity();
    this.parentesco.setValidators([]);
    this.parentesco.updateValueAndValidity();
    $('#rtn').focus();
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'PERFIL_ECONOMICO';
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
      this.bindHide();

    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  changeIsr(value) {
    if (this.client.datosGeneralesPersonaNatural && this.client.datosGeneralesPersonaNatural) {
      if (this.client.datosGeneralesPersonaNatural && this.client.datosGeneralesPersonaNatural.paisResidencia &&
        this.client.datosGeneralesPersonaNatural.paisResidencia.codigo &&
        value && this.nationalityTin === this.client.datosGeneralesPersonaNatural.paisResidencia.codigo) {
        this.tin.setValidators([Validators.required, Validators.minLength(9), Validators.maxLength(9)]);
        this.tin.updateValueAndValidity();
      } else {
        this.tin.setValidators([]);
        this.tin.updateValueAndValidity();
      }
      /*if (value) {
       this.rtn.enable();
       } else {
       this.rtn.disable();
       }*/
    }

  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  setUpForm() {

    this.formGroup = this.formBuilder.group({
      actividadEconomica: [{disabled: this.disabledField}, [Validators.required]],
      afectoISR: [{disabled: this.disabledField}],
      claseCliente: [{disabled: this.disabledField}, [Validators.required]],
      tipoCliente: [{disabled: this.disabledField}, []],
      codigoEmpleado: [{disabled: this.disabledField}, []],
      generadorDivisas: [{disabled: this.disabledField}, []],
      parentescoEmpleadoBanco: [{disabled: this.disabledField}, []],
      perteneceGrupoEconomico: [{disabled: this.disabledField}, []],
      relacionEconomica: ['', Validators.required],
      rtn: [{disabled: this.disabledField}, [Validators.minLength(14), Validators.maxLength(14)]],
      sectorEconomico: [{disabled: this.disabledField}, [Validators.required]],
      tin: [{disabled: this.disabledField}, [Validators.minLength(9), Validators.maxLength(9)]],
      tipoInstitucion: [{disabled: this.disabledField}, [Validators.required]],
      institucion: [{disabled: this.disabledField}, [Validators.required]]
    });

    this.formGroupRelationShip = this.formBuilder.group({
      relEmpleado: [{disabled: this.disabledField}, []],
      parentesco: [{disabled: this.disabledField}, []]
    });

    this.actividadEconomica = this.formGroup.controls['actividadEconomica'];
    this.afectoISR = this.formGroup.controls['afectoISR'];
    this.claseCliente = this.formGroup.controls['claseCliente'];
    this.codigoEmpleado = this.formGroup.controls['codigoEmpleado'];
    this.generadorDivisas = this.formGroup.controls['generadorDivisas'];
    this.parentescoEmpleadoBanco = this.formGroup.controls['parentescoEmpleadoBanco'];
    this.perteneceGrupoEconomico = this.formGroup.controls['perteneceGrupoEconomico'];
    this.relacionEconomica = this.formGroup.controls['relacionEconomica'];
    this.rtn = this.formGroup.controls['rtn'];
    this.sectorEconomico = this.formGroup.controls['sectorEconomico'];
    this.tin = this.formGroup.controls['tin'];
    this.tipoInstitucion = this.formGroup.controls['tipoInstitucion'];
    this.institucion = this.formGroup.controls['institucion'];
    this.tipoCliente = this.formGroup.controls['tipoCliente'];
    this.relEmpleado = this.formGroupRelationShip.controls['relEmpleado'];
    this.parentesco = this.formGroupRelationShip.controls['parentesco'];
  }

  cambioEco() {
    console.log(this.formGroup);
  }

  legalSetUpForm() {
    this.actividadEconomica.setValidators([]);
    this.actividadEconomica.updateValueAndValidity();
    this.relacionEconomica.setValidators([]);
    this.relacionEconomica.updateValueAndValidity();
  }

  changeBonding(event) {
    console.log('bonding2 ', this.formGroup);
    this.client.perfilEconomico.parentescoEmpleadoBanco = !this.client.perfilEconomico.parentescoEmpleadoBanco;
    if (this.client.perfilEconomico.parentescoEmpleadoBanco) {
      this.relEmpleado.setValidators([Validators.required]);
      this.relEmpleado.updateValueAndValidity();
      this.parentesco.setValidators([Validators.required]);
      this.parentesco.updateValueAndValidity();
    } else {
      this.relEmpleado.setValidators([]);
      this.relEmpleado.updateValueAndValidity();
      this.parentesco.setValidators([]);
      this.parentesco.updateValueAndValidity();
    }
  }


  defaultParameters() {
    this.plParameterService.getParameter(PlatformParameters.PARAM_SECECO)
      .then((plParameters: any) => {
        const sectorEconomico = new SectorEconomico();
        sectorEconomico.codigo = plParameters.valor;
        this.client.perfilEconomico.sectorEconomico = sectorEconomico;
      });
    this.plParameterService.getParameter(PlatformParameters.PARAM_NACEST)
      .then((parameter: any) => {
        this.nationalityTin = parameter.valor;
        console.log(this.client.datosGeneralesPersonaNatural.paisResidencia.codigo);
        this.changeIsr(this.client.perfilEconomico.afectoISR);
      });
  }


  employmentSituation() {
    if (this.client.tipoPersona === 'J') {
      this.client.perfilEconomico.relacionEconomica = this.ECONOMIC_RELATIONSHIP_MERCHANT;
    }
  }


  addReferencia(referenciaParentescoEmpleado: ReferenciaParentescoEmpleado): void {
//    referenciaParentescoEmpleado.direccion = null;

    if (this.modifying) {
      if (this.validReference(referenciaParentescoEmpleado, this.index)) {
        this.client.referencias.referenciasParentestoEmpleados[this.index] = JSON.parse(JSON.stringify(referenciaParentescoEmpleado));
        if (referenciaParentescoEmpleado.modalidad !== this.mode.I) {
          this.client.referencias.referenciasParentestoEmpleados[this.index].modalidad = this.mode.U;
        }
        this.clean();
      }
    } else {
      const valido = false;
      if (!this.client.referencias) {
        this.client.referencias = new Referencia();
      }


      if (this.validateReferences(this.client.referencias.referenciasParentestoEmpleados.length + 1)) {

        if (this.client.referencias) {
          if (this.validReference(referenciaParentescoEmpleado)) {
            referenciaParentescoEmpleado.modalidad = this.mode.I;
            if (!this.client.referencias.referenciasParentestoEmpleados) {
              this.client.referencias.referenciasParentestoEmpleados = [];
            }
            this.client.referencias.referenciasParentestoEmpleados.push(JSON.parse(JSON.stringify(referenciaParentescoEmpleado)));
            this.clean();
          }
        } else {
          this.client.referencias = new Referencia();
          referenciaParentescoEmpleado.modalidad = this.mode.I;
          this.client.referencias.referenciasParentestoEmpleados.push(JSON.parse(JSON.stringify(referenciaParentescoEmpleado)));
          this.clean();
        }
      }

    }
    this.invalidReference = true;
    this.clean();
  }

  messageError(title: string, message: string): void {
    this.notificationService.error(this.translate.instant(title) + this.translate.instant(message), null, null);
  }

  validReference(referenciaParentescoEmpleado: ReferenciaParentescoEmpleado, index?: number): boolean {
    if (this.client && this.client.referencias) {
      if (this.client.referencias.referenciasParentestoEmpleados) {
        const referenceExist = this.client.referencias.referenciasParentestoEmpleados.filter(item =>
        (item.empleado ? item.empleado.codigo === referenciaParentescoEmpleado.empleado.id.codigo : item.empleado.codigo === referenciaParentescoEmpleado.empleado.id.codigo) &&
        (item.parentesco ? item.parentesco.codigo === referenciaParentescoEmpleado.parentesco.codigo : item.parentesco.codigo === referenciaParentescoEmpleado.parentesco.codigo));
        if (referenceExist && referenceExist.length > 0) {
          this.errorMessage('', this.translate.instant('validations.reference-exist'));
          return false;
        }
      }
    }
    return true;
  }


  removeReferencia(referenciaParentescoEmpleado): void {
    if (referenciaParentescoEmpleado.modalidad !== this.mode.I) {
      this.client.referencias.referenciasParentestoEmpleados[this.index].modalidad = this.mode.D;
    } else {
      this.client.referencias.referenciasParentestoEmpleados.splice(this.index, 1);
    }
    this.clean();
  }

  modify(referenciaParentescoEmpleado): void {
    this.modifying = true;
    this.edit = true;
    this.index = this.client.referencias.referenciasParentestoEmpleados.indexOf(referenciaParentescoEmpleado);
    this.referenciaParentescoEmpleado = JSON.parse(JSON.stringify(referenciaParentescoEmpleado));
    this.referenciaParentescoTemp = JSON.parse(JSON.stringify(referenciaParentescoEmpleado));
  }

  clean() {
    this.modifying = false;
    this.edit = false;
    this.referenciaParentescoEmpleado = new ReferenciaParentescoEmpleado();
    this.relEmpleado.setValidators([]);
    this.relEmpleado.updateValueAndValidity();
    this.parentesco.setValidators([]);
    this.parentesco.updateValueAndValidity();
  }

  restoreReference(item) {
    this.client.referencias.referenciasParentestoEmpleados[this.index] = JSON.parse(JSON.stringify(this.referenciaParentescoTemp));
  }

  errorMessage(title: string, message: string): void {
    this.notificationService.error(title, message);
  }

  loadIncomeReference() {
    if (this.client.tipoPersona === 'N') {
      this.catalogService.getCatalogParam('referenciasIngreso/' + this.typeReference[4], 'tipoPersona', this.client.tipoPersona)
        .then((response) => {
          this.min = response.minimo;
          this.max = response.maximo;
        });
    }

    if (!this.client.perfilEconomico.rtn && 
            this._navigationService.currentSections.find(item => item.section === Section.economicProfile && item.status === false)) {
      this.plParameterService.getParameter(PlatformParameters.PARAM_TIDODE)
        .then((parameter: any) => {
        if (this.client.tipoIdentificacion && this.client.tipoIdentificacion.codigo) {
          const valreplace = this.client.identificacion.replace(/ /g, '');
          if (this.client.tipoIdentificacion.codigo === parameter.valor) {
            this.client.perfilEconomico.rtn = valreplace;
          } else {
            this.plParameterService.getParameter(PlatformParameters.PARAM_TIDRTN)
            .then((param: any) => {
              if (this.client.tipoIdentificacion.codigo === param.valor && this.client.tipoPersona === PersonType[PersonType.J]) {
                this.client.perfilEconomico.rtn = valreplace;   
              } 
            });
          }
        }
      });
    }

    this.plParameterService.getParameter(PlatformParameters.PARAM_NACEST)
      .then((parameter: any) => {
        this.nationalityTin = parameter.valor;
        this.changeIsr(this.client.perfilEconomico.afectoISR);
      });


  }

  validateReferences(sizeReferences): boolean {
    if (sizeReferences < this.min) {
      this.messageError('validations.min-references', this.min.toString());
      return false;
    }
    if (sizeReferences > this.max) {
      this.messageError('validations.max-references', this.max.toString());
      return false;
    }
    return true;
  }

  isValidChange(): boolean {
//    if (this.referenciaParentescoEmpleado.empleado.codigo && this.client.referencias.referenciasLaborales[this.index].nombre) {
//      if (this.laboralReference.nombre === this.client.referencias.referenciasLaborales[this.index].nombre &&
//        this.laboralReference.cargo === this.client.referencias.referenciasLaborales[this.index].cargo &&
//        this.laboralReference.salario === this.client.referencias.referenciasLaborales[this.index].salario &&
//        this.laboralReference.diaPago === this.client.referencias.referenciasLaborales[this.index].diaPago &&
//        this.laboralReference.fechaIngreso === this.client.referencias.referenciasLaborales[this.index].fechaIngreso) {
//        return true;
//      }
//    }
    return false;
  }


}
