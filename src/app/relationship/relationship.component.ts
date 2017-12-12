import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {Relationship} from './shared/relationship';
import {CatalogService} from '../shared/services/catalog.service';


@Component({
  selector: 'pl-reference-relationship-select',
  templateUrl: './relationship.component.html',
  styles: [''],
  providers: []
})

export class RelationshipSelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Relationship[];
  @Input() relationshipSelected: number;
  @Output() changeType: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() relationship = new Relationship();
  references: Relationship[] = [];
  data: Relationship[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(private catalogService: CatalogService) {
    this.changeType = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'relationship';
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
      this.catalogService.getCatalog('parentescos')
        .then((relationships: any) => {
          this.references = relationships;
          if (this.relationship != null && this.relationship.codigo != null) {
            const relationshipFind = this.references.find((item) => item.codigo === this.relationship.codigo);
            this.relationship = relationshipFind;
          }
          this.data = this.references;
        });
    } else {
      this.references = this.options;
      this.data = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Relationship) =>
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
    if (changes['relationshipSelected'] !== undefined) {
      if (changes['relationshipSelected'].currentValue !== undefined && changes['relationshipSelected'].currentValue !== null) {
        if (this.data) {
          const relationship = this.data.find((item) => item.codigo === changes['relationshipSelected'].currentValue);
          if (relationship) {
            this.relationship = relationship;
          }
        }
      }
    }

    if (changes['relationship'] !== undefined) {
      if (this.data) {
        const relationship = this.data.find((item) => item.codigo === changes['relationship'].currentValue.codigo);
        if (relationship) {
          this.relationship = relationship;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeType.emit(newObj.item);
    } else {
      this.changeType.emit(newObj);
    }
  }
}
