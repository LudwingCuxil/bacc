import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';

import {FormSectionInterface} from '../shared/form-section-interface';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {Mode} from '../shared/client/referenceDTO';
import {SaveService} from '../shared/services/save-service';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {CatalogService} from '../shared/services/catalog.service';
import {ReferencesService} from './shared/references.service';
import {TranslateService} from 'ng2-translate';
import {NgbAccordion} from '@ng-bootstrap/ng-bootstrap-byte';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {isUndefined} from 'util';

declare var $: any;

@Component({
  selector: 'pl-references',
  templateUrl: './references.component.html',
  styles: [``],
  providers: [PlParameterService, SaveService, CatalogService, ReferencesService],
  encapsulation: ViewEncapsulation.None
})
export class ReferencesComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  static LIST_REFERENCE_CATALOG = 'referenciasIngreso';
  static PERSON_TYPE_PARAM = 'tipoPersona';
  @Input() editMode;
  changeMode = false;
  @ViewChild(NgbAccordion) referencesAccordion;
  identification: string;
  referenceList = [];
  edit = false;
  mode = Mode;

  heading: string[] = ['general-information.address-type', 'general-information.address'];
  headingEdit: string[] = ['general-information.address-type', 'general-information.address', 'table.actions'];

  values: string[] = ['tipoDireccion.descripcion', 'direccion'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;

  busy: Promise<any>;
  client: ClienteDto;
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

  constructor(public formBuilder: FormBuilder,
              private _router: Router,
              private _route: ActivatedRoute,
              private notificationService: NotificationsService,
              private _translateService: TranslateService,
              private _securityService: SecurityService,
              private _partialPersistService: PartialPersistService,
              private _validationService: ValidationsService,
              private _saveService: SaveService,
              private _referencesService: ReferencesService,
              private _plService: PlParameterService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _catalogService: CatalogService) {
    this.setUpForm();
    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
      this.checkReferences();
      this.getReferenceList();
    }
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.busy = this._referencesService.getReferences(this.identification);
      this.change();
      this.busy.then((client) => {
        this._partialPersistService.data = client;
        this.client = this._partialPersistService.data;
        this.checkReferences();
        this.getReferenceList();
      }).catch(e => this.handleError(e));
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

  validateReference(): boolean {
    let status = true;
    if (this.referenceList) {
      this.referenceList.forEach(reference => {
        if (reference.referencia.tipoReferencia === 'PERSONALES_FAMILIARES') {
          if (reference.minimo <= this.client.referencias.referenciasPersonalesFamiliares.length) {
            return;
          }
        }
        if (reference.referencia.tipoReferencia === 'ACCIONISTAS') {
          if (reference.minimo <= this.client.referencias.referenciasAccionistas.length) {
            return;
          }
        }
        if (reference.referencia.tipoReferencia === 'CREDITO') {
          if (reference.minimo <= this.client.referencias.referenciasCredito.length) {
            return;
          }
        }
        if (reference.referencia.tipoReferencia === 'CUENTAS') {
          if (reference.minimo <= this.client.referencias.referenciasCuentas.length) {
            return;
          }
        }
        if (reference.referencia.tipoReferencia === 'SEGUROS') {
          if (reference.minimo <= this.client.referencias.referenciasSeguros.length) {
            return;
          }
        }
        if (reference.referencia.tipoReferencia === 'VEHICULOS') {
          if (reference.minimo <= this.client.referencias.referenciasSeguros.length) {
            return;
          }
        }
        this._translateService.get('exceptionace.core.clientes.referencias.minimo').subscribe((item) => {
          this.notificationService.alert(item, reference.minimo);
        });
        status = false;
      });
      return status;
    }
    this._translateService.get('exceptionace.core.clientes.exception.0100165').subscribe((item) => {
      this.notificationService.error('Error al recuperar parametrización', item);
    });
    return false;
  }

  getParametrizedReference(reference: String): any {
    return this.referenceList.find(item => item.referencia.tipoReferencia === reference);
  }

  checkReferences(): void {
    if (!this.client.referencias.referenciasVehiculos) {
      this.client.referencias.referenciasVehiculos = [];
    }
    if (!this.client.referencias.referenciasCredito) {
      this.client.referencias.referenciasCredito = [];
    }
    if (!this.client.referencias.referenciasAccionistas) {
      this.client.referencias.referenciasAccionistas = [];
    }
    if (!this.client.referencias.referenciasSeguros) {
      this.client.referencias.referenciasSeguros = [];
    }
    if (!this.client.referencias.referenciasPersonalesFamiliares) {
      this.client.referencias.referenciasPersonalesFamiliares = [];
    }
    if (!this.client.referencias.referenciasCuentas) {
      this.client.referencias.referenciasCuentas = [];
    }
    if (!this.client.referencias.referenciasPropiedades) {
      this.client.referencias.referenciasPropiedades = [];
    }
    if (!this.client.referencias.referenciasTarjetasCredito) {
      this.client.referencias.referenciasTarjetasCredito = [];
    }
  }

  canShow(reference: String) {
    if (this.referenceList.find(item => item.referencia.tipoReferencia === reference)) {
      return true;
    }
    return false;
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = ClientFormSection[ClientFormSection.REFERENCIAS];
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.validateForm();
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

  cancel() {
    $('#confirmModal').modal('show');
  }

  loadPartial() {
    this.client = new ClienteDto();
    this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        this.client = client;
        this.getReferenceList();
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
      this._route.params.forEach((params: Params) => {
        const id = params['param'];
        if (isUndefined(id)) {
          this._securityService.deleteCookie('identification');
          this._securityService.setCookie('identification', this.client.clienteResumen.id.identificacion, <any>'Session');
          this.busy = this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CLIENTE]);
          this._router.navigate(['portalCreateAccount']);
        } else if (id === 'F') {
          this._securityService.deleteCookie('client_signature');
          this._securityService.setCookie('client_signature', JSON.stringify(this.client.clienteResumen), <any>'Session');
          this.busy = this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CLIENTE]);
          let accountSignature = this._securityService.getCookie('account_signature');
          if (accountSignature) {
            let accountSign = JSON.parse(accountSignature);
            if (accountSign.editMode) {
              this._router.navigate(['portalAccounts']);
            } else {
              this._router.navigate(['portalCreateAccount']);
            }
          }
        } else if (id === 'M') {
          this._securityService.deleteCookie('client_mancomunado');
          this._securityService.setCookie('client_mancomunado', JSON.stringify(this.client.clienteResumen), <any>'Session');
          this.busy = this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CLIENTE]);
          let accountJoint = this._securityService.getCookie('account_mancomunado');
          if (accountJoint) {
            let accountSign = JSON.parse(accountJoint);
            if (accountSign.editMode) {
              this._router.navigate(['portalAccounts']);
            } else {
              this._router.navigate(['portalCreateAccount']);
            }
          }
        }
      });
    }
  }

  partialSave(): void {
    console.log(this.client);
    if (this.editMode) {
      this.busy = this._referencesService.putReferences(this.client, this.identification);
      this.busy.then((client) => {
        this.bindHide();
        this.client = client;
        this.client.autorizaciones = [];
        this.successUpdate('Datos Generales Actualizados', 'Se actualizo correctamente');
        this.ngOnInit();
        this.referenceList.forEach(item => {
          if (this.referencesAccordion.isOpen(item.referencia.tipoReferencia)) {
            this.referencesAccordion.toggle(item.referencia.tipoReferencia);
          }
        });
      }, (e: any) => this.handleError(e));
    } else {
      this._plService.getplParameter(undefined, 'PARAM_EMPRSA').then((data) => {
        this._saveService.saveReferences(this.client, parseInt(data.valor, 10)).then((client) => {
          this.client = client;
          this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
            this.next();
          }).catch(er => this.handleError(er));
        }).catch(e => this.handleError(e));
      }).catch(e => this.handleError(e));
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
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  change(): void {
    this.changeMode = !this.changeMode;
    this.disabledField = !this.disabledField;
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({});
  }

  enableControls(): void {
    this.changeMode = false;
    this.disabledField = false;
  }
}
