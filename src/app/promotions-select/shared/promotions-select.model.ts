import { SearchDataType } from 'security-angular/src/app/search';

export class Promotions{

  constructor(public codigo:string = '',
              public descripcion1:string = '',
              public descripcion2:string = '',
              public descripcion3:string = '',
              public descripcion4:string = '',
              public descripcion5:string = '',
              public terminal:string = '',
              public usuario:string = '',
              public anioCreacion:number = 0,
              public mesCreacion:number = 0,
              public diaCreacion:number = 0){}
}
