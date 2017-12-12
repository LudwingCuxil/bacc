package com.bytesw.platform.bs.service.impl;

import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_FECHA_INICIAL_FUTURO_CRECE;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_CUENTA_PASIVA;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.service.CuentaService;
import com.bytesw.platform.eis.bo.clientes.ClienteResumen;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.depositos.PlanFuturoCrece;
import com.bytesw.platform.eis.bo.depositos.dominio.EstadoCuenta;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.dto.clientes.ClienteInformacionDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioFinalDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaDTO;
import com.bytesw.platform.eis.dto.depositos.PlanFuturoCreceDTO;
import com.bytesw.platform.eis.dto.depositos.ProductoDTO;
import com.bytesw.platform.eis.dto.depositos.RangoInteresDTO;
import com.bytesw.platform.eis.dto.depositos.TasaInteresDTO;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.SeccionFormularioCuenta;
import com.bytesw.platform.utilities.ParameterPlatform;
import com.bytesw.platform.utilities.ParameterProduct;

@Service
public class CuentaServiceBTHHNImpl extends CuentaServiceImpl implements CuentaService {
	
	@Override
	@Transactional(readOnly = true)
	public void validateParametroProducto(CuentaDTO cuenta, ProductoDTO producto, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException {
		ClienteResumen cliente = cuenta.getCliente();
		// CUENTA BASICA ACTIVA
		if (SeccionFormularioCuenta.CLIENTE_PRODUCTO.equals(seccion) && TipoPersona.N.equals(cliente.getTipoPersona())) {
			String isCuentaBasica = producto.getParameterValue(ParameterProduct.ES_CUENTA_BASICA);
			if (null != isCuentaBasica && Consts.SI.equals(isCuentaBasica.trim())) {
				Parametro nacionalidad = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_NACIONALIDAD);
				ClienteInformacionDTO c = clienteService.findCliente(cliente.getId().getTipoIdentificacion(), cliente.getId().getIdentificacion());
				if (nacionalidad.getValor().equalsIgnoreCase(c.getNacionalidad())) { 
					List<String> estados = Arrays.asList(EstadoCuenta.ACTIVA.getEstado(), EstadoCuenta.EMBARGADA.getEstado(), EstadoCuenta.PENDIENTE_ACTIVACION.getEstado(), EstadoCuenta.INACTIVA.getEstado());
					if (catalogoService.containsCuentaPorClienteProducto(c.getTipoIdentificacion(), c.getIdentificacion(), cuenta.getProducto().getId().getProducto(), cuenta.getProducto().getId().getSubProducto(), null, estados)) {
						throw new ServiceAccessException(ErrorMessage.CLIENTE_TIENE_CUENTA_BASICA_ACTIVA);
					}
				} else {
					throw new ServiceAccessException(ErrorMessage.CLIENTE_DE_NACIONALIDAD_DISTINTA_HONDURENIA);
				}
			}
		}
		// PLAN FUTURO CRECE
		if (SeccionFormularioCuenta.CLIENTE_PRODUCTO.equals(seccion)) {
			String plan = producto.getParameterValue(ParameterProduct.PLAN_AHORRO_FUTURO_CRECE);
			if (null != plan && !plan.isEmpty()) {
				if (!catalogoService.containsCuentaPorClienteProducto(cliente.getId().getTipoIdentificacion(), cliente.getId().getIdentificacion(), cuenta.getProducto().getId().getProducto(), 0, cuenta.getMoneda().getCodigo(), null)) {
					throw new ServiceAccessException(ErrorMessage.CLIENTE_NO_TIENE_CUENTA_AHORRO);
				}
			}
		}
		super.validateParametroProducto(cuenta, producto, seccion);
	}
	
	@Override
	@Transactional(readOnly = true)
	public List<PlanFuturoCreceDTO> findPlanFuturoCrece(String moneda) throws ServiceAccessException {
		List<PlanFuturoCreceDTO> response = new ArrayList<PlanFuturoCreceDTO>();
		List<PlanFuturoCrece> planes = catalogoService.findPlanFuturoCrece(moneda, true);
		if (null == planes || planes.isEmpty()) {
			throw new ServiceAccessException(ErrorMessage.PLAN_FUTURO_CRECE_NO_DISPONIBLE);
		}
		TasaInteresDTO tasaInteres = null;
		BigDecimal valorApertura = BigDecimal.ZERO;
		BigDecimal tasa = BigDecimal.ZERO;
		BigDecimal plazoMeses = BigDecimal.ZERO;
		BigDecimal vx = BigDecimal.ZERO;
		BigDecimal vy = BigDecimal.ZERO;
		BigDecimal vz = BigDecimal.ZERO;
		for (PlanFuturoCrece p : planes) {
			tasaInteres = new TasaInteresDTO(p.getTasa());
			rangos: for (RangoInteresDTO rango : tasaInteres.getRangos()) {
				if (rango.getRango().compareTo(BigDecimal.ZERO) != 0) {
					if (p.getMontoAhorroFinal().compareTo(rango.getRango()) < 0 || p.getMontoAhorroFinal().compareTo(rango.getRango()) == 0) {
						tasa = rango.getValor();
						break rangos;
					}
				}
			}
			if (tasa.compareTo(BigDecimal.ZERO) > 0) {
				plazoMeses = new BigDecimal(p.getPlazoMeses());
				vx = plazoMeses.multiply((plazoMeses.add(BigDecimal.ONE))).divide(new BigDecimal(2)).setScale(2, RoundingMode.DOWN);
				vy = tasa.divide(new BigDecimal(12), RoundingMode.DOWN).divide(new BigDecimal(100)).setScale(6, RoundingMode.DOWN);
				vz = vx.multiply(vy).add(plazoMeses).setScale(4, RoundingMode.DOWN);
				valorApertura = p.getMontoAhorroFinal().divide(vz, 2, RoundingMode.FLOOR);
			}
			response.add(new PlanFuturoCreceDTO(p, valorApertura, tasa));
		}
		return response;
	}
	
	@Override
	@Transactional(propagation = Propagation.SUPPORTS)
	public void afterSave(CuentaDTO cuenta, ProductoDTO producto) throws ServiceAccessException {
		// GRABA PLAN FUTURO CRECE
		String plan = producto.getParameterValue(ParameterProduct.PLAN_AHORRO_FUTURO_CRECE);
		if (null != plan && null != cuenta.getDatoGeneral().getPlanFuturoCrece()) {
			Calendar calculado = Calendar.getInstance();
			Date fecha = cuenta.getFechaApertura();
			Integer dia = 0, mes = 0, anio = 0;
			BigDecimal totalInteres = BigDecimal.ZERO;
			for (Integer correlativo = 1; correlativo <= cuenta.getDatoGeneral().getPlanFuturoCrece().getPlazoMeses(); correlativo++) {
				calculado.setTime(cuentaHelper.addCalendarDayOfYear(cuentaHelper.addCalendarMonth(fecha, correlativo), -1));
				dia = calculado.get(Calendar.DAY_OF_MONTH);
				mes = calculado.get(Calendar.MONTH) + 1;
				anio = calculado.get(Calendar.YEAR);
				if (dia.compareTo(0) == 0 || !(dia.compareTo(cuentaHelper.lastDayOfMonth(calculado.getTime())) < 0)) {
					if (mes.compareTo(2) == 0) {
						if (cuentaHelper.isLeapYear(calculado.get(Calendar.YEAR))) {
							if (producto.getMesCalendario().compareTo(1) == 0) {
								dia = 28;
							} else {
								dia = 29;
							}
						} else {
							dia = cuentaHelper.lastDayOfMonth(calculado.getTime());
						}
					} else {
						dia = cuentaHelper.lastDayOfMonth(calculado.getTime());
					}
				}
				cuenta.getDatoGeneral().getPlanFuturoCrece().setDiaVencimientoCuota(dia);
				cuenta.getDatoGeneral().getPlanFuturoCrece().setMesVencimientoCuota(mes);
				cuenta.getDatoGeneral().getPlanFuturoCrece().setAnioVencimientoCuota(anio);
				if (correlativo.compareTo(cuenta.getDatoGeneral().getPlanFuturoCrece().getPlazoMeses()) == 0) {
					BigDecimal ultimoInteres = cuenta.getDatoGeneral().getPlanFuturoCrece().getInteresProgramado().subtract(totalInteres);
					cuenta.getDatoGeneral().getPlanFuturoCrece().setUltimoValorInteres(ultimoInteres);
				}
				dao.savePlanFuturoCreceDetalle(cuenta, cuenta.getDatoGeneral().getPlanFuturoCrece(), correlativo);
				totalInteres = totalInteres.add(cuenta.getDatoGeneral().getPlanFuturoCrece().getValorInteres());
			}
			String cconcate = cuentaHelper.getCuentaEditada(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador(), Consts.EMPTY);
			super.saveCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_FECHA_INICIAL_FUTURO_CRECE, cconcate, cuenta.getDatoGeneral().getFechaInicio());
			dao.savePlanFuturoCreceEncabezado(cuenta);
		}
		// GRABA BENEFICIARIO FINAL
		if (!cuenta.getClienteEsBeneficiarioFinal()) {
			if (null != cuenta.getBeneficiariosFinales() && !cuenta.getBeneficiariosFinales().isEmpty()) {
				Integer correlativo = 1;
				ClienteResumenDTO personaAsociada = null;
				for (BeneficiarioFinalDTO b : cuenta.getBeneficiariosFinales()) {
					b.setDigitoIdentificador(cuenta.getDigitoIdentificador());
					b.setAgencia(cuenta.getAgencia());
					b.setCorrelativo(cuenta.getCorrelativo());
					b.setDigitoVerificador(cuenta.getDigitoVerificador());
					b.setCorrelativoBeneficiarioFinal(correlativo);
					b.setNombreCompleto(cuentaHelper.getNombreCompleto(b.getPrimerApellido(), b.getSegundoApellido(), b.getApellidoCasada(), b.getPrimerNombre(), b.getSegundoNombre()).toString());
					personaAsociada = dao.saveBeneficiarioFinal(b);
					if (null != personaAsociada) {
						cuenta.getPersonasRelacionadas().add(personaAsociada);
					}
					correlativo += 1;
				}
			}
		}
	}

}