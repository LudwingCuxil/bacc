import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Deadline} from '../shared/account/fixed-term';

@Component({
  selector: 'pl-deadline-selected',
  templateUrl: './deadline-selected.component.html',
  styleUrls: ['./deadline-select.component.css'],
  providers: [CatalogService]
})

export class DeadLineSelectedComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Deadline[];
  @Input() deadlineSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeDeadline: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() deadline = new Deadline();
  @Input() subProduct: number = null;
  @Input() term: number = null;
  deadlines: Deadline[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService, private _changeDetectorRef: ChangeDetectorRef) {
    this.changeDeadline = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'deadline';
    }
  }
  
  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
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
      this.catalogService.getCatalog('parametrosPlataforma/PARAM_PLDIVA')
        .then((deadlines: any) => {
          this.deadlines = deadlines.valores; 
          if (this.deadline != null) {
            const deadlineFind = this.deadlines.find((item) => +item.valor === this.term);
            if (deadlineFind) {
              this.deadline = deadlineFind;
              this.changeDeadline.emit(this.deadline);
            }
          }
          if (this.subProduct && this.deadline === null) {
            const deadlineFind = this.deadlines.find((item) => +item.valor === this.subProduct);
            this.deadline = deadlineFind;
            this.changeDeadline.emit(this.deadline);
          }
        });
    } else {
      this.deadlines = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Deadline) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.deadlines.slice(0, 20);
      }
      if (terms.term) {
        return this.deadlines.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.deadlines.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['deadlineSelected'] !== undefined) {
      if (changes['deadlineSelected'].currentValue !== undefined && changes['deadlineSelected'].currentValue !== null) {
        if (this.deadlines) {
          const deadline = this.deadlines.find((item) => item.id === changes['deadlineSelected'].currentValue);
          if (deadline) {
            this.deadline = deadline;
          }
        }
      }
    }

    if (changes['deadline'] !== undefined) {
      if (this.deadlines && changes['deadline'].currentValue) {
        const deadline = this.deadlines.find((item) => +item.valor === +changes['deadline'].currentValue);
        if (deadline) {
          this.deadline = deadline;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeDeadline.emit(newObj.item);
    } else {
      this.changeDeadline.emit(newObj);
    }
  }
}
