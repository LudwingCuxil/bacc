import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {NavigationService} from '../shared/services/navigation.service';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {WebFormName} from '../shared/webform-name';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {ValidationsService} from '../shared/services/validations.service';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {CatalogService} from '../shared/services/catalog.service';
import {OpeningDocument, OpeningDocumentService, OpeningDocumentMod} from '../shared/client/documento-apertura';
import {SecurityService} from 'security-angular/src/app';
import {ChangeService} from '../shared/services/change.service';
import {PerfilEconomico} from '../shared/client/perfil-economico';
declare var $: any;

@Component({
  selector: 'pl-presented-documents',
  templateUrl: './presented-documents.component.html',
  styleUrls: ['./presented-documents.component.css'],
  providers: [CatalogService]
})
export class PresentedDocumentsComponent implements OnInit, FormSectionInterface, AfterViewChecked {

  @Input() editMode = false;

  client: ClienteDto;
  authorization: Authorization;
  authorized: Authorized;

  openingDocuments: OpeningDocumentMod[] = [];
  openingDocumentsCopy: OpeningDocument[] = [];
  openingDocumentMod: OpeningDocumentMod = new OpeningDocumentMod();
  formGroup: FormGroup;
  documents: AbstractControl;

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
              private translate: TranslateService,) {
      this.setUpForm();
      if (this.partialPersistService.data){
        this.client = this.partialPersistService.data;
        this.loadDocuments(this.client.documentosApertura);
      }
  }

  setUpForm() {
      this.formGroup = this.formBuilder.group({
         documents: [{
             value: null,
             disabled: this.editMode
         }, Validators.required]
      });
      this.documents = this.formGroup.controls['documents'];
  }

  ngOnInit() {
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      this.busy = this.changeService.getSection(this.identification, 'documentosPresentados');
      this.busy.then((client) => {
        this.documents.disable();
        this.client = client;
        if (!this.client.perfilEconomico) {
          this.client.perfilEconomico = new PerfilEconomico();
        }
        if (this.client.documentosApertura)
          this.openingDocumentsCopy = JSON.parse(JSON.stringify(this.client.documentosApertura));
        this.loadDocuments(this.client.documentosApertura);
      });
    } else {
      if (!this.client) {
        this.loadPartial();
      }
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }
  
  changeControl() {
    this.documents.disabled? this.documents.enable() : this.documents.disable();
  }

  loadDocuments(documents?: OpeningDocument[]) {
    //TODO se necesita claseCliente de perfil economico
    this.catalogService.getCatalogParam('documentosRequeridos', 'claseCliente', this.client.perfilEconomico.claseCliente.codigo).then((documentsService : OpeningDocumentService[]) => {
      this.openingDocuments = []; 
        for(var x = 0; x < documentsService.length; x++) {
          if (documents) {
            let document = this.client.documentosApertura.find(item => item.codigo === documentsService[x].id.documentoApertura.codigo);
            if (document) {
              this.openingDocumentMod.id = documentsService[x].id;
              this.openingDocumentMod.requerido = documentsService[x].requerido;
              this.openingDocumentMod.check = true;
            } else {
              this.openingDocumentMod.id = documentsService[x].id
              this.openingDocumentMod.requerido = documentsService[x].requerido;
              this.openingDocumentMod.check = false;
            }
          } else {
            this.openingDocumentMod.check = false;
            this.openingDocumentMod.id = documentsService[x].id;
            this.openingDocumentMod.requerido = documentsService[x].requerido;
          }
          this.openingDocuments.push(JSON.parse(JSON.stringify(this.openingDocumentMod)));
        }
    });
  }

  documentSelect(document: OpeningDocument) {
    if (!this.client.documentosApertura.find(item =>
      item.codigo.toString().trim() === document.codigo.toString().trim())){
      this.client.documentosApertura.push(document);
    } else {
      for (var x = 0; x < this.client.documentosApertura.length; x++) {
        if (this.client.documentosApertura[x].codigo === document.codigo){
          this.client.documentosApertura.splice(x, 1)
          break;
        }
      }
    }
  }

  cancelDocuments(){
    this.documents.disabled? this.documents.enable() : this.documents.disable();
    if (this.openingDocumentsCopy) {
      this.client.documentosApertura = JSON.parse(JSON.stringify(this.openingDocumentsCopy));
    } else {
      this.client.documentosApertura = [];
    }
    this.loadDocuments(this.client.documentosApertura);
  }

  loadPartial() {
      this.partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
         if(client) {
             this.client = client
             this.loadDocuments(this.client.documentosApertura);
         }  else {
             this.client = new ClienteDto();
         }
      }).catch((e) => this.client = new ClienteDto());
  }

  validateForm(): void {
    if (this.openingDocuments.length === 0) {
      this.partialSave();
    } else {
      if (this.client.documentosApertura.length > 0) {
        if(this.editMode) {
            this.partialSave();
        } else {
            this.validationService.validationForm(this.client, ClientFormSection[ClientFormSection.DOCUMENTOS]).then(response => {
                this.partialSave();
            }).catch((e) => this.handleError(e));
        }
      } else {
        this.notificationService.error('', this.translate.instant('exceptionace.core.clientes.exception.0100159'));
      }
    }
  }

  next() : void {
      if (this.editMode) {

      } else {
          this.navigationService.navigateTo(Section.documents, Section.addressInformation, true);
      }
  }

  partialSave() {
      if (this.editMode) {
          this.busy = this.changeService.putSection(this.client, this.identification, 'documentosPresentados');
          this.busy.then((client) => {
            this.client = client;
            if (this.client.documentosApertura)
              this.openingDocumentsCopy = JSON.parse(JSON.stringify(this.client.documentosApertura));
            this.client.autorizaciones = [];
            this.changeControl();
            this.bindHide();
            this.successUpdate('messages.success.presented-documents', 'messages.success.update');
          }, (e:any) => this.handleError(e));
      } else {
          this.partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
             this.next();
          });
      }
  }
  
  cancel() {
    $('#confirmModal').modal('show');
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

  changeAuthorization (event) {
    if(event) {
        this.authorized = event;
        this.authorized.seccion = 'DOCUMENTOS';
        if (this.client.autorizaciones === null)
            this.client.autorizaciones = [];
        this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
        this.partialSave();
    } else {
        this.client.autorizaciones = [];
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
}
