/**
 * Created by ajuarez on 16/06/17.
 */

export enum PlatformParameters{
  PARAM_TIASEG = <any>'PARAM_TIASEG',	// Tipo institución aseguradora
  PARAM_ECIVIL = <any>'PARAM_ECIVIL',	// Estados civiles válidos
  PARAM_C4NGPD = <any>'PARAM_C4NGPD',	// Códigos de 4to nivel geográfico por defecto
  PARAM_EDAMIN = <any>'PARAM_EDAMIN',	// Edad mínima
  PARAM_EDAMAX = <any>'PARAM_EDAMAX',	// Edad máxima
  PARAM_MCBUSC = <any>'PARAM_MCBUSC',	// Máximo de coincidencias para la búsqueda de clientes*/
  PARAM_EMPRSA = <any>'PARAM_EMPRSA',	// Empresa por defecto
  PARAM_TPINAS = <any>'PARAM_TPINAS',	// Tipo institución aseguradora
  PARAM_FOPACA = <any>'PARAM_FOPACA',	// Formas de pago de capital
  PARAM_TIPODE = <any>'PARAM_TIPODE',	// Tipo de producto por defecto
  PARAM_PLDIVA = <any>'PARAM_PLDIVA',	// Plazos en días válidos
  PARAM_VERIFICAR_REGISTRO_PERSONAS = <any>'PARAM_VERIFICAR_REGISTRO_PERSONAS',	// Indica si se verifica en el registro de personas el cliente a crear (true/false)
  PARAM_REGISTRO_PERSONAS_TIPO_ID = <any>'PARAM_REGISTRO_PERSONAS_TIPO_ID',	// Codigo del tipo de documento a usar en el registro de personas
  PARAM_CODIGO_CEDULA = <any>'PARAM_CODIGO_CEDULA',	// Codigo del tipo documento CEDULA
  PARAM_CODIGO_PAIS_USA = <any>'PARAM_CODIGO_PAIS_USA',	// Código del país USA
  PARAM_CODIGO_TIPO_DIRECCION_DOMICILIO = <any>'PARAM_CODIGO_TIPO_DIRECCION_DOMICILIO',	// Código de tipo direccion Domiciliaria
  PARAM_CODIGO_TIPO_DIRECCION_TRABAJO = <any>'PARAM_CODIGO_TIPO_DIRECCION_TRABAJO',	// Código de tipo direccion de Trabajo
  PARAM_PLCLCT = <any>'PARAM_PLCLCT',	// Tipos de cuentas para referencias
  PARAM_NACDEF = <any>'PARAM_NACDEF',	// Nacionalidad default
  PARAM_TIDODE = <any>'PARAM_TIDODE',	// Código del tipo documento por default en creación cliente
  PARAM_CHEQUE = <any>'PARAM_CHEQUE',	// Código tipo producto cheques
  PARAM_AHORRO = <any>'PARAM_AHORRO',	// Código tipo producto ahorros
  PARAM_PLFIJO = <any>'PARAM_PLFIJO',	// Código tipo producto plazo fijo
  PARAM_RELACION_ECONOMICA_ASALARIADO = <any>'PARAM_RELACION_ECONOMICA_ASALARIADO',	// Código Asalariado
  PARAM_RELACION_ECONOMICA_COMERCIANTE = <any>'PARAM_RELACION_ECONOMICA_COMERCIANTE',	// Código Comerciante
  PARAM_RELACION_ECONOMICA_AMBOS = <any>'PARAM_RELACION_ECONOMICA_AMBOS',	// Código Ambos
  PARAM_DOC_CAOPA = <any>'PARAM_DOC_CAOPA',	// Código que almacena el tipo de documento pasaporte
  PARAM_SECECO = <any>'PARAM_SECECO',	// Código sector económico por defecto
  PARAM_TIPDID = <any>'PARAM_TIPDID',	// Código del tipo de dirección por defecto
  PARAM_PEAISR = <any>'PARAM_PEAISR',	// Valor por defecto en campo afecta isr en apertura cliente
  PARAM_AUTREG = <any>'PARAM_AUTREG',	// Requiere autorización para el registro de personas
  PARAM_PAISDE = <any>'PARAM_PAISDE',	// Código de país por defecto
  PARAM_NACEST = <any>'PARAM_NACEST',	// Código de nacionalidad estadounidense
  PARAM_CCLEM = <any>'PARAM_CCLEM',	//  Código de clase de cliente empleado del banco
  PARAM_RELACION_ECONOMICA_OTROS = <any>'PARAM_RELACION_ECONOMICA_OTROS',	// Relación Económica Ambos
  PARAM_CODIGO_TIPO_DIRECCION_COMERCIO = <any>'PARAM_CODIGO_TIPO_DIRECCION_COMERCIO',	// Código de tipo de dirección Comercio
  PARAM_FOSEID = <any>'PARAM_FOSEID',	// Identificadores de los formularios de servicios electrónicos
  PARAM_NOTCRE = <any>'PARAM_NOTCRE', //Código de forma de pago nota de crédito
  PARAM_TIDRTN = <any>'PARAM_TIDRTN'   // Código del tipo documento rtn
}
