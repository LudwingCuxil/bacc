export class TipoChequera{
  cantidadCheques = 0;
  claseChequera = '';
  descripcion = '';
  equivalente = '';
  id = new TipoChequeraId();
  serie = '';
  tipoForma = 0;
}

export class TipoChequeraId{
  codigo = 0;
  moneda = '';
}
