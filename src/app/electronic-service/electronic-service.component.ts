import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
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
declare var $: any;

@Component({
  selector: 'pl-electronic-service',
  templateUrl: './electronic-service.component.html',
  styleUrls: ['./electronic-service.component.css'],
  providers: [CatalogService, AccountsServices]
})
export class ElectronicServiceComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;
  @Input() cancelAccount = false;
  @Output() validSectAccount = new EventEmitter();

  account: AccountDto;
  authorization: Authorization;
  authorized: Authorized;

  electronicServiceCopy: ServicioElectronico[] = [];
  finalBeneficiaryCopy: boolean;

  formGroup: FormGroup;
  suscription: AbstractControl;
  beneficiary: AbstractControl;

  private identification: string;

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
      this.busy = this.changeService.getSectionAccount(this.identification, 'serviciosElectronicos');
      this.busy.then((account) => {
        this.account = account;
        if (!this.account.serviciosElectronicos)
          this.account.serviciosElectronicos = [];
        this.electronicServiceCopy = JSON.parse(JSON.stringify(this.account.serviciosElectronicos));
        this.finalBeneficiaryCopy = JSON.parse(JSON.stringify(this.account.clienteEsBeneficiarioFinal));
        this.suscription.disable();
        this.beneficiary.disable();
        this.loadElectronicService(this.account.serviciosElectronicos);
      });
    } else {
      if (!this.account) {
        this.loadPartial();
      } else {
        this.loadElectronicService(this.account.serviciosElectronicos);
      }
    }
  }

  changeControl() {
    this.suscription.disabled? this.suscription.enable() : this.suscription.disable();
    this.beneficiary.disabled? this.beneficiary.enable() : this.beneficiary.disable();
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  loadElectronicService(electronicService?: ServicioElectronico[]) {
    if (this.account.serviciosElectronicos.length == 0 || this.editMode){
      this.catalogService.getCatalog('cuentas/serviciosElectronicos?tipoPersona='+this.account.cliente.tipoPersona+'&producto='+
        this.account.producto.id.producto+'&subProducto='+this.account.producto.id.subProducto)
        .then((response: ServicioElectronico[]) => {
          this.account.serviciosElectronicos = response;
          if (this.editMode) {
            electronicService.filter((item) => {
              const electronicFind = this.account.serviciosElectronicos.find((subItem) => subItem.id === item.id && item.acepta);
              if (electronicFind) {
                const index = this.account.serviciosElectronicos.indexOf(electronicFind);
                this.account.serviciosElectronicos[index].acepta = true;
              }
            });
          }
        }).catch(e => this.handleError(e));
    }
  }

  changeSuscription(electronicService: ServicioElectronico, index: number) {
    this.account.serviciosElectronicos[index].acepta = !this.account.serviciosElectronicos[index].acepta;
  }

  loadPartial() {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then((account) => {
      this.account = account;
      this.loadElectronicService(this.account.serviciosElectronicos);
    }).catch((e) => this.account = new AccountDto());
  }

  validateForm(): void {

  }

  next() : void {
    if (!this.editMode) {
      if (Section.electronicService === this.partialPersistService.extraData['accountSection'][0])
        this.partialPersistService.extraData['accountSection'].splice(0,1);
      this.navigationService.navigateTo(Section.electronicService, this.partialPersistService.extraData['accountSection'][0], true);
    } else {
      this.validSectAccount.emit();
    }
  }

  partialSave() {
      if (this.editMode) {
          this.busy = this.changeService.putSectionAccount(this.account, this.identification, 'serviciosElectronicos');
          this.busy.then((account) => {
            this.account = account;
            this.account.autorizaciones = [];
            if (!this.account.clienteEsBeneficiarioFinal){
              this.navigationService.account.beneficiariesFinal = true;
            } else {
              this.navigationService.account.beneficiariesFinal = false;
            }
            this.electronicServiceCopy = JSON.parse(JSON.stringify(this.account.serviciosElectronicos));
            this.finalBeneficiaryCopy = JSON.parse(JSON.stringify(this.account.clienteEsBeneficiarioFinal));
            this.bindHide();
            this.changeControl();
            this.successUpdate('messages.success.electronic-service', 'messages.success.update');
            this.next();
            if (this.navigationService.account.beneficiariesFinal) {
              this.changeService.getSectionAccount(this.identification, 'beneficiariosFinales').then((dto : AccountDto) => {
                if (dto.beneficiariosFinales) {
                  if (dto.beneficiariosFinales.length === 0) {
                    this.navigationService.account.finalRequired = true;
                    this.navigationService.navigateTo(Section.electronicService, Section.beneficiariesFinal, true);
                  } else {
                    this.navigationService.account.finalRequired = false;
                  }
                } else {
                  this.navigationService.account.finalRequired = true;
                  this.navigationService.navigateTo(Section.electronicService, Section.beneficiariesFinal, true);
                }
              });
            }
//            if (this.navigationService.account.beneficiariesFinal) {
//              this.navigationService.account.finalRequired = true;
//              this.navigationService.navigateTo(Section.electronicService, Section.beneficiariesFinal, true);
//            }
          }, (e:any) => this.handleError(e));
      } else {
        if (!this.account.clienteEsBeneficiarioFinal) {
          this.navigationService.currentSections.find(item => item.section === Section.electronicService).status = true;
          this.partialPersistService.extraData['accountSection'].splice(this.partialPersistService.extraData['accountSection'].indexOf(Section.electronicService) + 1, 0, Section.beneficiariesFinal);
          this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then((response) => {
            this.next();
          });
        } else {
          this.busy = this.accountsServices.saveAccount(this.account, this.account.business.valor);
          this.busy.then((account: AccountResponse) => {
            this.account.accountResponse = account;
            const current = this.navigationService.currentSections.find((item) => item.section === Section.beneficiariesFinal);
            if (current) {
              this.navigationService.currentSections.splice(this.navigationService.currentSections.indexOf(current), 1);
              this.partialPersistService.extraData['accountSection'].splice(0, 1, Section.electronicService);
            }
            this.navigationService.currentSections.find(item => item.section === Section.electronicService).status = true;
            this.navigationService.account.accountCreated = true;
            this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then((response) => {
              this.next();
            });
          }).catch((e) => this.handleError(e));
        }
      }
  }
  
  restoreData() {
    this.suscription.disabled? this.suscription.enable() : this.suscription.disable();
    this.beneficiary.disabled? this.beneficiary.enable() : this.beneficiary.disable();
    this.loadElectronicService(JSON.parse(JSON.stringify(this.electronicServiceCopy)));
    this.account.clienteEsBeneficiarioFinal = JSON.parse(JSON.stringify(this.finalBeneficiaryCopy));
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
        this.authorized.seccion = AccountFormSection[AccountFormSection.SERVICIOS_ELECTRONICOS];
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
