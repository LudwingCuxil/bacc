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
import {AccountDto} from '../shared/account/account-dto';
import {environment} from '../../environments/environment';
import {TypePerson} from '../shared/account/type-person.enum';
import {ValidationsService} from '../shared/services/validations.service';

import {PersonaMancomunada} from '../shared/account/person-joint';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import { ClienteResumen } from '../shared/client/cliente-resumen';
declare var $: any;
@Component({
  selector: 'pl-joint-account',
  templateUrl: './joint-account.component.html',
  styleUrls: ['./joint-account.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class JointAccountComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Input() cancelAccount = false;

  private clientURL = environment.apiUrl + '/api/'; // URL to web api

  @ViewChild(ClientComponent) buscador: ClientComponent;

  private identification: string;
  private mode = Mode;
  private index: number;
  private ident: string = '';
  jointAccountCopy: PersonaMancomunada[];
  typePerson = TypePerson;
  formGroup: FormGroup;
  codeClient: AbstractControl;
  nameClient: AbstractControl;
  relation: AbstractControl;
  authorization: Authorization;
  authorized: Authorized;

  account : AccountDto = new AccountDto();

  createSucessful = false;
  deleteSucessful = false;
  updateSucessful = false;
  modifyJoint = false;
  busy: Promise<any>;

  heading: string[] = ['cuenta_mancomunada.relacion', 'cuenta_mancomunada.cliente', 'cuenta_mancomunada.nombre'];
  headingUpdate: string[] = ['cuenta_mancomunada.relacion', 'cuenta_mancomunada.cliente', 'cuenta_mancomunada.nombre', 'cuenta_mancomunada.mode'];
  values: string[] = ['cliente.id.identificacion', 'cliente.nombre'];

  jointAccount : PersonaMancomunada = new PersonaMancomunada();

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
              private router: Router,
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
    }
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      codeClient: [{
        value: null,
        disabled: true
      }, Validators.compose([Validators.required, Validators.maxLength(35)])],
      nameClient: [{
        value: '',
        disabled: true
      }, Validators.compose([Validators.required, Validators.maxLength(70)])],
      relation: [{
        value: false,
        disabled: false
      }]
    });
    this.codeClient = this.formGroup.controls['codeClient'];
    this.nameClient = this.formGroup.controls['nameClient'];
    this.relation = this.formGroup.controls['relation'];
  }

  ngOnInit() {
    this.buscador.setEndPoint(this.clientURL);
    this.buscador.update(this.clientURL, 'A');
    if (this.editMode) {
      this.account = new AccountDto();
      this.identification = this._securityService.getCookie('accountNumber');
      this.busy = this.changeService.getSectionAccount(this.identification, 'personasAsociadas');
      this.busy.then((account) => {
        this.account = account;
        if (!this.account.personasAsociadas)
          this.account.personasAsociadas = [];
        this.jointAccountCopy = JSON.parse(JSON.stringify(this.account.personasAsociadas));
        this.changeClient();
      });
    } else {
      if (!this.account) {
        this.loadPartial();
      } else {
        this.changeClient();
      }
    }
  }
  
  changeClient() {
    let clientSummary = this._securityService.getCookie('client_mancomunado');
    if (clientSummary) {
      this.jointAccount.cliente = JSON.parse(clientSummary);
      this.ident = this.jointAccount.cliente.id.identificacion.trim();
      if (!this.editMode) {
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      } else {
        let accountSummary = this._securityService.getCookie('account_mancomunado');
        if (accountSummary) {
          let accountJount = JSON.parse(accountSummary);
          if (accountJount.joints)
            this.account.personasAsociadas = accountJount.joints;
        }
      }
      this._securityService.deleteCookie('client_mancomunado');
      this._securityService.deleteCookie('account_mancomunado');
    } else {
      if (this.editMode)
        this.relation.disable();
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.PERSONAS_ASOCIADAS];
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
    };
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
    } else if (error.status === 403) {
      this.notificationService.error('234', '23424');
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
    this.notificationService.error(title, this.translate.instant(message));
  }

  modify(jointAccount: PersonaMancomunada): void {
    if (!this.relation.disabled) {
      this.modifyJoint = true;
      const joinAccount  = this.account.personasAsociadas.find((item) => item.cliente.id.identificacion.trim() === jointAccount.cliente.id.identificacion.trim());
      this.index = this.account.personasAsociadas.indexOf(joinAccount);
      this.jointAccount = JSON.parse(JSON.stringify(joinAccount));
      this.ident = this.jointAccount.cliente.id.identificacion.trim();
    }
  }
  
  restoreJoint(jointAccount: PersonaMancomunada): void {
    let joint = this.account.personasAsociadas.filter(item => item.cliente.id.identificacion.trim() === jointAccount.cliente.id.identificacion.trim())[0];
    if (jointAccount.modalidad === Mode.I) {
      this.account.personasAsociadas.splice(this.account.personasAsociadas.indexOf(joint), 1);
    } else {
      this.account.personasAsociadas[this.account.personasAsociadas.indexOf(joint)] = JSON.parse(JSON.stringify(this.jointAccountCopy[this.account.personasAsociadas.indexOf(joint)]));
    }
  }
  
  restoreData() {
    this.changeControl();
    this.account.personasAsociadas = JSON.parse(JSON.stringify(this.jointAccountCopy));
    this.clean();
  }

  clean() {
    this.jointAccount = new PersonaMancomunada();
    this.modifyJoint = false;
    this.index = null;
    this.ident = null;
  }

  addJoint(jointAccount: PersonaMancomunada) {
    if (this.account.cliente.id.identificacion.trim() !== jointAccount.cliente.id.identificacion.trim()) {
      if (!this.account.personasAsociadas.find((item) => item.cliente.id.identificacion.trim() === jointAccount.cliente.id.identificacion.trim())) {
        this.validationService.validationView('cuentas/personasMancomunadas/validate', jointAccount)
          .then((response) => {
            if (this.modifyJoint) {
              if(jointAccount.modalidad !== Mode.I)
                jointAccount.modalidad = Mode.U;
              this.account.personasAsociadas[this.index] = JSON.parse(JSON.stringify(jointAccount));
            } else {
              jointAccount.modalidad = Mode.I;
              this.account.personasAsociadas.push(JSON.parse(JSON.stringify(jointAccount)));
            }
            this.clean();
        }).catch(e => this.notificationService.error(JSON.parse(e._body).message, ''));
      } else {
        this.errorMessage('', 'messages.cliente-existe');
        this.clean();
      }
    } else {
      this.errorMessage('', 'messages.titular-cuenta-cliente');
      this.clean();
    }
  }

  changeRelation(jointAccount: PersonaMancomunada) {
    const joint = this.account.personasAsociadas.find((item) => item.cliente.id.identificacion.trim() === jointAccount.cliente.id.identificacion.trim());
    const index = this.account.personasAsociadas.indexOf(joint);
    this.account.personasAsociadas[index].relacionIncluyente = this.account.personasAsociadas[index].relacionIncluyente? false : true;
    if (this.jointAccountCopy) {
      this.jointAccountCopy.map((item) => {
        if (item.cliente.id.identificacion === this.account.personasAsociadas[index].cliente.id.identificacion && item.relacionIncluyente === this.account.personasAsociadas[index].relacionIncluyente)
          this.account.personasAsociadas[index].modalidad = null;
        if (item.cliente.id.identificacion === this.account.personasAsociadas[index].cliente.id.identificacion && item.relacionIncluyente !== this.account.personasAsociadas[index].relacionIncluyente)
          this.account.personasAsociadas[index].modalidad = Mode.U;
      }); 
    }
  }

  removeJoint(jointAccount: PersonaMancomunada) {
    if (jointAccount.modalidad !== Mode.I) {
      this.account.personasAsociadas[this.index].modalidad = Mode.D;
    } else {
      this.account.personasAsociadas.splice(this.index, 1); 
    }
    this.clean();
  }

  loadPartial() {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
      if (account) {
        this.account = account;
      }
    }).catch((e) => this.account = new AccountDto());
  }

  validateForm(): void {

  }

  next(): void {
    if (!this.editMode){
      if (Section.jointAccount === this.partialPersistService.extraData['accountSection'][0])
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      this.navigationService.navigateTo(Section.jointAccount, this.partialPersistService.extraData['accountSection'][0], true);
    }
  }

  partialSave(): void {
    if (!this.editMode) {
      this.navigationService.currentSections.find(item => item.section === Section.jointAccount).status = true;
      this.busy = this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData);
      this.busy.then((response) => {
        this.next();
      }).catch(e => this.handleError(e));
    } else {
      this.busy = this.changeService.putSectionAccount(this.account, this.identification, 'personasAsociadas')
      this.busy.then((account) => {
        this.account = account;
        this.bindHide();
        this.account.autorizaciones = [];
        this.changeControl(); 
        this.successUpdate('messages.success.joint', 'messages.success.update');
      }).catch(e => this.handleError(e));
    }
  }

  clientSelection(event: ClienteResumen) {
    this.reset();
    if (event.tipoPersona.toString() === TypePerson[TypePerson.N]) {
      this.jointAccount.cliente = event;
      this.ident = this.jointAccount.cliente.id.identificacion.trim();
    } else {
      this.errorMessage('', 'messages.cliente-natural');
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
  
  changeControl(){
    this.relation.disabled? this.relation.enable() : this.relation.disable();
  }
  
  createClient() {
    this._securityService.deleteCookie('account_signature');
    let accountJoint = {view: 'M', editMode: false, joints: []};
    if (this.editMode) {
      accountJoint.editMode = true;
      accountJoint.joints = this.account.personasAsociadas;
    } else {
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then((response) => {
      }).catch(e => this.handleError(e));
    }
    this._securityService.setCookie('account_mancomunado', JSON.stringify(accountJoint), <any>'Session');
    let link = ['/portalCreateClient', 'M'];
    this.router.navigate(link);
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
}
