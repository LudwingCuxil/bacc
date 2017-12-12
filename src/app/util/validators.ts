//export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
//  return (control: AbstractControl): {[key: string]: any} => {
//    const name = control.value;
//    const no = nameRe.test(name);
//    return no ? {'forbiddenName': {name}} : null;
//  };
//}