import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, EventEmitter, Output, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {CatalogService} from '../shared/services/catalog.service';
import {SecurityService} from 'security-angular/src/app';
import {ChangeService} from '../shared/services/change.service';
import {ServicioElectronico} from '../shared/account/electronic-service';
import {AccountDto} from '../shared/account/account-dto';
import {AccountsServices} from '../shared/services/accounts.service';
import {AccountResponse} from '../shared/account/account-response';
import {AccountFormSection} from '../shared/account/accountFormSection.enum';
import {AccountId} from '../shared/account/account-id';
import {AccountDualListComponent} from './account-dual-list.component';
import { AccountSummary } from '../shared/account/account-summary';
declare var $: any;

@Component({
  selector: 'pl-transfer-account',
  templateUrl: './transfer-account.component.html',
  styleUrls: ['./transfer-account.component.css'],
  providers: [CatalogService, AccountsServices]
})
export class TransferAccountComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Input() cancelAccount = false;
  @Input() currency = 'LPS';

  account: AccountDto;
  authorization: Authorization;
  authorized: Authorized;

  formGroup: FormGroup;
  suscription: AbstractControl;
  beneficiary: AbstractControl;
  
  associatedAccounts: AccountSummary[] = []
  transferAccountCopy: AccountSummary[] = [];
  newAccounts: AccountSummary[] = [];
  removedAccounts: AccountSummary[] = [];
  @ViewChild(AccountDualListComponent) accountDualList;

  private identification: string;
  private documento: string;
  private loadAccount = false;
  private editFlag = true;

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
              private catalogService: CatalogService,
              private changeService: ChangeService,
              private _securityService: SecurityService,
              private _changeDetectorRef: ChangeDetectorRef,
              private translate: TranslateService,
              private accountsServices: AccountsServices) {
      this.setUpForm();
      if (this.partialPersistService.data)
        this.account = this.partialPersistService.data;
  }

  setUpForm() {
      this.formGroup = this.formBuilder.group({
        suscription: [{
             value: null,
             disabled: this.editMode
         }],
       beneficiary: [{
         value: true,
         disabled: this.editMode
       }]
      });
      this.suscription = this.formGroup.controls['suscription'];
      this.beneficiary = this.formGroup.controls['beneficiary'];
  }

  ngOnInit() {
    if (this.editMode) {
      this.account = new AccountDto();
      this.identification = this._securityService.getCookie('accountNumber');
      this.documento = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSectionAccount(this.identification, 'cuentasTraslados');
      this.busy.then((account) => {
        this.account = account;
        if (!this.account.cuentasTraslados)
          this.account.cuentasTraslados = [];
        this.associatedAccounts = this.account.cuentasTraslados;
        this.transferAccountCopy = JSON.parse(JSON.stringify(this.associatedAccounts));
        this.loadAccount = true;
//        if (!this.account.serviciosElectronicos)
//          this.account.serviciosElectronicos = [];
//        this.electronicServiceCopy = JSON.parse(JSON.stringify(this.account.serviciosElectronicos));
//        this.finalBeneficiaryCopy = JSON.parse(JSON.stringify(this.account.clienteEsBeneficiarioFinal));
//        this.suscription.disable();
//        this.beneficiary.disable();
//        this.loadTransferAccount(this.account.serviciosElectronicos);
      });
    } else {
      this.editFlag = false;
      if (!this.account) {
        this.loadPartial();
      } else {
          this.associatedAccounts = this.account.cuentasTraslados;
          this.loadAccount = true;
//          this.accountDualList.loadAll();
//        this.loadTransferAccount(this.account.serviciosElectronicos);
      }
    }
  }
  
  fillAccountAssigned () {
    this.associatedAccounts = [];
  }
  
  onRoleRemoved(event: any) {
    const found = this.newAccounts.filter((data) => data.id === event.id);
    if (found.length > 0) {
      this.removedAccounts.push(event);
      this.newAccounts.splice(this.newAccounts.indexOf(found[0]), 1);
      this.account.cuentasTraslados = this.newAccounts;
    } else {
      this.removedAccounts.push(event);
      if (this.editMode) {
        const item = this.account.cuentasTraslados.find(acc => acc.id.agencia === event.id.agencia && acc.id.correlativo === event.id.correlativo && 
                acc.id.digitoIdentificador === event.id.digitoIdentificador && acc.id.digitoVerificador === event.id.digitoVerificador);
        if(item)
          this.account.cuentasTraslados.splice(this.account.cuentasTraslados.indexOf(item), 1);
      }
      if (this.navigationService.currentSections.find(item => item.section === Section.transferAccount && item.status === true)){
        const findAccount = this.account.cuentasTraslados.find(item => item.id.agencia === event.id.agencia && item.id.correlativo === event.id.correlativo && 
          item.id.digitoIdentificador === event.id.digitoIdentificador && item.id.digitoVerificador === event.id.digitoVerificador);
        if (findAccount)
          this.account.cuentasTraslados.splice(this.account.cuentasTraslados.indexOf(findAccount), 1);
      }
    }
    this._changeDetectorRef.detectChanges();
  }

  onRoleAdded(event: any) {
    const found = this.removedAccounts.filter((data) => data.id === event.id);
    if (found.length > 0) {
      this.removedAccounts.splice(this.removedAccounts.indexOf(found[0]), 1);
    }
    const already = this.associatedAccounts.filter((data) => data.id === event.id);
    if (already.length === 0) {
      this.newAccounts.push(event);
      if (!this.editMode && !this.navigationService.currentSections.find(item => item.section === Section.transferAccount && item.status === true)) {
        this.account.cuentasTraslados = this.newAccounts;
      } else {
        this.account.cuentasTraslados.push(event);
      }
    }
    this._changeDetectorRef.detectChanges();
  }
  
  selectAssign(event) {
    this.account.cuentasTraslados = event;
  }

  changeControl() {
    this.editFlag = !this.editFlag;
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  loadPartial() {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
      this.account = account;
      this.loadAccount = true;
    }).catch((e) => this.account = new AccountDto());
  }

  validateForm(): void {
    if (this.account.cuentasTraslados.length > 0) {
      this.partialSave();
    } else {
      this.notificationService.error('', this.translate.instant('messages.transfer-required'));
    }
  }

  next() : void {
    if (!this.editMode) {
      if (Section.transferAccount === this.partialPersistService.extraData['accountSection'][0])
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      this.navigationService.navigateTo(Section.transferAccount, this.partialPersistService.extraData['accountSection'][0], true);
    }
  }

  partialSave() {
    if (this.editMode) {
//      this.account.cuentasTraslados
      this.busy = this.changeService.putSectionAccount(this.account, this.identification, 'cuentasTraslados');
      this.busy.then((account) => {
        this.account = account;
        if (this.account.cuentasTraslados.length > 0)
          this.navigationService.account.transferRequired = false;
        this.transferAccountCopy = JSON.parse(JSON.stringify(this.account.cuentasTraslados));
        this.account.autorizaciones = [];
        this.bindHide();
        this.changeControl();
        this.successUpdate('messages.success.transfer-account', 'messages.success.update');
        this.next();
      }, (e:any) => this.handleError(e));
    } else {
      this.navigationService.currentSections.find(item => item.section === Section.transferAccount).status = true;
        this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then(() => {
          this.next();
        }).catch(e => {
          this.handleError(e);
          this.navigationService.currentSections.find(item => item.section === Section.transferAccount).status = false;
        });
    }
  }
  
  restoreData() {
    this.editFlag = true;
    this.account.cuentasTraslados = JSON.parse(JSON.stringify(this.transferAccountCopy));
    this.accountDualList.restoreData(this.account.cuentasTraslados);
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
          this.notificationService.error('', JSON.parse(error._body).message);
      } else if (error.status === 404) {
          this.bindHide();
          this.notificationService.alert('No found 404!', 'The server response 404 error');
      } else if (error.status === 500) {
          this.bindHide();
          this.notificationService.error('Internal Error', 'The server response 500 error');
      }
  }

  changeAuthorization (event) {
    if(event) {
        this.authorized = event;
        this.authorized.seccion = AccountFormSection[AccountFormSection.CUENTAS_TRASLADOS];
        if (this.account.autorizaciones === null)
            this.account.autorizaciones = [];
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
    }

  successUpdate(title: string, message: string): void {
    this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
  }

  public  cancel() {
    $('#confirmModal').modal('show');
  }
}
