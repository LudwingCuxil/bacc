import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FrequencyService } from './shared/frequency.service';
import { Frecuencia } from '../shared/account/frequency';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { isObject } from 'util';

@Component({
  selector: 'pl-frequency-select',
  templateUrl: './frequency-select.component.html',
  styleUrls: ['./frequency-select.component.css'],
  providers: [FrequencyService]
})
export class FrequencySelectComponent implements OnInit, OnChanges {
  @Output() frequencyUpdated = new EventEmitter<Frecuencia>();
  @Input() frequencySelected: string;
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Frecuencia[];
  @Input() autocomplete = false;
  @Input() disabled: false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Input() frequency: Frecuencia;

  frequencies: Frecuencia[] = [];
  resultOptionsSubject = new Subject<any>();

  constructor(private frequencyService: FrequencyService) { }

  ngOnInit() {
    if (!this.options) {
      this.frequencyService.getFrequencies().then(frequencies => {
        if (frequencies) {
          this.frequencies = frequencies;
        }
      });
    } else {
      this.frequencies = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
      control.setValidators([this.validateInput]);
    }
  }

  // Select Methods

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.frequencies.slice(0, 20);
      }
      if (terms.term) {
        return this.frequencies.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.frequencies.slice(0, 20);
    })

  formatter = (result: Frecuencia) => result.descripcion ? result.descripcion : '';

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frequencySelected'] && changes['frequencySelected'].currentValue) {
      if (this.frequencies && this.frequencies.length) {
        const freq = this.frequencies.find(item => item.codigo === changes['frequencySelected'].currentValue.codigo);
        if (freq) {
          this.frequency = freq;
        }
      }
    }

    if (changes['frequency'] && changes['frequency'].currentValue) {
      if (this.frequencies && this.frequencies.length) {
        const freq = this.frequencies.find(item => item.codigo === changes['frequency'].currentValue.codigo);
        if (freq) {
          this.frequency = freq;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.frequencyUpdated.emit(newObj.item);
    } else {
      this.frequencyUpdated.emit(newObj);
    }
  }
}
