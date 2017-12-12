export class EjecutivoNegocio {
    
  id = new EjecutivoNegocioId();
  descripcion = '';
  
  constructor() {
  }
}

class EjecutivoNegocioId {
    codigoEmpresa = '';
    codigo = 0;
}