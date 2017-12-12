import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { AccountSummary } from '../shared/account/account-summary';
import {AccountsServices} from '../shared/services/accounts.service';
@Component({
  selector: 'pl-account-selected',
  templateUrl: './account-select.component.html',
  styleUrls: ['./account-select.component.css'],
  providers: [AccountsServices]
})

export class AccountSelectedComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: AccountSummary[];
  @Input() accountSummarySelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeAccountSummary: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() accountSummary = new AccountSummary();
  @Input() documentType: string;
  @Input() document: string;
  @Input() currency: string[];
  accountSummaries: AccountSummary[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public accountsServices: AccountsServices) {
    this.changeAccountSummary = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'accountSummary';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.numeroCuenta && input.value.numeroCuenta.length > 2) {
          return null;
        }
      }
    }
    return {
      'required': true
    };
  }

  ngOnInit() {
    if (!this.options) {
      this.accountsServices.getAccountsByClient(this.documentType, this.document, [3], ['A,'], this.currency)
        .then((accountSummaries: any) => {
          this.accountSummaries = accountSummaries; 
          if (this.accountSummary != null && this.accountSummary.id != null && this.accountSummary.id) {
            const accountSummaryFind = this.accountSummaries.find((item) => item.id.correlativo === this.accountSummary.id.correlativo);
            this.accountSummary = accountSummaryFind;
          }
        });
    } else {
      this.accountSummaries = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: AccountSummary) =>
    result.numeroCuenta ? result.numeroCuenta : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.accountSummaries.slice(0, 20);
      }
      if (terms.term) {
        return this.accountSummaries.filter(v => v.numeroCuenta.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.accountSummaries.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['accountSummarySelected'] !== undefined) {
      if (changes['accountSummarySelected'].currentValue !== undefined && changes['accountSummarySelected'].currentValue !== null) {
        if (this.accountSummaries) {
          const accountSummary = this.accountSummaries.find((item) => item.id.correlativo === changes['accountSummarySelected'].currentValue);
          if (accountSummary) {
            this.accountSummary = accountSummary;
          }
        }
      }
    }

    if (changes['accountSummary'] !== undefined) {
      if (this.accountSummaries && changes['accountSummary'].currentValue) {
        const accountSummary = this.accountSummaries.find((item) => item.id.correlativo === changes['accountSummary'].currentValue.id.correlativo);
        if (accountSummary) {
          this.accountSummary = accountSummary;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAccountSummary.emit(newObj.item);
    } else {
      this.changeAccountSummary.emit(newObj);
    }
  }

}
