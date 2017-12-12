import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Profesion} from '../shared/client/profesion';

@Component({
  selector: 'pl-profession-select',
  templateUrl: './profession.select.component.html',
  styleUrls: ['./profession.select.component.css'],
  providers: [CatalogService]
})

export class ProfessionSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Profesion[];
  @Input() professionSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeProfession: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() profession = new Profesion();
  wages: Profesion[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeProfession = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'profession';
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
      this.catalogService.getCatalog('profesiones')
        .then((wages: any) => {
          this.wages = wages;
          if (this.profession != null && this.profession.id != null) {
            const professionFind = this.wages.find((item) => item.id === this.profession.id);
            this.profession = professionFind;
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

  formatter = (result: Profesion) =>
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
    if (changes['professionSelected'] !== undefined) {
      if (changes['professionSelected'].currentValue !== undefined && changes['professionSelected'].currentValue !== null) {
        if (this.wages) {
          const profession = this.wages.find((item) => item.id === changes['professionSelected'].currentValue);
          if (profession) {
            this.profession = profession;
          }
        }
      }
    }

    if (changes['profession'] !== undefined) {
      if (this.wages) {
        const profession = this.wages.find((item) => item.id === changes['profession'].currentValue.id);
        if (profession) {
          this.profession = profession;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeProfession.emit(newObj.item);
    } else {
      this.changeProfession.emit(newObj);
    }
  }

}
