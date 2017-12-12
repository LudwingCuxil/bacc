import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {TypeSocietyService} from './shared/type-society.service';
import {TipoSociedad} from '../shared/client/tipo-sociedad';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';

 
@Component({
  selector: 'pl-type-society',
  templateUrl: './type-society.select.component.html',
  providers: [TypeSocietyService],
  styleUrls: ['./type-society.select.component.css']
})

export class TypeSocietySelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: TipoSociedad[];
  @Input() typeSocietySelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeTipoSociedad: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() typeSociety = new TipoSociedad();
  typeSocietys: TipoSociedad[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public typeSocietyService: TypeSocietyService) {
    this.changeTipoSociedad = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'typeSociety';
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
      this.typeSocietyService.getTypeSocietyService()
        .then((typeSocietys: any) => {
          this.typeSocietys = typeSocietys;
          if (this.typeSociety != null && this.typeSociety.codigo != null) {
            const typeSocietyFind = this.typeSocietys.find((item) => item.codigo === this.typeSociety.codigo);
            this.typeSociety = typeSocietyFind;
          }
        });
    } else {
      this.typeSocietys = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: TipoSociedad) =>
     result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.typeSocietys.slice(0, 20);
      }
      if (terms.term) {
        return this.typeSocietys.filter(v =>
         v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1)
      }
      return this.typeSocietys.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typeSocietySelected'] !== undefined) {
      if (changes['typeSocietySelected'].currentValue !== undefined && changes['typeSocietySelected'].currentValue !== null) {
        if (this.typeSocietys) {
          const typeSociety = this.typeSocietys.find((item) => item.codigo === changes['typeSocietySelected'].currentValue);
          if (typeSociety) {
            this.typeSociety = typeSociety;
          }
        }
      }
    }

    if (changes['typeSociety'] !== undefined) {
      if (this.typeSocietys) {
        const typeSociety = this.typeSocietys.find((item) => item.codigo === changes['typeSociety'].currentValue.codigo);
        if (typeSociety) {
          this.typeSociety = typeSociety;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeTipoSociedad.emit(newObj.item);
    } else {
      this.changeTipoSociedad.emit(newObj);
    }
  }

}

