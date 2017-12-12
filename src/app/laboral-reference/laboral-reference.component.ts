import {Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, EventEmitter, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {ClienteDto} from '../shared/client/cliente-dto';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {NavigationService} from '../shared/services/navigation.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ReferenciaLaboral} from '../shared/client/referencia-laboral';
import {Mode} from '../shared/client/referenceDTO';
import {Referencia} from '../shared/client/referencia';
import {SecurityService} from 'security-angular/src/app';
import {ChangeService} from '../shared/services/change.service';
import {CatalogService} from '../shared/services/catalog.service';
import {TypeReference} from '../shared/typeReference';
import {Validator} from '../shared/custom-validators';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlatformParameters} from '../shared/platform-parameters.enum';
declare var $: any;
@Component({
  selector: 'pl-laboral-reference',
  templateUrl: './laboral-reference.component.html',
  styleUrls: ['./laboral-reference.component.css'],
  providers: [CatalogService, PlParameterService]
})
export class LaboralReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Output() notifyHeader = new EventEmitter();
  ECONOMIC_RELATIONSHIP_MERCHANT;
  ECONOMIC_RELATIONSHIP_BOTH;
  formGroup: FormGroup;
  name: AbstractControl;
  position: AbstractControl;
  salary: AbstractControl;
  payday: AbstractControl;
  admissionDate: AbstractControl;
  exitDate: AbstractControl;

  client: ClienteDto;
  tempClient : ClienteDto;
  laboralReference: ReferenciaLaboral = new ReferenciaLaboral();
  laboralReferenceCopy: ReferenciaLaboral[];
  maxDate: any;
  minDate: any;
  minDateExit: any;
  admissionDateModel: any;
  exitDateModel: any;
  max: number = 0;
  min: number = 0;
  typeReference = TypeReference;
  authorization: Authorization;
  authorized: Authorized;
//  validator : Validator;

  private edit = false;
  private modifying = false;
  private index: number;
  private mode = Mode;
  private identification: string;
  busy: Promise<any>;

  heading: string[] = ['references.laboral.code', 'references.laboral.description'];
  headingUpdate: string[] = ['references.laboral.code', 'references.laboral.description', 'references.dependent.mode'];
  values: string[] = ['nombre', 'cargo'];

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

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private translate: TranslateService,
              private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private _securityService: SecurityService,
              private changeService: ChangeService,
              private catalogService: CatalogService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _plService: PlParameterService,
              private validationService: ValidationsService) {
    this.setUpForm();
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
    this.minDateExit = {
      year: 1920,
      month: 1,
      day: 1
    };
    if (this.partialPersistService.data) {
      this.client = this.partialPersistService.data;
      this.loadIncomeReference();
    }
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      name: [{
        value: null,
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      position: [{
        value: null,
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(30)])],
      salary: [{
        value: null,
        disabled: this.editMode
      }, Validators.required],
      payday: [{
        value: null,
        disabled: this.editMode
      }, Validators.compose([Validator.max(31), Validator.min(0)])],
      admissionDate: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      exitDate: [{
        value: new Date(),
        disabled: this.editMode
      }]
    });
    this.name = this.formGroup.controls['name'];
    this.position = this.formGroup.controls['position'];
    this.salary = this.formGroup.controls['salary'];
    this.payday = this.formGroup.controls['payday'];
    this.admissionDate = this.formGroup.controls['admissionDate'];
    this.exitDate = this.formGroup.controls['exitDate'];
  }

  enableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].enable();
    }
  }

  disableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].disable();
    }
  }

  changeControl() {
    this.tempClient =  <ClienteDto> JSON.parse(JSON.stringify(this.client)); 
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
    }
  }

  async ngOnInit() {
    if (this.editMode) {
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSection(this.identification, 'referenciasLaborales')
      this.busy.then((client) => {
        this.disableControl();
        this.client = client;
        if (this.client.referencias) {
          if (this.client.referencias.referenciasLaborales)
            this.laboralReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasLaborales));
        }
        this.loadIncomeReference();
      });
    } else {
      if (!this.client)
        this.loadPartial();
    }
    const merchant = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_COMERCIANTE);
    const both = await this._plService.getParameter(PlatformParameters.PARAM_RELACION_ECONOMICA_AMBOS);
    this.ECONOMIC_RELATIONSHIP_MERCHANT = parseInt(merchant.valor, 10);
    this.ECONOMIC_RELATIONSHIP_BOTH = parseInt(both.valor, 10);
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  loadIncomeReference() {
    this.catalogService.getCatalogParam('referenciasIngreso/' + this.typeReference[2], 'tipoPersona', this.client.tipoPersona)
      .then((response) => {
        this.min = response.minimo;
        this.max = response.maximo;
      });
  }

  selectSalary(salary) {
    this.laboralReference.salario = salary;
  }

  changeDateAdmission(date): void {
    if (date) {
      this.laboralReference.fechaIngreso = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
      this.minDateExit = {
        year: date.year,
        month: date.month,
        day: date.day
      };
    }
  }

  changeDateExit(date): void {
    if (date) {
      this.laboralReference.fechaEgreso = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  isValidChange(): boolean {
    if (this.laboralReference.nombre && this.client.referencias.referenciasLaborales[this.index].nombre) {
      if (this.laboralReference.nombre === this.client.referencias.referenciasLaborales[this.index].nombre &&
        this.laboralReference.cargo === this.client.referencias.referenciasLaborales[this.index].cargo &&
        this.laboralReference.salario === this.client.referencias.referenciasLaborales[this.index].salario &&
        this.laboralReference.diaPago === this.client.referencias.referenciasLaborales[this.index].diaPago &&
        this.laboralReference.fechaIngreso === this.client.referencias.referenciasLaborales[this.index].fechaIngreso) {
        return true;
      }
    }
    return false;
  }

  isValidCancel(): boolean {
    if ((this.client.referencias.referenciasLaborales.find(item =>
      item.modalidad === this.mode.D ||
      item.modalidad === this.mode.I ||
      item.modalidad === this.mode.U))) {
      return false;
    }
    return true;
  }

  restoreLaboral(laboral: ReferenciaLaboral): void {
    let lab = this.client.referencias.referenciasLaborales.filter(item => item.correlativoReferencia === laboral.correlativoReferencia)[0];
    if (laboral.modalidad === this.mode.I) {
      this.client.referencias.referenciasLaborales.splice(this.client.referencias.referenciasLaborales.indexOf(lab), 1);
    } else {
      let labb = JSON.parse(JSON.stringify(this.laboralReferenceCopy.filter(item => item.correlativoReferencia === laboral.correlativoReferencia)[0]));
      if (labb) {
        lab = this.client.referencias.referenciasLaborales.filter(item => item.correlativoReferencia === labb.correlativoReferencia)[0];
        this.client.referencias.referenciasLaborales[this.client.referencias.referenciasLaborales.indexOf(lab)] = labb;
      }
    }
  }

  cancelProviders() {
    
    if (this.laboralReferenceCopy) {
      this.client.referencias.referenciasLaborales = JSON.parse(JSON.stringify(this.laboralReferenceCopy));
    } else {
      this.client.referencias.referenciasLaborales = [];
    }
    this.disableControl();
      this.client = this.tempClient;  
  }

  clean() {
    this.modifying = false;
    this.edit = false;
    this.laboralReference = new ReferenciaLaboral();
    this.name.setValue('');
    this.position.setValue('');
    this.salary.setValue(0);
    this.payday.setValue('');
    this.admissionDate.setValue(undefined);
    this.exitDate.setValue('');
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  validReference(laboralReference: ReferenciaLaboral, index?: number): boolean {
    if (this.client.referencias.referenciasLaborales) {
      if (this.edit) {
        return true;
      }
      const referenceExist = this.client.referencias.referenciasLaborales.filter(item =>
      (item.nombre ? item.nombre.trim() === laboralReference.nombre.trim() : item.nombre === laboralReference.nombre) &&
      (item.cargo ? item.cargo.trim() === laboralReference.cargo.trim() : item.cargo === laboralReference.cargo) &&
      (item.correlativoReferencia ? item.correlativoReferencia !== laboralReference.correlativoReferencia : item.correlativoReferencia === laboralReference.correlativoReferencia))[0];
      if (referenceExist) {
        this.errorMessage('', this.translate.instant('validations.reference-exist'));
        return false;
      }
    }
    return true;
  }

  addReferencia(laboralReference: ReferenciaLaboral): void {
//    laboralReference.telefono2 = laboralReference.telefono2 === null || !laboralReference.telefono2 ? '' : laboralReference.telefono2;
    laboralReference.diaPago = laboralReference.diaPago ? laboralReference.diaPago : 0;
    if (this.modifying) {
      if (this.validReference(laboralReference, this.index)) {
        this.client.referencias.referenciasLaborales[this.index] = JSON.parse(JSON.stringify(laboralReference));
        if (laboralReference.modalidad !== this.mode.I) {
          this.client.referencias.referenciasLaborales[this.index].modalidad = this.mode.U;
        }
        this.clean();
      }
    } else {
      if (this.client.referencias) {
        if (this.validReference(laboralReference)) {
          laboralReference.modalidad = this.mode.I;
          laboralReference.direccion = null;
          if (!this.client.referencias.referenciasLaborales)
            this.client.referencias.referenciasLaborales = [];
          this.client.referencias.referenciasLaborales.push(JSON.parse(JSON.stringify(laboralReference)));
          this.clean();
        }
      } else {
        this.client.referencias = new Referencia();
        laboralReference.modalidad = this.mode.I;
        laboralReference.direccion = null;
        this.client.referencias.referenciasLaborales.push(JSON.parse(JSON.stringify(laboralReference)));
        this.clean();
      }
    }
  }

  removeReferencia(laboralReference): void {
    if (laboralReference.modalidad !== this.mode.I) {
      this.client.referencias.referenciasLaborales[this.index].modalidad = this.mode.D;
    } else {
      this.client.referencias.referenciasLaborales.splice(this.index, 1);
    }
    this.clean();
  }

  modify(laboral): void {
//    if (this.name.enabled) {
      this.modifying = true;
      this.edit = true;
      this.index = this.client.referencias.referenciasLaborales.indexOf(laboral);
      this.formGroup.markAsPristine();
      this.formGroup.markAsUntouched();
      this.laboralReference = JSON.parse(JSON.stringify(laboral));
      if (this.laboralReference.fechaIngreso) {
        const parsedDay = new Date(this.laboralReference.fechaIngreso);
        let a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
        this.admissionDateModel = a;
      }
      if (this.laboralReference.fechaEgreso) {
        const parsedDay = new Date(this.laboralReference.fechaEgreso);
        this.laboralReference.fechaEgreso = parsedDay;
        let a = {year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate()};
        this.exitDateModel = a;
      }
//    }
  }

  errorMessage(title: string, message: string): void {
    this.notificationService.error(title, message);
  }

  messageError(title: string, message: string): void {
    this.notificationService.error(this.translate.instant(title) + this.translate.instant(message), null, null)
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

  loadPartial() {
    this.client = new ClienteDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
      } else {
        this.client = new ClienteDto();
      }
      this.loadIncomeReference();
    }).catch((e) => this.client = new ClienteDto());
  }

  validateForm(): void {
    const size = this.client.referencias.referenciasLaborales.filter(item => item.modalidad != Mode.D).length;
    if (this.validateReferences(size)) {
      this.partialSave();
    }
  }

  next(): void {
    if (this.editMode) {
      this.notifyHeader.emit();
    } else {
      if (this.client.perfilEconomico.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH) {
        this.navigationService.navigateTo(Section.laboralReference, Section.businessDataLegal, true);
      } else {
        this.navigationService.navigateTo(Section.laboralReference, Section.legalRepresentative, true);
      }
    }
  }

  partialSave() {
    if (this.editMode) {
      this.busy = this.changeService.putSection(this.client, this.identification, 'referenciasLaborales');
      this.busy.then((client) => {
        this.client = client;
        this.bindHide();
        this.client.autorizaciones = [];
        this.disableControl();
        this.next();
        this.successUpdate('messages.success.references.laboral', 'messages.success.update');
      }).catch(e => this.handleError(e));
    } else {
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.next();
      });
    }
  }

  cancel() {
    $('#confirmModal').modal('show');
  }
  successUpdate(title: string, message: string): void {
    
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
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
    ;
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'REFERENCIAS';
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
