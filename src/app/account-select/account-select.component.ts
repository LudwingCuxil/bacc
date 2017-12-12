import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AccountsService } from '../portal/account/shared/accounts.service';
import { SecurityService } from 'security-angular/src/app';
import { Currency } from '../currency-select/shared/currency.model';
import { Account } from 'backoffice-ace/src/app/core/deposits-core/shared/account';
import { PartialPersistService } from '../shared/services/partial-persist.service';
import { FormGroup } from '@angular/forms';
import { detectChanges } from '../util/destructuring';

@Component({
  selector: 'pl-account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['./account-select.component.css'],
  providers: [AccountsService]
})
export class AccountSelectComponent implements OnInit, OnChanges {
  @Output() accountUpdated = new EventEmitter<Account>();
  @Input() accountSelected: any;
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Account[];
  @Input() autocomplete = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Input() currency: Currency;
  @Input() account = new Account();
  identification;
  public accounts: Account[] = [];

  constructor(private accountsService: AccountsService,
              private partialPersistService: PartialPersistService,
              private _securityService: SecurityService) {
    this.identification = this._securityService.getCookie('identification');
  }

  ngOnInit() {
    if (!this.options) {
      if (this.partialPersistService.data && this.partialPersistService.data.moneda && this.partialPersistService.data.moneda.codigo) {
        this.fetchAccounts(this.partialPersistService.data.moneda.codigo);
      }
    } else {
      this.accounts = this.options;
      if (this.account && this.account.numeroCuenta) {
        const found = this.accounts.find(item => this.account.numeroCuenta === item.numeroCuenta);
        this.account = found ? found : this.accounts[0];
      } else {
        this.account = this.accounts[0];
      }
      this.accountUpdated.emit(this.account);
    }
  }

  async fetchAccounts(currencyCode: string, accountId?: any) {
    let accounts = await this.accountsService.getAccountsByClient(this.identification, currencyCode);
    if (accounts && accounts.length) {
      this.accounts = accounts;
      this.account = accountId ? this.accounts.find(item => !detectChanges(item.id, accountId)) : this.accounts[0];
      this.accountUpdated.emit(this.account);
    } else {
      this.formGroup.controls[this.controlName].setErrors({'required': true});
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountSelected'] && changes['accountSelected'].currentValue) {
      const {currency, accountId} = changes['accountSelected'].currentValue;
      if (currency) {
        if (accountId) {
          this.fetchAccounts(currency, accountId);
        } else {
          this.fetchAccounts(currency);
        }
      }
    }

    if (changes['account'] && changes['account'].currentValue) {
      if (this.accounts && this.accounts.length) {
        const found = this.accounts.find(item => item.numeroCuenta === changes['account'].currentValue.numeroCuenta);
        if (found) {
          this.account = found;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (newObj) {
      if (this.autocomplete) {
        this.accountUpdated.emit(newObj.item);
      } else {
        this.accountUpdated.emit(newObj);
      }
    }
  }
}
