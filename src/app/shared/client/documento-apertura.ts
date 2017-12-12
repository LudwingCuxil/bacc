export class OpeningDocument {
  codigo: string;
  descripcion: string;

  constructor() {
  }
}

export class OpeningDocumentService {
  id: Id;
  requerido: boolean;

  constructor() {
  }
}

export class Id {
  claseCliente: OpeningDocument;
  documentoApertura: OpeningDocument;
}

export class OpeningDocumentMod {
  id: Id;
  requerido: boolean;
  check: boolean;

  constructor() {

  }
}
