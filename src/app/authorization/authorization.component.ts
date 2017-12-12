import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';
import {AuthorizationService} from './shared/authorization.service';
import {Authorization, AuthorizationResponse, Authorized} from './shared/authorization';
import { TranslateService } from 'ng2-translate';
import {environment} from '../../environments/environment';
const JSEncrypt = require('jsencrypt');
declare var $: any;

@Component({
  selector: 'pl-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [AuthorizationService]
})
export class AuthorizationComponent implements OnInit {
  @Output() changeAuthorization = new EventEmitter();
  @Input() authorization: Authorization;

  private authorizationResponse: AuthorizationResponse;
  private auth: Authorization;
  private authorized: Authorized = new Authorized();
  private message: string;
  private applyFor = false;
  private check = false;
  private messagePanel = false;
  private danger = false;
  private info = false;
  
  formGroup: FormGroup;
  description: AbstractControl;
  passwordAuth: AbstractControl;

  busy: Promise<any>;
  
  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private authorizationService: AuthorizationService,
              public formBuilder: FormBuilder) { 
    this.setUpForm();
  }
  
  setUpForm() {
    this.formGroup = this.formBuilder.group({
      description: [{
        value: '',
        disabled: true
      }],
      passwordAuth: [{
        value: '',
        disabled: false
      }, Validators.compose([Validators.required, Validators.maxLength(10)])]
    });
    this.description = this.formGroup.controls['description'];
    this.passwordAuth = this.formGroup.controls['passwordAuth'];
  }

  ngOnInit() {
      this.passwordAuth.enable();
  }

  applyForAuthorization() {
    this.auth = JSON.parse(JSON.stringify(this.authorization));
    if (this.authorization.requierePassword) {
      const encrypt = new JSEncrypt.JSEncrypt();
      encrypt.setPublicKey(environment.key);
      this.auth.password =  encrypt.encrypt($('#password').val());
    }
    this.busy = this.authorizationService.applyFor(this.auth);
    this.busy.then(authorizationResponse => {
      this.authorizationResponse = authorizationResponse;
      this.messagePanel = true;
      this.danger = false;
      this.info = true;
      if (this.authorizationResponse == '') {
        this.danger = true;
        this.info = false;
        this.message = 'authorization.empty-connection';
      } else {
        this.applyFor = true;
//        this.passwordAuth.setValidators([Validators.maxLength(10)]);
        this.passwordAuth.disable();
//        this.passwordAuth.updateValueAndValidity();
        if (this.authorizationResponse.notifica){
          this.message = this.authorizationResponse.message;
        } else {
          this.check = true;
          this.info = false;
          this.message = 'authorization.authorized';
        }
      }
    }, (errorAuthorization: any) => {
      this.danger = true;
      this.messagePanel = true;
      this.info = false;
      if (errorAuthorization.override) {
        this.message = 'exceptionace.' + errorAuthorization.code;
      } else {
        this.message = errorAuthorization.message;
      }
    });
  }

  checkAuthorization() {
    this.busy = this.authorizationService.check(this.authorizationResponse);
    this.busy.then(authorizationResponse => {
      this.check = true;
      this.danger = false;
      this.info = false;
      this.message = 'authorization.authorized';
    }, (errorAuthorization: any) => {
      this.danger = true;
      this.info = false;
      if (errorAuthorization.override) {
        this.message = 'exceptionace.core.seguridad.exception.0100000';
      } else {
        this.message = errorAuthorization.message;
      }
      if (errorAuthorization.code == null){
        this.message = 'messages.core.seguridad.exception.0100103';
      }
    });
  }

  cancelAuthorization(){
      this.busy = this.authorizationService.cancel(this.authorizationResponse);
      this.busy.then(authorizationResponse => {
        this.cancel();
      }, (errorAuthorization: any) => {
          this.danger = true;
          this.info = false;
        if (errorAuthorization.override){
          this.message = 'exceptionace.' + errorAuthorization.code;
        } else {
          this.message = errorAuthorization.message;
        }
      });
  }

  cancel() {
      this.setVal();
      this.changeAuthorization.emit(undefined);
  }
  
  setVal() {
      this.applyFor = false;
      this.check = false;
      this.messagePanel = false;
      this.message = '';
      this.passwordAuth.enable();
  }

  successAuthorization() {
    this.setVal();
    this.authorized.permiso = this.authorization.codigo;
    this.changeAuthorization.emit(this.authorized);
  }

  translateTag(tag: string): string {
    return this.translate.instant(tag);
  }

  handleError(error: any): void {
    if (error.status == 403) {
      let body = '';
      if (error._body != '') {
        try {
          body = JSON.parse(error._body);
        } catch (e) {
          body = error._body;
        }
      }
//      this.notificationService.alert('No found 404!', 'The server response 404: \n' + body);
    }
  }

}
