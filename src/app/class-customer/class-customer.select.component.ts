import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ClaseCliente} from '../shared/client/clase-cliente';
import {ClassCustomerService} from './shared/class-customer.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';

@Component({
  selector: 'pl-class-customer-select',
  templateUrl: './class-customer.select.component.html',
  providers: [ClassCustomerService],
  styleUrls: ['./class-customer.select.component.css']
})

export class ClassCustomerSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() typePerson = 'N';
  @Input() classClient;
  @Input() options: ClaseCliente[];
  @Input() classCustomerSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeClassCustomer: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() classCustomer = new ClaseCliente();
  classCustomers: ClaseCliente[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public classCustomerService: ClassCustomerService) {
    this.changeClassCustomer = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'classCustomer';
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
      this.classCustomerService.getclassCustomerService()
        .then((classCustomers: any) => {
            if(this.typePerson=='J'){
            this.classCustomers = classCustomers.filter((item) => item.codigo != this.classClient); 
          }else{
            this.classCustomers = classCustomers;
          }
            
            //this.classCustomers = classCustomers;
          if (this.classCustomer != null && this.classCustomer.codigo != null) {
            const classCustomerFind = this.classCustomers.find((item) => item.codigo === this.classCustomer.codigo);
            this.classCustomer = classCustomerFind;
          }
        });
    } else {
      this.classCustomers = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: ClaseCliente) =>
     result.descripcion ? result.descripcion : '' ;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.classCustomers.slice(0, 20);
      }
      if (terms.term) {
        return this.classCustomers.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1)
      }
      return this.classCustomers.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['classCustomerSelected'] !== undefined) {
      if (changes['classCustomerSelected'].currentValue !== undefined && changes['classCustomerSelected'].currentValue !== null) {
        if (this.classCustomers) {
          const classCustomer = this.classCustomers.find((item) => item.codigo === changes['classCustomerSelected'].currentValue);
          if (classCustomer) {
            this.classCustomer = classCustomer;
          }
        }
      }
    }

    if (changes['classCustomer'] !== undefined) {
      if (this.classCustomers) {
        const classCustomer = this.classCustomers.find((item) => item.codigo === changes['classCustomer'].currentValue.codigo);
        if (classCustomer) {
          this.classCustomer = classCustomer;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeClassCustomer.emit(newObj.item);
    } else {
      this.changeClassCustomer.emit(newObj);
    }
  }

}
