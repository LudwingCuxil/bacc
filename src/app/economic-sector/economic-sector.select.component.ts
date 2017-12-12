import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SectorEconomico} from '../shared/client/sector-economico';
import {EconomicSectorService} from "./shared/economic-sector.service";
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';

@Component({
  selector: 'pl-economic-sector-select',
  templateUrl: './economic-sector.select.component.html',
  providers: [EconomicSectorService],
  styleUrls: ['./economic-sector.select.component.css']
})

export class EconomicSectorSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: SectorEconomico[];
  @Input() economicSectorSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeEconomicSector: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() economicSector = new SectorEconomico();
  economicSectors: SectorEconomico[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public economicSectorService: EconomicSectorService) {
    this.changeEconomicSector = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'economicSector';
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
      this.economicSectorService.geteconomicSectorService()
        .then((economicSectors: any) => {
          this.economicSectors = economicSectors;
          if (this.economicSector != null && this.economicSector.codigo != null) {
            const economicSectorFind = this.economicSectors.find((item) => item.codigo == this.economicSector.codigo);
            this.economicSector = economicSectorFind;
          }
        });
    } else {
      this.economicSectors = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: SectorEconomico) =>
    result.descripcion ? result.descripcion : '' ;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.economicSectors.slice(0, 20);
      }
      if (terms.term) {
        return this.economicSectors.filter(v => 
        v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.economicSectors.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['economicSectorSelected'] !== undefined) {
      if (changes['economicSectorSelected'].currentValue !== undefined && changes['economicSectorSelected'].currentValue !== null) {
        if (this.economicSectors) {
          const economicSector = this.economicSectors.find((item) => item.codigo === changes['economicSectorSelected'].currentValue);
          if (economicSector) {
            this.economicSector = economicSector;
          }
        }
      }
    }

    if (changes['economicSector'] !== undefined) {
      if (this.economicSectors) {
        const economicSector = this.economicSectors.find((item) => item.codigo === changes['economicSector'].currentValue.codigo);
        if (economicSector) {
          this.economicSector = economicSector;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeEconomicSector.emit(newObj.item);
    } else {
      this.changeEconomicSector.emit(newObj);
    }
  }

}
