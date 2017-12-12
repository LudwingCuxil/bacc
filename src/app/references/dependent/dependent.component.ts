import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {SecurityService} from 'security-angular/src/app';

import {ReferencesService} from '../shared/references.service';
import {ClienteDto} from '../../shared/client/cliente-dto';
import {ReferenciaDependiente} from '../../shared/client/referencia-dependiente';
import {Authorization, Authorized} from '../../authorization/shared/authorization';
import {CatalogService} from '../../shared/services/catalog.service';
import {RelationshipSelectComponent} from '../../components/select/relationship-select.component';
import {Parentesco} from '../../shared/client/parentesco';
import {Mode} from '../../shared/client/referenceDTO';
import {Referencia} from '../../shared/client/referencia';
import {NavigationService} from '../../shared/services/navigation.service';
import {ChangeService} from '../../shared/services/change.service';

import {FormSectionInterface} from '../../shared/form-section-interface';
import {Section} from '../../shared/section';
import {WebFormName} from '../../shared/webform-name';
import {PartialPersistService} from '../../shared/services/partial-persist.service';

declare var $: any;
@Component({
  selector: 'pl-dependent',
  templateUrl: './dependent.component.html',
  styleUrls: ['./dependent.component.css'],
  providers: [ReferencesService, CatalogService]
})
export class DependentComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;

  private identification: string;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  private relationships: Parentesco[] = [];
  private edit: boolean = false;
  private modifying: boolean = false;
  private mode = Mode;
  private index: number;
  formGroup: FormGroup;
  name: AbstractControl;
  address: AbstractControl;
  phone: AbstractControl;
  phone2: AbstractControl;
  relationship: AbstractControl;

  authorization: Authorization;
  authorized: Authorized;

  client: ClienteDto;
  dependentReference: ReferenciaDependiente = new ReferenciaDependiente();
  dependentReferenceCopy: ReferenciaDependiente[];
  descRelationship = false;
  createSucessful = false;
  deleteSucessful = false;
  updateSucessful = false;
  busy: Promise<any>;

  heading: string[] = ['references.dependent.name', 'references.dependent.address', 'references.dependent.relationship', 'references.dependent.phone'];
  headingUpdate: string[] = ['references.dependent.name', 'references.dependent.address', 'references.dependent.relationship', 'references.dependent.phone', 'references.dependent.mode'];
  values: string[] = ['nombre', 'direccion', 'parentesco.descripcion', 'telefono1'];

  @ViewChild(RelationshipSelectComponent) public relationshipSelect: RelationshipSelectComponent;

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
              private route: ActivatedRoute,
              private notificationService: NotificationsService,
              private translate: TranslateService,
              private referencesService: ReferencesService,
              private catalogService: CatalogService,
              private navigationService: NavigationService,
              private _securityService: SecurityService,
              private changeService: ChangeService,
              private partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef,) {
    this.setUpForm();
    if (this.partialPersistService.data) {
      this.client = this.partialPersistService.data;
    }
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      name: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(40), Validators.pattern(this.pattern)])],
      address: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(40)])],
      relationship: [{
        value: null,
        disabled: this.editMode
      }, Validators.required],
      phone: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      phone2: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(/^(0|[1-9][0-9]*)$/)])]
    });

    this.name = this.formGroup.controls['name'];
    this.address = this.formGroup.controls['address'];
    this.relationship = this.formGroup.controls['relationship'];
    this.phone = this.formGroup.controls['phone'];
    this.phone2 = this.formGroup.controls['phone2'];
  }

  ngOnInit() {
    if (this.editMode) {
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this.referencesService.getReferencesDependent(this.identification);
      this.busy.then((client) => {
        this.client = client;
        this.disableControl();
        if (this.client.referencias){
          this.client.referencias.referenciasDependientes.map((item) => item.parentesco = item.parentesco ? item.parentesco : new Parentesco());
          this.busy = this.catalogService.getCatalog('parentescos');
          this.busy.then((relationships: Parentesco[]) => {
            this.client.referencias.referenciasDependientes.map((item) => {
              item.parentesco = relationships.find((itemRel) => itemRel.codigo.trim() === item.parentesco.codigo.trim());
              if (!item.parentesco) {
                item.parentesco = new Parentesco();
                item.parentesco = {codigo: '', descripcion: item.parentescoDescripcion};
              }
            });
          });
          this.dependentReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasDependientes));
        } else {
          this.client.referencias = new Referencia();
        }
      });
    } else {
      if (!this.client)
        this.loadPartial();
    }
  }
  
  disableControl() {
    for (let key in this.formGroup.controls) {
      this.formGroup.controls[key].disable();
    }
  }
  
  changeControl() {
    for (let key in this.formGroup.controls)
      this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
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

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  cancelDependents() {
    if (this.dependentReferenceCopy) {
      this.client.referencias.referenciasDependientes = JSON.parse(JSON.stringify(this.dependentReferenceCopy));
    } else {
      if (!this.client.referencias)
        this.client.referencias = new Referencia();
      this.client.referencias.referenciasDependientes = [];
    }
    this.changeControl();
  }

  public  cancel() {
    $('#confirmModal').modal('show');
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
      this.translate.get('exceptionace.' + JSON.parse(error._body).code).subscribe(title => {
        this.notificationService.error('An error occurred, status: ' + error.status, title);
      });
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
    this.createSucessful = false;
    this.deleteSucessful = false;
    this.updateSucessful = false;
  }

  successCreate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), message);
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }

  successDelete(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  errorMessage(title: string, message: string): void {
    this.notificationService.error(title, message);
  }

  selectRelationship(relationship) {
    this.dependentReference.parentesco = relationship;
  }

  relationshipDes(code: string): string {
    if (this.relationships.length === 0 && this.relationshipSelect) {
      this.relationships = this.relationshipSelect.relationships;
    }
    if (this.relationships.length > 0) {
      let rel = this.relationships.filter(item => item.codigo.trim() === code.trim())[0];
      return rel.descripcion;
    }
  }

  modify(dependent): void {
    this.modifying = true;
    this.edit = true;
    this.index = this.client.referencias.referenciasDependientes.indexOf(dependent);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.dependentReference = JSON.parse(JSON.stringify(dependent));
    if (dependent.parentesco.codigo === '') {
      this.descRelationship = true;
    } else {
      this.descRelationship = false;
    }
  }

  isValidChange(): boolean {
    if (this.dependentReference.nombre && this.client.referencias.referenciasDependientes[this.index].nombre) {
      if (this.dependentReference.nombre === this.client.referencias.referenciasDependientes[this.index].nombre &&
        this.dependentReference.direccion === this.client.referencias.referenciasDependientes[this.index].direccion &&
        this.dependentReference.telefono1 === this.client.referencias.referenciasDependientes[this.index].telefono1 &&
        this.dependentReference.parentesco.codigo === this.client.referencias.referenciasDependientes[this.index].parentesco.codigo &&
        this.dependentReference.telefono2 === this.client.referencias.referenciasDependientes[this.index].telefono2) {
        return true;
      }
    }
    return false;
  }

  isValidCancel(): boolean {
    if ((this.client.referencias.referenciasDependientes.find(item =>
      item.modalidad === this.mode.D ||
      item.modalidad === this.mode.I ||
      item.modalidad === this.mode.U))) {
      return false;
    }
    return true;
  }

  restoreDependent(dependent: ReferenciaDependiente): void {
    let dependentRestore = this.client.referencias.referenciasDependientes.filter(item => item.correlativo === dependent.correlativo)[0];
    if (dependent.modalidad === this.mode.I) {
      this.client.referencias.referenciasDependientes.splice(this.client.referencias.referenciasDependientes.indexOf(dependentRestore), 1);
    } else {
      let dependentRestoreb = this.dependentReferenceCopy.filter(item => item.correlativo === dependent.correlativo)[0];
      if (dependentRestoreb) {
        dependentRestore = this.client.referencias.referenciasDependientes.filter(item => item.correlativo === dependentRestoreb.correlativo)[0];
        this.client.referencias.referenciasDependientes[this.client.referencias.referenciasDependientes.indexOf(dependentRestore)] = dependentRestoreb;
      }
    }
  }

  clean() {
    this.modifying = false;
    this.edit = false;
    this.descRelationship = false;
//      this.name.setValue(null);
//      this.address.setValue(null);
//      this.relationship.setValue(null);
//      this.phone.setValue(null);
//      this.phone2.setValue(null);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.dependentReference = new ReferenciaDependiente();
//      this.ngAfterViewInit();
  }

  validReference(dependentReference: ReferenciaDependiente, index?: number): boolean {
    let referenceExist = this.client.referencias.referenciasDependientes.filter(item =>
    item.nombre.trim() === dependentReference.nombre.trim() && item.parentesco.codigo.trim() === dependentReference.parentesco.codigo.trim() &&
    item.correlativo !== dependentReference.correlativo)[0];
    if (referenceExist) {
      this.errorMessage('', this.translate.instant('validations.reference-exist'))
      return false;
    }
    return true;
  }

  addReferencia(dependentReference: ReferenciaDependiente): void {
    if (this.modifying) {
      if (this.validReference(dependentReference, this.index)) {
        this.client.referencias.referenciasDependientes[this.index] = dependentReference;
        if (dependentReference.modalidad !== this.mode.I) {
          this.client.referencias.referenciasDependientes[this.index].modalidad = this.mode.U;
        }
        this.clean();
      }
    } else {
      if (this.client.referencias) {
        if (this.validReference(dependentReference)) {
          dependentReference.modalidad = this.mode.I;
          this.client.referencias.referenciasDependientes.push(dependentReference);
          this.clean();
        }
      } else {
        this.client.referencias = new Referencia();
        dependentReference.modalidad = this.mode.I;
        this.client.referencias.referenciasDependientes.push(dependentReference)
        this.clean();
      }
    }
  }

  removeReferencia(dependentReference): void {
    if (dependentReference.modalidad !== this.mode.I) {
      this.client.referencias.referenciasDependientes[this.index].modalidad = this.mode.D;
    } else {
      this.client.referencias.referenciasDependientes.splice(this.index, 1);
    }
    this.clean();
  }

  loadPartial() {
    this.client = new ClienteDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
      } else {
        this.client = new ClienteDto();
      }
    }).catch((e) => this.client = new ClienteDto());
  }

  validateForm(): void {

  }

  next(): void {
    if (!this.editMode)
      this.navigationService.navigateTo(Section.dependentReference, Section.economicProfile, true);
  }

  partialSave(): void {
    if (this.editMode) {
      this.busy = this.changeService.putSection(this.client, this.identification, 'dependientes');
      this.busy.then((client) => {
        this.client = client;
        this.dependentReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasDependientes));
        this.disableControl();
        this.bindHide();
        this.client.autorizaciones = [];
        this.successUpdate('messages.success.references.dependent', 'messages.success.update');
      }).catch((e) => this.handleError(e));
    } else {
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.next();
      });
    }
  }
}
