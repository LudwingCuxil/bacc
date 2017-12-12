import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Currency} from './shared/currency.model';
import {CurrencyService} from './shared/currency.service';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'pl-currency-select',
  templateUrl: './currency-select.component.html',
  styleUrls: ['./currency-select.component.css'],
  providers: [CurrencyService]
})
export class CurrencySelectComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;

  @Output() currencyUpdated: EventEmitter<Currency>;
  @Input() options: Currency[];
  @Input() currencySelected: number;
  @Input() disabled = false;
  @Input() modeView: boolean;
  @Input() modeDelete: boolean;

  @Input() autocomplete = false;
  @Input() currency: Currency;

  currencies: Currency[] = [];
  currencyDefault: Currency;

  constructor(private currencyService: CurrencyService) {
    this.currencyUpdated = new EventEmitter<Currency>();
  }

  async ngOnInit() {
    try {
      this.currencyDefault = await this.currencyService.getCurrencyDefault();

      if (!this.options) {
        this.currencyService.getCurrencies({number: 0, size: 1500})
          .then((currencies: any) => {
            if (currencies && currencies.length) {
              this.currencies = currencies;
              if (this.currency && this.currency.codigo) {
                const found = this.currencies.find((curr => curr.codigo === this.currency.codigo));
                this.currency = found ? found : this.currencyDefault;
              } else {
                this.currency = this.currencyDefault;
              }
            }
          });
      } else {
        this.currencies = this.options;
      }
    } catch (error) {
      console.log(error.message || error);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currencySelected'] && changes['currencySelected'].currentValue) {
      if (this.currencies) {
        const curr = this.currencies.find(item => item.codigo === changes['currencySelected'].currentValue.codigo);
        if (curr) {
          this.currency = curr;
        }
      }
    }

    if (changes['currency'] && changes['currency'].currentValue) {
      if (this.currencies) {
        const curr = this.currencies.find(item => item.codigo === changes['currency'].currentValue.codigo);
        if (curr) {
          this.currency = curr;
        }
      }
    }
  }

  onChangeObj(newObj: any) {
    if (this.autocomplete) {
      this.currencyUpdated.emit(newObj.item);
    }else {
      this.currencyUpdated.emit(newObj);
    }
  }

}
