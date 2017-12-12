import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {DocumentoIdentificacion} from '../shared/client/documento-identificacion';
import {TypeDocumentService} from '../type-document/shared/type-document.service';
import {TypeDocumentSelectComponent} from '../type-document/type-document-select.component';
import {environment} from '../../environments/environment';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {NotificationsService} from 'angular2-notifications';
import {ClienteDto} from '../shared/client/cliente-dto';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {FormSectionInterface} from '../shared/form-section-interface';
import {ValidationsService} from '../shared/services/validations.service';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Section} from '../shared/section';
import {NavigationService} from '../shared/services/navigation.service';
import {Navigation} from '../shared/navigation';

declare var $: any;

@Component({
  selector: 'pl-person-type',
  templateUrl: './person-type.component.html',
  styleUrls: ['./person-type.component.css'],
  providers: [PlParameterService, TypeDocumentService]
})
export class PersonTypeComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Output() changeView: EventEmitter<any>;
  @ViewChild('docType') tipeDoc: TypeDocumentSelectComponent;
  @Input() editMode = false;
  authorization: Authorization;
  private authorized: Authorized = new Authorized()
  private typeSelected = true;
  busy: Promise<any>;
  private regex = new RegExp(/^/);

  private client;
  typeDocument2URL = environment.apiUrl + '/api/';
  codigo = null;
  // public plParameters: PlParameter[];
  // public plParameter = new PlParameter();
  public documents: DocumentoIdentificacion[] = [];
  public documentDefault = new DocumentoIdentificacion();
  private serviceData = false;

  formGroup: FormGroup;
  legal: AbstractControl;
  natural: AbstractControl;
  documentIdentification: AbstractControl;
  identificacion: AbstractControl;
  private result;
  private tempIdentificiacion = '';

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
      let ob = this.tipeDoc.obtainRegex();
      this.identificacion.setValidators([Validators.required, Validators.pattern(ob)]);
      this.identificacion.updateValueAndValidity();
    }
    if (newValue) {
      this.tempIdentificiacion = newValue.toUpperCase();
      this.client.identificacion = this.tempIdentificiacion;
    }
  }

  onBlurIdentification(newValue: FocusEvent): void {
    let value = (<HTMLInputElement>newValue.srcElement).value;
    if (value && value.includes('@')) {
      value = value.replace(/@/g, ' ');
      this.identificacion.setValue(value);
      this.identificacion.updateValueAndValidity();
      this.tempIdentificiacion = value.toUpperCase();
      this.client.identificacion = this.tempIdentificiacion;
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  selectTipoLegal(event: any): void {
    this.tipeDoc.setPlaceHolder('');
    this.tipeDoc.setDocumentDefault(null);
    this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'J');
    // const tr = this.translate.instant('type-person.legal');
    this.client.tipoPersona = 'J';
    this.client.tipoIdentificacion = null;
    this.client.identificacion = '';
    this.typeSelected = false;
    this.identificacion.setValue('');
  }

  selectTipoNatural(event: any): void {
    this.tipeDoc.setPlaceHolder('');
    this.tipeDoc.setDocumentDefault(this.documentDefault);
    this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
    // const tr = this.translate.instant('type-person.natural');
    this.client.tipoPersona = 'N';
    this.client.identificacion = '';
    this.typeSelected = true;
    this.identificacion.setValue('');
  }

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, private router: Router,
              private plParameterService: PlParameterService, private _validationService: ValidationsService,
              private notificationService: NotificationsService, private typeDocumentService: TypeDocumentService,
              private _navigationService: NavigationService, private _partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef) {
    this.setUpForm();
    this.changeView = new EventEmitter();
    this.client = this._partialPersistService.data;
    if (this.client) {
      if (this.client.tipoPersona === 'J') {
        this.typeSelected = false;
        // this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'J');
      } else {
        this.typeSelected = true;
        // this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
      }
    }
    this.typeDocumentService.getDocumentItentification('A')
      .then((documents: any) => {
        this.documents = documents;
      });
  }

  setUpForm() {
    this.formGroup = this.formBuilder.group({
      legal: [{disabled: false}, []],
      natural: [{disabled: false}, []],
      documentIdentification: [{disabled: false}, [Validators.required]],
      identificacion: [{value: '', disabled: false}, [Validators.required]]
    });

    this.legal = this.formGroup.controls['legal'];
    this.natural = this.formGroup.controls['natural'];
    this.documentIdentification = this.formGroup.controls['documentIdentification'];
    this.identificacion = this.formGroup.controls['identificacion'];
  }

  handleError(error) {
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
    } else {
      const err = JSON.parse(error._body);
      const tr = this.translate.instant('exceptionace.' + err.code);
      this.notificationService.error('', tr);
    }
  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
    ;
  }

  public  cancel() {
    $('#confirmModal').modal('show');
  }

  changeAuthorization(event) {
    if (event) {
      this.authorized = event;
      this.authorized.seccion = 'TIPO_PERSONA_IDENTIFICACION';
      if (this.client.autorizaciones === null) {
        this.client.autorizaciones = [];
      }
      this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
      this.partialSave();
      this.bindHide();
    } else {
      this.client.autorizaciones = [];
      this.bindHide();
    }
  }

  ngOnInit() {
    if (this.editMode) {
    } else {
      // this.enableControls();
      if (!this.client) {
        this.checkForPartial();
      }
    }
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
    } else {
      if (this.client.tipoPersona.toUpperCase() === 'N') {
        this._navigationService.client.natural = true;
        this._navigationService.client.legal = false;
        this._navigationService.navigateTo(Section.personType, Section.naturalGeneralData, true);
      } else {
        this._navigationService.client.natural = false;
        this._navigationService.client.legal = true;
        this._navigationService.navigateTo(Section.personType, Section.legalGeneralData, true);
      }
    }
  }

  validateForm(): void {
    if (this.editMode) {
      this.partialSave();
    } else {
      if (this.tempIdentificiacion) {
        this.client.identificacion = this.tempIdentificiacion.toUpperCase();
      }
      this.busy = this._validationService.validationForm(this.client, ClientFormSection[ClientFormSection.TIPO_PERSONA_IDENTIFICACION]);
      this.busy.then(response => {
        this.partialSave();
      }).catch((e) => this.handleError(e));
    }
  }

  loadPartial() {
    this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
      if (client) {
        if (client.tipoPersona === 'J') {
          this.typeSelected = false;
          // this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'J');
        } else {
          this.typeSelected = true;
          // this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
        }
        this.client = client;
        this.setDocumentDefault();
        this.changeView.emit();
        this._navigationService.navigationChange.emit();
      } else {
        this.client = new ClienteDto();
      }
    }).catch((e) => {
      this.initialValues();
    });
  }

  checkForPartial(): void {
    this._partialPersistService.checkPartial(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((repsonse) => {
      $('#loadPartialModal').modal('show');
    }).catch((e) => {
      this.initialValues();
    });
  }

  deletePartial(): void {
    this.initialValues();
    this._partialPersistService.removeWebForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).catch(e => this.handleError(e));
  }

  partialSave(): void {
    if (this.editMode) {
    } else {
      this._navigationService.currentSections[0].status = true;
      if (this.tempIdentificiacion) {
        this.client.identificacion = this.tempIdentificiacion.toUpperCase();
      }
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
        this.next();
      }).catch((e) => {
        this.handleError(e);
        this._navigationService.currentSections[0].status = false;
      });
    }
  }

  initialValues() {
    this._partialPersistService.data = new ClienteDto();
    this.client = this._partialPersistService.data;
    this.client.tipoPersona = 'N';
    this.plParameterService.getplParameter({number: 0, size: 1500}, 'PARAM_TIDODE')
      .then((parameter: any) => {
        this.result = this.documents.filter(item => item.codigo.indexOf(parameter.valor) !== -1);
        this.documentDefault = this.result[0];
        this.tipeDoc.setDocumentDefault(this.documentDefault);
        this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
      });
    this.changeView.emit();
  }

  setDocumentDefault(): void {
    this.plParameterService.getplParameter({number: 0, size: 1500}, 'PARAM_TIDODE')
      .then((parameter: any) => {
        this.result = this.documents.filter(item => item.codigo.indexOf(parameter.valor) !== -1);
        this.documentDefault = this.result[0];
        /*if (this.client.tipoIdentificacion) {
         this.tipeDoc.setDocumentDefault(this.client.tipoIdentificacion);
         }
         this.tipeDoc.updateTypeDocument(this.typeDocument2URL, this.client.tipoPersona); */
      });
  }

}
