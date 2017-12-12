import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CatalogService} from '../shared/services/catalog.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {ActividadEconomica} from '../shared/client/actividad-economica';
@Component({
  selector: 'pl-economic-activities-select',
  templateUrl: './economic-activities.select.component.html',
  styleUrls: ['./economic-activities.select.component.css'],
  providers: [CatalogService]
})

export class EconomicActivitiesSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: ActividadEconomica[];
  @Input() economicActivitySelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeEconomicActivity: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() economicActivity = new ActividadEconomica();
  economicActivities: ActividadEconomica[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changeEconomicActivity = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'economicActivity';
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
      this.catalogService.getCatalog('actividadesEconomicas')
        .then((economicActivities: any) => {
          this.economicActivities = economicActivities;
          if (this.economicActivity && this.economicActivity !== null && this.economicActivity.codigo && this.economicActivity.codigo !== null) {
            const economicActivityFind = this.economicActivities.find((item) => item.codigo === this.economicActivity.codigo);
            this.economicActivity = economicActivityFind;
          }
        });
    } else {
      this.economicActivities = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: ActividadEconomica) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.economicActivities.slice(0, 20);
      }
      if (terms.term) {
        return this.economicActivities.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.economicActivities.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['economicActivitySelected'] !== undefined) {
      if (changes['economicActivitySelected'].currentValue !== undefined && changes['economicActivitySelected'].currentValue !== null) {
        if (this.economicActivities) {
          const economicActivity = this.economicActivities.find((item) => item.codigo === changes['economicActivitySelected'].currentValue);
          if (economicActivity) {
            this.economicActivity = economicActivity;
          }
        }
      }
    }

    if (changes['economicActivity'] !== undefined && changes['economicActivity'].currentValue !== undefined && changes['economicActivity'].currentValue !== null) {
      if (this.economicActivities) {
        const economicActivity = this.economicActivities.find((item) => item.codigo === changes['economicActivity'].currentValue.codigo);
        if (economicActivity) {
          this.economicActivity = economicActivity;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeEconomicActivity.emit(newObj.item);
    } else {
      this.changeEconomicActivity.emit(newObj);
    }
  }

}
