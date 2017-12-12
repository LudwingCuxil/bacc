import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {AccountOfficerService} from './shared/account-officer.service';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {OficialDeCuentas} from '../shared/client/oficial-de-cuentas';

@Component({
  selector: 'pl-account-officer',
  templateUrl: './account-officer.component.html',
  providers: [AccountOfficerService],
  styleUrls: ['./account-officer.component.css']
})

export class AccountOfficerComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: OficialDeCuentas[];
  @Input() accountOfficerSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeOficialDeCuentas: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() accountOfficer = new OficialDeCuentas();
  accountOfficers: OficialDeCuentas[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public accountOfficerService: AccountOfficerService) {
    this.changeOficialDeCuentas = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'accountOfficer';
    }
  }

  ngOnInit() {
    if (!this.options) {
      this.accountOfficerService.getAccountOfficerService({number: 0, size: 1500}, '1', 'false')
        .then((accountOfficers: any) => {
          this.accountOfficers = accountOfficers;
          if (this.accountOfficer !== undefined) {
            if (this.accountOfficer.id !== undefined) {
              const accountOfficerFind = this.accountOfficers.find((item) => item.id.codigo === this.accountOfficer.id.codigo);
              this.accountOfficer = accountOfficerFind;
            }
          }
        });
    } else {
      this.accountOfficers = this.options;
    }
  }

  formatter = (result: OficialDeCuentas) => result.descripcion;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.accountOfficers.slice(0, 20);
      }
      if (terms.term) {
        return this.accountOfficers.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.accountOfficers.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['accountOfficerSelected'] !== undefined) {
      if (changes['accountOfficerSelected'].currentValue !== undefined && changes['accountOfficerSelected'].currentValue !== null) {
        if (this.accountOfficers) {
          const accountOfficer = this.accountOfficers.find((item) => item.id.codigo === changes['accountOfficerSelected'].currentValue);
          if (accountOfficer) {
            this.accountOfficer = accountOfficer;
          }
        }
      }
    }

    if (changes['accountOfficer'] !== undefined) {
      if (this.accountOfficers && changes['accountOfficer'].currentValue !== undefined) {
        const accountOfficer = this.accountOfficers.find((item) => item.id.codigo === changes['accountOfficer'].currentValue.id.codigo);
        if (accountOfficer) {
          this.accountOfficer = accountOfficer;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeOficialDeCuentas.emit(newObj.item);
    } else {
      this.changeOficialDeCuentas.emit(newObj);
    }
  }

}
