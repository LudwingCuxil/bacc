import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {ClienteDto} from '../shared/client/cliente-dto';
import {ValidationsService} from '../shared/services/validations.service';
import {NotificationsService} from 'angular2-notifications';
import {NavigationService} from '../shared/services/navigation.service';
import {PartialPersistService} from '../shared/services/partial-persist.service';
import {Authorization} from '../authorization/shared/authorization';
import {Section} from '../shared/section';
import {WebFormName} from '../shared/webform-name';
import {MnemonicoServices} from '../shared/services/mnemonico.service';
import {ClientService} from '../client/shared/client.service';
import {PlParameterService} from '../pl-parameter/shared/pl-parameter.service';
import {PlatformParameters} from '../shared/platform-parameters.enum';


@Component({
  selector: 'pl-customer-created',
  templateUrl: './customer-created.component.html',
  styleUrls: ['./customer-created.component.css'],
  providers: [ClientService, MnemonicoServices, PlParameterService]
})
export class CustomerCreatedComponent implements OnInit, AfterViewChecked {


  showPhoto = false;
  showFinger = false;
  @Input() editMode = false;
  client: ClienteDto;
  authorization: Authorization;
  private busy: Promise<any>;

  constructor(public translate: TranslateService,
              private _validationService: ValidationsService,
              private notificationService: NotificationsService,
              private _navigationService: NavigationService,
              private plParameterService: PlParameterService,
              private _nemonicoService: MnemonicoServices,
              private _detectorChange: ChangeDetectorRef,
              private _partialPersistService: PartialPersistService,
              private _changeDetectorRef: ChangeDetectorRef, private _clientServie: ClientService) {
    if (this._partialPersistService.data) {
      this.client = this._partialPersistService.data;
    }


    this.busy = this.plParameterService.getParameter(PlatformParameters.PARAM_EMPRSA);
    this.busy.then(business => {
      if (business) {
        this.busy = this._nemonicoService.getShowHuellafoto(this.client.tipoPersona, business.valor);
        this.busy.then((response: any) => {
          this.showPhoto = response.tomaFoto;
          this.showFinger = response.tomaHuella;
        }).catch((e) => this.handleError(e));
      }
    });

  }

  ngOnInit() {
    this._navigationService.navigationChange.emit();
  }


  ngAfterViewChecked(): void {
    this._detectorChange.detectChanges();
  }

  face() {
    this.busy = this._clientServie.dequeueFaceFinger(this.client.clienteResumen.id.tipoIdentificacion, this.client.clienteResumen.id.identificacion, 'F', this.client.clienteResumen.nombre);
    this.busy.then((response: any) => {
    }).catch((e) => this.handleError(e));
  }

  finger() {
    this.busy = this._clientServie.dequeueFaceFinger(this.client.clienteResumen.id.tipoIdentificacion, this.client.clienteResumen.id.identificacion, 'H', this.client.clienteResumen.nombre);
    this.busy.then((response: any) => {
    }).catch((e) => this.handleError(e));
  }

  next(): void {
    if (this.editMode) {
      // TODO validate what more to do
    } else {
      this._navigationService.navigateTo(Section.customerCreated, Section.reference, true);
      this._partialPersistService.saveOrUpdate(WebFormName[WebFormName.WEBFORM_CLIENTE], this.client);
    }
  }

  handleError(error) {

  }

}
