import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ClientInformationService} from './shared/client-information.service';
import {AccountInformationService} from './shared/account-information.service';
import {NavigationService} from '../../shared/services/navigation.service';
import {AvatarInformationService} from './shared/avatar-information.service';
import {SecurityService} from 'security-angular/src/app';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from 'rxjs/Subject';
import {LockServices} from '../../shared/services/lock.service';

declare const $: any;
declare const window: any;

@Component({
  selector: 'pl-portal-header',
  templateUrl: './portal-header.component.html',
  styleUrls: ['./portal-header.component.css'],
  providers: [ClientInformationService, AccountInformationService, AvatarInformationService, LockServices],
  encapsulation: ViewEncapsulation.None,
})
export class PortalHeaderComponent implements OnInit, OnDestroy {

  subscriptionNameChange: Subject<any>;
  @Input() clientInformation: any;
  @Input() accountInformation: any;
  clientBack = 'client';
  accountBack = 'account';
  private identification: string;

  clientAvatar: any = '';
  informationClient;

  @Input() currency = 'LPS,DLS';

  busy: Promise<any>;

  constructor(private navigation: NavigationService,
              private route: ActivatedRoute,
              private _router: Router,
              private sanitizer: DomSanitizer,
              private avatarInformationService: AvatarInformationService,
              private lockService: LockServices,
              private _securityService: SecurityService) {
  }

  ngOnInit() {
    this.loadAll();
    if (this.navigation) {
      this.subscriptionNameChange = this.navigation.nameChange.subscribe(updateName => {
        if (updateName.datosGeneralesPersonaNatural) {
          this.clientInformation.nombre = this.composeName(updateName.datosGeneralesPersonaNatural);
        } else if (updateName.datosGeneralesPersonaJuridica) {
          this.clientInformation.nombre = updateName.datosGeneralesPersonaJuridica.razonSocial;
        } else if (this.accountInformation) {
          console.log(this.accountInformation.nombre = updateName.datoGeneral.nombre);
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscriptionNameChange.unsubscribe();
  }

  loadAll(): void {
    this.route.params.forEach((params: Params) => {
      const id = +params['id'];
      this.informationClient = id;

    });
    this.identification = this._securityService.getCookie('identification');
    this.avatarInformationService.getAvatar(this.identification).then(clientAvatar => {
      const urlCreator = window.URL;
      const imageUrl = urlCreator.createObjectURL(clientAvatar);
      this.clientAvatar = <string>this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);
    });
  }

  composeName(ben: any): any {
    return '' + ben.primerApellido.trim() + (ben.segundoApellido.trim() ? ' ' + ben.segundoApellido.trim() : ' ')
      + (ben.apellidoCasada.trim() ? ' DE ' + ben.apellidoCasada.trim() : '')
      + (' ' + ben.primerNombre.trim()) + (ben.segundoNombre.trim() ? ' ' + ben.segundoNombre.trim() : '');
  }

  goBack(value: any) {

    if (value === this.accountBack) {
      this._router.navigate(['/portalClients']);
    } else if (value === this.clientBack) {
      this._router.navigate(['/create']);

      this._securityService.deleteCookie('identification');
      this._securityService.deleteCookie('client_signature');
      this._securityService.deleteCookie('client_mancomunado');
      this._securityService.deleteCookie('account_mancomunado');
      this._securityService.deleteCookie('account_signature');
      this._securityService.deleteCookie('accountNumber');

      this.navigation.client.natural = false;
      this.navigation.client.legal = false;

      this.lockService.cancelLock(this.clientInformation.id).then((item) => {
      }).catch(e => console.error(e));
    }
  }

}
