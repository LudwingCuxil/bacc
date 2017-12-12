import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoginService} from 'security-angular/src/app/login/shared/login.service';
import {Login} from 'security-angular/src/app/login/shared/login';
import {NotificationsService} from 'angular2-notifications';
import {LoginsComponent} from 'security-angular/src/app/login/login.component';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
const JSEncrypt = require('jsencrypt');
import {environment} from '../../environments/environment';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'pl-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent extends LoginsComponent implements OnInit {

  private fillField: boolean = false;
  private username: any;
  private password: any;

  public loginForm: FormGroup;
  SPECIAL_CHARACTERS: string[][] = [["$", "%24"],
    ["-", "%2D"],
    ["_", "%5F"],
    [".", "%2E"],
    ["+", "%2B"],
    ["!", "%21"],
    ["*", "%2A"],
    ["\'", "%27"],
    ["(", "%28"],
    [")", "%29"],
    [",", "%2C"],
    ["\"", "%22"]];

  constructor(private formBuilderl: FormBuilder,
              private routerl: Router,
              private loginServicel: LoginService,
              private notificationServicel: NotificationsService) {
    super(formBuilderl, routerl, loginServicel, notificationServicel);

    this.loginForm = this.formBuilderl.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });

    this.username = this.loginForm.controls['username'];
    this.password = this.loginForm.controls['password'];
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.username !== '' || this.password !== '') {
        $('.btn-login').removeAttr('disabled');
      }
    }, 150);
  }

  signIn() {
    const loginSha = <Login> JSON.parse(JSON.stringify(this.login));
    const encrypt = new JSEncrypt.JSEncrypt();
    var pssw = '';
    let count = 0;
    encrypt.setPublicKey(environment.key);
    pssw = encrypt.encrypt(loginSha.password);
    for (var x = 0; x < pssw.length; x++) {
      this.SPECIAL_CHARACTERS.map((item, index) => {
        if (pssw.includes(item[0])) {
          loginSha.password = pssw.replace(item[0], item[1]);
          pssw = loginSha.password;
          count ++;
        }
      });
    }
    if (count === 0)
        loginSha.password = pssw;
    this.busy = this.loginServicel.makeLogin(loginSha);
    this.busy.then(() => this.successCreate('', ''), (e: any) => this.handleError(e));
  }

}
