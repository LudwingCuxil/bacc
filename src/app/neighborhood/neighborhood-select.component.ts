import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Neighborhood} from './shared/neighborhood';
import {NeighborhoodService} from './shared/neighborhood.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';
import {Municipality} from '../municipality/shared/municipality';


@Component({
  selector: 'pl-neighborhood-select',
  templateUrl: './neighborhood-select.component.html',
  styles: [''],
  providers: [NeighborhoodService]
})

export class NeighborhoodSelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Neighborhood[];
  @Input() municipality: Municipality = new Municipality();
  @Input() neighborhoodSelected: any;
  @Output() changeNeighborhood: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() neighborhood = new Neighborhood();
  neighborhoods: Neighborhood[] = [];
  data: Neighborhood[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(public neighborhoodService: NeighborhoodService) {
    this.changeNeighborhood = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'neighborhood';
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
      this.neighborhoodService.getNeighborhoods()
        .then((neighborhoods: any) => {
          this.neighborhoods = neighborhoods;
          this.data = neighborhoods;
          if (this.neighborhood != null && this.neighborhood.id.codigo != null) {
            const neighborhoodFind = this.neighborhoods.find((item) => item.id.codigo === this.neighborhood.id.codigo && item.id.codigoRegion === this.neighborhood.id.codigoRegion
            && item.id.codigoDepartamento === this.neighborhood.id.codigoDepartamento);
            this.neighborhood = neighborhoodFind;
          }else if (this.municipality && this.municipality.id) {
            this.data = this.neighborhoods.filter((item) => item.id.codigoDepartamento === this.municipality.id.codigoDepartamento
            && item.id.codigoRegion === this.municipality.id.codigoRegion
            && item.id.codigoMunicipio === this.municipality.id.codigo
            && item.id.codigo === 99);
            if (this.data) {
              this.neighborhood = this.data[0];
            }
          }else if (this.neighborhoodSelected) {
            const neighborhood = this.neighborhoods.find((item) => item.id.codigo === this.neighborhoodSelected.nivelGeografico44
            && item.id.codigoRegion === this.neighborhoodSelected.nivelGeografico41
            && item.id.codigoDepartamento === this.neighborhoodSelected.currentValue.nivelGeografico42
            && item.id.codigoMunicipio === this.neighborhoodSelected.currentValue.nivelGeografico43);
            if (neighborhood) {
              this.neighborhood = neighborhood;
            }
          }
        });
    } else {
      this.neighborhoods = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Neighborhood) =>
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
    if (changes['neighborhoodSelected'] !== undefined) {
      if (changes['neighborhoodSelected'].currentValue !== undefined && changes['neighborhoodSelected'].currentValue !== null) {
        if (this.neighborhoods) {
          const neighborhood = this.neighborhoods.find((item) => item.id.codigo === changes['neighborhoodSelected'].currentValue.nivelGeografico44
          && item.id.codigoRegion === changes['neighborhoodSelected'].currentValue.nivelGeografico41
          && item.id.codigoDepartamento === changes['neighborhoodSelected'].currentValue.nivelGeografico42
          && item.id.codigoMunicipio === changes['neighborhoodSelected'].currentValue.nivelGeografico43);

          if (neighborhood) {
            this.neighborhood = neighborhood;
          }
        }
      }
    }

    if (changes['neighborhood'] !== undefined && changes['neighborhood'].currentValue !== undefined) {
      if (this.neighborhoods) {
        const neighborhood = this.neighborhoods.find((item) => item.id.codigo === changes['neighborhood'].currentValue.id.codigo);
        if (neighborhood) {
          this.neighborhood = neighborhood;
        }
      }
    }

    if (changes['municipality'] !== undefined && changes['municipality'].currentValue !== undefined) {
      if (this.data) {
        this.data = this.neighborhoods.filter((item) => item.id.codigoDepartamento === changes['municipality'].currentValue.id.codigoDepartamento
        && item.id.codigoRegion === changes['municipality'].currentValue.id.codigoRegion
        && item.id.codigoMunicipio === changes['municipality'].currentValue.id.codigo
        && item.id.codigo === 99);
        if (this.data) {
          this.neighborhood = this.data[0];
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeNeighborhood.emit(newObj.item);
    } else {
      this.changeNeighborhood.emit(newObj);
    }
  }


}
