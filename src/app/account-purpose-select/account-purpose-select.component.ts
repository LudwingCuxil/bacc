import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { AccountPurpose } from "./shared/account-purpose.model";
@Component({
  selector: 'pl-account-purpose-select',
  templateUrl: './account-purpose-select.component.html',
  styleUrls: ['./account-purpose-select.component.css'],
  providers: [CatalogService]
})

export class AccountPurposeSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: AccountPurpose[];
  @Input() accountPurposeSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeAccountPurpose: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() accountPurpose = new AccountPurpose();
  accountPurposes: AccountPurpose[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeAccountPurpose = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'accountPurpose';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.descripcion && input.value.descripcion.length > 2) {
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
      this.catalogService.getCatalog('usosCuenta')
        .then((accountPurposes: any) => {
          this.accountPurposes = accountPurposes; 
          if (this.accountPurpose != null && this.accountPurpose.codigo != null) {
            const accountPurposeFind = this.accountPurposes.find((item) => item.codigo === this.accountPurpose.codigo);
            this.accountPurpose = accountPurposeFind;
          }
        });
    } else {
      this.accountPurposes = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: AccountPurpose) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.accountPurposes.slice(0, 20);
      }
      if (terms.term) {
        return this.accountPurposes.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.accountPurposes.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['accountPurposeSelected'] !== undefined) {
      if (changes['accountPurposeSelected'].currentValue !== undefined && changes['accountPurposeSelected'].currentValue !== null) {
        if (this.accountPurposes) {
          const accountPurpose = this.accountPurposes.find((item) => item.codigo === changes['accountPurposeSelected'].currentValue);
          if (accountPurpose) {
            this.accountPurpose = accountPurpose;
          }
        }
      }
    }

    if (changes['accountPurpose'] !== undefined) {
      if (this.accountPurposes && changes['accountPurpose'].currentValue) {
        const accountPurpose = this.accountPurposes.find((item) => item.codigo === changes['accountPurpose'].currentValue.codigo);
        if (accountPurpose) {
          this.accountPurpose = accountPurpose;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeAccountPurpose.emit(newObj.item);
    } else {
      this.changeAccountPurpose.emit(newObj);
    }
  }

}
