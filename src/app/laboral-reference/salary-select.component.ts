import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Salario} from '../shared/client/salario';

@Component({
  selector: 'pl-salary-select',
  templateUrl: './salary-select.component.html',
  styleUrls: ['./salary-select.component.css'],
  providers: [CatalogService]
})

export class SalarySelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Salario[];
  @Input() salarySelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeSalary: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() salary = new Salario();
  wages: Salario[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeSalary = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'salary';
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
      this.catalogService.getCatalog('rangoSueldos')
        .then((wages: any) => {
          this.wages = wages; 
          if (this.salary != null && this.salary.codigo != null) {
            const salaryFind = this.wages.find((item) => item.codigo === this.salary.codigo);
            this.salary = salaryFind;
          }
        });
    } else {
      this.wages = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Salario) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.wages.slice(0, 20);
      }
      if (terms.term) {
        return this.wages.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.wages.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salarySelected'] !== undefined) {
      if (changes['salarySelected'].currentValue !== undefined && changes['salarySelected'].currentValue !== null) {
        if (this.wages) {
          const salary = this.wages.find((item) => item.codigo === changes['salarySelected'].currentValue);
          if (salary) {
            this.salary = salary;
          }
        }
      }
    }

    if (changes['salary'] !== undefined) {
      if (this.wages && changes['salary'].currentValue) {
        const salary = this.wages.find((item) => item.codigo === changes['salary'].currentValue.codigo);
        if (salary) {
          this.salary = salary;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeSalary.emit(newObj.item);
    } else {
      this.changeSalary.emit(newObj);
    }
  }

}
