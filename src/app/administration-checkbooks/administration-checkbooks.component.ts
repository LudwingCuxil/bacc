import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {SecurityService} from 'security-angular/src/app';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {Mode} from '../shared/client/referenceDTO';
import {NavigationService} from '../shared/services/navigation.service';
import {ChangeService} from '../shared/services/change.service';

import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {AccountDto} from '../shared/account/account-dto';
import {Validator} from '../shared/custom-validators';
import {TypePerson} from '../shared/account/type-person.enum';
import {TypeDocumentSelectComponent} from '../type-document/type-document-select.component';
import {PersonaChequera} from '../shared/account/checkbook-person';
import {isObject} from 'util';
import { Agency } from '../agencies-select/shared/agencies-select.model';
import { TipoChequera } from '../shared/account/checkbook-type';
import { DocumentoIdentificacion } from '../shared/client/documento-identificacion';
import {ValidationsService} from '../shared/services/validations.service';
import {DatoChequera} from '../shared/account/checkbook-data';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
declare var $: any;
@Component({
  selector: 'pl-administration-checkbooks',
  templateUrl: './administration-checkbooks.component.html',
  styleUrls: ['./administration-checkbooks.component.css']
})
export class AdministrationCheckbooksComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Input() cancelAccount = false;
  @ViewChild(TypeDocumentSelectComponent) typeDoc: TypeDocumentSelectComponent;

  private identification: string;
  private mode = Mode;
  typePerson = TypePerson;
  formGroup: FormGroup;
  disableCheckPerson: boolean = true;
  deleteCheckPerson: boolean = false;

  personalized: AbstractControl;
  count: AbstractControl;
  name: AbstractControl;
  address: AbstractControl;
  phone: AbstractControl;
  checkbookType: AbstractControl;
  agencies: AbstractControl;
  identificationType: AbstractControl;
  identificacion: AbstractControl;
  personName: AbstractControl;
  checkbookPerson: PersonaChequera = new PersonaChequera();
  documentSelected;
  authorization: Authorization;
  authorized: Authorized;
  account : AccountDto = new AccountDto();
  checkbookCopy: DatoChequera;
  index: number = 0;
  busy: Promise<any>;
  heading: string[] = ['admincheqcta.tipodoc', 'admincheqcta.noDocumento', 'admincheqcta.nombre'];
  headingUpdate: string[] = ['admincheqcta.tipodoc', 'admincheqcta.noDocumento', 'admincheqcta.nombre', 'admincheqcta.mode'];
  values: string[] = ['tipoDocumento.descripcion', 'numeroDocumento', 'nombre'];

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
              private navigationService: NavigationService,
              private _securityService: SecurityService,
              private changeService: ChangeService,
              private partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef,
              private validationService: ValidationsService) {
    this.setUpForm();
    if (this.partialPersistService.data) {
      this.account = this.partialPersistService.data;
      this.setInitData();
    }
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      personalized: [{
        value: '',
        disabled: this.editMode
      }],
      name: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(60)])],
      address : [{
        value: '',
        disabled: true
      }, Validators.maxLength(70)],
      phone: [{
        value: '',
        disabled: true
      }, Validators.maxLength(12)],
      checkbookType: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      count: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(4), Validator.min(1)])],
      agencies: [{
        value: '',
        disabled: this.editMode
      }, Validators.required],
      checkPerson: this.formBuilder.group({
        identificationType: [{
          value: '',
          disabled: this.editMode
        }, Validators.required],
        identificacion: [{
          value: '',
          disabled: this.editMode
        }, Validators.required],
        personName: [{
          value: '',
          disabled: this.editMode
        }, Validators.compose([Validators.required, Validators.maxLength(50)])]
      })
    });

    this.personalized = this.formGroup.controls['personalized'];
    this.name = this.formGroup.controls['name'];
    this.address = this.formGroup.controls['address'];
    this.phone = this.formGroup.controls['phone'];
    this.checkbookType = this.formGroup.controls['checkbookType'];
    this.count = this.formGroup.controls['count'];
    this.agencies = this.formGroup.controls['agencies'];
    this.identificationType = this.formGroup.controls['checkPerson']['controls']['identificationType'];
    this.identificacion = this.formGroup.controls['checkPerson']['controls']['identificacion'];
    this.personName = this.formGroup.controls['checkPerson']['controls']['personName'];
  }

  selectCheckbookType(event) {
    this.account.datoChequera.tipoChequera = event;
    this.count.setValidators([Validators.required, Validators.maxLength(4), Validator.max(this.account.datoChequera.tipoChequera.cantidadCheques)]);
    this.count.updateValueAndValidity();
  }

  ngOnInit() {
    if (this.editMode) {
      this.account = new AccountDto();
      this.identification = this._securityService.getCookie('accountNumber');
      this.busy = this.changeService.getSectionAccount(this.identification, 'chequera');
      this.busy.then((account) => {
        this.account = account;
        if (!this.account.datoChequera.personasAutorizadas)
          this.account.datoChequera.personasAutorizadas = [];
        this.checkbookCopy = JSON.parse(JSON.stringify(this.account.datoChequera));
        this.disableControl();
      });
    } else {
      if (this.typeDoc)
        this.typeDoc.updateTypeDocument('', 'N');
      if (!this.account) {
        this.loadPartial();
      } else {
        this.addClientCheckbookPerson();
      }
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

  changeControl() {
    for (let key in this.formGroup.controls) {
      if (key != 'personalized' && key != 'checkbookType' && key != 'count' && key != 'agencies' && 
          key != 'identificationType' && key != 'identificacion' && key != 'personName' && key != 'address' && key != 'phone')
        this.formGroup.controls[key].disabled ? this.formGroup.controls[key].enable() : this.formGroup.controls[key].disable();
    }
    this.disableField(true);
  }
  
  restoreCheckbook (checkbookPerson: PersonaChequera) {
    let check = this.account.datoChequera.personasAutorizadas.filter(item => item.numeroDocumento.trim() === checkbookPerson.numeroDocumento.trim())[0];
    if (checkbookPerson.modalidad === Mode.I) {
      this.account.datoChequera.personasAutorizadas.splice(this.account.datoChequera.personasAutorizadas.indexOf(check), 1);
    } else {
      let checkCopy = this.checkbookCopy.personasAutorizadas.filter(item => item.numeroDocumento.trim() === checkbookPerson.numeroDocumento.trim())[0];
      this.account.datoChequera.personasAutorizadas[this.account.datoChequera.personasAutorizadas.indexOf(check)] = 
        JSON.parse(JSON.stringify(this.checkbookCopy.personasAutorizadas[this.checkbookCopy.personasAutorizadas.indexOf(checkCopy)]));
    }
  }
  
  restoreData() {
    this.disableControl();
    this.account.datoChequera = JSON.parse(JSON.stringify(this.checkbookCopy));
    this.clean();
  }

  selectTypedoc(document): void {
    if (document && isObject(document)) {
      this.checkbookPerson.tipoDocumento = document;
    }
  }

  addCheckbook(checkbookPerson : PersonaChequera) {
    if (this.disableCheckPerson) {
      this.disableField(false);
    } else {
      if (this.account.datoChequera.personasAutorizadas.find((item) => item.numeroDocumento.trim() === checkbookPerson.numeroDocumento &&
          item.tipoDocumento.descripcion.trim() === checkbookPerson.tipoDocumento.descripcion && item.nombre.trim() === checkbookPerson.nombre)) {
        this.errorMessage('', 'messages.cliente-existe');
      } else {
        this.validationService.validationView('cuentas/personasAutorizadas/validate', checkbookPerson)
        .then((response) => {
          if (this.deleteCheckPerson) {
            if (checkbookPerson.modalidad !== Mode.I)
              checkbookPerson.modalidad = Mode.U;
            this.account.datoChequera.personasAutorizadas[this.index] = JSON.parse(JSON.stringify(checkbookPerson));
          } else {
            checkbookPerson.editable = true;
            checkbookPerson.modalidad = Mode.I;
            this.account.datoChequera.personasAutorizadas.push(JSON.parse(JSON.stringify(checkbookPerson)));
          }
          this.clean();
        }, this.handleError);
      }
    }
  }

  selectAgency (event) {
    this.account.datoChequera.agenciaEntrega = event;
  }

  addClientCheckbookPerson() {
    if (this.account.datoChequera.personasAutorizadas.length === 0) {
      this.typeDoc.typeDocumentService.getDocumentItentification('N')
      .then((documents) => {
        if (this.account.cliente.tipoPersona.toString() === this.typePerson[0].toString()){
          this.checkbookPerson.nombre = this.account.cliente.nombre;
          this.checkbookPerson.tipoDocumento = this.getDocuments(documents, this.account.cliente.tipoDeIdentificacion);
          this.checkbookPerson.numeroDocumento = this.account.cliente.numeroIdentificacion;
          this.checkbookPerson.editable = false;
          this.checkbookPerson.modalidad = Mode.I;
          this.account.datoChequera.personasAutorizadas.push(JSON.parse(JSON.stringify(this.checkbookPerson)));
          this.checkbookPerson = new PersonaChequera();
        }
        if (this.account.datoGeneral.cuentaMancomunada) {
          if (this.account.personasAsociadas.length > 0) {
            this.account.personasAsociadas.map((item) => {
              this.account.datoChequera.personasAutorizadas.push({nombre: item.cliente.nombre,
                                                                  tipoDocumento: this.getDocuments(documents, item.cliente.tipoDeIdentificacion),
                                                                  numeroDocumento: item.cliente.numeroIdentificacion,
                                                                  editable: false,
                                                                  modalidad: Mode.I, valorNumeroDocumento: '', valorTipoDocumento: ''});
            });
          }
        }
        if (this.account.cliente.tipoPersona.toString() === this.typePerson[1].toString()) {
          if (this.account.clientInformation.datoRepresentanteLegal == null) {
            this.errorMessage('', 'messages.juridico-representante');
          } else {
            if (!this.account.clientInformation.datoRepresentanteLegal.numeroIdentificacion && !this.account.clientInformation.datoRepresentanteLegal.nombre && 
                !this.account.clientInformation.datoRepresentanteLegal.tipoDeIdentificacion) {
              this.errorMessage('', 'messages.juridico-representante');
            } else {
              this.account.datoChequera.personasAutorizadas.push({nombre: this.account.clientInformation.datoRepresentanteLegal.nombre,
                                                                tipoDocumento: this.getDocuments(documents, this.account.clientInformation.datoRepresentanteLegal.tipoDeIdentificacion),
                                                                numeroDocumento: this.account.clientInformation.datoRepresentanteLegal.numeroIdentificacion,
                                                                editable: false,
                                                                modalidad: Mode.I, valorNumeroDocumento: '', valorTipoDocumento: ''});
            }
          }
        }
      });
    }
    this.disableField(true);
  }

  getDocuments(documents: DocumentoIdentificacion[], identificationType: string) : DocumentoIdentificacion {
    let documentsFilter = documents.filter((item) => item.codigo === identificationType)[0];
    if (!documentsFilter)
      return new DocumentoIdentificacion();
    return documentsFilter;
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.DATO_CHEQUERA];
      if (this.account.autorizaciones === null) {
        this.account.autorizaciones = [];
      }
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
    } else {
      this.account.autorizaciones = [];
      this.bindHide();
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  public  cancel() {
    $('#confirmModal').modal('show');
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
    this.notificationService.error('', this.translate.instant(message));
  }

  modify(checkbookPerson : PersonaChequera): void {
    if (this.name.enabled) {
      if (!checkbookPerson.editable) {
        this.errorMessage('', 'messages.registro-edited');
      } else {
        const checkbookFind = this.account.datoChequera.personasAutorizadas.find((item) => item.numeroDocumento === checkbookPerson.numeroDocumento);
        this.index = this.account.datoChequera.personasAutorizadas.indexOf(checkbookFind);
        if (this.editMode) {
          this.checkbookPerson = JSON.parse(JSON.stringify(checkbookPerson));
          this.documentSelected = this.checkbookPerson.tipoDocumento.codigo;
          this.deleteCheckPerson = true;
          this.disableField(false);
        } else {
          if (!checkbookPerson.editable) {
            if (checkbookPerson.numeroDocumento === this.account.cliente.numeroIdentificacion) {
              this.errorMessage('', 'messages.titular-modifica');
            } else {
              if (this.account.clientInformation.datoRepresentanteLegal != null) {
                if (checkbookPerson.numeroDocumento === this.account.clientInformation.datoRepresentanteLegal.numeroIdentificacion) {
                  this.errorMessage('', 'messages.representante-modifica');
                }
                if (this.account.cliente.tipoPersona.toString() === this.typePerson[1].toString()) {
                  if (this.account.personasAsociadas.length >= this.index + 1) {
                    if (this.account.personasAsociadas[this.index].cliente.numeroIdentificacion === checkbookPerson.numeroDocumento) {
                      this.errorMessage('', 'messages.mancomunado-modifica');
                    }
                  }
                } else {
                  if (this.account.personasAsociadas.length >= this.index) {
                    if (this.account.personasAsociadas[this.index -1].cliente.numeroIdentificacion === checkbookPerson.numeroDocumento) {
                      this.errorMessage('', 'messages.mancomunado-modifica');
                    }
                  }
                }
              }
            }
          } else {
            this.checkbookPerson = JSON.parse(JSON.stringify(checkbookPerson));
            this.documentSelected = this.checkbookPerson.tipoDocumento.codigo;
            this.deleteCheckPerson = true;
            this.disableField(false);
          }
        }
      }
    }
  }

  removeCheckbook(checkbookPerson: PersonaChequera) {
    if (checkbookPerson.modalidad !== Mode.I) {
      this.account.datoChequera.personasAutorizadas[this.index].modalidad = Mode.D
    } else {
      this.account.datoChequera.personasAutorizadas.splice(this.index, 1); 
    }
    this.clean();
  }

  clean() {
    this.documentSelected = '';
    this.checkbookPerson = new PersonaChequera();
    this.identificationType.setValue(new DocumentoIdentificacion());
    this.disableField(true);
    this.deleteCheckPerson = false;
    this.index = 0;
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  disableField(value: boolean) {
    if (value) {
      this.identificationType.disable();
      this.identificacion.disable();
      this.personName.disable();
      this.disableCheckPerson = true;
    } else {
      this.identificationType.enable();
      this.identificacion.enable();
      this.personName.enable();
      this.disableCheckPerson = false;
    }
  }

  loadPartial() {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
      if (account) {
        this.account = account;
        this.setInitData();
        this.addClientCheckbookPerson();
      }
    }).catch((e) => this.account = new AccountDto());
  }

  setInitData() {
    if (this.account.datoGeneral.direccion.tipoDireccion.length > 0) {
      this.account.datoChequera.direccion = this.account.datoGeneral.direccion.tipoDireccion.trim() + ' ' + this.account.datoGeneral.direccion.direccion1;
    } else {
      this.account.datoChequera.direccion = this.account.datoGeneral.direccion.direccion1;
    }
    this.account.datoChequera.telefono = this.account.datoGeneral.direccion.telefono1;
    this.account.datoChequera.nombre = this.account.cliente.nombre;
  }

  changeCheckbook () {
    if (this.account.datoChequera.chequeraPersonalizada) {
      this.account.datoChequera.agenciaEntrega = new Agency();
      this.account.datoChequera.cantidad = 1;
      this.account.datoChequera.direccion = '';
      this.account.datoChequera.nombre = '';
      this.account.datoChequera.telefono = '';
      this.account.datoChequera.tipoChequera = new TipoChequera();
    } else {
      this.setInitData();
    }
  }

  validateForm(): void {

  }

  next(): void {
    if (!this.editMode){
      if (Section.administrationCheckbooks === this.partialPersistService.extraData['accountSection'][0])
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      this.navigationService.navigateTo(Section.administrationCheckbooks, this.partialPersistService.extraData['accountSection'][0], true);
    }
  }

  partialSave(): void {
    if (!this.editMode) {
      this.navigationService.currentSections.find(item => item.section === Section.administrationCheckbooks).status = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then((response) => {
        this.next();
      });
    } else {
      this.busy = this.changeService.putSectionAccount(this.account, this.identification, 'chequera');
      this.busy.then((account) => {
        this.account = account;
        this.checkbookCopy = JSON.parse(JSON.stringify(this.account.datoChequera));
        this.bindHide();
        this.account.autorizaciones = [];
        this.changeControl();
        this.successUpdate('messages.success.checkbook', 'messages.success.update');
      }).catch(e => this.handleError(e));
    }
  }

}
