import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {isObject} from 'util';
import {CatalogService} from '../shared/services/catalog.service';
import { PromotionsService } from "./shared/promotions-select.service";
import { Promotions } from "./shared/promotions-select.model";

@Component({
  selector: 'pl-promotions-select',
  templateUrl: './promotions-select.component.html',
  styleUrls: ['./promotions-select.component.css'],
  providers: [CatalogService]
})
export class PromotionsSelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() options: Promotions[];
  @Input() promotionSelected: string;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;
  @Output() changePromotion: EventEmitter<any>;
  @Input() autocomplete = false;
  @Input() promotion = new Promotions();
  promotions: Promotions[] = [];
  resultOptionsSubject: Subject<any> = new Subject<any>();

  // @ViewChild('selectAuto');

  constructor(public catalogService: CatalogService) {
    this.changePromotion = new EventEmitter<any>();
    if (!this.controlName) {
      this.controlName = 'promotion';
    }
  }

  validateInput(input: FormControl) {
    if (input.value) {
      if (isObject(input.value)) {
        if (input.value.descripcion1 && input.value.descripcion1.length > 2) {
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
      this.catalogService.getCatalog('promociones')
        .then((promotions: any) => {
          this.promotions = promotions; 
          if (this.promotion != null && this.promotion.codigo != null) {
            const promotionFind = this.promotions.find((item) => item.codigo === this.promotion.codigo);
            this.promotion = promotionFind;
          }
        });
    } else {
      this.promotions = this.options;
    }

    if (this.formGroup) {
      const control = this.formGroup.controls[this.controlName];
//      control.setValidators([this.validateInput]);
    }
  }

  formatter = (result: Promotions) =>
    result.descripcion1 ? result.descripcion1 : '';

  search = (text$: Observable<string>) =>
    this.resultOptionsSubject.merge(text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => {
        return {term: term};
      })).map(terms => {
      if (terms.showAll) {
        return this.promotions.slice(0, 20);
      }
      if (terms.term) {
        return this.promotions.filter(v => v.descripcion1.toLowerCase().indexOf(terms.term.toLowerCase()) > -1).slice(0, 20);
      }
      return this.promotions.slice(0, 20);
    })

  openAll(event: Event) {
    event.preventDefault();
    this.resultOptionsSubject.next({showAll: true});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['promotionSelected'] !== undefined) {
      if (changes['promotionSelected'].currentValue !== undefined && changes['promotionSelected'].currentValue !== null) {
        if (this.promotions) {
          const promotion = this.promotions.find((item) => item.codigo === changes['promotionSelected'].currentValue);
          if (promotion) {
            this.promotion = promotion;
          }
        }
      }
    }

    if (changes['promotion'] !== undefined) {
      if (this.promotions && changes['promotion'].currentValue) {
        const promotion = this.promotions.find((item) => item.codigo === changes['promotion'].currentValue.codigo);
        if (promotion) {
          this.promotion = promotion;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.changePromotion.emit(newObj.item);
    } else {
      this.changePromotion.emit(newObj);
    }
  }
}
