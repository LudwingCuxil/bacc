import {
  Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import {NotificationsService} from 'angular2-notifications';
import {AccountsServices} from '../shared/services/accounts.service';
import { AccountSummary } from '../shared/account/account-summary';
import {AccountId} from '../shared/account/account-id';
import {DualListAccountComponent} from './dual-list.component';
import {SecurityService} from 'security-angular/src/app';
@Component({
  selector: 'pl-account-dual-list',
  template: `
    <pl-dual-list [sort]="sort" [source]="accounts" [key]="identifier" [display]="display" [(destination)]="added"
               (onAdded)="onAdded($event)" (onRemoved)="onRemoved($event)" height="265px" [editMode]="editMode"
               (selectAssign)="selectAssig($event)"></pl-dual-list>`,
  styles: [],
  providers: [AccountsServices]
})
export class AccountDualListComponent implements OnInit, AfterViewChecked {

  @ViewChild(DualListAccountComponent) dualListAccount;
  @Input() sort: true;
  @Input() accounts: AccountSummary[] = [];
  @Input() identifier = 'id';
  @Input() display = 'numeroCuenta';
  @Input() added: AccountSummary[] = [];
  @Input() asigned: AccountSummary[] = null;
  @Input() documentType:string;
  @Input() document: string;
  @Input() currency: string[];
  @Input() editMode = false;
  @Output() onRemove: EventEmitter<AccountSummary[]> = new EventEmitter<AccountSummary[]>();
  @Output() onAdd: EventEmitter<AccountSummary[]> = new EventEmitter<AccountSummary[]>();
  @Output() selectedAssign: EventEmitter<any> = new EventEmitter<any>();

  constructor(private notificationService: NotificationsService,
              private accountsServices: AccountsServices,
              private _securityService: SecurityService,
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.loadAll();
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  loadAll(): void {
    if (this.accounts.length === 0) {
      this.accountsServices.getAccountsByClient(' ', this.document, [3], ['A'], this.currency)
      .then((accountsummaries: any) => {
        this.fetchRoles(accountsummaries)
      }).catch((e) => this.handleError(e));
    } else {
      this.fillAsigned(this.accounts);
    }
  }

  selectAssig(event) {
    this.selectedAssign.emit(event);
  }

  fetchRoles(accounts: AccountSummary[]) {
    this.accounts = accounts;
    var accountNumber = this._securityService.getCookie('accountNumber');
    var numberExist = this.accounts.filter((item) => item.numeroCuenta === accountNumber)[0];
    if (numberExist)
      this.accounts.splice(this.accounts.indexOf(numberExist), 1);
    this.fillAsigned(accounts);
  }

  fillAsigned(accounts?: AccountSummary[]) {
    if (this.asigned != null) {
      for (let i = 0; i < this.asigned.length; i++) {
        for (const account of accounts) {
          if (account.id.agencia === this.asigned[i].id.agencia && account.id.correlativo === this.asigned[i].id.correlativo &&
                  account.id.digitoIdentificador === this.asigned[i].id.digitoIdentificador && account.id.digitoVerificador === this.asigned[i].id.digitoVerificador) {
            this.added.push(account);
            break;
          }
        }
      }
      this._changeDetectorRef.detectChanges();
    }
  }

  onAdded(added: any) {
    this.onAdd.emit(added);
    this._changeDetectorRef.detectChanges();
  }

  onRemoved(removed: any) {
    this.onRemove.emit(removed);
    this._changeDetectorRef.detectChanges();
  }

  restoreData(data: any) {
    this.dualListAccount.source = this.accounts;
    this.dualListAccount.destination = data;
    this.dualListAccount.available = JSON.parse(JSON.stringify(this.dualListAccount.availableCopy));
    this.dualListAccount.confirmed = JSON.parse(JSON.stringify(this.dualListAccount.confirmedCopy));
    this.dualListAccount.ngDoCheck();
  }

  handleError(error: any): void {
    if (error._body !== '') {
      this.notificationService.error('An error occurred, status: ' + error.status, JSON.parse(error._body).message);
    } else if (error.status === 404) {
      this.notificationService.alert('No found 404!', 'The server response 404 error');
    } else if (error.status === 500) {
      this.notificationService.error('Internal Error', 'The server response 500 error');
    }
  }

}
