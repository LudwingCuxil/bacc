import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {SalesLevelService} from './shared/sales-level.service';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {NivelVentas} from '../shared/client/nivel-ventas';

@Component({
  selector: 'pl-sales-level-select',
  templateUrl: './sales-level.select.component.html',
  providers: [SalesLevelService],
  styleUrls: ['./sales-level.select.component.css']
})

export class SalesLevelSelectComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: NivelVentas[];
  @Input() salesLevelSelected: string;
  @Input() showNationality = false;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changeNivelVentas: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() salesLevel = new NivelVentas();
  salesLevels: NivelVentas[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public salesLevelService: SalesLevelService) {
    this.changeNivelVentas = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'salesLevel';
    }
  }

  ngOnInit() {
    if (!this.options) {
      this.salesLevelService.getSalesLevelService({number: 0, size: 1500})
        .then((salesLevels: any) => {
          this.salesLevels = salesLevels;
          if(this.salesLevelSelected){
            const salesLevelFind = this.salesLevels.find((item) => item.codigo == Number(this.salesLevelSelected));
            this.salesLevel =salesLevelFind;
          }
          if (this.salesLevel!=null && this.salesLevel.codigo != null && this.salesLevel.codigo) {

            const salesLevelFind = this.salesLevels.find((item) => item.codigo == this.salesLevel.codigo);
            this.salesLevel =salesLevelFind;

          }
        });
    } else {
      this.salesLevels = this.options;
    }
  }

  formatter = (result: NivelVentas) => result.descripcion;

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.salesLevels.slice(0, 20);
      }
      if (terms.term) {
        return this.salesLevels.filter(v => this.showNationality ? v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1
          : v.descripcion.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.salesLevels.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['salesLevelSelected'] != undefined) {
      if (changes['salesLevelSelected'].currentValue !== undefined && changes['salesLevelSelected'].currentValue !== null) {
        if (this.salesLevels) {
          const salesLevel = this.salesLevels.find((item) => item.codigo == changes['salesLevelSelected'].currentValue);
          if (salesLevel) {
            this.salesLevel = salesLevel;
          }
        }
      }
    }

    if (changes['salesLevel'] != undefined) {
      if (this.salesLevels && changes['salesLevel'].currentValue != undefined) {
        const salesLevel = this.salesLevels.find((item) => item.codigo == changes['salesLevel'].currentValue.codigo);
        if (salesLevel) {
          this.salesLevel = salesLevel;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changeNivelVentas.emit(newObj.item);
    } else {
      this.changeNivelVentas.emit(newObj);
    }
  }

}
