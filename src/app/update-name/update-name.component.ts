import {Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output} from '@angular/core';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {AbstractControl, FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';
import {UpdateNameService} from './shared/update-name.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {Client} from '../client/shared/client.model';
import {NavigationService} from '../shared/services/navigation.service';
//import { forbiddenNameValidator } from '../util/validators';
//import {CustomValidator} from '../util/validators';
declare var $: any;
//import {ClientInformationService} from './portal-header/shared/client-information.service';
//import {ClientInformation} from './shared/client-information.model';
@Component({
  selector: 'pl-update-name',
  templateUrl: './update-name.component.html',
  styleUrls: ['./update-name.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [UpdateNameService]
})
export class UpdateNameComponent implements OnInit {

  @Output() nameChange: EventEmitter<Client>;
  client: Client = new Client();
  authorization: Authorization;
  authorized: Authorized;
  private clientFormSection = ClientFormSection;

  private identification: string;
  private disabledField: boolean = true;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z&.\s]+$/;
  updateGeneralDataNatural: FormGroup;
  updateGeneralDataJuridic: FormGroup;
  copyUpdate: Client;

  surname: AbstractControl;
  secondSurname: AbstractControl;
  marriedSurname: AbstractControl;
  firstName: AbstractControl;
  secondName: AbstractControl;
  businessName: AbstractControl;
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
              private updateNameService: UpdateNameService,
              public formBuilder: FormBuilder,
              private _securityService: SecurityService,
              private navigation: NavigationService) {
    this.setUpForm();
  }

  setUpForm() {
    this.updateGeneralDataNatural = this.formBuilder.group({
      surname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondSurname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      marriedSurname: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      firstName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])]
    });
    this.updateGeneralDataJuridic = this.formBuilder.group({
      businessName: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(180), Validators.pattern(this.pattern)])]
    });

    this.surname = this.updateGeneralDataNatural.controls['surname'];
    this.secondSurname = this.updateGeneralDataNatural.controls['secondSurname'];
    this.marriedSurname = this.updateGeneralDataNatural.controls['marriedSurname'];
    this.firstName = this.updateGeneralDataNatural.controls['firstName'];
    this.secondName = this.updateGeneralDataNatural.controls['secondName'];
    this.businessName = this.updateGeneralDataJuridic.controls['businessName'];
  }

  ngOnInit() {
    this.identification = this._securityService.getCookie('identification');
    this.updateNameService.getUpdateName(this.identification).then(client => {
      this.client = client;
      this.copyUpdate = JSON.parse(JSON.stringify(this.client));
    });
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'CAMBIO_DE_NOMBRE';
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.updateName();
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

  updateName() {
    this.updateNameService.updateName(this.identification, this.client).then(client => {
      this.client = client;
      this.client.autorizaciones = [];
      this.change();
      this.bindHide();
      this.copyUpdate = JSON.parse(JSON.stringify(this.client));
      this.successUpdate('Nombre Actualizado', 'El Nombre se actualizo correctamente');
      this.navigation.nameChange.emit(client);
    }, (error: any) => this.handleError(error));
  }

  change() {
    this.disabledField = !this.disabledField;
    this.surname.disabled ? this.surname.enable() : this.surname.disable();
    this.secondSurname.disabled ? this.secondSurname.enable() : this.secondSurname.disable();
    this.marriedSurname.disabled ? this.marriedSurname.enable() : this.marriedSurname.disable();
    this.firstName.disabled ? this.firstName.enable() : this.firstName.disable();
    this.secondName.disabled ? this.secondName.enable() : this.secondName.disable();
    this.businessName.disabled ? this.businessName.enable() : this.businessName.disable();
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
