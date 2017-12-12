export class ClientSummary {
  constructor(
    public id: number,
    public tipoIdentificacion: string,
    public identificacion: string,
    public tipoDeIdentificacion: string,
    public numeroIdentificacion: string,
    public nombre: string,
    public clase: string,
    public tipoPersona: string,
    public estado: string,
    public fecha: Date,
    public fechaFormato: string,
    public enListaNegra: boolean
  ) {}
}
