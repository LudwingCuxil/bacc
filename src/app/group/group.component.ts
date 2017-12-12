import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Mode} from '../shared/client/referenceDTO';
import {Authorization, Authorized} from '../authorization/shared/authorization';
import {ClienteDto} from '../shared/client/cliente-dto';
import {EconomicGroup} from './shared/economic-group';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {SecurityService} from 'security-angular/src/app/security';

@Component({
  selector: 'pl-economic-group',
  templateUrl: './group.component.html',
  styles: []
})
export class GroupComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() editMode;
  @Input() changeMode = false;
  identification: string;
  edit = false;
  mode = Mode;

  referenceListCopy: EconomicGroup[] = [];
  referenceList = [];
  heading: string[] = ['perfil-economico.grupo-economico', 'table.actions'];
  headingEdit: string[] = ['perfil-economico.grupo-economico', 'table.actions'];
  values: string[] = ['descripcion'];
  disabledField = false;
  pattern = /^[\u00E0-\u00FCña-zÑA-Z\s]+$/;
  authorization: Authorization;
  authorized: Authorized;
  maxDate: any;
  minDate: any;
  relationship;
  busy: Promise<any>;
  @Input() client: ClienteDto = new ClienteDto();
  economicGroup: EconomicGroup = new EconomicGroup();
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

  formGroup: FormGroup;
  economicGroupInput: AbstractControl;

  constructor(public formBuilder: FormBuilder,
              private notificationService: NotificationsService,
              private _securityService: SecurityService,
              private _translateService: TranslateService,
              private _partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef) {
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
      if (!this.client.perfilEconomico.gruposEconomicos) {
        this.client.perfilEconomico.gruposEconomicos = [];
      }
    }
  }

  ngOnInit() {
    if (this.client.perfilEconomico) {
      if (!this.client.perfilEconomico.gruposEconomicos) {
        this.client.perfilEconomico.gruposEconomicos = [];
      }
    }
    if (this.editMode) {
      this.identification = this._securityService.getCookie('identification');
      if (this.changeMode) {
        this.disableControls();
      }
    } else {
      this.enableControls();
    }
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  restoreReference(personal: EconomicGroup): void {
    const economicGroup = this.client.perfilEconomico.gruposEconomicos.find((item) => personal.id.grupo === item.id.grupo && personal.id.tipoGrupo === item.id.tipoGrupo);
    if (personal.modalidad === this.mode.I) {
      this.client.perfilEconomico.gruposEconomicos.splice(this.client.perfilEconomico.gruposEconomicos.indexOf(economicGroup), 1);
    } else {
      const personalRestore = this.referenceListCopy.filter(item => personal.id.grupo === item.id.grupo && personal.id.tipoGrupo === item.id.tipoGrupo)[0];
      if (personalRestore) {
        personalRestore.modalidad = undefined;
        this.client.perfilEconomico.gruposEconomicos[this.client.perfilEconomico.gruposEconomicos.indexOf(economicGroup)] = JSON.parse(JSON.stringify(personalRestore));
      }
    }
    this.clean();
  }

  removeReference(): void {
    if (this.economicGroup.modalidad !== this.mode.I) {
      this.client.perfilEconomico.gruposEconomicos.find((item) => this.economicGroup.id.grupo === item.id.grupo && this.economicGroup.id.tipoGrupo === item.id.tipoGrupo).modalidad = this.mode.D;
    } else {
      const ref = this.client.perfilEconomico.gruposEconomicos.find((item) => this.economicGroup.id.grupo === item.id.grupo && this.economicGroup.id.tipoGrupo === item.id.tipoGrupo);
      this.client.perfilEconomico.gruposEconomicos.splice(this.client.perfilEconomico.gruposEconomicos.indexOf(ref), 1);
    }
    this.clean();
  }

  addReference(): void {
    if (this.edit) {
      const group = this.client.perfilEconomico.gruposEconomicos.find((item) => this.economicGroup.id.grupo === item.id.grupo && this.economicGroup.id.tipoGrupo === item.id.tipoGrupo);
      this.client.perfilEconomico.gruposEconomicos[this.client.perfilEconomico.gruposEconomicos.indexOf(group)] = JSON.parse(JSON.stringify(this.economicGroup));
      if (this.economicGroup.modalidad !== this.mode.I) {
        this.client.perfilEconomico.gruposEconomicos.find((item) => this.economicGroup.id.grupo === item.id.grupo && this.economicGroup.id.tipoGrupo === item.id.tipoGrupo).modalidad = this.mode.U;
      }
    } else {
      if (this.isInvalidChange()) {
        this.economicGroup.modalidad = this.mode.I;
        this.client.perfilEconomico.gruposEconomicos.push(JSON.parse(JSON.stringify(this.economicGroup)));
      }
    }
    this.clean();
  }

  isInvalidChange() {
    if (this.client.perfilEconomico.gruposEconomicos.find((item) => this.economicGroup.id.grupo === item.id.grupo && this.economicGroup.id.tipoGrupo === item.id.tipoGrupo)) {
      this._translateService.get('validations.economic-group-exists').subscribe((item) => {
        this.notificationService.error('Error', item);
      });
      return false;
    }
    return true;
  }

  selectRecord(event: EconomicGroup) {
    this.edit = true;
    this.economicGroup = JSON.parse(JSON.stringify(event));
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  selectGroup(event: EconomicGroup): void {
    this.economicGroup = event;
  }

  handleError(error: any): void {
    if (error.status === 428) {
    } else if (error._body !== '') {
      this._translateService.get('exceptionace.' + JSON.parse(error._body).code).subscribe(title => {
        this.notificationService.error('An error occurred, status: ' + error.status, title);
      });
    } else if (error.status === 404) {
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.notificationService.error('Internal Error', 'The server response 500 error');
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

  clean(): void {
    this.edit = false;
    this.economicGroup = new EconomicGroup();
    this.economicGroupInput.setValue(new EconomicGroup());
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }

  setUpForm(): void {
    this.formGroup = this.formBuilder.group({
      economicGroupInput: [{
        value: new EconomicGroup(),
        disabled: this.disabledField
      }, Validators.compose([Validators.required])],
    });
    this.economicGroupInput = this.formGroup.controls['economicGroupInput'];
  }

  enableControls(): void {
    this.disabledField = false;
    this.economicGroupInput.enable();
  }

  disableControls(): void {
    this.disabledField = true;
    this.economicGroupInput.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes !== undefined && changes['changeMode'] !== undefined) {
      if (changes['changeMode'].currentValue) {
        this.ngOnInit();
        this.setUpForm();
        this.disableControls();
      } else {
        this.enableControls();
      }
    }
  }
}
