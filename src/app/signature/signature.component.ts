import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

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
import {ClientComponent} from 'backoffice-ace/src/app/core/client-core/client.component';

import {Firma} from '../shared/account/sign';
import {Firmante} from '../shared/account/signatory';
import {AccountDto} from '../shared/account/account-dto';
import {environment} from '../../environments/environment';
import {Validator} from '../shared/custom-validators';
import {TypePerson} from '../shared/account/type-person.enum';
import {ValidationsService} from '../shared/services/validations.service';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import { ClienteResumen } from '../shared/client/cliente-resumen';
import {ClientId} from '../shared/account/client-id';
declare var $: any;
@Component({
  selector: 'pl-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignatureComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Input() cancelAccount = false;

  private clientURL = environment.apiUrl + '/api/'; // URL to web api

  @ViewChild(ClientComponent) buscador: ClientComponent;

  private identification: string;
  private disabledField = false;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  private edit: boolean = false;
  private modifying: boolean = false;
  private mode = Mode;
  private index: number;
  private ident: string = '';
  typePerson = TypePerson;
  formGroup: FormGroup;
  name: AbstractControl;
  address: AbstractControl;
  phone: AbstractControl;
  phone2: AbstractControl;
  relationship: AbstractControl;

  registered: AbstractControl;
  turn: AbstractControl;
  codeClient: AbstractControl;
  nameClient: AbstractControl;
  observations: AbstractControl;
  condition: AbstractControl;

  authorization: Authorization;
  authorized: Authorized;

  account : AccountDto = new AccountDto();
  signatory: Firmante = new Firmante();
  signatureCopy: Firma;
  createSucessful = false;
  deleteSucessful = false;
  updateSucessful = false;
  deleteSignature = false;
  modifySignature = false;
  busy: Promise<any>;

  heading: string[] = ['firmas.cliente', 'firmas.nombre', 'firmas.observaciones'];
  headingUpdate: string[] = ['firmas.cliente', 'firmas.nombre', 'firmas.observaciones', 'firmas.mode'];
  values: string[] = ['cliente.numeroIdentificacion', 'cliente.nombre', 'observacion'];

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
              private validationService: ValidationsService,
              private router: Router) {
    this.setUpForm();
    if (this.partialPersistService.data)
      this.account = this.partialPersistService.data;
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      registered: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required, Validators.maxLength(2)])],
      turn: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(2), Validator.max(0)])],
      codeClient: [{
        value: null,
        disabled: true
      }, Validators.compose([Validators.required, Validators.maxLength(35)])],
      nameClient: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required, Validators.maxLength(70)])],
      observations: [{
        value: '',
        disabled: this.editMode
      }, Validators.maxLength(60)],
      condition: [{
        value: '',
        disabled: this.editMode
      }, Validators.compose([Validators.required, Validators.maxLength(300)])]
    });

    this.registered = this.formGroup.controls['registered'];
    this.turn = this.formGroup.controls['turn'];
    this.codeClient = this.formGroup.controls['codeClient'];
    this.nameClient = this.formGroup.controls['nameClient'];
    this.observations = this.formGroup.controls['observations'];
    this.condition = this.formGroup.controls['condition'];
  }

  ngOnInit() {
    this.buscador.setEndPoint(this.clientURL);
    this.buscador.update(this.clientURL, 'A');
    if (this.editMode) {
      this.account = new AccountDto();
      this.identification = this._securityService.getCookie('accountNumber');
      this.busy = this.changeService.getSectionAccount(this.identification, 'firmas')
      this.busy.then((account) => {
        this.account = account;
        if (this.account.firma.firmantes)
          this.signatureCopy = JSON.parse(JSON.stringify(this.account.firma));
        this.changeTurn();
        this.changeClient();
      }).catch((e) => this.handleError(e));
    } else {
      if (!this.account) {
        this.loadPartial();
      } else {
        this.addClientTable();
        this.changeClient();
      }
    }
  }
  
  changeClient() {
    let clientSummary = this._securityService.getCookie('client_signature');
    if (clientSummary) {
      this.signatory.cliente = JSON.parse(clientSummary);
      this.ident = this.signatory.cliente.id.identificacion.trim();
      this._securityService.deleteCookie('client_signature');
      this._securityService.deleteCookie('account_signature');
      if (!this.editMode) {
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      }
    } else {
      if (this.editMode) {
        this.turn.disable();
        this.observations.disable();
        this.condition.disable(); 
      }
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.FIRMAS];
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
  
  changeControl(){
    this.turn.disabled? this.turn.enable() : this.turn.disable();
    this.observations.disabled? this.observations.enable() : this.observations.disable();
    this.condition.disabled? this.condition.enable() : this.condition.disable();
  }
  
  restoreData() {
    this.changeControl();
    this.account.firma = JSON.parse(JSON.stringify(this.signatureCopy));
    this.changeTurn();
    this.clean();
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
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    } else if (error.status === 403) {
      this.notificationService.error(JSON.parse(error._body).message, '');
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
    this.notificationService.error(title, this.translate.instant(message));
  }

  modify(signatory : Firmante): void {
    if (!this.observations.disabled) {
      this.modifySignature = true;
      const signature = this.account.firma.firmantes.find((item) => item.cliente.id.identificacion && signatory.cliente.id.identificacion? (item.cliente.id.identificacion.trim() === signatory.cliente.id.identificacion.trim()) : false);
      if (signature) {
        this.index = this.account.firma.firmantes.indexOf(signature);
        this.validSignature(signature.editable);
        this.signatory = JSON.parse(JSON.stringify(signatory));
        this.ident = this.signatory.cliente.id.identificacion.trim();
      }
    }
  }

  validSignature(deleted: boolean) {
    this.deleteSignature = deleted;
  }

  clean() {
    this.signatory = new Firmante();
    this.modifySignature = false;
    this.deleteSignature = false;
    this.index = null;
    this.ident = null;
  }

  removeSignature(signatory: Firmante): void {
    if (signatory.modalidad !== Mode.I) {
      this.account.firma.firmantes[this.index].modalidad = Mode.D
    } else {
      this.account.firma.firmantes.splice(this.index, 1);
    }
    this.changeTurn();
    this.clean();
  }
  
  restoreSignature(signatory: Firmante): void {
    let sign = this.account.firma.firmantes.filter(item => item.correlativoFirma === signatory.correlativoFirma)[0];
    if (signatory.modalidad === Mode.I) {
      this.account.firma.firmantes.splice(this.account.firma.firmantes.indexOf(sign), 1);
    } else {
      let signB = JSON.parse(JSON.stringify(this.signatureCopy.firmantes.filter(item => item.correlativoFirma === signatory.correlativoFirma)[0]));
      if (signB) {
        sign = this.account.firma.firmantes.filter(item => item.correlativoFirma === signB.correlativoFirma)[0];
        this.account.firma.firmantes[this.account.firma.firmantes.indexOf(sign)] = signB;
      }
    }
    this.changeTurn();
  }

  loadPartial() {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
      if (account) {
        this.account = account;
        this.addClientTable();
      }
    }).catch((e) => this.account = new AccountDto());
  }

  validateForm(): void {

  }

  next(): void {
    if (!this.editMode)
      if (Section.signature === this.partialPersistService.extraData['accountSection'][0]) {
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      }
      this.navigationService.navigateTo(Section.signature, this.partialPersistService.extraData['accountSection'][0], true);
  }

  partialSave(): void {
    if (this.editMode) {
      this.busy = this.changeService.putSectionAccount(this.account, this.identification, 'firmas')
      this.busy.then((account) => {
        this.account = account;
        this.signatureCopy = JSON.parse(JSON.stringify(this.account.firma));
        this.bindHide();
        this.account.autorizaciones = [];
        this.changeControl();
        this.successUpdate('messages.success.signature', 'messages.success.update');
      }).catch(e => this.handleError(e));
    } else {
      this.navigationService.currentSections.find(item => item.section === Section.signature).status = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then((response) => {
        this.next();
      });
    }
  }

  clientSelection(event: ClienteResumen) {
    this.reset();
    if (event.tipoPersona.toString() === TypePerson[TypePerson.N]) {
      this.signatory.cliente = event;
      this.ident = this.signatory.cliente.id.identificacion.trim();
    } else {
      this.errorMessage('', 'messages.firmante-natural');
    }
    this.buscador.clients = [];
    this.buscador.primerNombre = '';
    this.buscador.segundoNombre = '';
    this.buscador.primerApellido = '';
    this.buscador.segundoApellido = '';
    this.buscador.codigoCliente = null;
    this.buscador.nitCliente = '';
    this.buscador.identificacion = '';
  }

  addSignature(signatory: Firmante, headline?: boolean) {
    if (signatory.cliente.id) {
      if ((this.modifySignature ? (!this.account.firma.firmantes.find((item) => item.cliente.id.identificacion.trim() === signatory.cliente.id.identificacion.trim() && 
          item.observacion === signatory.observacion)) : (!this.account.firma.firmantes.find((item) => item.cliente.id.identificacion.trim() === signatory.cliente.id.identificacion.trim())))) {
        if (headline) {
          signatory.editable = false;
          signatory.modalidad = Mode.I;
          this.account.firma.firmantes.push(JSON.parse(JSON.stringify(signatory)));
          this.changeTurn();
        } else {
          this.validationService.validationView('cuentas/firmantes/validate', signatory)
            .then((response) => {
              if (this.modifySignature) {
                if (signatory.modalidad !== Mode.I)
                  signatory.modalidad = Mode.U;
                this.account.firma.firmantes[this.index] = JSON.parse(JSON.stringify(signatory));
              } else {
                signatory.editable = true;
                signatory.modalidad = Mode.I;
                this.account.firma.firmantes.push(JSON.parse(JSON.stringify(signatory)));
              }
              this.changeTurn();
              this.clean();
            }).catch(e => this.handleError(e));
        }
      } else {
        this.errorMessage('', 'messages.cliente-existe');
        this.clean();
      }
    }
  }
  
  isValidChange(): boolean {
    if (this.signatory.cliente.numeroIdentificacion === this.account.firma.firmantes[this.index].cliente.numeroIdentificacion &&
        this.signatory.cliente.id.identificacion === this.account.firma.firmantes[this.index].cliente.id.identificacion && 
        this.signatory.observacion === this.account.firma.firmantes[this.index].observacion) {
      return true;
    }
    return false;
  }

  changeTurn() {
    if (this.editMode) {
      this.account.firma.firmasRegistradas = this.account.firma.firmantes.filter(item => item.modalidad !== Mode.D).length;
      if (this.account.firma.firmasParaGirar > this.account.firma.firmasRegistradas)
        this.account.firma.firmasParaGirar = this.account.firma.firmasRegistradas;
    } else {
      this.account.firma.firmasRegistradas = this.account.firma.firmantes.length;
    }
    if (this.account.firma.firmasParaGirar === null && this.account.firma.firmasRegistradas > 0)
      this.account.firma.firmasParaGirar = 1;
    this.turn.setValidators([Validators.required, Validators.maxLength(2), Validator.max(this.account.firma.firmasRegistradas)]);
    this.turn.updateValueAndValidity();
  }

  reset() {
    if (($('#findClient').data('bs.modal') || {}).isShown) {
      $('#findClient').modal('hide');
    } else {
      $(this).find('.modal-body').css({
        width:'auto',
        height:'auto',
        'max-height':'100%'
      });
    }
  }

  openClientModal() {
    if (($('#findClient').data('bs.modal') || {}).isShown) {
      $('#findClient').modal('hide');
    } else {
      $('#findClient').modal('show');
//      $('#findClient').find('.modal-body').css({
//        width:'auto',
//        height:'auto',
//        'max-height':'100%'
//      });
    }
  }
  
  createClient() {
    this._securityService.deleteCookie('account_mancomunado');
    let accountSignature = {view: 'F', editMode: false};
    if (this.editMode)
      accountSignature.editMode = true;
    this._securityService.setCookie('account_signature', JSON.stringify(accountSignature), <any>'Session');
    let link = ['/portalCreateClient', 'F'];
    this.router.navigate(link);
  }

  addClientTable() {
    if (this.account.firma.firmantes.length === 0) {
      if(this.account.cliente.tipoPersona.toString() === this.typePerson[0].toString()) {
          this.addSignature({cliente: this.account.cliente, editable: false, correlativoFirma: null, observacion: '', modalidad: Mode.I}, true);
      }
      if (this.account.datoGeneral.cuentaMancomunada) {
        this.account.personasAsociadas.map((mancomunado) => {
          this.addSignature({cliente: mancomunado.cliente, editable: false, correlativoFirma: null, observacion: '', modalidad: Mode.I}, true);
        });
      }
      if (this.account.cliente.tipoPersona.toString() === this.typePerson[1].toString()) {
        if (this.account.clientInformation.datoRepresentanteLegal === null) {
          this.errorMessage('', 'messages.juridico-representante');
        } else {
          if (!this.account.clientInformation.datoRepresentanteLegal['identificacion']) { 
            this.errorMessage('', 'messages.juridico-representante');
          } else {
            if (this.account.clientInformation.datoRepresentanteLegal.nombre != 'N/A') {
              this.addSignature({cliente: {clase: null, descripcionEstado: null, descripcionTipoDeIdentificacion: null, estado: null, fechaNacimiento: null, 
                identificacionTributaria: null, relacion: null, tipoPersona: null, id: {identificacion: this.account.clientInformation.datoRepresentanteLegal['identificacion']}, 
                nombre: this.account.clientInformation.datoRepresentanteLegal.nombre,
                numeroIdentificacion: this.account.clientInformation.datoRepresentanteLegal.numeroIdentificacion,
                tipoDeIdentificacion: this.account.clientInformation.datoRepresentanteLegal.tipoDeIdentificacion}, editable: false, correlativoFirma: null, observacion: '', modalidad: Mode.I}, true);
            } else {
              this.errorMessage('', 'messages.juridico-representante');
            }
          }
        }
      }
    } else {
      this.changeTurn();
    }
  }
}
