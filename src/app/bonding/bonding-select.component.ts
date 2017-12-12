import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BondingService} from './shared/bonding.service';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Vinculacion} from '../shared/client/vinculacion';

@Component({
  selector: 'pl-bonding-select',
  templateUrl: './bonding-select.component.html',
  providers: [BondingService],
  styleUrls: ['./bonding-select.component.css']
})

export class BondingSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Vinculacion[];
  @Input() bondingSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeVinculacion: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() bonding = new Vinculacion();
  bondings: Vinculacion[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public bondingService: BondingService) {
    this.changeVinculacion = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'bonding';
    }
  }

  ngOnInit() {
    if (!this.options) {
      this.bondingService.getBondingService({number: 0, size: 1500}, '1', 'false')
        .then((bondings: any) => {
          this.bondings = bondings;
          if (this.bonding) {

              const bondingFind = this.bondings.find((item) => item.codigo === this.bonding.codigo);
              this.bonding = bondingFind;
            
          }
        });
    } else {
      this.bondings = this.options;
    }
  }

  formatter = (result: Vinculacion) => result.descripcion;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.bondings.slice(0, 20);
      }
      if (terms.term) {
        return this.bondings.filter(v => v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.bondings.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bondingSelected'] !== undefined) {
      if (changes['bondingSelected'].currentValue !== undefined && changes['bondingSelected'].currentValue !== null) {
        if (this.bondings) {
          const bonding = this.bondings.find((item) => item.codigo === changes['bondingSelected'].currentValue);
          if (bonding) {
            this.bonding = bonding;
          }
        }
      }
    }

    if (changes['bonding'] !== undefined) {
      if (this.bondings && changes['bonding'].currentValue !== undefined) {
        const bonding = this.bondings.find((item) => item.codigo === changes['bonding'].currentValue.codigo);
        if (bonding) {
          this.bonding = bonding;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeVinculacion.emit(newObj.item);
    } else {
      this.changeVinculacion.emit(newObj);
    }
  }

}
