import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NoCustomerEmployeesService} from './shared/no-customer-employees.service';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {EmpleadosNoClientes} from '../shared/client/empleados-no-clientes';

@Component({
  selector: 'pl-no-customer-employees-select',
  templateUrl: './no-customer-employees-select.component.html',
  providers: [NoCustomerEmployeesService],
  styleUrls: ['./no-customer-employees-select.component.css']
})

export class NoCustomerEmployeesComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: EmpleadosNoClientes[];
  @Input() noCustomerEmployeesSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeEmpleadosNoClientes: EventEmitter<any>;
  @Input() autocomplete = false;
    @Input() endpoint:string;
  @Input() noCustomerEmployees = new EmpleadosNoClientes();
  noCustomerEmployeess: EmpleadosNoClientes[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public noCustomerEmployeesService: NoCustomerEmployeesService) {
    this.changeEmpleadosNoClientes = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'noCustomerEmployees';
    }
  }

  ngOnInit() {
    if (!this.options) {
      this.noCustomerEmployeesService.getNoCustomerEmployees('1',this.endpoint)
        .then((noCustomerEmployeess: any) => {
          this.noCustomerEmployeess = noCustomerEmployeess;
          if (this.noCustomerEmployees) {
              const noCustomerEmployeesFind = this.noCustomerEmployeess.find((item) => item.codigo == this.noCustomerEmployees.codigo);
              this.noCustomerEmployees = noCustomerEmployeesFind;
          }
        });
    } else {
      this.noCustomerEmployeess = this.options;
    }
  }

  formatter = (result: EmpleadosNoClientes) => result.nombre ? result.nombre : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.noCustomerEmployeess.slice(0, 20);
      }
      if (terms.term) {
        return this.noCustomerEmployeess.filter(v => v.nombre.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.noCustomerEmployeess.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['noCustomerEmployeesSelected'] !== undefined) {
      if (changes['noCustomerEmployeesSelected'].currentValue !== undefined && changes['noCustomerEmployeesSelected'].currentValue !== null) {
        if (this.noCustomerEmployeess) {
          const noCustomerEmployees = this.noCustomerEmployeess.find((item) => item.codigo === changes['noCustomerEmployeesSelected'].currentValue);
          if (noCustomerEmployees) {
            this.noCustomerEmployees = noCustomerEmployees;
          }
        }
      }
    }

    if (changes['noCustomerEmployees'] !== undefined) {
      if (this.noCustomerEmployeess && changes['noCustomerEmployees'].currentValue !== undefined) {
        const noCustomerEmployees = this.noCustomerEmployeess.find((item) => item.codigo === changes['noCustomerEmployees'].currentValue.id.codigo);
        if (noCustomerEmployees) {
          this.noCustomerEmployees = noCustomerEmployees;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeEmpleadosNoClientes.emit(newObj.item);
    } else {
      this.changeEmpleadosNoClientes.emit(newObj);
    }
  }

}
