import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {ReferenciaProveedor} from '../shared/client/referencia-proveedor';
import {ClienteDto} from '../shared/client/cliente-dto';
import {Mode} from '../shared/client/referenceDTO';
import {Referencia} from '../shared/client/referencia';
import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ChangeService} from '../shared/services/change.service';
import {SecurityService} from 'security-angular/src/app';
import {TypeReference} from '../shared/typeReference';
import {CatalogService} from '../shared/services/catalog.service';
declare var $: any;
@Component({
  selector: 'pl-supplier-reference',
  templateUrl: './supplier-reference.component.html',
  styleUrls: ['./supplier-reference.component.css'],
  providers: [CatalogService]
})
export class SupplierReferenceComponent implements OnInit, FormSectionInterface {

  @Input() editMode = false;

  providerReference: ReferenciaProveedor = new ReferenciaProveedor();
  client: ClienteDto;
  providerReferenceCopy: ReferenciaProveedor[];
  authorization: Authorization;
  authorized: Authorized;
  typeReference = TypeReference;
  max: number = 0;
  min: number = 0;
  
  private pattern = /^(0|[1-9][0-9]*)$/;
  private edit = false;
  private modifying = false;
  private index: number;
  private mode = Mode;
  private identification: string;
  private disabledField = true;
  
  busy: Promise<any>;
  formGroup: FormGroup;
  name: AbstractControl;
  address: AbstractControl;
  businessTurn: AbstractControl;
  phone: AbstractControl;
  phone2: AbstractControl;
  nombre = '';
  giroNegocio = '';
  
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
  
  heading: string[] = ['supplier-reference.code', 'supplier-reference.description'];
  headingUpdate: string[] = ['supplier-reference.code', 'supplier-reference.description', 'supplier-reference.mode'];
  values: string[] = ['nombre', 'giroNegocio'];

  constructor(private router: Router,
              private fb: FormBuilder,
              private notificationService: NotificationsService,
              private translate: TranslateService,
              private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private validationService: ValidationsService,
              private changeService: ChangeService,
              private _securityService: SecurityService,
              private catalogService: CatalogService) {
    this.setUpForm();
    if (this.partialPersistService.data) {
      this.client = this.partialPersistService.data;
      this.loadIncomeReference();
    }
  }
  
  setUpForm() {
      this.formGroup = this.fb.group({
          name: [{
            value: null,
            disabled: this.editMode
          }, Validators.compose([Validators.required, Validators.maxLength(40)])],
          address: [{
            value: null,
            disabled: this.editMode
          }, Validators.compose([Validators.required, Validators.maxLength(40)])],
          businessTurn: [{
            value: null,
            disabled: this.editMode
          }, Validators.compose([Validators.required, Validators.maxLength(60)])],
          phone: [{
            value: null,
            disabled: this.editMode
          }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
          phone2: [{
            value: null,
            disabled: this.editMode
          }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])]
        });
        this.name = this.formGroup.controls['name'];
        this.address = this.formGroup.controls['address'];
        this.businessTurn = this.formGroup.controls['businessTurn'];
        this.phone = this.formGroup.controls['phone'];
        this.phone2 = this.formGroup.controls['phone2'];
  }

  ngOnInit() {
    if (this.editMode) {
      this.client = new ClienteDto();
      this.identification = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSection(this.identification, 'referenciasProveedores');
      this.busy.then((client) => {
      this.client = client;
      this.changeControl();
        if (this.client.referencias){
          if (!this.client.referencias.referenciasProveedores)
            this.client.referencias.referenciasProveedores = [];
          this.providerReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasProveedores));
        }
        this.loadIncomeReference();
      });
    } else {
        if (!this.client){
          this.loadPartial();
        }
    }
  }
  
  changeControl() {
    for (let key in this.formGroup.controls) {
        this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
    }
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
  
  loadIncomeReference() {
    this.catalogService.getCatalogParam('referenciasIngreso/'+this.typeReference[0], 'tipoPersona', this.client.tipoPersona)
      .then((response) => {
        this.min = response.minimo;
        this.max = response.maximo;
      });
  }
  
  public  cancel() {
    $('#confirmModal').modal('show');
  }

  eventSubmit() {
    this.router.navigate(['/legal-representative']);
  }

  isValidChange(): boolean {
    if (this.providerReference.nombre && this.client.referencias.referenciasProveedores[this.index].nombre) {
      if (this.providerReference.nombre === this.client.referencias.referenciasProveedores[this.index].nombre &&
        this.providerReference.direccion === this.client.referencias.referenciasProveedores[this.index].direccion &&
        this.providerReference.giroNegocio === this.client.referencias.referenciasProveedores[this.index].giroNegocio &&
        this.providerReference.telefono1 === this.client.referencias.referenciasProveedores[this.index].telefono1 &&
        this.providerReference.telefono2 === this.client.referencias.referenciasProveedores[this.index].telefono2) {
        return true;
      }
    }
    return false;
  }

  isValidCancel(): boolean {
//    if(this.editMode && this.client.referencias.referenciasProveedores.length > 0){
//        return false;
//    }
    if ((this.client.referencias.referenciasProveedores.find(item =>
      item.modalidad === this.mode.D ||
      item.modalidad === this.mode.I ||
      item.modalidad === this.mode.U))) {
      return false;
    }
    return true;
  }

  restoreProvider(provider: ReferenciaProveedor): void {
    let prov = this.client.referencias.referenciasProveedores.filter(item => item.correlativoReferencia === provider.correlativoReferencia)[0];
    if (provider.modalidad === this.mode.I) {
      this.client.referencias.referenciasProveedores.splice(this.client.referencias.referenciasProveedores.indexOf(prov), 1);
    } else {
      let providerRestore = JSON.parse(JSON.stringify(this.providerReferenceCopy.filter(item => item.correlativoReferencia === provider.correlativoReferencia)[0]));
      if (providerRestore) {
        prov = this.client.referencias.referenciasProveedores.filter(item => item.correlativoReferencia === providerRestore.correlativoReferencia)[0];
        this.client.referencias.referenciasProveedores[this.client.referencias.referenciasProveedores.indexOf(prov)] = providerRestore;
      }
    }
  }
  
  cancelProviders() {
    this.disableControl();
    if (this.providerReferenceCopy) {
        this.client.referencias.referenciasProveedores = JSON.parse(JSON.stringify(this.providerReferenceCopy));
    } else {
        this.client.referencias.referenciasProveedores = [];
    }
  }

  clean() {
    this.modifying = false;
    this.edit = false;

//         this.providerReference = new ReferenciaProveedor();
//         this.name.setValue(null);
//         this.address.setValue(null);
//         this.businessTurn.setValue(null);
//         this.phone.setValue(null);
//         this.phone2.setValue(null);
    this.providerReference = new ReferenciaProveedor();
    this.formGroup.controls['name'].setValue(null);
    this.formGroup.controls['address'].setValue(null);
    this.formGroup.controls['businessTurn'].setValue(null);
    this.formGroup.controls['phone'].setValue(null);
    this.formGroup.controls['phone2'].setValue(null);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();

//         this.ngAfterViewInit();
  }

  validReference(providerReference: ReferenciaProveedor, index?: number): boolean {
    const referenceExist = this.client.referencias.referenciasProveedores.filter(item =>
    (item.nombre? item.nombre.trim() === providerReference.nombre.trim() : item.nombre === providerReference.nombre) && 
    (item.giroNegocio? item.giroNegocio.trim() === providerReference.giroNegocio.trim() : item.giroNegocio === providerReference.giroNegocio) &&
    (item.correlativoReferencia? item.correlativoReferencia !== providerReference.correlativoReferencia : item.correlativoReferencia === providerReference.correlativoReferencia))[0];
    if (referenceExist) {
      this.errorMessage('', this.translate.instant('validations.reference-exist'));
      return false;
    }
    return true;
  }

  addReferencia(providerReference: ReferenciaProveedor): void {
    providerReference.telefono2 = providerReference.telefono2 === null || !providerReference.telefono2 ? '' : providerReference.telefono2;
    if (this.modifying) {
      if (this.validReference(providerReference, this.index)) {
        this.client.referencias.referenciasProveedores[this.index] = JSON.parse(JSON.stringify(providerReference));
        if (providerReference.modalidad !== this.mode.I) {
          this.client.referencias.referenciasProveedores[this.index].modalidad = this.mode.U;
        }
        this.clean();
      }
    } else {
      if (this.client.referencias) {
        if (this.validReference(providerReference)) {
          providerReference.modalidad = this.mode.I;
          this.client.referencias.referenciasProveedores.push(JSON.parse(JSON.stringify(providerReference)));
          this.clean();
        }
      } else {
        this.client.referencias = new Referencia();
        providerReference.modalidad = this.mode.I;
        this.client.referencias.referenciasProveedores.push(JSON.parse(JSON.stringify(providerReference)));
        this.clean();
      }
    }
  }

  removeReferencia(providerReference): void {
    if (providerReference.modalidad !== this.mode.I) {
      this.client.referencias.referenciasProveedores[this.index].modalidad = this.mode.D;
    } else {
      this.client.referencias.referenciasProveedores.splice(this.index, 1);
    }
    this.clean();
  }

  errorMessage(title: string, message: string): void {
    this.notificationService.error(title, message);
  }

  modify(provider, index): void {
//    if (this.name.enabled) {
      this.modifying = true;
      this.edit = true;
      this.index = this.client.referencias.referenciasProveedores.indexOf(provider);
      this.formGroup.markAsPristine();
      this.formGroup.markAsUntouched();
      this.providerReference = JSON.parse(JSON.stringify(provider));
//    }
  }
  
  loadPartial() {
    this.client = new ClienteDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if(client) {
        this.client = client;
        this.loadIncomeReference();
      }  else {
        this.client = new ClienteDto();
      }
    }).catch((e) => this.client = new ClienteDto());
  }
  
  validateForm(): void {
    if(this.editMode) {
        this.partialSave();
    } else {
        this.validationService.validationForm(this.client, ClientFormSection[ClientFormSection.DATOS_ADICIONALES]).then(response => {
            this.partialSave();
        }).catch((e) => this.handleError(e));
    }
  }
  
  next() : void {
    if (this.editMode) {
        
    } else {
        this.navigationService.navigateTo(Section.providerReference, Section.legalRepresentative, true);
    }
  }
  
  partialSave() {
    let size = this.client.referencias.referenciasProveedores.filter(item => item.modalidad != Mode.D).length;
    if (this.validateReferences(size)){
        if (this.editMode) {
            this.busy = this.changeService.putSection(this.client, this.identification, 'referenciasProveedores');
            this.busy.then((client) => {
              this.client = client;
              if (this.client.referencias.referenciasProveedores)
                this.providerReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasProveedores));
              this.bindHide();
              this.client.autorizaciones = [];
              this.disableControl();
              this.successUpdate('messages.success.references.provider', 'messages.success.update');
            }, (e: any) => this.handleError(e));
        } else {
            this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
               this.next(); 
            });
        }
    }
  }
  
  validateReferences(sizeReferences) : boolean {
    if (sizeReferences < this.min) { 
      this.messageError('validations.min-references', this.min.toString());
      return false;
    }
    if (sizeReferences > this.max){
      this.messageError('validations.max-references', this.max.toString());
      return false;
    }
    return true;
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
  
  successCreate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), message);
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }
  
  messageError(title: string, message: string): void {
    this.notificationService.error(this.translate.instant(title) + this.translate.instant(message), null, null)
  }
}
