import {ControlValueAccessor} from '@angular/forms';

export abstract class AbstractValueAccessor implements ControlValueAccessor {

  private _value: any = '';
  constructor() {

  }

  onChange: any = () => {

  }

  onTouched: any = () => {

  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    this.value = value;
  }

  onBlur() {
    this.onTouched();
  }
}
