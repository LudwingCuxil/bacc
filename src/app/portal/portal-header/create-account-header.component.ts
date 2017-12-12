import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Location} from '@angular/common';

import {SecurityService} from 'security-angular/src/app/security';

import {NavigationService} from '../../shared/services/navigation.service';
import {PartialPersistService} from '../../shared/services/partial-persist.service';
import {Router} from '@angular/router';
declare var $: any;
@Component({
  selector: 'pl-create-account-header',
  templateUrl: './create-account-header.component.html',
  styleUrls: ['./portal-header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateAccountHeaderComponent implements OnInit, AfterViewChecked {
  account: any;
  fechaAlta: Date;

  constructor(private _navigation: NavigationService,
              private _securityService: SecurityService,
              private _router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              private partialPersistService: PartialPersistService) {
  }

  ngOnInit() {
    this.updateAccount();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  goBack() {
    $('#confirmModal').modal('show');
  }

  updateAccount() {
    this.account = this.partialPersistService.data;
  }
}
