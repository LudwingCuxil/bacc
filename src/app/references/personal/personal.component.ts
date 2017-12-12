import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {PersonalReferenceService} from './shared/personal.service';
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
import {ReferenciaPersonalFamiliar} from '../../shared/client/referencia-personal-familiar';
import {Parentesco} from '../../shared/client/parentesco';
import {CatalogService} from '../../shared/services/catalog.service';
import {ReferencesComponent} from '../references.component';

declare var $: any;

@Component({
  selector: 'pl-personal-reference',
  templateUrl: './personal.component.html',
  styles: [``],
  providers: [PersonalReferenceService, PlParameterService, CatalogService],
})
export class PersonalReferenceComponent implements OnInit, FormSectionInterface, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy = [];
  referenceList = [];
  heading: string[] = ['referencias-personales.nombre', 'referencias-personales.parentesco', 'referencias-personales.direccion'];
  headingEdit: string[] = ['referencias-personales.nombre', 'referencias-personales.parentesco', 'referencias-personales.direccion', 'table.actions'];
  values: string[] = ['nombre', 'parentesco.descripcion', 'direccion'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  maxDate: any;
  minDate: any;
  relationship;
  busy: Promise<any>;
  client: ClienteDto;
  personal: ReferenciaPersonalFamiliar = new ReferenciaPersonalFamiliar();
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
  nameInput: AbstractControl;
  addressInput: AbstractControl;
  relationshipInput: AbstractControl;
  homePhoneNumber: AbstractControl;
  officePhoneNumber: AbstractControl;

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
      if (!this.client.referencias.referenciasPersonalesFamiliares) {
        this.client.referencias.referenciasPersonalesFamiliares = [];
      }
    }
    this.getReferenceList();
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._catalogService.getCatalog('parentescos');
      if (this.changeMode) {
        this.disableControls();
      }
      this.busy.then((relationships: any) => {
        this.referenceListCopy = this.client.referencias.referenciasPersonalesFamiliares;
        this.client.referencias.referenciasPersonalesFamiliares.forEach(item => {
          const relationshipFind = relationships.find((relation) => item.parentesco.codigo.trim() === relation.codigo.trim());
          if (relationshipFind) {
            item.parentesco = relationshipFind;
          }
        });
      });
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

  restoreReference(personal: ReferenciaPersonalFamiliar): void {
    const personalFound = this.client.referencias.referenciasPersonalesFamiliares.find((item) => personal.correlativoReferencia === item.correlativoReferencia);
    if (personal.modalidad === this.mode.I) {
      this.client.referencias.referenciasPersonalesFamiliares.splice(this.client.referencias.referenciasPersonalesFamiliares.indexOf(personalFound), 1);
    } else {
      const personalRestore = this.referenceListCopy.filter(item => item.correlativoReferencia === personal.correlativoReferencia)[0];
      if (personalRestore) {
        this.client.referencias.referenciasPersonalesFamiliares[this.client.referencias.referenciasPersonalesFamiliares.indexOf(personalFound)] = JSON.parse(JSON.stringify(personalRestore));
      }
    }
    this.clean();
  }

  selectRelationship(relationship) {
    this.relationship = relationship;
    if (relationship) {
      this.personal.parentesco = relationship;
    }
  }

  selectRecord(personal: ReferenciaPersonalFamiliar) {
    this.edit = true;
    this.personal = JSON.parse(JSON.stringify(personal));
    this.relationship = this.personal.parentesco;
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
    if (this.personal.modalidad !== this.mode.I) {
      this.client.referencias.referenciasPersonalesFamiliares.find(a => this.personal.correlativoReferencia === a.correlativoReferencia).modalidad = this.mode.D;
    } else {
      const ref = this.client.referencias.referenciasPersonalesFamiliares.find(a => this.personal.correlativoReferencia === a.correlativoReferencia);
      this.client.referencias.referenciasPersonalesFamiliares.splice(this.client.referencias.referenciasPersonalesFamiliares.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.edit) {
      const personal = this.client.referencias.referenciasPersonalesFamiliares.find((item) => this.personal.correlativoReferencia === item.correlativoReferencia);
      this.client.referencias.referenciasPersonalesFamiliares[this.client.referencias.referenciasPersonalesFamiliares.indexOf(personal)] = JSON.parse(JSON.stringify(this.personal));
      if (this.personal.modalidad !== this.mode.I) {
        this.client.referencias.referenciasPersonalesFamiliares.find(item => item.correlativoReferencia === this.personal.correlativoReferencia).modalidad = this.mode.U;
      }
    } else {
      if (this.validateReference()) {
        this.personal.modalidad = this.mode.I;
        if (this.client.referencias.referenciasPersonalesFamiliares.length === 0) {
          this.personal.correlativoReferencia = 0;
        } else {
          this.personal.correlativoReferencia = this.client.referencias.referenciasPersonalesFamiliares[this.client.referencias.referenciasPersonalesFamiliares.length - 1].correlativoReferencia + 1;
        }
        this.client.referencias.referenciasPersonalesFamiliares.push(JSON.parse(JSON.stringify(this.personal)));
      }
    }
    this.clean();
  }

  validateReference(): boolean {
    if (this.referenceList) {
      const reference = this.referenceList.find(item => item.referencia.tipoReferencia === 'PERSONALES_FAMILIARES');
      if (reference.maximo <= this.client.referencias.referenciasPersonalesFamiliares.length) {
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
    if (this.client.referencias.referenciasPersonalesFamiliares.find(item => item.correlativoReferencia === this.personal.correlativoReferencia)) {
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
    this.personal = new ReferenciaPersonalFamiliar();
    this.addressInput.setValue('');
    this.nameInput.setValue('');
    this.relationshipInput.setValue(new Parentesco());
    this.officePhoneNumber.setValue('');
    this.homePhoneNumber.setValue('');
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      nameInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.pattern(this.pattern), Validators.maxLength(40)])],
      addressInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(40)])],
      relationshipInput: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
      homePhoneNumber: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15)])],
      officePhoneNumber: [{
        value: '',
        disabled: this.disabledField
      }]
    });
    this.addressInput = this.formGroup.controls['addressInput'];
    this.nameInput = this.formGroup.controls['nameInput'];
    this.relationshipInput = this.formGroup.controls['relationshipInput'];
    this.homePhoneNumber = this.formGroup.controls['homePhoneNumber'];
    this.officePhoneNumber = this.formGroup.controls['officePhoneNumber'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.addressInput.enable();
    this.nameInput.enable();
    this.relationshipInput.enable();
    this.homePhoneNumber.enable();
    this.officePhoneNumber.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.addressInput.disable();
    this.nameInput.disable();
    this.relationshipInput.disable();
    this.homePhoneNumber.disable();
    this.officePhoneNumber.disable();
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
