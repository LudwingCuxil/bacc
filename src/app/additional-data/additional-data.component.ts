import { Component, OnInit, Input } from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {DatosAdicionales} from '../shared/client/datos-adicionales';
import {ChangeService} from '../shared/services/change.service';
import {SecurityService} from 'security-angular/src/app';
import {TranslateService} from 'ng2-translate';
declare var $: any;
@Component({
  selector: 'pl-additional-data',
  templateUrl: './additional-data.component.html',
  styleUrls: ['./additional-data.component.css']
})
export class AdditionalDataComponent implements OnInit, FormSectionInterface {

  @Input() editMode = false;

  client: ClienteDto;
  formGroup: FormGroup;
  additionalDatatype: AbstractControl;
  identification: AbstractControl;
  additionalDatatypeList: string[] = [];
  authorization: Authorization;
  authorized: Authorized;
  private identificationClient: string;

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

  busy: Promise<any>;

  constructor(private router: Router,
              public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private partialPersistService: PartialPersistService,
              private navigationService: NavigationService,
              private validationService: ValidationsService,
              private changeService: ChangeService,
              private _securityService: SecurityService,
              private translate: TranslateService) {
      this.setUpForm();
      if (this.partialPersistService.data) {
        this.client = this.partialPersistService.data;
      }
  }

  setUpForm(){
      this.formGroup = this.formBuilder.group({
          additionalDatatype: [{
              value: 'MATRICULA_GRATIS',
              disabled: this.editMode
          }, Validators.required],
          identification: [{
              value: null,
              disabled: this.editMode
          }, Validators.maxLength(15)]
      });
      this.additionalDatatype = this.formGroup.controls['additionalDatatype'];
      this.identification = this.formGroup.controls['identification'];
  }

  ngOnInit() {
    this.additionalDatatypeList = DatosAdicionales.getCode();
    if (this.editMode) {
      this.client = new ClienteDto();
//      this.client.datosAdicionales.tipoDatoAdicional;
      this.identificationClient = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSection(this.identificationClient, 'datosAdicionales');
      this.busy.then((client) => {
        this.client = client;
      });
    } else {
      if (!this.client) {
        this.loadPartial();
      }
    }
  }

  loadPartial() {
      this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
         if(client) {
             this.client = client;
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
        this.navigationService.navigateTo(Section.additionalData, Section.documents, true);
    }
  }

  partialSave() {
      console.log(this.client);
      if (this.editMode) {
        this.busy = this.changeService.putSection(this.client, this.identificationClient, 'datosAdicionales');
        this.busy.then((client) => {
          this.client = client;
          this.bindHide();
          this.client.autorizaciones = [];
          this.successUpdate('messages.success.additional-data', 'messages.success.update');
        }, (e: any) => this.handleError(e));
      } else {
          this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
             this.next();
          });
      }
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
  
  public  cancel() {
    $('#confirmModal').modal('show');
  }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }

  changeAuthorization (event) {
    if(event) {
        this.authorized = event;
        this.authorized.seccion = 'DATOS_ADICIONALES';
        if (this.client.autorizaciones === null)
            this.client.autorizaciones = [];
        this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
        this.partialSave();
    } else {
        this.client.autorizaciones = [];
        this.bindHide();
    }
  }

}
