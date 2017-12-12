import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import { OperationsSupervisor } from "./shared/operations-supervisor.model";
@Component({
  selector: 'pl-operations-supervisor',
  templateUrl: './operations-supervisor.component.html',
  styleUrls: ['./operations-supervisor.component.css'],
  providers: [CatalogService]
})

export class OperationsSupervisorComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: OperationsSupervisor[];
  @Input() operationsSupervisorSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeOperationsSupervisor: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() operationsSupervisor = new OperationsSupervisor();
  @Input() business: string;
  operationsSupervisors: OperationsSupervisor[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeOperationsSupervisor = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'operationsSupervisor';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.nombre && input.value.nombre.length > 2) {
          return null;
        }
      }
    }
    return {
      'required': true
    };
  }

  ngOnInit() {
    if (!this.options && this.business) {
      this.catalogService.getCatalogParam('supervisoresOperacion/default', 'empresa', this.business)
      .then((operationDefault: OperationsSupervisor) => {
        this.catalogService.getCatalogParam('supervisoresOperacion', 'empresa', this.business)
        .then((operationsSupervisors: any) => {
          this.operationsSupervisors = operationsSupervisors; 
          if (this.operationsSupervisor != null && this.operationsSupervisor.id.codigo != null && this.operationsSupervisor.id.codigo != 0) {
            const operationsSupervisorFind = this.operationsSupervisors.find((item) => item.id.codigo === this.operationsSupervisor.id.codigo);
            this.operationsSupervisor = operationsSupervisorFind;
          } else {
            const operationsSupervisorDefault = this.operationsSupervisors.find((item) => item.id.codigo === operationDefault.id.codigo);
            this.operationsSupervisor = operationsSupervisorDefault;
            if (this.operationsSupervisor)
              this.changeOperationsSupervisor.emit(this.operationsSupervisor);
          }
        });
      });
    } else {
      this.operationsSupervisors = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: OperationsSupervisor) =>
    result.nombre ? result.nombre : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.operationsSupervisors.slice(0, 20);
      }
      if (terms.term) {
        return this.operationsSupervisors.filter(v => v.nombre.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.operationsSupervisors.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['operationsSupervisorSelected'] !== undefined) {
      if (changes['operationsSupervisorSelected'].currentValue !== undefined && changes['operationsSupervisorSelected'].currentValue !== null) {
        if (this.operationsSupervisors) {
          const operationsSupervisor = this.operationsSupervisors.find((item) => item.id.codigo === changes['operationsSupervisorSelected'].currentValue);
          if (operationsSupervisor) {
            this.operationsSupervisor = operationsSupervisor;
          }
        }
      }
    }

    if (changes['operationsSupervisor'] !== undefined) {
      if (this.operationsSupervisors) {
        const operationsSupervisor = this.operationsSupervisors.find((item) => item.id.codigo === changes['operationsSupervisor'].currentValue.id.codigo);
        if (operationsSupervisor) {
          this.operationsSupervisor = operationsSupervisor;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeOperationsSupervisor.emit(newObj.item);
    } else {
      this.changeOperationsSupervisor.emit(newObj);
    }
  }

}
