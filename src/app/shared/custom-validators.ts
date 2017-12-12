import {FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl} from '@angular/forms';


function isEmptyInputValue(value: any): boolean {
  return value == null || value.length === 0;
}

export class Validator {
  
  static min(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value) || isEmptyInputValue(min)) {
        return null;
      }
      const value = parseFloat(control.value);
      return !isNaN(value) && value < min ? {'min': {'min': min, 'actual': control.value}} : null;
    };
  }
  
  static max(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value) || isEmptyInputValue(max)) {
        return null;
      }
      const value = parseFloat(control.value);
      return !isNaN(value) && value > max ? {'max': {'max': max, 'actual': control.value}} : null;
    };
  }
}