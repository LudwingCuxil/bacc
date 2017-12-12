import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild, Output,
    EventEmitter,AfterViewInit} from '@angular/core';
import {TypedocService} from 'backoffice-ace/src/app/core/typedoc/shared/typedoc.service';
import {TypedocSelectComponent} from 'backoffice-ace/src/app/core/typedoc/typedoc-select.component';
import {CountryService} from '../country/shared/country.service';
import {AccountantData} from '../accountant-data/shared/accountant-data';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {ValidationsService} from '../shared/services/validations.service';
import {NotificationsService} from 'angular2-notifications';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {Contador} from '../shared/client/contador';
import {Referencia} from '../shared/client/referencia';
import {TranslateService} from 'ng2-translate';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlParameter} from '../pl-parameter/shared/pl-parameter';
import {ClientFormSection} from '../shared/clientFormSection.enum';
import {Nacionalidad} from '../shared/client/nacionalidad';
import {FormSectionInterface} from '../shared/form-section-interface';
import {Section} from '../shared/section';
import {NavigationService} from '../shared/services/navigation.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {WebFormName} from '../shared/webform-name';
import {ReferenciaComerciante} from '../shared/client/referencia-comerciante';
import {Mode} from '../shared/client/referenceDTO';
import {TypeReference} from '../shared/typeReference';
import {SecurityService} from 'security-angular/src/app';
import {ChangeService} from '../shared/services/change.service';
import {CatalogService} from '../shared/services/catalog.service';
import {PlatformParameters} from 'app/shared/platform-parameters.enum';
import {DocumentoIdentificacion} from '../shared/client/documento-identificacion';
  
declare var $: any;
@Component({
    selector: 'pl-business-data-legal',
    templateUrl: './business-data-legal.component.html',
    styleUrls: ['./business-data-legal.component.css'],
    providers: [TypedocService, CountryService, CatalogService, PlParameterService]
})

export class BusinessDataLegalComponent implements OnInit, FormSectionInterface, AfterViewChecked,AfterViewInit {

    static LIST_REFERENCE_CATALOG = 'referenciasIngreso';
    static PERSON_TYPE_PARAM = 'tipoPersona';
    public mask = [];
    nombreContador = '';
    direccionContador = '';
    typeDocument2URL = environment.apiUrl + '/api/';
    private edit = false;
    private modifying = false;
    private index: number;
    private mode = Mode;
    private contadorRequerido = true;
    private contadorInsert = true;
    private identificationClient: string;
    private authorization: Authorization;
    tipoIdentificacion = new DocumentoIdentificacion();
    @Output() notifyHeader = new EventEmitter();

    @Input() editMode = false;


    @ViewChild('docType') tipeDoc: TypedocSelectComponent;

    merchantReference: ReferenciaComerciante = new ReferenciaComerciante();
    client: ClienteDto;
    merchantReferenceCopy: ReferenciaComerciante[];
    maxDate: any;
    minDate: any;
    private minReference;
    private maxReference;
    startOperationModel: any;
    referenceList = [];
    formGroup: FormGroup;
    businessName: AbstractControl;
    businessActivity: AbstractControl;
    startOperation: AbstractControl;
    businessIncome: AbstractControl;
    nameCounter: AbstractControl;
    private maskIngresos = [/[1-9]/, /[1-9]/, /[1-9]/, '.', /[1-9]/, /[1-9]/]
    identification: AbstractControl;
    nationality: AbstractControl;
    address: AbstractControl;
    phone: AbstractControl;
    phone2: AbstractControl;
    documentIdentification: AbstractControl;
    busy: Promise<any>;
    private plParameters: PlParameter[];
    private plParameter = new PlParameter();
    private disabledField = true;
    private personType;
    private tempIdentificiacion = '';
    private tempTipoIdentificacion = this.tipoIdentificacion;
    private nacionalidad = new Nacionalidad();
    private authorized: Authorized = new Authorized();

    public optionsm = {
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

    heading: string[] = ['references.merchant.code', 'references.merchant.description'];
    headingUpdate: string[] = ['references.merchant.code', 'references.merchant.description', 'references.merchant.mode'];
    values: string[] = ['nombreNegocio', 'actividadNegocios'];
    typeReference = TypeReference;
    max: number = 0;
    min: number = 0;

    selectTypedoc(event: any): void {
        this.mask = event;
        this.merchantReference.contador.tipoIdentificacion = event;
    }

    selectNationality(event: any): void {
        this.merchantReference.contador.nacionalidad = event;
    }

    valuechange(newValue, status) {
        if (newValue) {
            let ob = this.tipeDoc.obtainRegex();
            this.identification.setValidators([Validators.required, Validators.pattern(ob)]);
            this.identification.updateValueAndValidity();
        }

        if (newValue) {
            this.tempIdentificiacion = newValue.toUpperCase();
            this.merchantReference.contador.numeroIdentificacion = this.tempIdentificiacion;
        }


    }

    changeAuthorization(event) {
        if (event) {
            this.authorized = event;
            this.authorized.seccion = 'REFERENCIAS';
            if (this.client.autorizaciones === null)
                this.client.autorizaciones = [];
            this.client.autorizaciones.push(JSON.parse(JSON.stringify(this.authorized)));
            this.partialSave();
            this.bindHide();

        } else {
            this.client.autorizaciones = [];
            this.bindHide();
        }
    }


    public accountantData: AccountantData[] = [];


    onBlurIdentification(newValue: FocusEvent): void {
        let value = (<HTMLInputElement>newValue.srcElement).value;
        if (value && value.includes('@')) {

            value = value.replace(/@/g, ' ');
            this.identification.setValue(value);
            this.identification.updateValueAndValidity();
            this.tempIdentificiacion = value.toUpperCase();
            this.client.identificacion = this.tempIdentificiacion;
        }
    }


    constructor(public translate: TranslateService,
        public service: TypedocService,
        private router: Router,
        private formBuilder: FormBuilder,
        private _validationService: ValidationsService,
        private notificationService: NotificationsService,
        private _navigationService: NavigationService,
        private _partialPersistService: PartialPersistService,
        private _securityService: SecurityService,
        private changeService: ChangeService,
        private catalogService: CatalogService,
        private _changeDetectorRef: ChangeDetectorRef,
        private plParameterService: PlParameterService) {
        this.setUpForm();
        const today = new Date();


        this.maxDate = {
            year: today.getFullYear(),
            month: (today.getMonth() + 1),
            day: today.getDate()
        };
        this.minDate = {
            year: 1920,
            month: 1,
            day: 1
        };

        if (this._partialPersistService.data) {
            this.client = this._partialPersistService.data;
            this.loadIncomeReference();
            if (this.client) {
                if (this.client.referencias) {
                    if (this.client.referencias.referenciasComerciante.length < 1) {

                        this.defaultParametersLegal();

                    }
                }
            }
            if (this.client.tipoPersona == 'N') {

            }
            else {
                this.values = ['contador.nombre', 'contador.direccion'];
                this.tamanio = -1;
                //           if(!this.client.contador.nacionalidad){
                //               this.defaultParametersLegal();
                //           }
            }
        } else {
            //this.defaultParameters();
        }
    }

    setUpForm() {
        this.formGroup = this.formBuilder.group({
            businessName: [{ disabled: this.disabledField }, [Validators.required, Validators.maxLength(60)]],
            businessActivity: [{ disabled: this.disabledField }, [Validators.required, Validators.maxLength(60)]],
            startOperation: [{ disabled: this.disabledField }, []],
            businessIncome: [{ value: '' }, [Validators.required, Validators.maxLength(11)]],
            nameCounter: [{ disabled: this.disabledField }, [Validators.maxLength(60)]],
            identification: [{ value: '', disabled: false }, []],
            nationality: [{ disabled: this.disabledField }, []],
            address: [{ disabled: this.disabledField }, [Validators.maxLength(300)]],
            phone: [{ disabled: this.disabledField }, [Validators.maxLength(12)]],
            phone2: [{ disabled: this.disabledField }, [Validators.maxLength(12)]],
            documentIdentification: [{ disabled: false }, []]
        });

        this.businessName = this.formGroup.controls['businessName'];
        this.businessActivity = this.formGroup.controls['businessActivity'];
        this.startOperation = this.formGroup.controls['startOperation'];
        this.businessIncome = this.formGroup.controls['businessIncome'];
        this.nameCounter = this.formGroup.controls['nameCounter'];
        this.identification = this.formGroup.controls['identification'];
        this.nationality = this.formGroup.controls['nationality'];
        this.address = this.formGroup.controls['address'];
        this.phone = this.formGroup.controls['phone'];
        this.phone2 = this.formGroup.controls['phone2'];
        this.documentIdentification = this.formGroup.controls['documentIdentification'];
        
    }
    
    
    ngAfterViewInit(){
        this.contadorRequerido = false;
        this.contadorRequired();
    }
    
    
    changeRequired(){
        
       
       this.contadorRequerido = !this.contadorRequerido;
        if(this.client.referencias.referenciasComerciante[this.index] && this.client.referencias.referenciasComerciante[this.index].contador){
            if(!this.contadorRequerido){
               this.client.referencias.referenciasComerciante[this.index].contador.modalidad =  this.mode.D;
                if (this.client.tipoPersona == 'J') {
                    this.client.referencias.referenciasComerciante[this.index].modalidad = this.mode.D;
                }
            }
        }
       this.contadorRequired();
    }
    
    contadorRequired(){
      
        
        if(this.contadorRequerido){
        this.documentIdentification.setValidators([Validators.required]);
        this.documentIdentification.updateValueAndValidity();
        this.nationality.setValidators([Validators.required]);
        this.nationality.updateValueAndValidity();
        this.phone.setValidators([Validators.required,Validators.maxLength(12)]);
        this.phone.updateValueAndValidity();
        this.nameCounter.setValidators([Validators.required,Validators.maxLength(60)]);
        this.nameCounter.updateValueAndValidity(); 
        }
        else{
        this.documentIdentification.setValidators([]);
        this.nationality.setValidators([]);
        this.documentIdentification.updateValueAndValidity();
        this.nationality.updateValueAndValidity();
        this.phone.setValidators([]);
        this.phone.updateValueAndValidity();
        this.nameCounter.setValidators([]);
        this.nameCounter.updateValueAndValidity();    
        }
        
    }
    tamanio = 0;
    ngOnInit() {
        if(this.tipeDoc){
            this.tipeDoc.updateTypeDocument(this.typeDocument2URL, 'N');
        }
        if (this.editMode) {
            this.identificationClient = this._securityService.getCookie('identification');
            this.reloadClient();
        } else {
            if (!this.client) {
                this.loadPartial();
                this.getReferenceList();
            }

        }
    }
    
    
    reloadClient(){
     this.busy = this.changeService.getSection(this.identificationClient, 'referenciaComerciante');
            this.busy.then((client) => {
                this.client = client;
                this.getReferenceList();
                this.change();
                if (this.client.tipoPersona == 'J') {
                    this.values = ['contador.nombre', 'contador.direccion'];
                    this.tamanio = -1;
                    if (this.client.referencias) {
                        if (this.client.referencias.referenciasComerciante[this.index]) {
                            if (this.client.referencias.referenciasComerciante[this.index].contador) {
                                this.values = ['contador.nombre', 'contador.direccion'];
                            }
                        }
                    }

                }
                this.personType = client.tipoPersona;
                if (this.client.referencias) {
                    this.merchantReferenceCopy = JSON.parse(JSON.stringify(this.client.referencias.referenciasComerciante));
                }
                this.loadIncomeReference();
                 if (this.client.referencias) {
                        if (this.client.referencias.referenciasComerciante[this.index]) {
                            if (this.client.referencias.referenciasComerciante[this.index].contador) {
                               this.contadorRequerido = true;
                               this.contadorInsert = false;
                            }
                        }
                    }
                this.contadorRequired();
            });    
    }

    ngAfterViewChecked(): void {
        this._changeDetectorRef.detectChanges();
        
    }

    loadIncomeReference() {
        this.catalogService.getCatalogParam('referenciasIngreso/' + this.typeReference[1], 'tipoPersona', this.client.tipoPersona)
            .then((response) => {
                this.minReference = response.minimo;
                this.maxReference = response.maximo;
            });
    }

    isValidCancel(): boolean {
        if ((this.client.referencias.referenciasComerciante.find(item =>
            item.modalidad === this.mode.D ||
            item.modalidad === this.mode.I ||
            item.modalidad === this.mode.U))) {
            return false;
        }else{
            if(this.client.tipoPersona == 'J'){
            return false;    
            }    
        }
        return true;
    }

    isValidChange(): boolean {
        if (this.client && this.client.referencias && this.client.referencias.referenciasComerciante &&
            this.client.referencias.referenciasComerciante.length < this.minReference && this.client.referencias.referenciasComerciante.length > this.maxReference) {
            return true;
        } else {
            if (this.merchantReference.nombreNegocio !=null && this.index !=null &&  this.merchantReference.nombreNegocio && this.client.referencias.referenciasComerciante[this.index].nombreNegocio) {
                let date = new Date(this.client.referencias.referenciasComerciante[this.index].inicioOperaciones);
                let time1 = date.toLocaleDateString();
                let date2 = new Date(this.merchantReference.inicioOperaciones);
                let time2 = date2.toLocaleDateString();
                if (this.merchantReference.nombreNegocio === this.client.referencias.referenciasComerciante[this.index].nombreNegocio &&
                    this.merchantReference.actividadNegocios === this.client.referencias.referenciasComerciante[this.index].actividadNegocios &&
                    time1 === time2 &&
                    this.merchantReference.ingresosDeNegocioPropio === this.client.referencias.referenciasComerciante[this.index].ingresosDeNegocioPropio &&
                    this.merchantReference.contador.nombre === this.client.referencias.referenciasComerciante[this.index].contador.nombre && this.merchantReference.contador.direccion === this.client.referencias.referenciasComerciante[this.index].contador.direccion
                    && this.merchantReference.contador.nacionalidad.codigo === this.client.referencias.referenciasComerciante[this.index].contador.nacionalidad.codigo
                    && this.merchantReference.contador.numeroIdentificacion === this.client.referencias.referenciasComerciante[this.index].contador.numeroIdentificacion
                    && this.merchantReference.contador.telefono1 === this.client.referencias.referenciasComerciante[this.index].contador.telefono1
                    && this.merchantReference.contador.telefono2 === this.client.referencias.referenciasComerciante[this.index].contador.telefono2
                    && this.merchantReference.contador.modalidad === this.client.referencias.referenciasComerciante[this.index].contador.modalidad) {
                    return true;
                }
            }
        }

        return false;
    }

    changeStartOperation(date): void {
        if (date) {
            this.merchantReference.inicioOperaciones = new Date(parseInt(date.year, 10), parseInt(date.month, 10) - 1, parseInt(date.day, 10));
        }
    }

    change() {
        this.edit = true;
        this.disabledField = !this.disabledField;
        this.disabledField ?
            this.formGroup.controls['documentIdentification'].enable() :
            this.formGroup.controls['documentIdentification'].disable();
        this.disabledField ?
            this.formGroup.controls['businessName'].enable() :
            this.formGroup.controls['businessName'].disable();
        this.disabledField ?
            this.formGroup.controls['businessActivity'].enable() :
            this.formGroup.controls['businessActivity'].disable();
        this.disabledField ?
            this.formGroup.controls['startOperation'].enable() :
            this.formGroup.controls['startOperation'].disable();
        this.disabledField ?
            this.formGroup.controls['businessIncome'].enable() :
            this.formGroup.controls['businessIncome'].disable();
        this.disabledField ?
            this.formGroup.controls['nameCounter'].enable() :
            this.formGroup.controls['nameCounter'].disable();
        this.disabledField ?
            this.formGroup.controls['identification'].enable() :
            this.formGroup.controls['identification'].disable();
        this.disabledField ?
            this.formGroup.controls['nationality'].enable() :
            this.formGroup.controls['nationality'].disable();
        this.disabledField ?
            this.formGroup.controls['address'].enable() :
            this.formGroup.controls['address'].disable();
        this.disabledField ?
            this.formGroup.controls['phone'].enable() :
            this.formGroup.controls['phone'].disable();
        this.disabledField ?
            this.formGroup.controls['phone2'].enable() :
            this.formGroup.controls['phone2'].disable();

    }


    addReferencia(merchantReference: ReferenciaComerciante): void {
        if (this.client.tipoPersona == 'J') {
            this.values = ['contador.nombre', 'contador.direccion'];
        }

        merchantReference.contador.telefono2 = merchantReference.contador.telefono2 === null || !merchantReference.contador.telefono2 ? '' : merchantReference.contador.telefono2;
        if (this.modifying) {

            if (this.client.tipoPersona == 'J') {
                this.client.referencias.referenciasComerciante[this.index] = JSON.parse(JSON.stringify(merchantReference));
                if (merchantReference.modalidad !== this.mode.I) {
                    this.client.referencias.referenciasComerciante[this.index].modalidad = this.mode.U;
                }
                this.clean();
            }
            else {
                if (this.validReference(merchantReference, this.index)) {
                    this.client.referencias.referenciasComerciante[this.index] = JSON.parse(JSON.stringify(merchantReference));
                    if (merchantReference.modalidad !== this.mode.I) {
                        this.client.referencias.referenciasComerciante[this.index].modalidad = this.mode.U;
                    }
                    this.clean();
                }
            }

        } else {
            if (this.client.referencias) {
                if (this.validReference(merchantReference)) {
                    merchantReference.modalidad = this.mode.I;
                    this.merchantReference.direccion = null;
                    this.client.referencias.referenciasComerciante.push(JSON.parse(JSON.stringify(merchantReference)));
                    this.clean();
                }
            } else {
                this.client.referencias = new Referencia();
                merchantReference.modalidad = this.mode.I;
                this.merchantReference.direccion = null;
                this.client.referencias.referenciasComerciante.push(JSON.parse(JSON.stringify(merchantReference)));
                this.clean();
            }
        }

        this.tempTipoIdentificacion = null;
    }

    validReference(merchantReference: ReferenciaComerciante, index?: number): boolean {
        let referenceExist = null;
        if (this.client.tipoPersona == 'N') {
            referenceExist = this.client.referencias.referenciasComerciante.filter(item =>
                (item.nombreNegocio ? item.nombreNegocio.trim() === merchantReference.nombreNegocio.trim() : item.nombreNegocio === merchantReference.nombreNegocio) &&
                (item.actividadNegocios ? item.actividadNegocios.trim() === merchantReference.actividadNegocios.trim() : item.actividadNegocios === merchantReference.actividadNegocios) &&
                (item.correlativoReferencia ? item.correlativoReferencia !== merchantReference.correlativoReferencia : item.correlativoReferencia === merchantReference.correlativoReferencia) 
                && item.contador === merchantReference.contador)[this.index];
        }
        else {



            referenceExist = this.client.referencias.referenciasComerciante.filter(item => (item.contador.nombre === merchantReference.contador.nombre) && (item.contador.direccion === merchantReference.contador.direccion));

        }
        if (referenceExist !=null && referenceExist.length != 0 ) {
            this.notificationService.error('Error', this.translate.instant('validations.reference-exist'));
            return false;
        }
        return true;
    }

    clean() {
        this.modifying = false;
        this.edit = true;
        this.merchantReference = new ReferenciaComerciante();
        this.formGroup.controls['startOperation'].setValue(null);
        this.formGroup.controls['identification'].setValue('');
        this.formGroup.controls['nationality'].setValue('');
        this.tempTipoIdentificacion = null;
        this.formGroup.markAsPristine();
        this.formGroup.markAsUntouched();
        this.index =  undefined;

    }

    restoreDependent(dependent: ReferenciaComerciante): void {
        let dependentRestore;
        this.index = this.client.referencias.referenciasComerciante.indexOf(dependent);
        if(dependent.correlativoReferencia){
          dependentRestore = this.client.referencias.referenciasComerciante[this.index];  
        }
        if (dependent && (dependent.modalidad === this.mode.I)) {
            this.client.referencias.referenciasComerciante.splice(this.client.referencias.referenciasComerciante.indexOf(dependentRestore), 1);
        } else {
            if (dependent.correlativoReferencia) {
                dependentRestore = JSON.parse(JSON.stringify(this.merchantReferenceCopy[this.index]));
                if (dependentRestore) {
                   let prov = this.client.referencias.referenciasComerciante[this.index];
                    this.client.referencias.referenciasComerciante[this.client.referencias.referenciasComerciante.indexOf(prov)] = dependentRestore;
                }   
            }
            else {
                dependentRestore = this.merchantReferenceCopy[this.index];
                this.client.referencias.referenciasComerciante[this.index] = dependentRestore;
            }
        }
    }

    removeReferencia(merchantReference): void {
        if (merchantReference.modalidad !== this.mode.I) {
            this.client.referencias.referenciasComerciante[this.index].modalidad = this.mode.D;
        } else {
            this.client.referencias.referenciasComerciante.splice(this.index, 1);
        }
        this.clean();
    }

    modify(merchantReference): void {
        this.index = this.client.referencias.referenciasComerciante.indexOf(merchantReference);
        if (!merchantReference.contador) {
            this.contadorRequerido = false;
            this.contadorInsert = true;
            merchantReference.contador = new Contador();
        }else{
            this.contadorRequerido = true;
            this.contadorInsert = false;
            if(!merchantReference.contador.numeroIdentificacion){
                this.contadorInsert = false;
                this.contadorRequerido = false;
            }
            if(!merchantReference.contador.nacionalidad){
                this.contadorInsert = false;
                this.contadorRequerido = false;
                merchantReference.contador.nacionalidad = new Nacionalidad();
            }
        }
        
       if(!merchantReference.contador && !merchantReference.contador.tipoIdentificacion){
          merchantReference.contador = new Contador();
       }
        
        this.contadorRequired();
        this.merchantReference = merchantReference;
        this.modifying = true;
        this.edit = true;
        this.index = this.client.referencias.referenciasComerciante.indexOf(merchantReference);
        this.formGroup.markAsPristine();
        this.formGroup.markAsUntouched();
        this.merchantReference = JSON.parse(JSON.stringify(merchantReference));
        const parsedDay = new Date(this.merchantReference.inicioOperaciones);
        let a = { year: parsedDay.getFullYear(), month: (parsedDay.getMonth() + 1), day: parsedDay.getDate() };
        this.startOperationModel = a;
        this.tempTipoIdentificacion = this.merchantReference.contador.tipoIdentificacion;
        this.tempIdentificiacion = this.merchantReference.contador.numeroIdentificacion;
        this.nacionalidad = this.merchantReference.contador.nacionalidad;
    }

    restoreReference(reference: ReferenciaComerciante): void {
        this.index = this.client.referencias.referenciasComerciante.indexOf(reference);
        if (reference.modalidad === this.mode.I) {
            this.client.referencias.referenciasComerciante.splice(this.client.referencias.referenciasComerciante.indexOf(reference), 1);
        } else {
            const referenceRestore = JSON.parse(JSON.stringify(this.merchantReferenceCopy[this.index]));
            if (referenceRestore) {
                this.client.referencias.referenciasComerciante[this.index] = JSON.parse(JSON.stringify(referenceRestore));
            }
        }
    }

    cancelReference() {
        this.disableControl();
        this.disabledField = false;
        this.clean();
        if (this.merchantReferenceCopy) {
            this.client.referencias.referenciasComerciante = JSON.parse(JSON.stringify(this.merchantReferenceCopy));
        } else {
            this.client.referencias.referenciasComerciante = [];
        }
    }

    disableControl() {
        for (let key in this.formGroup.controls) {
            this.formGroup.controls[key].disable();
        }
    }

    public cancel() {
        $('#confirmModal').modal('show');
    }

    messageError(title: string, message: string): void {
        this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
    }

    successUpdate(title: string, message: string): void {
        this.notificationService.success(this.translate.instant(title), this.translate.instant(message));
    }

    validateReferences(sizeReferences): boolean {
        
//        let y = 0;
//        for(var x = 0; x < sizeReferences; x++){
//          if(this.client.referencias.referenciasComerciante[x].modalidad === this.mode.D){
//              y++;
//          }   
//        }
//        sizeReferences = sizeReferences -y;
        if(this.client.tipoPersona == 'J'){
            this.minReference = 0;
        }
        
        if (sizeReferences < this.minReference) {
            this.notificationService.error(this.translate.instant('validations.min-references'), this.minReference);
            return false;
        }
        if (sizeReferences > this.maxReference) {
            this.notificationService.error(this.translate.instant('validations.max-references'), this.maxReference);
            return false;
        }
        return true;
    }

    eventSubmit(event) {

    }

    bindHide() {
        if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
            $('#authorizationModal').modal('hide');
        };
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
            let err = JSON.parse(error._body);
            console.log(err.code);
            let tr = this.translate.instant('exceptionace.' + err.code);
            this.notificationService.error('', tr);

        }
    }

    next(): void {
        if (this.editMode) {
            // TODO validate what more to do
        } else {
            this._navigationService.navigateTo(Section.businessDataLegal, Section.providerReference, true);
        }
    }

    validateForm(): void {
         if(!this.index){
                 this.index = 0;    
         } 
        
        if(this.client.referencias.referenciasComerciante[this.index] && this.client.referencias.referenciasComerciante[this.index].contador){
            if(!this.contadorRequerido){
                 this.client.referencias.referenciasComerciante[this.index].contador.modalidad =  this.mode.D;
                
            }
           
        }
        if (this.client.tipoPersona == 'J' &&  this.client.referencias.referenciasComerciante.length == 0 ) {
             this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
                    this.next();
             });
        }else{
             if (this.editMode) {
            if(this.client.referencias.referenciasComerciante[this.index].contador){
                if(this.contadorInsert){
                 this.client.referencias.referenciasComerciante[this.index].contador.modalidad = this.mode.I;   
                }
                let val = '';
                if(!this.client.referencias.referenciasComerciante[this.index].contador && !this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion){
                         val = this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion.toString();
                }
                if(!this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion && val.toString() != '' &&  !this.client.referencias.referenciasComerciante[this.index].contador.numeroIdentificacion){
                this._validationService.getValidationPost('', this.client.referencias.referenciasComerciante[this.index].contador.numeroIdentificacion,
                this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion.codigo).then(response => {
                    this.partialSave();
                }).catch((e) => this.handleError(e)); 
                }else{
                     this.partialSave();
                }
            }else{
               this.partialSave();
            }  
        } else {
                 if (this.client.tipoPersona == 'J' &&  this.client.referencias.referenciasComerciante.length == 1 ) {
                     this._validationService.getValidationPost('', this.client.referencias.referenciasComerciante[0].contador.numeroIdentificacion,
                this.client.referencias.referenciasComerciante[0].contador.tipoIdentificacion.codigo).then(response => {
                    this.partialSave();
                }).catch((e) => this.handleError(e));
                 }else{
                     let val = '';
                     if(!this.client.referencias.referenciasComerciante[this.index].contador && !this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion){
                         val = this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion.toString();
                     }
                if(!this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion && val != '' && !this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion.codigo){
                    this._validationService.getValidationPost('', this.client.referencias.referenciasComerciante[this.index].contador.numeroIdentificacion,
                    this.client.referencias.referenciasComerciante[this.index].contador.tipoIdentificacion.codigo).then(response => {
                    this.partialSave();
                    }).catch((e) => this.handleError(e));
                     }
                     else{
                    this.partialSave(); 
                 }
                } 
                
          
        }
        
        }
       
    }

    loadPartial() {
        this._partialPersistService.getForm(WebFormName[WebFormName.WEBFORM_CLIENTE]).then((client) => {
            if (client) {
                this.client = client;
                if (!this.client) {
                    if (!this.client.referencias) {
                        if (!this.client.referencias.referenciasComerciante[this.index]) {
                            if (!this.client.referencias.referenciasComerciante[this.index].contador) {
                                this.defaultParametersLegal();
                            }
                        }
                    }
                }
                if (this.client.tipoPersona == 'N') {
                    this.loadIncomeReference();
                } else {
                    this.values = ['contador.nombre', 'contador.direccion'];
                    this.defaultParametersLegal();
                }
                if (this.client.tipoPersona == 'J') {
                    this.tamanio = -1;
                }
                console.log('business data', this.client,this.tamanio);
            } else {
                this.client = new ClienteDto();
            }
        }).catch((e) => this.client = new ClienteDto());
       
    }

    partialSave(): void {
        if (this.validateReferences(this.client.referencias.referenciasComerciante.length)) {
            if (this.editMode) {
                this.client.referencias.referenciasComerciante[this.index].direccion = null;
                this.busy = this.changeService.putSection(this.client, this.identificationClient, 'referenciasComerciante');
                this.busy.then((client) => {
                    //this.client = client;
                    
                    this.reloadClient();
                    
                    this.client.autorizaciones = [];
                    this.successUpdate('messages.success.references.merchant', 'messages.success.update');
                    this.bindHide();
                    this.change();
                    this.notifyHeader.emit();
                }, (e: any) => this.handleError(e));
            } else {
                this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client).then((response) => {
                    this.next();
                });
            }
        }
    }

    getReferenceList(): void {
        this.loadIncomeReference();
    }

    getParametrizedReference(reference: String): any {
        return this.referenceList.find(item => item.referencia.tipoReferencia === reference);
    }


    defaultParametersLegal() {
        this.plParameterService.getParameter(PlatformParameters.PARAM_PAISDE)
            .then((plParameters: any) => {
                //        this.plParameter = plParameters;
                //        console.log(this.plParameter);
                let paisOrigen = new Nacionalidad();
                paisOrigen.codigo = plParameters.valor;
                this.nacionalidad = paisOrigen;
                this.merchantReference.contador.nacionalidad = this.nacionalidad;
                //this.client.contador.nacionalidad = paisOrigen ;
                //this.country.setValue(this.plParameters);
            });
    }


}
