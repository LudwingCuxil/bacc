import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ClientInformationService} from './portal-header/shared/client-information.service';

import {SecurityService} from 'security-angular/src/app';
import {AvatarInformationService} from './portal-header/shared/avatar-information.service';

declare const window: any;

@Component({
  selector: 'pl-portal-admin',
  templateUrl: './portal-admin-client.component.html',
  styleUrls: ['./portal-admin.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ClientInformationService, AvatarInformationService]
})
export class PortalAdminClientComponent implements OnInit {

  @Input() currency = 'LPS,DLS';

  private identification: string;

  clientAvatar: any = {};
  clientInformation: any = {};
  busy: Promise<any>;

  constructor(private route: ActivatedRoute,
              private avatarInformationService: AvatarInformationService,
              private clientInformationService: ClientInformationService,
              private _securityService: SecurityService) {
  }

  ngOnInit() {
    /*this.route.params.forEach((params: Params) => {
     const id = +params['id'];
     if (!isNaN(id)) {
     this.identification = id.toString();
     this.clientInformationService.getInformationByClient(this.identification).then(identification => {
     this.clientInformation = identification;
     });
     }
     });*/
    this.identification = this._securityService.getCookie('identification');
    this.clientInformationService.getInformationByClient(this.identification).then(identification => {
      this.clientInformation = identification;
    });
  }

}
