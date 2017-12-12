import { current } from 'codelyzer/util/syntaxKind';
/**
 * Created by ajuarez on 16/06/17.
 */

function destructuring(source: any, target: any, predicate: any): void{
  try{
    for(let key in source){
      if(predicate(key, source, target)){
        target[key] = source[key];
      }
    }
  }catch(e){
    console.log(e.message || e);
  }
}

export function weakDestructuring(source: any, target: any): void{
  destructuring(source, target, (key, source, target) => source[key] && target.hasOwnProperty(key));
}

export function assignDestructuring(source: any, target: any): void{
  destructuring(source, target, (key, source) => source[key]);
}

export function forceDestructuring(source: any, target: any): void{
  destructuring(source, target, () => true);
}

export function forEachKey(source, callback: any, predicate?: any): void {
  try {
    for (let key in source) {
      if(source.hasOwnProperty(key)) {
        let item = source[key];
        if (predicate) {
          if (predicate(item)) {
            callback(item);
          }
        } else {
          callback(item);
        }
      }
    }
  } catch (e){
    console.log(e);
  }
}

export function detectChanges(current: any, base: any): boolean {
  try{
    for(let key in current) {
      if (current.hasOwnProperty(key) && base.hasOwnProperty(key)) {
        let currentkey = current[key];
        let basekey = base[key];
        if (typeof currentkey === 'string' && typeof basekey === 'string') {
          currentkey = currentkey.trim();
          if (basekey) {
            basekey = basekey.trim();
          }
        }
        if (currentkey !== basekey) {
          if(typeof currentkey === 'object') {
            if (detectChanges(currentkey, basekey)) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}
