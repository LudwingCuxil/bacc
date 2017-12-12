import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {isObject} from 'util';
import {FormControl, FormGroup} from '@angular/forms';
import {DepartmentService} from './shared/department.service';
import {Department} from './shared/department';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Region} from '../region/shared/region';


@Component({
  selector: 'pl-department-select',
  templateUrl: './department-select.component.html',
  styles: [``],
  providers: [DepartmentService]
})

export class DepartmentSelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Department[];
  @Input() departmentSelected: string;
  @Input() region: Region;
  @Output() changeDepartment: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() department = new Department();
  departments: Department[] = [];
  data: Department[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(public departmentService: DepartmentService) {
    this.changeDepartment = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'department';
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
      this.departmentService.getDepartments()
        .then((departments: any) => {
          this.departments = departments;
          this.data = departments;
          if (this.department != null && this.department.id.codigo != null) {
            const departmentFind = this.departments.find((item) => item.id.codigo === this.department.id.codigo && item.id.codigoRegion === this.department.id.codigoRegion);
            this.department = departmentFind;
            this.onChangeObj(this.department);
          }
        });
    } else {
      this.departments = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Department) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.data.slice(0, 20);
      }
      if (terms.term) {
        return this.data.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.data.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['departmentSelected'] !== undefined) {
      if (changes['departmentSelected'].currentValue !== undefined && changes['departmentSelected'].currentValue !== null) {
        if (this.departments) {
          const department = this.departments.find((item) => item.id.codigo === changes['departmentSelected'].currentValue);
          if (department) {
            this.department = department;
          }
        }
      }
    }

    if (changes['department'] !== undefined) {
      if (this.departments) {
        const department = this.departments.find((item) => item.id.codigo === changes['department'].currentValue.id.codigo);
        if (department) {
          this.department = department;
        }
      }
    }

    if (changes['region'] !== undefined) {
      if (this.departments) {
        const data = this.departments.filter((item) => item.id.codigoRegion === changes['region'].currentValue.id.codigo);
        if (data) {
          this.data = data;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeDepartment.emit(newObj.item);
    } else {
      this.changeDepartment.emit(newObj);
    }
  }

}
