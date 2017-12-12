import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
//import {Nacionalidad} from '../shared/client/nacionalidad';
import {CatalogService} from '../../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Parentesco} from '../../shared/client/parentesco';

@Component({
  selector: 'pl-relationship-select',
  templateUrl: './relationship-select.component.html',
  styleUrls: ['./relationship-select.component.css'],
  providers: [CatalogService]
})

export class RelationshipSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Parentesco[];
  @Input() relationshipSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeRelationship: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() relationship = new Parentesco();
  relationships: Parentesco[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeRelationship = new EventEmitter<any>();
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
          this.relationships = relationships;
          if (this.relationship != null && this.relationship.codigo != null) {
            const relationshipFind = this.relationships.find((item) => item.codigo.trim() === this.relationship.codigo.trim());
            this.relationship = relationshipFind;
            return;
          }
          if (this.relationship != null && this.relationship.codigo === '' && this.relationship.descripcion != null) {
            const relationshipFind = this.relationships.find((item) => item.descripcion.trim() === this.relationship.descripcion.trim());
            this.relationship = relationshipFind;
          }
        });
    } else {
      this.relationships = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Parentesco) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.relationships.slice(0, 20);
      }
      if (terms.term) {
        return this.relationships.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.relationships.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['relationshipSelected'] !== undefined) {
      if (changes['relationshipSelected'].currentValue !== undefined && changes['relationshipSelected'].currentValue !== null) {
        if (this.relationships) {
          const relationship = this.relationships.find((item) => item.codigo.trim() === changes['relationshipSelected'].currentValue.trim());
          if (relationship) {
            this.relationship = relationship;
          }
        }
      }
    }

    if (changes['relationship'] !== undefined && changes['relationship'].currentValue
      && changes['relationship'].currentValue.codigo !== '') {
      if (this.relationships) {
        const relationship = this.relationships.find((item) => item.codigo.trim() === changes['relationship'].currentValue.codigo.trim());
        if (relationship) {
          this.relationship = relationship;
        }
      }
    } else if (changes['relationship'] !== undefined && changes['relationship'].currentValue
      && changes['relationship'].currentValue.descripcion != null) {
      if (this.relationships) {
        const relationship = this.relationships.find((item) => item.descripcion.trim() === changes['relationship'].currentValue.descripcion.trim());
        if (relationship) {
          this.relationship = relationship;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeRelationship.emit(newObj.item);
    } else {
      this.changeRelationship.emit(newObj);
    }
  }

}
