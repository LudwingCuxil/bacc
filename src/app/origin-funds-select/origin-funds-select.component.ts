import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { OriginFund } from "./shared/origin-fund.model";
@Component({
  selector: 'pl-origin-funds-select',
  templateUrl: './origin-funds-select.component.html',
  styleUrls: ['./origin-funds-select.component.css'],
  providers: [CatalogService]
})

export class OriginFundsSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: OriginFund[];
  @Input() originFundSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeOriginFund: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() originFund = new OriginFund();
  originFunds: OriginFund[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeOriginFund = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'originFund';
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
      this.catalogService.getCatalog('origenesFondo')
        .then((originFunds: any) => {
          this.originFunds = originFunds; 
          if (this.originFund != null && this.originFund.codigo != null) {
            const originFundFind = this.originFunds.find((item) => item.codigo === this.originFund.codigo);
            this.originFund = originFundFind;
          }
        });
    } else {
      this.originFunds = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: OriginFund) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.originFunds.slice(0, 20);
      }
      if (terms.term) {
        return this.originFunds.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.originFunds.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['originFundSelected'] !== undefined) {
      if (changes['originFundSelected'].currentValue !== undefined && changes['originFundSelected'].currentValue !== null) {
        if (this.originFunds) {
          const originFund = this.originFunds.find((item) => item.codigo === changes['originFundSelected'].currentValue);
          if (originFund) {
            this.originFund = originFund;
          }
        }
      }
    }

    if (changes['originFund'] !== undefined) {
      if (this.originFunds && changes['originFund'].currentValue) {
        const originFund = this.originFunds.find((item) => item.codigo === changes['originFund'].currentValue.codigo);
        if (originFund) {
          this.originFund = originFund;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeOriginFund.emit(newObj.item);
    } else {
      this.changeOriginFund.emit(newObj);
    }
  }

}
