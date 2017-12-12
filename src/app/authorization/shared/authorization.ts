export class Authorization {
  constructor(public agencia?: number,
              public codigo?: string,
              public descripcion?: string,
              public empresa? : string,
              public password?: string,
              public requierePassword?: boolean,
              public supervisor?: number,
              public usuario?: string){}
}
export class AuthorizationResponse {
  constructor(public error?: number,
              public descripcion?: string,
              public key?: number,
              public message?: string,
              public notifica?: boolean
            ){}
}

export class Authorized {
  constructor(public seccion?: string,
              public permiso?: string){}
}