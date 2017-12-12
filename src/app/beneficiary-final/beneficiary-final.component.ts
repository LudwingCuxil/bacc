import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, EventEmitter, Output} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PartialPersistService } from '../shared/services/partial-persist.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FormSectionInterface } from '../shared/form-section-interface';
import { AccountDto } from '../shared/account/account-dto';
import { BeneficiarioFinal } from '../shared/account/final-beneficiary';
import { Authorization, Authorized } from '../authorization/shared/authorization';
import { detectChanges, forceDestructuring, forEachKey } from '../util/destructuring';
import { Section } from '../shared/section';
import { WebFormName } from '../shared/webform-name';
import { NotificationsService } from 'angular2-notifications';
import { SecurityService } from 'security-angular/src/app';
import { TypeDocumentSelectComponent } from '../type-document/type-document-select.component';
import { environment } from '../../environments/environment';
import { AccountsServices } from '../shared/services/accounts.service';
import { isNumber } from 'util';
import { Country } from '../country/shared/country';
import { CountrySelectComponent } from '../country/country-select.component';
import { Mode } from '../shared/client/referenceDTO';
import { AccountResponse } from "app/shared/account/account-response";
import { AccountFormSection } from '../shared/account/accountFormSection.enum';
import { TranslateService } from 'ng2-translate';
import {ChangeService} from '../shared/services/change.service';
import { number } from 'ng2-validation/dist/number';
declare var $: any;

@Component({
  selector: 'pl-beneficiary-final',
  templateUrl: './beneficiary-final.component.html',
  styleUrls: ['./beneficiary-final.component.css'],
  providers: [AccountsServices]
})
export class BeneficiaryFinalComponent implements OnInit, FormSectionInterface, AfterViewChecked {
  @Input() editMode = false;
  @Input() cancelAccount = false;
  @Output() validSectAccount = new EventEmitter();
  @ViewChild('docType') docType: TypeDocumentSelectComponent;
  @ViewChild('countryView') countryView: CountrySelectComponent;
  busy: Promise<any>;
  account: AccountDto;
  tmpAccount: AccountDto;
  beneficiaryFinal = new BeneficiarioFinal();
  beneficiaryFinalBase: BeneficiarioFinal;
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  typeDocumentURL = environment.apiUrl + '/api/';
  itemEditMode = false;
  accountNumber: string;

  private mode = Mode;

  // Form Properties
  formGroup: FormGroup;
  firstName: AbstractControl;
  secondName: AbstractControl;
  firstSurname: AbstractControl;
  secondSurname: AbstractControl;
  marriedSurname: AbstractControl;
  documentIdentification: AbstractControl;
  identification: AbstractControl;
  address: AbstractControl;
  cellphone: AbstractControl;
  cellphone2: AbstractControl;
  rtn: AbstractControl;
  country: AbstractControl;
  department: AbstractControl;
  municipality: AbstractControl;
  phonenumber: AbstractControl;
  email: AbstractControl;
  percentage: AbstractControl;

  // Table Properties
  prefix = 'create-account.beneficiaries-final.heading';
  values: string[] = ['tipoDocumento.descripcion', 'numeroDocumento', 'composeName', 'nacionalidad.nacionalidad', 'porcentaje'];

  constructor(private formBuilder: FormBuilder,
              private navigationService: NavigationService,
              private notificationService: NotificationsService,
              private changeDetector: ChangeDetectorRef,
              private accountsService: AccountsServices,
              private securityService: SecurityService,
              private translate: TranslateService,
              private partialPersistService: PartialPersistService,
              private changeService: ChangeService) {
    this.setUpForm();
    if (this.partialPersistService.data) {
      this.account = this.partialPersistService.data;
    }
  }

  async ngOnInit() {
    if (this.docType)
      this.docType.updateTypeDocument(this.typeDocumentURL, 'N');
    if (this.editMode) {
      this.account = new AccountDto();
      this.accountNumber = this.securityService.getCookie('accountNumber');
      let account = await this.accountsService.getAccountBySection(this.accountNumber, 'beneficiariosFinales');
      if (account) {
        this.account = account;
        if (this.account.beneficiariosFinales && this.account.beneficiariosFinales.length) {
          forEachKey(this.account.beneficiariosFinales, item => {
            item.composeName = this.composeName(item);
            item.tipoDocumento = this.docType.documentIdentifications.find(doc => doc.codigo === item.tipoDocumento.codigo);
          });
        } else {
          this.account.beneficiariosFinales = [];
        }
        this.tmpAccount = JSON.parse(JSON.stringify(this.account));
        this.change();
      }
    } else {
      this.enableControls();
      this.rtn.setValidators([Validators.minLength(14), Validators.maxLength(14)]);
      this.rtn.updateValueAndValidity();
      if (!this.account) {
        this.loadPartial();
      }
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  getHeader(): string[] {
    if (this.editMode) {
      return [`${this.prefix}.document-type`, `${this.prefix}.noDocument`, `${this.prefix}.name`, `${this.prefix}.nationality`, `%`, `${this.prefix}.mode`];
    } else {
      return [`${this.prefix}.document-type`, `${this.prefix}.noDocument`, `${this.prefix}.name`, `${this.prefix}.nationality`, `%`];
    }
  }

  // Form
  setUpForm() {
    this.formGroup = this.formBuilder.group({
      firstName: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondName: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      firstSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      marriedSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      documentIdentification: [{disabled: this.disabledField}, Validators.required],
      identification: [{value: '', disabled: this.disabledField}, Validators.required],
      address: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(80), Validators.minLength(10)])],
      department: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(20)])],
      municipality: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(20)])],
      cellphone: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(20)])],
      cellphone2: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(20)])],
      rtn: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.minLength(14), Validators.maxLength(14)])],
      country: [{value: new Country(), disabled: this.disabledField}, Validators.required],
      phonenumber: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(20)])],
      email: [{value: undefined, disabled: this.disabledField}, Validators.compose([Validators.maxLength(80)])],
      percentage: [{value: 0.00, disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(6), this.percentageValidator])]
    });
    forceDestructuring(this.formGroup.controls, this);
  }

  enableControls() {
    this.disabledField = false;
    forEachKey(this.formGroup.controls, (item) => item.enable());
  }

  percentageValidator(input: FormControl) {
    if( input && input.value ) {
      let numberValue = +(input.value);
      return numberValue > 100 || numberValue < 0 ? {invalidPercentage: true} : null;
    }
    return { invalidPercentage: true };
  }

  emailValidator(input: FormControl) {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])+(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
    if ((input.value && EMAIL_REGEXP.test(input.value)) || input.value === '') {
        return null;
    }
    return {
      'email': true
    };
  }

  // Form Section Interface
  next(): void {
    if (!this.editMode) {
      if (Section.beneficiariesFinal === this.partialPersistService.extraData['accountSection'][0]) {
        this.partialPersistService.extraData['accountSection'].splice(0, 1);
      }
      this.navigationService.navigateTo(Section.beneficiariesFinal, this.partialPersistService.extraData['accountSection'][0], true);
    } else {
      this.validSectAccount.emit();
    }
  }

  validateForm(): void {
    this.partialSave();
  }

  change(): void {
    forceDestructuring(this.formGroup.controls, this);

    /*if (this.editMode && this.beneficiaryFinal && this.beneficiaryFinal.numeroDocumento) {
      this.itemEditMode = true;
      this.beneficiaryFinal['originalDocument'] = this.beneficiaryFinal.numeroDocumento;
      this.beneficiaryFinalBase = JSON.parse(JSON.stringify(this.beneficiaryFinal));
      this.formGroup.markAsPristine();
      this.formGroup.markAsUntouched();
    }*/
    this.beneficiaryFinal = new BeneficiarioFinal();

    this.disabledField = !this.disabledField;
    forEachKey(this.formGroup.controls, item => this.disabledField? item.disable() : item.enable());
  }

  cancel(): void {
    if (!this.editMode) {
      $('#confirmModal').modal('show');
    } else if (!this.disabledField) {
      this.change();
      this.account.beneficiariosFinales.forEach(beneficiary => this.restoreBeneficiaryFinal(beneficiary));
      this.clean();
    }
  }

  loadPartial(): void {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      if (account) {
        this.account = account;
        if (this.account.beneficiariosFinales) {
          this.account.beneficiariosFinales.map(item => item.composeName = this.composeName(item));
        }
      }
    }).catch(e => {
      console.log(e);
    });
  }

  partialSave(): void {
    if (this.editMode) {
      this.busy = this.accountsService.putAccountBySection(this.account, this.accountNumber, 'beneficiariosFinales');
      this.busy.then(account => {
        this.bindHide();
        this.account = account;
        this.account.autorizaciones = [];
        this.tmpAccount = JSON.parse(JSON.stringify(this.account));
        this.account.beneficiariosFinales.forEach(beneficiary => beneficiary.composeName = this.composeName(beneficiary));
        this.change();
        this.notify('success', 'create-account.beneficiaries.messages.title.successful-update', 'create-account.beneficiaries.messages.body.successful-update')
        this.next();
        if (this.navigationService.account.finalRequired) {
          this.changeService.getSectionAccount(this.accountNumber, 'beneficiariosFinales').then((dto : AccountDto) => {
            this.navigationService.account.finalRequired = false;
            this.navigationService.navigateTo(Section.beneficiariesFinal, Section.beneficiariesFinal, true);
          });
        }
      }, (e: any) => this.handleError(e));
    } else {
      this.busy = this.accountsService.saveAccount(this.account, this.account.business.valor);
      this.busy.then((account: AccountResponse) => {
        this.account.accountResponse = account;
        this.navigationService.currentSections.find(item => item.section === Section.beneficiariesFinal).status = true;
        this.navigationService.account.accountCreated = true;
        this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData).then(() => {
          this.next();
        })
      }).catch((e) => this.handleError(e));
    }
  }

  invalidPercentage(): boolean {
    if (this.account.beneficiariosFinales && this.account.beneficiariosFinales.length) {
      const total = this.getTotalPercentage();
      return !(total === 100 || total === 100.00);
    }
    return true;
  }

  getTotalPercentage(): number {
    if (this.account.beneficiariosFinales && this.account.beneficiariosFinales.length) {
      const values = this.account.beneficiariosFinales.filter(ben => ben.modalidad !== this.mode.D).map(per => per.porcentaje);
      return values.reduce((prev, next) => (+(prev)) + (+(next)), 0);
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
  }

  notify(type: string, titleMessage: string, bodyMessage: string) {
    this.translate.get(titleMessage).subscribe(title => {
      this.translate.get(bodyMessage).subscribe(value => {
        this.notificationService[type](title, value);
      });
    });
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
      this.notificationService.error('', JSON.parse(error._body).message);
    } else if (error.status === 404) {
      this.bindHide();
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.bindHide();
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

  // Event Handling
  onDocumentChange(event: any){
    if (event) {
      if (this.account && event.codigo) {
        this.beneficiaryFinal.tipoDocumento = event;
      }
      if (event.mascara) {
        this.valueChange(this.beneficiaryFinal.numeroDocumento, null);
      }
    }
  }

  valueChangeEmail(event) {
    if (event.value && event.value.length > 0) {
      this.email.setValidators(Validators.compose([this.emailValidator, Validators.maxLength(80)]));
      this.email.updateValueAndValidity();
    } else {
      this.email.clearValidators();
      this.email.setValue(this.beneficiaryFinal.correo);
    }
  }

  valueChange(newValue, guide) {
    if (newValue) {
      let regex = this.docType.obtainRegex();
      this.identification.setValidators([Validators.required, Validators.pattern(regex)]);
      this.identification.updateValueAndValidity();
      this.beneficiaryFinal.numeroDocumento = newValue.toUpperCase();
    }
  }

  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.identification.setValue(value);
      this.identification.updateValueAndValidity();
      this.beneficiaryFinal.numeroDocumento = value.toUpperCase();
    }
  }

  onCountryChange(event: any) {
    if (event) {
      this.beneficiaryFinal.nacionalidad = event;
    }
  }

  addBeneficiaryFinal(obj: BeneficiarioFinal) {
    if (obj && this.beneficiaryFinal) {
      if (+(obj.porcentaje) === 0) {
        this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-zero')
        return;
      }
      const total = +(this.getTotalPercentage());
      if (+(obj.porcentaje) > 100 || (total && ((total + (+obj.porcentaje)) > 100)) || total === 100) {
        this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-percentage');
        return;
      }
      const repeated = this.account.beneficiariosFinales.find(item => item.numeroDocumento === obj.numeroDocumento);
      if (repeated) {
        this.notify('error', 'create-account.beneficiaries.messages.title.repeated-beneficiary', 'create-account.beneficiaries.messages.body.repeated-beneficiary');
        return;
      }
      this.busy = this.accountsService.validateBeneficiaryFinal(obj);
      this.busy.then(() => {
        obj.composeName = this.composeName(obj);
        if (!this.itemEditMode) {
          if (this.editMode) {
            obj.modalidad = this.mode.I;
          }
          this.account.beneficiariosFinales.push(obj);
        }
        this.clean();
      }).catch(error => {
        this.translate.get('exceptionace.'+JSON.parse(error._body).code).subscribe((item) => {
          this.notificationService.error('Error en servicio', item);
        });
      });
    }
  }

  restoreBeneficiaryFinal(obj: BeneficiarioFinal) {
    let found = this.account.beneficiariosFinales.find(item => item.numeroDocumento === obj.numeroDocumento);
    if (found && obj.modalidad === this.mode.I) {
      this.account.beneficiariosFinales.splice(this.account.beneficiariosFinales.indexOf(found), 1);
    } else {
      let foundCopy = this.tmpAccount.beneficiariosFinales.find(item => item.numeroDocumento === obj['originalDocument']);
      if (foundCopy) {
        forceDestructuring(foundCopy, obj);
      }
    }
  }

  modify(event: any) {
    if (this.disabledField && this.editMode) {
      this.beneficiaryFinal = this.account.beneficiariosFinales.find(item => item.numeroDocumento === event.numeroDocumento);
      return;
    }
    this.itemEditMode = true;
    this.beneficiaryFinal = this.account.beneficiariosFinales.find(item => item.numeroDocumento === event.numeroDocumento);
    this.beneficiaryFinal['originalDocument'] = this.beneficiaryFinal.numeroDocumento;
    this.beneficiaryFinalBase = JSON.parse(JSON.stringify(this.beneficiaryFinal));
    this.email.setValue(this.beneficiaryFinal.correo);
    this.email.setValidators(Validators.compose([Validators.maxLength(80)]));
    this.email.patchValue(this.beneficiaryFinal.correo);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  nameChange(){
    this.beneficiaryFinal.composeName = this.composeName(this.beneficiaryFinal);
  }

  saveItem() {
    const total = +(this.getTotalPercentage());
    if (total > 100 || total <= 0) {
      this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-percentage');
      return;
    }
    if (detectChanges(this.beneficiaryFinal, this.beneficiaryFinalBase) && this.editMode) {
      this.beneficiaryFinal.modalidad = this.beneficiaryFinal.modalidad === this.mode.I ? this.mode.I : this.mode.U;
    }
    this.clean();
    this.itemEditMode = false;
  }

  deleteItem() {
    if (this.account.beneficiariosFinales && this.account.beneficiariosFinales.length) {
      let index = this.account.beneficiariosFinales.indexOf(this.beneficiaryFinal);
      if (this.beneficiaryFinal.modalidad !== undefined && this.beneficiaryFinal.modalidad !== this.mode.I) {
        this.account.beneficiariosFinales[index].modalidad = this.mode.D;
      } else {
        this.account.beneficiariosFinales.splice(index, 1);
      }
      this.clean();
      this.itemEditMode = false;
    }
  }

  composeName(ben: BeneficiarioFinal): any {
    return '' + ben.primerNombre.trim() + (ben.segundoNombre.trim() ? ' ' + ben.segundoNombre.trim(): ' ')
                  + (' ' + ben.primerApellido.trim()) + (ben.segundoApellido.trim() ? ' ' + ben.segundoApellido.trim() : '')
                  + (ben.apellidoCasada.trim() ? ' DE ' + ben.apellidoCasada.trim() : '');
  }

  clearEdit() {
    forceDestructuring(this.beneficiaryFinalBase, this.beneficiaryFinal);
    this.clean();
  }

  clean() {
    this.itemEditMode = false;
    this.beneficiaryFinal = new BeneficiarioFinal();
    this.countryView.setDefaultValue();
    this.country.setValue(this.countryView.country);
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched()
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.BENEFICIARIOS_FINALES];
      if (this.account.autorizaciones === null)
        this.account.autorizaciones = [];
      this.account.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
    } else {
      this.account.autorizaciones = [];
      this.bindHide();
    }
  }
}
