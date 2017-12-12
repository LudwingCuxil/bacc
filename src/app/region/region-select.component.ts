import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {RegionService} from './shared/region.service';
import {Region} from './shared/region';
import {Subject} from 'rxjs/Subject';
import {FormControl, FormGroup} from '@angular/forms';
import {isObject} from 'util';
import {Observable} from 'rxjs/Observable';


@Component({
  selector: 'pl-region-select',
  templateUrl: './region-select.component.html',
  styles: [``],
  providers: [RegionService]
})

export class RegionSelectComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Region[];
  @Input() regionSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeRegion: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() region = new Region();
  regions: Region[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  constructor(public regionService: RegionService) {
    this.changeRegion = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'region';
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
      this.regionService.getRegions()
        .then((regions: any) => {
          this.regions = regions;
          if (this.region != null && this.region.id.codigo != null) {
            const regionFind = this.regions.find((item) => item.id.codigo === this.region.id.codigo);
            this.region = regionFind;
          }
        });
    } else {
      this.regions = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Region) =>
    result.descripcion ? result.descripcion : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.regions.slice(0, 20);
      }
      if (terms.term) {
        return this.regions.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.regions.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['regionSelected'] !== undefined) {
      if (changes['regionSelected'].currentValue !== undefined && changes['regionSelected'].currentValue !== null) {
        if (this.regions) {
          const region = this.regions.find((item) => item.id.codigo === changes['regionSelected'].currentValue);
          if (region) {
            this.region = region;
          }
        }
      }
    }

    if (changes['region'] !== undefined) {
      if (this.regions) {
        const region = this.regions.find((item) => item.id.codigo === changes['region'].currentValue.id.codigo);
        if (region) {
          this.region = region;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeRegion.emit(newObj.item);
    } else {
      this.changeRegion.emit(newObj);
    }
  }

}
