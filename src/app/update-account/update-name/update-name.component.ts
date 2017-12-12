import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {SecurityService} from 'security-angular/src/app';
import {UpdateAccountService} from '../shared/update-account.service';
import {Authorization, Authorized} from '../../authorization/shared/authorization';
import {AccountDto} from '../../shared/account/account-dto';
import {ActivatedRoute, Params} from '@angular/router';
import {NavigationService} from '../../shared/services/navigation.service';

declare var $: any;


@Component({
  selector: 'pl-update-account-name',
  templateUrl: './update-name.component.html',
  styles: [``],
  encapsulation: ViewEncapsulation.None,
  providers: [UpdateAccountService]
})
export class UpdateAccountNameComponent implements OnInit {

  @Output() nameChangeAccount: EventEmitter<AccountDto>;
  @Input() cancelAccount = false;
  account: AccountDto = new AccountDto();
  authorization: Authorization;
  authorized: Authorized;
  accountCopy: AccountDto;

  private identification: string;
  private disabledField = true;
  private pattern = /^[\u00E0-\u00FCña-zÑA-Z&.\s]+$/;
  formGroup: FormGroup;

  name: AbstractControl;
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

  constructor(private route: ActivatedRoute, private notificationService: NotificationsService,
              private updateAccountService: UpdateAccountService,
              public formBuilder: FormBuilder,
              private _securityService: SecurityService,
              private navigation: NavigationService) {
    this
      .setUpForm();
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      name: [{
        value: '',
        disabled: this.disabledField
      }, Validators.compose([Validators.required, Validators.maxLength(180), Validators.pattern(this.pattern)])],
    });

    this.name = this.formGroup.controls['name'];
  }

  ngOnInit() {
    this.identification = this._securityService.getCookie('accountNumber');
    this.updateAccountService.getUpdateName(this.identification).then(account => {
      this.account = account;
      this.accountCopy = JSON.parse(JSON.stringify(this.account));
    });
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'CAMBIO_DE_NOMBRE';
      if (this.account.autorizaciones === null) {
        this.account.autorizaciones = [];
      }
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.updateName();
      this.bindHide();
    } else {
      this.account.autorizaciones = [];
      this.bindHide();
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
  }

  updateName() {
    this.updateAccountService.updateName(this.identification, this.account).then(account => {
      this.account = account;
      this.accountCopy = JSON.parse(JSON.stringify(this.account));
      this.account.autorizaciones = [];
      this.change();
      this.bindHide();
      this.successUpdate('Nombre Actualizado', 'El Nombre se actualizo correctamente');
      this.navigation.nameChange.emit(account);
    }, (error: any) => this.handleError(error));
  }

  change() {
    this.disabledField = !this.disabledField;
    this.name.disabled ? this.name.enable() : this.name.disable();
  }

  restoreName() {
   this.change();
   this.account = JSON.parse(JSON.stringify(this.accountCopy));
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
