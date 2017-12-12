import {Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output, ViewChild} from '@angular/core';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {AbstractControl, FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';
import {UpdateIdService} from './shared/update-id.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {ClienteDto} from '../shared/client/cliente-dto';
import {NavigationService} from '../shared/services/navigation.service';
import {TypeDocumentSelectComponent} from "../type-document/type-document-select.component";
import {environment} from "../../environments/environment";
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {isUndefined} from "util";

declare var $: any;


@Component({
  selector: 'pl-update-id',
  templateUrl: './update-id.component.html',
  styleUrls: ['./update-id.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [UpdateIdService]
})
export class UpdateIdComponent implements OnInit {

  @Output() idChange: EventEmitter<ClienteDto>;
  @ViewChild('docType') tipeDoc: TypeDocumentSelectComponent;
  client: ClienteDto;
  authorization: Authorization;
  authorized: Authorized;
  private clientFormSection = ClientFormSection;
  private tempIdentificiacion = '';
  typeDocument2URL = environment.apiUrl + '/api/';

  private identification: string;
  private disabledField: boolean = true;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z&.\s]+$/;
  updateIdForm: FormGroup;
  copyUpdate: ClienteDto;

  documentIdentification: AbstractControl;
  numberIdentification: AbstractControl;
  busy: Promise<any>;

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

  constructor(private route: ActivatedRoute,
              private notificationService: NotificationsService,
              private updateIdService: UpdateIdService,
              public formBuilder: FormBuilder,
              private _securityService: SecurityService,
              private navigation: NavigationService) {
    this.setUpForm();
  }

  setUpForm() {
    this.updateIdForm = this.formBuilder.group({
      documentIdentification: [{value: '', disabled: true}, [Validators.required]],
      numberIdentification: [{value: '', disabled: true}, [Validators.required]]
    });
    this.documentIdentification = this.updateIdForm.controls['documentIdentification'];
    this.numberIdentification = this.updateIdForm.controls['numberIdentification'];
  }
  isDataAvailable:boolean = false;

  ngOnInit() {
    this.client = new ClienteDto();
    this.copyUpdate = new ClienteDto();
    this.identification = this._securityService.getCookie('identification');
    this.updateIdService.getIdName(this.identification).then(client => {
      this.client = client;
      this.copyUpdate = JSON.parse(JSON.stringify(client));
      this.isDataAvailable = true;
      this.tempIdentificiacion = this.client.identificacion;
      this.valuechange(this.tempIdentificiacion,undefined);
    });
  }

  selectDocumentoIdentificacion(event: any): void {
    if (event) {
      if (this.client) {
        this.client.tipoIdentificacion = event;
      }
      if (event.mascara) {
        this.valuechange(this.client.identificacion, null);
      }
    }
  }

  valuechange(newValue, status) {
    if (newValue) {
      const ob = this.tipeDoc.obtainRegex();
      this.numberIdentification.setValidators([Validators.required, Validators.pattern(ob)]);
      this.numberIdentification.updateValueAndValidity();
      this.tempIdentificiacion = newValue.toUpperCase();
      this.client.identificacion = this.tempIdentificiacion;
    }
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'CAMBIO_DE_IDENTIFICACION';
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.updateId();
    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  restoreUpdate() {
    this.change();
    this.client = JSON.parse(JSON.stringify(this.copyUpdate));
  }

  bindHide() {
    if (($("#authorizationModal").data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  updateId() {
    this.updateIdService.updateId(this.identification, this.client).then(client => {
      this.client = client;
      this.client.autorizaciones = [];
      this.change();
      this.bindHide();
      this.copyUpdate = JSON.parse(JSON.stringify(this.client));
      this.successUpdate('Identificación Actualizada', 'La identificación se actualizo correctamente');
      this.navigation.idChange.emit(client);
    }, (error: any) => this.handleError(error));
  }

  change() {
    this.disabledField = !this.disabledField;
    this.updateIdForm.controls.documentIdentification.disabled ? this.updateIdForm.controls.documentIdentification.enable() : this.updateIdForm.controls.documentIdentification.disable();
    this.updateIdForm.controls.numberIdentification.disabled ? this.updateIdForm.controls.numberIdentification.enable() : this.updateIdForm.controls.numberIdentification.disable();
  }

  handleError(error: any): void {
    if (error.status == 428) {
      let authorization = '';
      if (error._body != '') {
        try {
          authorization = JSON.parse(error._body);
          this.authorization = authorization;
          if (!($("#authorizationModal").data('bs.modal') || {}).isShown) {
            $('#authorizationModal').modal('show');
          }
        } catch (e) {
          authorization = error._body;
        }
      }
    } else if (error._body != '') {
      let body = '';
      try {
        body = JSON.parse(error._body).message;
      } catch (e) {
        body = error._body;
      }
      this.notificationService.error('An error occurred, status: ' + error.status, body);
    }
  }

  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.numberIdentification.setValue(value);
      this.numberIdentification.updateValueAndValidity();
      this.tempIdentificiacion = value.toUpperCase();
      this.client.representanteLegalTutor.identificacion = this.tempIdentificiacion;
    }
  }
  // setDocumentDefault(): void {
  //   this.plParameterService.getplParameter({number: 0, size: 1500}, 'PARAM_TIDODE')
  //     .then((parameter: any) => {
  //       this.result = this.documents.filter(item => item.codigo.indexOf(parameter.valor) !== -1);
  //       this.documentDefault = this.result[0];
  //     });
  // }

  successCreate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(title, message);
  }

  successDelete(title: string, message: string): void {
    this.notificationService.success(title, message);
  }
}
