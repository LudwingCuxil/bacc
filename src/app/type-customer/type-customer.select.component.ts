import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TipoCliente} from '../shared/client/tipo-cliente';
import {TypeCustomerService} from "./shared/type-customer.service";
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';

@Component({
  selector: 'pl-type-customer-select',
  templateUrl: './type-customer.select.component.html',
  providers: [TypeCustomerService],
  styleUrls: ['./type-customer.select.component.css']
})

export class TypeCustomerSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: TipoCliente[];
  @Input() typeCustomerSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeTypeCustomer: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() typeCustomer = new TipoCliente();
  typeCustomers: TipoCliente[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public typeCustomerService: TypeCustomerService) {
    this.changeTypeCustomer = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'typeCustomer';
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
      this.typeCustomerService.getTypeCustomerService()
        .then((typeCustomers: any) => {
          this.typeCustomers = typeCustomers;
          if (this.typeCustomer != null && this.typeCustomer.codigo != null) {
            const typeCustomerFind = this.typeCustomers.find((item) => item.codigo === this.typeCustomer.codigo);
            this.typeCustomer = typeCustomerFind;
          }
        });
    } else {
      this.typeCustomers = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: TipoCliente) =>
    result.descripcion ? result.descripcion : '' ;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.typeCustomers.slice(0, 20);
      }
      if (terms.term) {
        return this.typeCustomers.filter(v => 
        v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.typeCustomers.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typeCustomerSelected'] !== undefined) {
      if (changes['typeCustomerSelected'].currentValue !== undefined && changes['typeCustomerSelected'].currentValue !== null) {
        if (this.typeCustomers) {
          const typeCustomer = this.typeCustomers.find((item) => item.codigo === changes['typeCustomerSelected'].currentValue);
          if (typeCustomer) {
            this.typeCustomer = typeCustomer;
          }
        }
      }
    }

    if (changes['typeCustomer'] !== undefined) {
      if (this.typeCustomers) {
        const typeCustomer = this.typeCustomers.find((item) => item.codigo === changes['typeCustomer'].currentValue.codigo);
        if (typeCustomer) {
          this.typeCustomer = typeCustomer;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeTypeCustomer.emit(newObj.item);
    } else {
      this.changeTypeCustomer.emit(newObj);
    }
  }

}
