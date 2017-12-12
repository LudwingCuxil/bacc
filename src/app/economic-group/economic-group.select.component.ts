import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {EconomicGroup} from './economic-group';
import {SecurityService} from 'security-angular/src/app';
@Component({
  selector: 'pl-economic-group-select',
  templateUrl: './economic-group.select.component.html',
  styleUrls: ['./economic-group.select.component.css'],
  providers: [CatalogService]
})

export class EconomicGroupSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: EconomicGroup[];
  @Input() economicGroupSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Input() editMode: boolean;
  @Output() changeEconomicGroup: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() economicGroup = new EconomicGroup();
  private groupBlank = new EconomicGroup();
  economicGroups: EconomicGroup[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService, private _securityService: SecurityService) {
    this.changeEconomicGroup = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'economicGroup';
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
      'required': false
    };
  }

  ngOnInit() {
    if (!this.options) {
      let identification = this._securityService.getCookie('identification');
      this.catalogService.getCatalog('clientes/'+identification+'/gruposEconomicos')
        .then((economicGroups: any) => {
          this.economicGroups = economicGroups;
          this.economicGroups.splice(0, 0, this.groupBlank);
          if (this.economicGroup && this.economicGroup !== null && this.economicGroup.id.grupo && this.economicGroup.id.grupo !== null) {
            const economicGroupFind = this.economicGroups.find((item) => item.id.grupo === this.economicGroup.id.grupo);
            this.economicGroup = economicGroupFind;
          } else {
            if (!this.editMode) {
              this.economicGroup = this.economicGroups[1];
              this.changeEconomicGroup.emit(this.economicGroup);
            }
          }
        }).catch((e) => this.changeEconomicGroup.emit(false));
    } else {
      this.economicGroups = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
//      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: EconomicGroup) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.economicGroups.slice(0, 20);
      }
      if (terms.term) {
        return this.economicGroups.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.economicGroups.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['economicGroupSelected'] !== undefined) {
      if (changes['economicGroupSelected'].currentValue !== undefined && changes['economicGroupSelected'].currentValue !== null) {
        if (this.economicGroups) {
          const economicGroup = this.economicGroups.find((item) => item.id.grupo === changes['economicGroupSelected'].currentValue);
          if (economicGroup) {
            this.economicGroup = economicGroup;
          }
        }
      }
    }

    if (changes['economicGroup'] !== undefined && changes['economicGroup'].currentValue !== undefined && changes['economicGroup'].currentValue !== null) {
      if (this.economicGroups) {
        const economicGroup = this.economicGroups.find((item) => item.id.grupo === changes['economicGroup'].currentValue.id.grupo);
        if (economicGroup) {
          this.economicGroup = economicGroup;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeEconomicGroup.emit(newObj.item);
    } else {
      this.changeEconomicGroup.emit(newObj);
    }
  }

}
