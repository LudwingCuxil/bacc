export class Parameter {
  constructor(public id? : number,
              public version?: number,
              public codigo?: string,
              public description?: string,
              public valor?: string,
              public habilitado?: boolean,
              public valores?: DetailParameter){}
}
export class DetailParameter {
    constructor(public id?: number,
                public version?: number,
                public valor?: string,
                public descripcion?: string,
                public orden?: number){}
}