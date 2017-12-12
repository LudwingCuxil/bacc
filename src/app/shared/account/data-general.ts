import { OriginFund } from '../../origin-funds-select/shared/origin-fund.model';
import { ActividadEconomica } from '../client/actividad-economica';
import { DireccionCliente } from './client-direction';
import { Agency } from '../../agencies-select/shared/agencies-select.model';
import { OperationsSupervisor } from '../../operations-supervisor/shared/operations-supervisor.model';
import { BusinessExecutive } from '../../business-executive/shared/business-executive.model';
import { PlanFuturoCrece } from './plan-futuro-crece';
import { Promotions } from '../../promotions-select/shared/promotions-select.model';
import { EconomicSector } from '../../economic-sector/shared/economic-sector';
import { AccountPurpose } from '../../account-purpose-select/shared/account-purpose.model';
import { EconomicGroup } from '../../economic-group/economic-group';

export class DatoGeneral{
  abrirLaCuenta = new OriginFund();
  actividadEconomica = new ActividadEconomica();
  afectaIsr: boolean = true;
  bancaEmpresarialPyme: boolean = false;
  cargoPorManejoCuenta: boolean = true;
  cuentaMancomunada: boolean = false;
  direccion = new DireccionCliente();
  envioEstadoCuenta = new Agency();
  funcionarioResponsable = new OperationsSupervisor();
  montoDepositos: number = null;
  nombre: string = '';
  numeroPoliza: string = '';
  oficialCuentas = new BusinessExecutive();
  planFuturoCrece = new PlanFuturoCrece();
  productoCampo1: number = null;
  promocion = new Promotions();
  proposito: string = '';
  sectorEconomico = new EconomicSector();
  utilizarEnCuenta = new AccountPurpose();
  valorApertura: number = null;
  grupoEconomico = new EconomicGroup();
  fechaInicio: Date = null;
}
