import {
  Component, Input, OnInit, ViewEncapsulation, ViewChild, AfterViewChecked, ChangeDetectorRef,
  OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {NavigationService} from '../../shared/services/navigation.service';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap-byte';
import {Subject} from 'rxjs/Subject';
import {Section} from '../../shared/section';
import {Authorization, Authorized} from '../../authorization/shared/authorization';
import {CatalogService} from '../../shared/services/catalog.service';
declare var $: any;
import {NotificationsService} from 'angular2-notifications';
import {TranslateService} from 'ng2-translate';
import {AccountDto} from '../../shared/account/account-dto';
import {AccountResponse} from '../../shared/account/account-response';
import {PlParameterService} from '../../pl-parameter/shared/pl-parameter.service';
import {PlatformParameters} from '../../shared/platform-parameters.enum';
import {EconomicProfileService} from '../../economic-profile/shared/economic-profile.service';
import {ClienteDto} from '../../shared/client/cliente-dto';
import {MnemonicoServices} from '../../shared/services/mnemonico.service';
import {ClientService} from '../../client/shared/client.service';
import {ChangeService} from 'app/shared/services/change.service';
import {ClientUpdateService} from '../../shared/services/client-update.service';
import {SecurityService} from 'security-angular/src/app';


@Component({
  selector: 'pl-portal-content',
  templateUrl: './portal-content.component.html',
  styleUrls: ['./portal-content.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [CatalogService, PlParameterService, EconomicProfileService, ClientService, MnemonicoServices, ChangeService, ClientUpdateService]
})
export class PortalContentComponent implements OnInit, AfterViewChecked, OnDestroy, OnChanges {

  @Input() clientInformation: any;
  @Input() accountInformation: any;
  @Input() validClientInformation: any;
  @ViewChild(NgbTabset) accountTab;
  private busy: Promise<any>;
  client: ClienteDto = new ClienteDto();
  ECONOMIC_RELATIONSHIP_MERCHANT;
  ECONOMIC_RELATIONSHIP_BOTH;
  ECONOMIC_RELATIONSHIP_SALARIED;
  ECONOMIC_RELATIONSHIP_INFORMAL;
  VALID_ECONOMIC_PROFILE = true;
  VALID_LEGAL_REPRESENTATIVE = true;
  VALID_DATO_GENERAL = true;
  VALID_BEN_FIN = true;
  private authorization: Authorization;
  private authorized: Authorized = new Authorized();
  private screen = '';
  private showPhoto = false;
  private showFinger = false;
  subscription: Subject<any>;
  account = new AccountResponse();
  section = Section;
  options = {
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
  pendinSections: any;

  constructor(private route: ActivatedRoute, private _partialPersist: PartialPersistService,
              public translate: TranslateService,
              private navigationService: NavigationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private catalogService: CatalogService,
              private notificationService: NotificationsService,
              private plParameterService: PlParameterService,
              private _nemonicoService: MnemonicoServices,
              private changeService: ChangeService,
              private _clientUpdateService: ClientUpdateService,
              private _clientServie: ClientService,
              private _securityService: SecurityService) {
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  tabChange() {
    if (this.screen && this.screen === 'portalClients') {
      this._partialPersist.data = undefined;
    }
  }

  reprint() {
    console.log(this.accountInformation);
    if (!this.navigationService.account.jointRequired && !this.navigationService.account.finalRequired && this.VALID_BEN_FIN && this.VALID_DATO_GENERAL) {
      this.busy = this.catalogService.getReportAuthorizationPost('1');
      this.busy.then((response: any) => {
      }).catch((e) => this.handleError(e));
    }
  }

  face() {
    this.busy = this._clientServie.dequeueFaceFinger(this.clientInformation.id.tipoIdentificacion, this.clientInformation.id.identificacion, 'F', this.clientInformation.nombre);
    this.busy.then((response: any) => {
    }).catch((e) => this.handleError(e));
  }

  finger() {
    this.busy = this._clientServie.dequeueFaceFinger(this.clientInformation.id.tipoIdentificacion, this.clientInformation.id.identificacion, 'H', this.clientInformation.nombre);
    this.busy.then((response: any) => {
    }).catch((e) => this.handleError(e));
  }

  changeAuthorization(event) {
    if (event) {
      this.bindHide();
      this.account.digitoIdentificador = this.accountInformation.id.digitoIdentificador;
      this.account.agencia = this.accountInformation.id.agencia;
      this.account.digitoVerificador = this.accountInformation.id.digitoVerificador;
      this.account.correlativo = this.accountInformation.id.correlativo;
      this.generateReport(event);
    } else {
      this.bindHide();
    }
  }

  generateReport(event) {
     
    console.log(event,this.accountInformation);
      this.account.estado = this.accountInformation.estado;
    this.busy = this.plParameterService.getParameter(PlatformParameters.PARAM_EMPRSA);
    this.busy.then(business => {
      if (business) {
        this.busy = this.catalogService.getReportRePost(this.account, business.valor, this.authorization.supervisor);
        this.busy.then((response: any) => {
          window.open('data:application/pdf;base64,' + response._body);
        });
      }
    });


  }

  bindHide() {
    if (($('#authorizationModal').data('bs.modal') || {}).isShown) {
      $('#authorizationModal').modal('hide');
    }
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
    
    handleErrorMessage(e){
    }

  async ngOnInit() {
    this.screen = this.route.snapshot.url[0].path;
    if (this.navigationService) {
      this.subscription = this.navigationService.navigationChange.subscribe(navigation => {
        this.accountTab.select(navigation.section);
        //        this.header.updateAccount();
      });
    }


    const economicRelationship = await this.plParameterService.getParametersLists('CLIENTE', 'SITUEMPLEO');
    this.ECONOMIC_RELATIONSHIP_SALARIED = parseInt(economicRelationship[0].id.codigo.trim(), 10);
    this.ECONOMIC_RELATIONSHIP_MERCHANT = parseInt(economicRelationship[1].id.codigo.trim(), 10);
    this.ECONOMIC_RELATIONSHIP_BOTH = parseInt(economicRelationship[2].id.codigo.trim(), 10);
    this.ECONOMIC_RELATIONSHIP_INFORMAL = parseInt(economicRelationship[3].id.codigo.trim(), 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientInformation'] !== undefined) {
      if (changes['clientInformation'].currentValue !== undefined && changes['clientInformation'].currentValue.id) {
        this.clientInformation = changes['clientInformation'].currentValue;
        this.updateEconomicProfile();
        this.isValidEconomicProfile();
      }
    }
    if (changes['accountInformation'] !== undefined) {
      if (changes['accountInformation'].currentValue !== undefined && changes['accountInformation'].currentValue.id) {
        this.accountInformation = changes['accountInformation'].currentValue;
        this.validSectionAccount();
      }
    }
  }

  updateEconomicProfile() {


    this.busy = this.plParameterService.getParameter(PlatformParameters.PARAM_EMPRSA);
    this.busy.then(business => {
      if (business) {
        this.busy = this._nemonicoService.getShowHuellafoto(this.clientInformation.tipoPersona, business.valor);
        this.busy.then((response: any) => {
          this.showPhoto = response.tomaFoto;
          this.showFinger = response.tomaHuella;
        }).catch((e) => this.handleErrorMessage(e));
      }
    });


    this.busy = this._clientUpdateService.getClientInfo(this.clientInformation.id.identificacion);
    this.busy.then((client) => {
      this.client = new ClienteDto();
      this.pendinSections = client;
      this.client.perfilEconomico.relacionEconomica = client.relacionEconomica;
    });
  }
  
  async isValidEconomicProfile() {
    const validEconomic = await this._clientUpdateService.validEconomicProfile(this.clientInformation.id.identificacion);
    console.log(validEconomic);
    if (validEconomic) { 
      if(validEconomic.tipoPersona === 'N'){
        this.VALID_ECONOMIC_PROFILE = validEconomic.relacionEconomica;
      } else {
        this.VALID_LEGAL_REPRESENTATIVE = validEconomic.representanteLegal;
      }
    }
  }
  
  async validSectionAccount() {
    const validSection = await this.catalogService.validSectionAccount(this.accountInformation.numeroCuenta);
    if (validSection) {
      this.VALID_DATO_GENERAL = validSection.datoGeneral;
      this.VALID_BEN_FIN = validSection.beneficiarioFinal;
    }
  }

  testMerchantReference(): string {
    if (this.pendinSections) {
      return this.pendinSections.referenciasComerciante === 0 ? '#F44336' : '';
    }
    return '';
  }

  testSalariedReference(): string {
    if (this.pendinSections) {
      return this.pendinSections.referenciasLaborales === 0 ? '#F44336' : '';
    }
    return '';
  }

  testAddressReferences(): string {
    if (this.pendinSections) {
      if (this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH
        || this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_SALARIED) {
        if (this.pendinSections.referenciasLaborales === 0 || this.pendinSections.referenciasLaborales > this.pendinSections.direccionTrabajo) {
          return '#F44336';
        }
      }
      if (this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH
        || this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_MERCHANT) {
        if (this.pendinSections.referenciasComerciante === 0 || this.pendinSections.referenciasComerciante > this.pendinSections.direccionComercio) {
          return '#F44336';
        }
      }
    }
    return '';
  }

  testLegalRepresentative(): string {
    if (this.pendinSections) {
      if ((this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_MERCHANT || this.pendinSections.relacionEconomica === this.ECONOMIC_RELATIONSHIP_BOTH)
        && this.pendinSections.representanteLegal === 0) {
        return '#F44336';
      }
    }
    return '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
