import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PartialPersistService } from '../shared/services/partial-persist.service';
import { NavigationService } from '../shared/services/navigation.service';
import { FormSectionInterface } from '../shared/form-section-interface';
import { AccountDto } from '../shared/account/account-dto';
import { Beneficiario } from '../shared/account/beneficiary';
import { Parentesco } from '../shared/client/parentesco';
import { detectChanges, forceDestructuring, forEachKey } from '../util/destructuring';
import { Section } from '../shared/section';
import { WebFormName } from '../shared/webform-name';
import { NotificationsService } from 'angular2-notifications';
import { SecurityService } from 'security-angular/src/app';
import { Authorization, Authorized } from '../authorization/shared/authorization';
import { TypeDocumentSelectComponent } from '../type-document/type-document-select.component';
import { environment } from '../../environments/environment';
import { AccountsServices } from '../shared/services/accounts.service';
import { isNumber } from 'util';
import { Mode } from '../shared/client/referenceDTO';
import { AccountFormSection } from '../shared/account/accountFormSection.enum';
import { TranslateService } from 'ng2-translate';
import {CatalogService} from '../shared/services/catalog.service';
declare var $: any;

@Component({
  selector: 'pl-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.css'],
  providers: [AccountsServices, CatalogService]
})
export class BeneficiaryComponent implements OnInit, FormSectionInterface, AfterViewChecked {
  @Input() editMode = false;
  @Input() cancelAccount = false;
  @ViewChild('docType') docType: TypeDocumentSelectComponent;
  busy: Promise<any>;
  account: AccountDto;
  tmpAccount: AccountDto;
  beneficiary = new Beneficiario();
  beneficiaryBase: Beneficiario;
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  typeDocumentURL = environment.apiUrl + '/api/';
  itemEditMode = false;
  accountNumber: string;
  descRelationship = false;

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
  phoneNumber: AbstractControl;
  relationship: AbstractControl;
  percentage: AbstractControl;

  // Table Properties
  prefix = 'create-account.beneficiaries.heading';
  values: string[] = ['tipoDocumento.descripcion', 'numeroDocumento', 'composeName', 'parentesco.descripcion', 'porcentaje'];

  constructor(private formBuilder: FormBuilder,
              private navigationService: NavigationService,
              private notificationService: NotificationsService,
              private changeDetector: ChangeDetectorRef,
              private accountsService: AccountsServices,
              private securityService: SecurityService,
              private translate: TranslateService,
              private partialPersistService: PartialPersistService,
              private _catalogService: CatalogService) {
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
      let account = await this.accountsService.getAccountBySection(this.accountNumber, 'beneficiarios');
      if (account) {
        this.account = account;
        if(this.account.beneficiarios && this.account.beneficiarios.length) {
          let relationships = await this._catalogService.getCatalog('parentescos');
          if (relationships && relationships.length) {
            this.account.beneficiarios.forEach((item) => {
              item.parentesco = relationships.find((itemRel) => itemRel.codigo.trim() === item.parentesco.codigo.trim() || itemRel.descripcion.trim() === item.parentesco.descripcion
                || (item.parentescoDescripcion && itemRel.descripcion.includes(item.parentescoDescripcion)));
              if (!item.parentesco) {
                item.parentesco = new Parentesco('', item.parentescoDescripcion || '');
              }
              item.composeName = this.composeName(item);
              const document = this.docType.documentIdentifications.find(doc => doc.codigo === item.tipoDocumento.codigo);
              item.tipoDocumento = document ? document : item.tipoDocumento;
            });
          }
        } else {
          this.account.beneficiarios = [];
        }
        this.tmpAccount = JSON.parse(JSON.stringify(this.account));
        this.change();
      }
    } else {
      this.enableControls();
      if (!this.account) {
        this.loadPartial();
      }
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  getHeader(): string[] {
    if(this.editMode) {
      return [`${this.prefix}.document-type`, `${this.prefix}.noDocument`, `${this.prefix}.name`, `${this.prefix}.relationship`, `%`, `${this.prefix}.mode`];
    } else {
      return [`${this.prefix}.document-type`, `${this.prefix}.noDocument`, `${this.prefix}.name`, `${this.prefix}.relationship`, `%`];
    }
  }

// Form
  setUpForm(){
    this.formGroup = this.formBuilder.group({
      firstName: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondName: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      firstSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern(this.pattern)])],
      secondSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      marriedSurname: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.maxLength(15), Validators.pattern(this.pattern)])],
      documentIdentification: [{disabled: this.disabledField}, Validators.required],
      identification: [{value: '', disabled: this.disabledField}, Validators.required],
      address: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(50)])],
      phoneNumber: [{value: '', disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(10)])],
      relationship: [{value: new Parentesco(), disabled: this.disabledField}, Validators.compose([Validators.required])],
      percentage: [{value: 0.00, disabled: this.disabledField}, Validators.compose([Validators.required, Validators.maxLength(6), this.percentageValidator])]
    });
    forceDestructuring(this.formGroup.controls, this);
  }

  enableControls(){
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

  // Form Section Interface
  next(): void {
    if (!this.editMode) {
      if (Section.beneficiaries === this.partialPersistService.extraData['accountSection'][0]) {
        this.partialPersistService.extraData['accountSection'].splice(0, 1);
      }
      this.navigationService.navigateTo(Section.beneficiaries, this.partialPersistService.extraData['accountSection'][0], true);
    }
  }

  validateForm(): void {
    this.partialSave();
  }

  change(): void {
    forceDestructuring(this.formGroup.controls, this);

    if (this.editMode && this.beneficiary && this.beneficiary.numeroDocumento) {
      this.itemEditMode = true;
      this.beneficiary['originalDocument'] = this.beneficiary.numeroDocumento;
      this.beneficiaryBase = JSON.parse(JSON.stringify(this.beneficiary));
      this.formGroup.markAsPristine();
      this.formGroup.markAsUntouched();
    }

    this.disabledField = !this.disabledField;
    forEachKey(this.formGroup.controls, item => this.disabledField? item.disable() : item.enable());
  }

  cancel(): void {
    if (!this.editMode) {
      $('#confirmModal').modal('show');
    } else if (!this.disabledField) {
      this.change();
      this.account.beneficiarios.forEach(beneficiary => this.restoreBeneficiary(beneficiary));
      this.clean();
    }
  }

  loadPartial(): void {
    this.account = new AccountDto();
    this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CUENTA]).then(account => {
      if (account) {
        this.account = account;
        if (this.account.beneficiarios) {
          this.account.beneficiarios.map(item => item.composeName = this.composeName(item));
        }
      }
    }).catch(e => {
      console.log(e);
    });
  }

  partialSave(): void {
    if (this.editMode) {
      this.busy = this.accountsService.putAccountBySection(this.account, this.accountNumber, 'beneficiarios');
      this.busy.then(account => {
        this.bindHide();
        this.account = account;
        this.account.autorizaciones = [];
        this.tmpAccount = JSON.parse(JSON.stringify(this.account));
        this.account.beneficiarios.forEach(beneficiary => beneficiary.composeName = this.composeName(beneficiary));
        this.change();
        this.notify('success', 'create-account.beneficiaries.messages.title.successful-update', 'create-account.beneficiaries.messages.body.successful-update')
      }, (e: any) => this.handleError(e));
    } else {
      this.navigationService.currentSections.find(item => item.section === Section.beneficiaries).status = true;
      this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CUENTA], this.account, this.partialPersistService.extraData)
        .then(() => {
          this.next();
        })
        .catch(e => {
          this.handleError(e);
          this.navigationService.currentSections.find(item => item.section === Section.beneficiaries).status = false;
        });
    }
  }

  invalidPercentage(): boolean {
    if (this.account.beneficiarios && this.account.beneficiarios.length) {
      const total = this.getTotalPercentage();
      return !(total === 100 || total === 100.00);
    }
    return true;
  }

  getTotalPercentage(): number {
    if (this.account.beneficiarios && this.account.beneficiarios.length) {
      const values = this.account.beneficiarios.filter(ben => ben.modalidad !== this.mode.D).map(per => per.porcentaje);
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
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
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
        this.beneficiary.tipoDocumento = event;
      }
      if (event.mascara) {
        this.valueChange(this.beneficiary.numeroDocumento, null);
      }
    }
  }

  valueChange(newValue, guide) {
    if (newValue) {
      let regex = this.docType.obtainRegex();
      this.identification.setValidators([Validators.required, Validators.pattern(regex)]);
      this.identification.updateValueAndValidity();
      this.beneficiary.numeroDocumento = newValue.toUpperCase();
    }
  }

  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.identification.setValue(value);
      this.identification.updateValueAndValidity();
      this.beneficiary.numeroDocumento = value.toUpperCase();
    }
  }

  onChangeRelationship(event: any) {
    if (event) {
      this.beneficiary.parentesco = event;
    }
  }

  addBeneficiary(obj: Beneficiario) {
    if (obj) {
      if (+(obj.porcentaje) === 0) {
        this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-zero')
        return;
      }
      const total = +(this.getTotalPercentage());
      if (+(obj.porcentaje) > 100 || (total && ((total + (+obj.porcentaje)) > 100)) || total === 100) {
        this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-percentage');
        return;
      }
      const repeated = this.account.beneficiarios.find(item => item.numeroDocumento === obj.numeroDocumento);
      if (repeated) {
        this.notify('error', 'create-account.beneficiaries.messages.title.repeated-beneficiary', 'create-account.beneficiaries.messages.body.repeated-beneficiary');
        return;
      }
      this.busy = this.accountsService.validateBeneficiary(obj);
      this.busy.then(() => {
        obj.composeName = this.composeName(obj);
        if (!this.itemEditMode) {
          if (this.editMode) {
            obj.modalidad = this.mode.I;
          }
          this.account.beneficiarios.push(obj);
        }
        this.clean();
      }).catch(error => {
        this.translate.get('exceptionace.'+JSON.parse(error._body).code).subscribe((item) => {
          this.notificationService.error('Error en servicio', item);
        });
      });
    }
  }

  restoreBeneficiary(obj: Beneficiario) {
    let found = this.account.beneficiarios.find(item => item.numeroDocumento === obj.numeroDocumento);
    if (found && obj.modalidad === this.mode.I) {
      this.account.beneficiarios.splice(this.account.beneficiarios.indexOf(found), 1);
    } else {
      let foundCopy = this.tmpAccount.beneficiarios.find(item => item.numeroDocumento === obj['originalDocument']);
      if (foundCopy) {
        forceDestructuring(foundCopy, obj);
      }
    }
  }

  modify(event: any) {
    if (this.disabledField && this.editMode) {
      this.beneficiary = this.account.beneficiarios.find(item => item.numeroDocumento === event.numeroDocumento);
      return;
    }
    this.itemEditMode = true;
    this.beneficiary = this.account.beneficiarios.find(item => item.numeroDocumento === event.numeroDocumento);
    this.beneficiary['originalDocument'] = this.beneficiary.numeroDocumento;
    this.beneficiaryBase = JSON.parse(JSON.stringify(this.beneficiary));
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.descRelationship = !event.parentesco.codigo;
  }

  nameChange(){
    this.beneficiary.composeName = this.composeName(this.beneficiary);
  }

  saveItem() {
    const total = +(this.getTotalPercentage());
    if (total > 100 || total <= 0) {
      this.notify('error', 'create-account.beneficiaries.messages.title.invalid-percentage', 'create-account.beneficiaries.messages.body.invalid-percentage');
      return;
    }
    if (detectChanges(this.beneficiary, this.beneficiaryBase) && this.editMode) {
      this.beneficiary.modalidad = this.beneficiary.modalidad === this.mode.I ? this.mode.I : this.mode.U;
    }
    this.clean();
    this.itemEditMode = false;
  }

  deleteItem() {
    if (this.account.beneficiarios && this.account.beneficiarios.length) {
      let index = this.account.beneficiarios.indexOf(this.beneficiary);
      if (this.beneficiary.modalidad !== undefined && this.beneficiary.modalidad !== this.mode.I) {
        this.account.beneficiarios[index].modalidad = this.mode.D;
      } else {
        this.account.beneficiarios.splice(index, 1);
      }
      this.clean();
      this.itemEditMode = false;
    }
  }

  composeName(ben: Beneficiario): any {
    return '' + ben.primerNombre.trim() + (ben.segundoNombre.trim() ? ' ' + ben.segundoNombre.trim(): ' ')
                  + (' ' + ben.primerApellido.trim()) + (ben.segundoApellido.trim() ? ' ' + ben.segundoApellido.trim() : '')
                  + (ben.apellidoCasada.trim() ? ' DE ' + ben.apellidoCasada.trim() : '');
  }

  clearEdit() {
    forceDestructuring(this.beneficiaryBase, this.beneficiary);
    this.clean()
  }

  clean() {
    this.itemEditMode = false;
    this.beneficiary = new Beneficiario();
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
    this.descRelationship = false;
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = AccountFormSection[AccountFormSection.BENEFICIARIOS];
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
