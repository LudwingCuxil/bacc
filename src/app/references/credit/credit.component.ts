import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {CreditService} from './shared/credit.service';
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
import {ReferenciaCredito} from '../../shared/client/referencia-credito';
import {TranslateService} from 'ng2-translate';
import {TipoInstitucion} from '../../shared/client/tipo-institucion';
import {Institucion} from '../../shared/client/institucion';
import {ReferenceType} from '../type-select/shared/reference-type';
import {ClaseReferencia} from '../../shared/client/clase-referencia';
import {InstitutionService} from '../../institution/shared/institution.service';
import {TypeInstitutionService} from '../../type-institution/shared/type-institution.service';
import {ReferencesComponent} from '../references.component';
import {CatalogService} from '../../shared/services/catalog.service';

declare var $: any;

@Component({
  selector: 'pl-credit-reference',
  templateUrl: './credit.component.html',
  styles: [``],
  providers: [CreditService, PlParameterService, TypeInstitutionService, InstitutionService],
})
export class CreditReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy = [];
  heading: string[] = ['referencias-credito.tipo', 'referencias-credito.institucion', 'referencias-credito.numero'];
  headingEdit: string[] = ['referencias-credito.tipo', 'referencias-credito.institucion', 'referencias-credito.numero', 'table.actions'];
  values: string[] = ['tipoInstitucion.descripcion', 'institucion.descripcion', 'numero'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  type: TipoInstitucion;
  subType: Institucion;
  reference: ClaseReferencia;
  referenceList = [];
  concession: any;
  expire: any;
  maxDate: any;
  maxDateExpire: any;
  minDate: any;
  busy: Promise<any>;
  client: ClienteDto;
  credit: ReferenciaCredito = new ReferenciaCredito();
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
  referenceType: AbstractControl;
  number: AbstractControl;
  limit: AbstractControl;
  concessionDate: AbstractControl;
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
    }
    this.getReferenceList();
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._institutionTypeService.getTypeInstitutionService();
      if (this.changeMode) {
        this.disableControls();
      }
      this.busy.then(response => {
        this.referenceListCopy = this.client.referencias.referenciasCredito;
        this.client.referencias.referenciasCredito.forEach(credit => credit.tipoInstitucion.descripcion = response.find(item => item.codigo === credit.tipoInstitucion.codigo).descripcion);
      });
      this.client.referencias.referenciasCredito.forEach(credit => {
        this.busy = this._institutionService.getInstitutionService(credit.tipoInstitucion.codigo + '');
        this.busy.then(institutions => {
          credit.institucion.descripcion = institutions.find(item => item.codigo === credit.institucion.codigo).descripcion;
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

  selectReferenceType(reference): void {
    this.credit.claseRefencia = reference;
  }


  selectSector(sector): void {
    if (sector) {
      this.type = sector;
      this.credit.tipoInstitucion = sector;
    }
    if (!this.edit) {
      this.subTypeSelect.setValue(new Institucion());
    }
  }

  selectSubSector(subSector): void {
    this.subType = subSector;
    if (subSector) {
      this.credit.institucion = subSector;
    }
  }

  changeDateConcession(date): void {
    if (date) {
      this.credit.fechaConcesion = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  changeDateExpire(date): void {
    if (date) {
      this.credit.fechaVencimiento = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
    }
  }

  restoreReference(credit: ReferenciaCredito): void {
    const creditFound = this.client.referencias.referenciasCredito.find((item) => credit.correlativoReferencia === item.correlativoReferencia);
    if (credit.modalidad === this.mode.I) {
      this.client.referencias.referenciasCredito.splice(this.client.referencias.referenciasCredito.indexOf(creditFound), 1);
    } else {
      const creditRestore = this.referenceListCopy.filter(item => item.correlativoReferencia === credit.correlativoReferencia)[0];
      if (creditRestore) {
        this.client.referencias.referenciasCredito[this.client.referencias.referenciasCredito.indexOf(creditFound)] = JSON.parse(JSON.stringify(creditRestore));
      }
    }
    this.clean();
  }

  selectRecord(credit: ReferenciaCredito) {
    this.edit = true;
    this.credit = JSON.parse(JSON.stringify(credit));
    this.credit.fechaConcesion = new Date(credit.fechaConcesion);
    this.type = this.credit.tipoInstitucion;
    this.subType = this.credit.institucion;
    this.reference = this.credit.claseRefencia;
    this.concession = {
      year: this.credit.fechaConcesion.getFullYear(),
      month: this.credit.fechaConcesion.getMonth() + 1,
      day: this.credit.fechaConcesion.getDate()
    };
    if (this.credit.fechaVencimiento) {
      this.credit.fechaVencimiento = new Date(credit.fechaVencimiento);
      this.expire = {
        year: this.credit.fechaVencimiento.getFullYear(),
        month: this.credit.fechaVencimiento.getMonth() + 1,
        day: this.credit.fechaVencimiento.getDate()
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
    if (this.credit.modalidad !== this.mode.I) {
      this.client.referencias.referenciasCredito.find(a => this.credit.correlativoReferencia === a.correlativoReferencia).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasCredito.find(a => this.credit.correlativoReferencia === a.correlativoReferencia);
      this.client.referencias.referenciasCredito.splice(this.client.referencias.referenciasCredito.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.edit) {
      const credit = this.client.referencias.referenciasCredito.find((item) => this.credit.correlativoReferencia === item.correlativoReferencia);
      this.client.referencias.referenciasCredito[this.client.referencias.referenciasCredito.indexOf(credit)] = JSON.parse(JSON.stringify(this.credit));
      if (this.credit.modalidad !== this.mode.I) {
        this.client.referencias.referenciasCredito.find(item => item.correlativoReferencia === this.credit.correlativoReferencia).modalidad = this.mode.U;
      }
    } else {
      if (this.validateReference()) {
        this.credit.modalidad = this.mode.I;
        if (this.client.referencias.referenciasCredito.length === 0) {
          this.credit.correlativoReferencia = 0;
        } else {
          this.credit.correlativoReferencia = this.client.referencias.referenciasCredito[this.client.referencias.referenciasCredito.length - 1].correlativoReferencia + 1;
        }
        this.client.referencias.referenciasCredito.push(JSON.parse(JSON.stringify(this.credit)));
      }
    }
    this.clean();
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'CREDITO');
      if (reference.maximo <= this.client.referencias.referenciasCredito.length) {
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


  isInvalidChange() {
    if (this.client.referencias.referenciasCredito.find(item => item.correlativoReferencia === this.credit.correlativoReferencia)) {
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
    this.credit = new ReferenciaCredito();
    this.subTypeSelect.setValue(new TipoInstitucion());
    this.typeSelect.setValue(new Institucion());
    this.referenceType.setValue(new ReferenceType());
    this.limit.setValue('');
    this.concessionDate.setValue(undefined);
    this.expireDate.setValue(undefined);
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
      referenceType: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      number: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(20)])],
      limit: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(9)])],
      concessionDate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      expireDate: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])]
    });
    this.subTypeSelect = this.formGroup.controls['subTypeSelect'];
    this.typeSelect = this.formGroup.controls['typeSelect'];
    this.referenceType = this.formGroup.controls['referenceType'];
    this.number = this.formGroup.controls['number'];
    this.limit = this.formGroup.controls['limit'];
    this.concessionDate = this.formGroup.controls['concessionDate'];
    this.expireDate = this.formGroup.controls['expireDate'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.subTypeSelect.enable();
    this.typeSelect.enable();
    this.referenceType.enable();
    this.number.enable();
    this.limit.enable();
    this.concessionDate.enable();
    this.expireDate.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.subTypeSelect.disable();
    this.typeSelect.disable();
    this.referenceType.disable();
    this.number.disable();
    this.limit.disable();
    this.concessionDate.disable();
    this.expireDate.disable();
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
