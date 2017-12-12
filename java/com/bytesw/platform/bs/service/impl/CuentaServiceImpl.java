package com.bytesw.platform.bs.service.impl;

import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CUENTA_NOMBRE;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_ES_BANCA_EMPRESARIAL;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_PROPOSITO_CUENTA;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_ES_BENEFICIARIO_FINAL;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_FECHA_INICIAL_FUTURO_CRECE;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_CUENTA_PASIVA;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

import javax.annotation.Resource;
import javax.persistence.NoResultException;

import com.bytesw.platform.eis.bo.depositos.*;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.depositos.CuentaDao;
import com.bytesw.platform.bs.dao.depositos.CuentaResumenRepository;
import com.bytesw.platform.bs.dao.depositos.PersonaMancomunadaRepository;
import com.bytesw.platform.bs.dao.plataforma.CampoProductoRepository;
import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.CuentaHelper;
import com.bytesw.platform.bs.service.*;
import com.bytesw.platform.eis.bo.clientes.ClienteIndividual;
import com.bytesw.platform.eis.bo.clientes.ClienteResumen;
import com.bytesw.platform.eis.bo.clientes.dominio.EstadoCliente;
import com.bytesw.platform.eis.bo.clientes.dominio.Modalidad;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.depositos.*;
import com.bytesw.platform.eis.bo.depositos.dominio.CuentaRelacion;
import com.bytesw.platform.eis.bo.depositos.dominio.EstadoCuenta;
import com.bytesw.platform.eis.bo.depositos.dominio.TasaFijaRango;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;
import com.bytesw.platform.eis.bo.plataforma.*;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.dominio.Tipo;
import com.bytesw.platform.eis.dto.clientes.ClienteInformacionDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.depositos.*;
import com.bytesw.platform.utilities.*;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.persistence.NoResultException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

import static com.bytesw.platform.utilities.CamposAdicionalesUtil.*;

public class CuentaServiceImpl implements CuentaService {

	protected final Log logger = LogFactory.getLog(getClass());

	@Resource
    private CuentaResumenRepository cuentaResumenRepository;
	
	@Resource
	private PersonaMancomunadaRepository personaMancomunadaRepository;
	
	@Resource
	private CampoProductoRepository campoProductoRepository;
	
	@Autowired
	private ServicioElectronicoService servicioElectronicoService;
	
	@Autowired
	private FormularioProductoService formularioProductoService;
	
    @Autowired
    private CampoAdicionalService campoAdicionalService;
	
	@Autowired
	protected TransaccionFormaEnBlancoServiceImpl transaccionFormaEnBlancoService;
	
    @Autowired
    protected MnemonicoService mnemonicoService;
    
	@Autowired
	protected CatalogoService catalogoService;	
	
	@Autowired
	protected ClienteService clienteService;
	
	@Autowired
	protected TransaccionService transaccionService;
	
	@Autowired
	protected CuentaHelper cuentaHelper;
	
	@Autowired
	@Qualifier("cuentaIntegrationDao")
	protected CuentaDao dao;
	
	@Override
	public Iterable<CuentaResumen> findAllCuentas(String tipoDocumento, String documento, List<Integer> excluir, List<String> estados, List<String> monedas) {
		List<CuentaResumen> cuentas = new ArrayList<CuentaResumen>();
		tipoDocumento = StringUtils.leftPad(tipoDocumento, 1, ' ');
		documento = StringUtils.leftPad(documento, 18, ' ');
		if (null == excluir) {
			excluir = new ArrayList<Integer>();
			excluir.add(0);
		}
		if (null == estados) {
			estados = new ArrayList<String>();
			estados.add(EstadoCuenta.PENDIENTE_ACTIVACION.getEstado());
			estados.add(EstadoCuenta.ACTIVA.getEstado());
			estados.add(EstadoCuenta.EMBARGADA.getEstado());
			estados.add(EstadoCuenta.INACTIVA.getEstado());
			estados.add(EstadoCuenta.CANCELADA.getEstado());
		}
		cuentas.addAll(this.findCuentasTitular(tipoDocumento, documento, excluir, estados, monedas));
		cuentas.addAll(this.findCuentasCoPropietario(tipoDocumento, documento, excluir, estados, monedas));
		cuentas.addAll(this.findCuentasResponsable(tipoDocumento, documento, excluir, estados, monedas));
		return cuentas;
	}
    
	@Transactional(readOnly = true)
	public List<CuentaResumen> findCuentasTitular(String tipoDocumento, String documento, List<Integer> excluir, List<String> estados, List<String> monedas) {
		List<CuentaResumen> cuentas = cuentaResumenRepository.findCuentasTitular(tipoDocumento, documento, excluir, estados, monedas);
		cuentas.stream().forEach(cuenta -> cuenta.setRelacion(CuentaRelacion.TITULAR));
		return cuentas;
	}
	
	@Transactional(readOnly = true)
	public List<CuentaResumen> findCuentasCoPropietario(String tipoDocumento, String documento, List<Integer> excluir, List<String> estados, List<String> monedas) {
		List<CuentaResumen> cuentas = personaMancomunadaRepository.findCuentasCoPropietario(tipoDocumento, documento, excluir, estados, monedas);
		cuentas.stream().forEach(cuenta -> cuenta.setRelacion(CuentaRelacion.COPROPIETARIO));
		return cuentas;
	}
	
	@Transactional(readOnly = true)
	public List<CuentaResumen> findCuentasResponsable(String tipoDocumento, String documento, List<Integer> excluir, List<String> estados, List<String> monedas) {
		List<CuentaResumen> cuentas = cuentaResumenRepository.findCuentasResponsable(tipoDocumento, documento, excluir, estados, monedas);
		cuentas.stream().forEach(cuenta -> cuenta.setRelacion(CuentaRelacion.RESPONSABLE));
		return cuentas;
	}
	
	@Transactional(readOnly = true)
	public TasaInteresCalculoDTO getTasaInteresPorValorApertura(CuentaDTO cuenta) throws ServiceAccessException {
		TasaInteresCalculoDTO response = new TasaInteresCalculoDTO();
		BigDecimal tasaInteres = BigDecimal.ZERO;
		ProductoDTO p = catalogoService.findProducto(cuenta.getProducto().getId().getProducto(), cuenta.getProducto().getId().getSubProducto());
		TasaInteresDTO tasa = null;
		if (Consts.TASA_ESPECIAL.equals(p.getCodigoTasaInteres())) {
			TasaDia td = catalogoService.findTasaDia(cuenta.getMoneda().getCodigo(), cuenta.getPlazoFijo().getPlazoDias());
			if (null == td) {
				throw new ServiceAccessException(ErrorMessage.TASA_ESPECIAL_NO_DISPONIBLE_MONEDA_Y_PLAZO);
			}
			tasa = new TasaInteresDTO(td.getTasaInteres());
		} else {
			tasa = new TasaInteresDTO(catalogoService.findTasaInteresPorCodigo(p.getCodigoTasaInteres()));
		}
		if (TasaFijaRango.F.equals(tasa.getFijaRango())) {
			if (null != tasa.getRangos().get(0)) {
				tasaInteres = tasa.getRangos().get(0).getValor();
			}
		} else {
			rangos: for (RangoInteresDTO rango : tasa.getRangos()) {
				if (rango.getRango().compareTo(BigDecimal.ZERO) != 0) {
					if (cuenta.getDatoGeneral().getValorApertura().compareTo(rango.getRango()) < 0) {
						tasaInteres = rango.getValor();
						break rangos;
					}
				}
			}
		}
		response.setTasaInteres(tasaInteres);
		response.setMesCalendario(p.getMesCalendario());
		return response;
	}
	
	@Override
	@Transactional(readOnly = true)
	public Date findFechaOperacion(String empresa) throws NoResultException, ServiceAccessException {
		RegistroControl rc = catalogoService.findRegistroControl(empresa);
		Date fechaOperacion = null;
		try {
			fechaOperacion = cuentaHelper.getFechaOperacion(rc);
		} catch (ParseException pe) {
			throw new ServiceAccessException(ErrorMessage.ERROR_FORMATO_FECHA_OPERACION);
		}
		return fechaOperacion;
	}
	
	@Override
	@Transactional(readOnly = true)
	public TasaInteresCalculoDTO findTasaInteresResumen(CuentaDTO cuenta, String empresa) throws NoResultException, ServiceAccessException {
		TasaInteresCalculoDTO response = this.getTasaInteresPorValorApertura(cuenta);
		Date fecha = this.findFechaOperacion(empresa);
		if (response.getMesCalendario().compareTo(1) == 0) {
			response.setVencimiento(cuentaHelper.getFechaVencimientoComercialAS400(fecha, cuenta.getPlazoFijo().getPlazoDias()));
		} else {
			response.setVencimiento(cuentaHelper.getFechaVencimientoCalendario(fecha, cuenta.getPlazoFijo().getPlazoDias()));
		}
		return response;
	}
	
	@Override
	@Transactional(readOnly = true)
	public TransaccionEquivalente findTransaccionEquivalente(String equivalente, String moneda, Integer tipoProducto) throws ServiceAccessException {
		return transaccionService.findTransaccionEquivalente(equivalente, moneda, tipoProducto);
	}
	
	@Override
	@Transactional(readOnly = true)
	public List<ServicioElectronico> findServiciosElectronicos(TipoPersona tipoPersona, Integer producto, Integer subProducto) throws ServiceAccessException {
		List<ServicioElectronico> response = servicioElectronicoService.findByTipoPersona(Tipo.valueOf(tipoPersona.name()));
		if (null == response || response.isEmpty()) {
			throw new ServiceAccessException(ErrorMessage.SERVICIOS_ELECTRONICOS_NO_DISPONIBLES);
		}
		// VERIFICA PARAMETRIZACION DE FORMULARIOS [table PLT_REPORTES_PRODUCTOS]
		Parametro mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_FORMULARIO_SERVICIOS_ELECTRONICOS);
		Integer codigo = null;
		if (null != mnemonico.getValores()) {
			for (ParametroDetalle valor : mnemonico.getValores()) {
				if (valor.getDescripcion().equals(tipoPersona.name())) {
					codigo = Integer.parseInt(valor.getValor());
					break;
				}
			}
		}
		List<FormularioProducto> productosValidos = formularioProductoService.findByTipoPersonaAndProductoAndFormulario(tipoPersona, producto, codigo);
		if (null == productosValidos || productosValidos.isEmpty()) {
			throw new ServiceAccessException(ErrorMessage.SERVICIOS_ELECTRONICOS_NO_DISPONIBLES);
		}
		if (!cuentaHelper.isEnableFormulario(productosValidos, subProducto)) {
			throw new ServiceAccessException(ErrorMessage.SERVICIOS_ELECTRONICOS_NO_DISPONIBLES);
		}
		return response;
	}
	
	@Override
	@Transactional(readOnly = true)
	public CampoProducto findCampoProducto(Integer producto, Integer subProducto, String campo) {
		return campoProductoRepository.findCampoProductoByProductoAndSubProducto(producto, subProducto, campo);
	}

	@Override
    @Transactional(readOnly = true)
	public ProductoEspecial findProductoEspecialByCuentaId(CuentaId id) throws NoResultException {
		return catalogoService.findProductoEspecialByCuentaId(id);
	}

	@Override
	public List<PlanFuturoCreceDTO> findPlanFuturoCrece(String moneda) throws ServiceAccessException {
		return new ArrayList<PlanFuturoCreceDTO>();
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validate(CuentaDTO cuenta, String empresa, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException {
		try {
			boolean result = false;
			this.beforeValidate(cuenta, seccion);
			if (SeccionFormularioCuenta.CLIENTE_PRODUCTO.equals(seccion)) {
				result = this.validateClienteProducto(cuenta);
			}
			if (SeccionFormularioCuenta.DATOS_GENERALES.equals(seccion)) {
				result = this.validateDatoGeneral(cuenta, empresa);
			}
			if (SeccionFormularioCuenta.PLAZO_FIJO.equals(seccion)) {
				result = this.validatePlazoFijo(cuenta);
			}
			this.afterValidate(cuenta, seccion);
			return result;
		} catch (ServiceAccessException se) {
			throw se;
		} catch (AuthorizationRequiredException are) {
			throw are;
		} catch (Exception exception) {
			exception.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.ERROR_EN_VALIDACION_CUENTA);
		}
	}
	
	public void beforeValidate(CuentaDTO cuenta, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException {
		/** RUTINAS ANTES DE VALIDACION DE PANTALLA **/
	}

	public void afterValidate(CuentaDTO cuenta, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException {
		/** RUTINAS DESPUES DE VALIDACION DE PANTALLA **/
	}
	
	// VALIDACIONES DE APERTURA DE CUENTA

	@Override
	@Transactional(readOnly = true)
	public boolean validateClienteProducto(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		Parametro mnemonico = null;
		int value = 0;
		if (TipoPersona.N.equals(cuenta.getCliente().getTipoPersona())) {
			if (null != cuenta.getCliente().getFechaNacimiento()) {
				int edad = Consts.getEdad(cuenta.getCliente().getFechaNacimiento());
				mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
				value = Integer.parseInt(mnemonico.getValor());
				if (edad < value) {
					throw new AuthorizationRequiredException(Permission.MENOEDAD);
				}
				mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MAXIMA);
				value = Integer.parseInt(mnemonico.getValor());
				if (edad > value) {
					throw new AuthorizationRequiredException(Permission.MAYOEDAD);
				}
			}
		}
		if (EstadoCliente.I.equals(cuenta.getCliente().getEstado())) {
			throw new ServiceAccessException(ErrorMessage.CLIENTE_INACTIVO_PARA_APERTURAR_CUENTA);
		}
		if (clienteService.isClienteEnListaNegraPorIdentificacion(cuenta.getCliente())) {
			throw new AuthorizationRequiredException(Permission.DOCLISNE);
		}
		if (clienteService.isClienteEnListaNegraPorNombres(cuenta.getCliente())) {
			throw new AuthorizationRequiredException(Permission.NOMLISNE);
		}
		ProductoDTO producto = catalogoService.findProducto(cuenta.getProducto().getId().getProducto(), cuenta.getProducto().getId().getSubProducto());
		this.validateParametroProducto(cuenta, producto, SeccionFormularioCuenta.CLIENTE_PRODUCTO);
		return true;
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public boolean validateDatoGeneral(CuentaDTO cuenta, String empresa) throws ServiceAccessException, AuthorizationRequiredException {
		ProductoDTO producto = catalogoService.findProducto(cuenta.getProducto().getId().getProducto(), cuenta.getProducto().getId().getSubProducto());
		DatoGeneralDTO dg = cuenta.getDatoGeneral();
		if (Modalidad.I.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD I
			if (null == dg.getValorApertura()) {
				throw new ServiceAccessException(ErrorMessage.VALOR_APERTURA_INCORRECTO);
			}
			if (dg.getValorApertura().compareTo(producto.getSaldoMinimoApertura()) < 0 && !cuenta.isAuthorized(SeccionFormularioCuenta.DATOS_GENERALES.name(), Permission.SALDOMIN)) {
				throw new AuthorizationRequiredException(Permission.SALDOMIN);
			}
		}
		CuentaParaPermiso cta = null;
		if (Modalidad.U.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD U
			CuentaId id = new CuentaId();
			id.setDigitoVerificador(cuenta.getDigitoVerificador());
			id.setAgencia(cuenta.getAgencia());
			id.setCorrelativo(cuenta.getCorrelativo());
			id.setDigitoIdentificador(cuenta.getDigitoIdentificador());
			try {
				cta = catalogoService.findCuentaParaPermisoById(id);
			} catch (NoResultException nre) {
				logger.error(nre.getMessage());
			}
		}
		if (!dg.getAfectaIsr() && !cuenta.isAuthorized(SeccionFormularioCuenta.DATOS_GENERALES.name(), Permission.EXCENISR)) {
			ClienteInformacionDTO cliente = clienteService.findCliente(cuenta.getCliente().getId().getTipoIdentificacion(), cuenta.getCliente().getId().getIdentificacion());
			if (Modalidad.I.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD I
				if (cliente.getAfectoISR()) {
					throw new AuthorizationRequiredException(Permission.EXCENISR);
				}
			}
			if (Modalidad.U.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD U
				if (cliente.getAfectoISR() && null != cta && cta.getAfectaIsr()) {
					throw new AuthorizationRequiredException(Permission.EXCENISR);		
				}
			}
		}
		if (!dg.getCargoPorManejoCuenta() && !cuenta.isAuthorized(SeccionFormularioCuenta.DATOS_GENERALES.name(), Permission.EXCTACXM)) {
			if (Modalidad.I.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD I
				throw new AuthorizationRequiredException(Permission.EXCTACXM);
			}
			if (Modalidad.U.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD U
				if (null != cta && cta.getCargoPorManejoCuenta()) {
					throw new AuthorizationRequiredException(Permission.EXCTACXM);
				}
			} 
		}
		if (Modalidad.I.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD I
			if (null != dg.getProductoCampo1() && dg.getProductoCampo1().compareTo(0) > 0 && producto.getTipoForma().compareTo(0) != 0) {
				CajeroDTO cajero = (CajeroDTO) ((Usuario) this.getAuthentication().getPrincipal()).getInfoAdicional();
				TrxFormaEnBlancoRequestDTO req = new TrxFormaEnBlancoRequestDTO();
				req.setCodigoTransaccion(Consts.TRX_VALIDA_FORMA_EN_BLANCO);
				req.setMonedaForma(producto.getMoneda().getCodigo());
				req.setTipoForma(producto.getTipoForma());
				req.setNoFormaInicial(dg.getProductoCampo1());
				req.setNoFormaFinal(dg.getProductoCampo1());
				req.setAgencia(cajero.getAgencia());
				req.setDepartamento(cajero.getDepartamento());
				req.setFechaOperacion(this.findFechaOperacion(empresa));
				req.setReferenciaForma(Consts.EMPTY);
				req.setNombrePrograma(Consts.PLAT);
				req.setUsuario(cajero.getUsuario());
				TrxFormaEnBlancoResponseDTO response = transaccionFormaEnBlancoService.procesar(req);
				if (null != response && response.getCodigo().compareTo(1) == 0) {
					throw new ServiceAccessException(ErrorMessage.NO_EXISTE_EN_INVENTARIO_DE_FORMAS);
				} else {
					req.setCodigoTransaccion(Consts.TRX_VALIDA_FORMA_EN_BLANCO_UTILIZADA);
					response = transaccionFormaEnBlancoService.procesar(req);
					if (null != response && response.getCodigo().compareTo(1) == 0) {
						throw new ServiceAccessException(ErrorMessage.NUMERO_FORMA_YA_UTILIZADA);
					}
				}
			}
		}
		if (null == dg.getMontoDepositos() || dg.getMontoDepositos().compareTo(BigDecimal.ZERO) == 0) {
			throw new ServiceAccessException(ErrorMessage.MONTO_DEPOSITOS_INCORRECTO);
		}
		this.validateParametroProducto(cuenta, producto, SeccionFormularioCuenta.DATOS_GENERALES);
		return true;
	}
	
	@Transactional(readOnly = true)
	public boolean validateDatoGeneralToUpdate(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		this.validateDatoGeneral(cuenta, null);
		
		// PERMISO DE CAMBIO DE DATOS GENERALES
		
		if (!cuenta.isAuthorized(SeccionFormularioCuenta.DATOS_GENERALES.name(), Permission.CAMBICTA)) {
			throw new AuthorizationRequiredException(Permission.CAMBICTA);
	    }
		 
		return true;
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validatePlazoFijo(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		PlazoFijoDTO pf = cuenta.getPlazoFijo();
		TasaInteresCalculoDTO tasaInteres = this.getTasaInteresPorValorApertura(cuenta);
		if (pf.getTasa().compareTo(tasaInteres.getTasaInteres()) != 0 && !cuenta.isAuthorized(SeccionFormularioCuenta.PLAZO_FIJO.name(), Permission.EXCTATAS)) {
			throw new AuthorizationRequiredException(Permission.EXCTATAS);
		}
		if (null != pf.getDebitarCuenta() && null != pf.getMonto()) {
			if (pf.getMonto().compareTo(cuenta.getDatoGeneral().getValorApertura()) > 0) {
				throw new ServiceAccessException(ErrorMessage.MONTO_DEBITAR_MAYOR_APERTURA);
			}
			if (pf.getMonto().compareTo(cuenta.getDatoGeneral().getValorApertura()) < 0) {
				throw new ServiceAccessException(ErrorMessage.MONTO_DEBITAR_MENOR_APERTURA);
			}
		}
		return true;
	}

	@Override
	@Transactional(readOnly = true)
	public void validateParametroProducto(CuentaDTO cuenta, ProductoDTO producto, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException {
		if (Modalidad.I.equals(cuenta.getModalidad())) { // CAMBIO MODALIDAD DE EDICION
			if (SeccionFormularioCuenta.DATOS_GENERALES.equals(seccion)) {
				String vma = producto.getParameterValue(ParameterProduct.MAXIMO_APERTURA);
				if (null != vma) {
					BigDecimal sma = new BigDecimal(vma);
					if (cuenta.getDatoGeneral().getValorApertura().compareTo(sma) > 0) {
						throw new ServiceAccessException(ErrorMessage.VALOR_APERTURA_MAYOR_AL_ESTABLECIDO);
					}
				}
			}
		}
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validateBeneficiario(String tipoDocumento, String numeroDocumento) throws ServiceAccessException {
		return clienteService.validateIdentificacion(tipoDocumento, numeroDocumento);
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validatePersonaMancomunada(PersonaMancomunadaDTO persona) throws ServiceAccessException {
		Parametro mnemonico = null;
		int value = 0;
		if (TipoPersona.N.equals(persona.getCliente().getTipoPersona())) {
			if (null != persona.getCliente().getFechaNacimiento()) {
				int edad = Consts.getEdad(persona.getCliente().getFechaNacimiento());
				mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
				value = Integer.parseInt(mnemonico.getValor());
				if (edad < value) {
					throw new ServiceAccessException(ErrorMessage.CLIENTE_MENOR_DE_EDAD);
				}
				mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MAXIMA);
				value = Integer.parseInt(mnemonico.getValor());
				if (edad > value) {
					throw new ServiceAccessException(ErrorMessage.CLIENTE_DE_TERCERA_EDAD);
				}
			}
		}
		if (clienteService.isClienteEnListaNegraPorIdentificacion(persona.getCliente())) {
			throw new ServiceAccessException(ErrorMessage.IDENTIFICACION_EN_LISTA_NEGRA);
		}
		if (clienteService.isClienteEnListaNegraPorNombres(persona.getCliente())) {
			throw new ServiceAccessException(ErrorMessage.NOMBRES_EN_LISTA_NEGRA);
		}
		return true;
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validatePersonaAutorizada(PersonaChequeraDTO persona) throws ServiceAccessException {
		return clienteService.validateIdentificacion(persona.getTipoDocumento().getCodigo(), persona.getNumeroDocumento());
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean validateFirmante(FirmanteDTO firmante) throws ServiceAccessException {
		Parametro mnemonico = null;
		int value = 0;
		if (firmante.getEditable()) { // SOLO SI EL FIRMANTE ES EDITABLE
			if (TipoPersona.N.equals(firmante.getCliente().getTipoPersona())) {
				if (null != firmante.getCliente().getFechaNacimiento()) {
					int edad = Consts.getEdad(firmante.getCliente().getFechaNacimiento());
					mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
					value = Integer.parseInt(mnemonico.getValor());
					if (edad < value) {
						throw new ServiceAccessException(ErrorMessage.CLIENTE_MENOR_DE_EDAD);
					}
					// CONSULTAR SI ES MAYOR DE EDAD TAMBIEN NO DEJAR ASOCIAR COMO FIRMANTE
					mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MAXIMA);
					value = Integer.parseInt(mnemonico.getValor());
					if (edad > value) {
						throw new ServiceAccessException(ErrorMessage.CLIENTE_DE_TERCERA_EDAD);
					}
				}
			}
			if (clienteService.isClienteEnListaNegraPorIdentificacion(firmante.getCliente())) {
				throw new ServiceAccessException(ErrorMessage.IDENTIFICACION_EN_LISTA_NEGRA);
			}
			if (clienteService.isClienteEnListaNegraPorNombres(firmante.getCliente())) {
				throw new ServiceAccessException(ErrorMessage.NOMBRES_EN_LISTA_NEGRA);
			}
		}
		return true;
	}
	
	@Override
	@Transactional(readOnly = true)
	public boolean isClienteBeneficiarioFinal(String numeroCuenta) throws ResourceNotFoundException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == bo) {
			throw new ResourceNotFoundException();
		}
		String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
		Object esBeneficiarioFinal = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, idCuenta);
		if (null != esBeneficiarioFinal) {
			return (Boolean) esBeneficiarioFinal;
		}
		return true; // CLIENTE ES BENEFICIARIO FINAL
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO save(String empresa, CuentaDTO cuenta) throws ServiceAccessException {
		TransaccionResponseDTO response = new TransaccionResponseDTO();
		TransaccionRequestDTO request = new TransaccionRequestDTO();
		boolean success = false;
		ClienteResumenDTO personaAsociada = null;
		CajeroDTO cajero = (CajeroDTO) ((Usuario) this.getAuthentication().getPrincipal()).getInfoAdicional();
		try {
			this.beforeSave(cuenta);
			// TITULAR DE LA CUENTA
			if (null == cuenta.getPersonasRelacionadas()) {
				cuenta.setPersonasRelacionadas(new ArrayList<ClienteResumenDTO>());
			}
			personaAsociada = new ClienteResumenDTO(cuenta.getCliente());
			personaAsociada.setRelacion(Consts.RELACION_TITULAR);
			cuenta.getPersonasRelacionadas().add(personaAsociada);

			// RECUPERA PRODUCTO A CREAR
			ProductoDTO producto = catalogoService.findProducto(cuenta.getProducto().getId().getProducto(), cuenta.getProducto().getId().getSubProducto());

			// CALCULA NUMERO DE CUENTA
			Integer prtipo = producto.getDigitoIdentificador();
			Integer dpagen = cajero.getAgencia();
			Integer dpcorr = this.getCorrelativoCuenta(prtipo, dpagen);
			Integer dpdive = this.getDigitoVerificador(cuenta.getTipoProducto(), prtipo, dpagen, dpcorr);

			// CALCULA CUENTA EDITADA
			String ceditada = cuentaHelper.getCuentaEditada(prtipo, dpagen, dpcorr, dpdive, Consts.GUION);
			String cconcate = cuentaHelper.getCuentaEditada(prtipo, dpagen, dpcorr, dpdive, Consts.EMPTY);

			cuenta.setDigitoIdentificador(prtipo);
			cuenta.setAgencia(dpagen);
			cuenta.setCorrelativo(dpcorr);
			cuenta.setDigitoVerificador(dpdive);
			cuenta.setNumeroCuenta(ceditada);
			cuenta.setValorProducto(producto.getProducto());
			cuenta.setValorTipoProducto(producto.getTipoProducto().getCodigo());
			cuenta.setValorSubProducto(producto.getSubProducto());
			cuenta.setValorMoneda(producto.getMoneda().getCodigo());
			cuenta.setUsuarioAperturo(cajero.getUsuario());
			cuenta.setAgenciaApertura(cajero.getAgencia());
			cuenta.setGrupoEmision(producto.getEmiteEstadoCuenta() ? 1 : 0);
			cuenta.setFechaOperacion(this.findFechaOperacion(empresa)); 

			// ESTADO DE LA CUENTA
			Integer tipoProducto = cuenta.getTipoProducto().getCodigo();
			if (this.debitaCuenta(cuenta.getPlazoFijo())) { // DEBITO POR APERTURA ??
				CuentaResumen c = cuenta.getPlazoFijo().getDebitarCuenta();
				request.setModalidad(TransactionMode.NORMAL);
				request.setCodigoTransaccion(0);
				request.setCajero(cajero.getCodigo());
				request.setFecha(cuenta.getFechaOperacion());
				request.setHora(new Date());
				request.setAgencia(cajero.getAgencia());
				request.setIndicadores(0);
				request.setEquivalente(Transaction.DEBITO_POR_APERTURA);
				request.setMoneda(c.getMoneda());
				request.setTipoProducto(c.getTipoProducto());
				ContenidoRequestDTO contenido = new ContenidoRequestDTO();
				contenido.setTrx01(cuentaHelper.getCuentaEditada(c.getId().getDigitoIdentificador(), c.getId().getAgencia(), c.getId().getCorrelativo(), c.getId().getDigitoVerificador(), Consts.EMPTY));
				contenido.setTrx04(cuenta.getPlazoFijo().getMonto());
				request.setContenido(contenido);
				response = transaccionService.procesarTransaccion(request);
				if (null != response && response.isTransactionError()) {
					throw new ServiceAccessException(response.getMensajeError(), false);
				}
				if (cuenta.getPlazoFijo().getMonto().compareTo(cuenta.getDatoGeneral().getValorApertura()) == 0) {
					cuenta.setEstado(EstadoCuenta.ACTIVA.getEstado());
				} else {
					cuenta.setEstado(EstadoCuenta.PENDIENTE_ACTIVACION.getEstado());
				}
				cuenta.setTransaccion(request);
			} else {
				cuenta.setEstado(EstadoCuenta.PENDIENTE_ACTIVACION.getEstado());
			}
			// FECHA APERTURA
			Integer[] fechaOperacion = catalogoService.findFechaOperacionAS400(empresa);
			cuenta.setAnioApertura(fechaOperacion[2]);
			cuenta.setMesApertura(fechaOperacion[1]);
			cuenta.setDiaApertura(fechaOperacion[0]);
			// VERIFICA PARAMETRO GENERICO [CTAINPLA]
			ParametroGenerico ctainpla = mnemonicoService.findParametroGenerico(GenericParameter.CTAINPLA);
			if (Consts.SI.equalsIgnoreCase(ctainpla.getValor())) {
				cuenta.setUltimoIgualApertura(true);
			}
			// ES TIPO DE PRODUCTO CHEQUE ??
			Parametro cheque = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CHEQUES);
			if (tipoProducto.toString().equalsIgnoreCase(cheque.getValor())) {
				cuenta.setTipoProductoCheque(true);
			} else {
				cuenta.setTipoProductoCheque(false);
			}
			dao.saveCuenta(cuenta);
			if (cuenta.getDatoGeneral().getSectorEconomico().getCodigo().compareTo(2) == 0 || cuenta.getDatoGeneral().getSectorEconomico().getCodigo().compareTo(5) == 0) {
			}
			dao.saveCuentaInfoAdicional(cuenta);
			// DATOS ADICIONALES NUEVOS
			this.saveCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_CUENTA_NOMBRE, cconcate, cuenta.getDatoGeneral().getNombre());
			this.saveCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_PROPOSITO_CUENTA, cconcate, cuenta.getDatoGeneral().getProposito());
			this.saveCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BANCA_EMPRESARIAL, cconcate, cuenta.getDatoGeneral().getBancaEmpresarialPyme());
			this.saveCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, cconcate, cuenta.getClienteEsBeneficiarioFinal());
			/** GRABA LOG STANDARD **/
			if (producto.getUsaChequera() && !cuenta.getDatoChequera().getChequeraPersonalizada()) {
				// VERIFICA PARAMETRO GENERICO [TIPSOLCH]
				Integer tipoSolicitud = 1;
				String tipsolche = this.findParametroPorProducto(producto, GenericParameter.TIPSOLCH);
				if (null != tipsolche) {
					tipoSolicitud = Integer.parseInt(tipsolche.trim());
				}
				cuenta.getDatoChequera().setTipoSolicitud(tipoSolicitud);
				// GRABA INFORMACION DE CHEQUERA DE LA CUENTA
				dao.saveCuentaInfoChequera(cuenta);
				dao.saveCuentaSolicitudChequera(cuenta);
				if (null != cuenta.getDatoChequera().getPersonasAutorizadas() && !cuenta.getDatoChequera().getPersonasAutorizadas().isEmpty()) {
					for (PersonaChequeraDTO personaChequera : cuenta.getDatoChequera().getPersonasAutorizadas()) {
						personaChequera.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						personaChequera.setAgencia(cuenta.getAgencia());
						personaChequera.setCorrelativo(cuenta.getCorrelativo());
						personaChequera.setDigitoVerificador(cuenta.getDigitoVerificador());
						dao.saveCuentaPersonaChequera(personaChequera);
					}
				}
			}
			if (!tipoProducto.toString().equalsIgnoreCase(cheque.getValor()) && producto.getTipoForma().compareTo(0) != 0) {
				// DESCARGA FORMA EN BLANCO
				TrxFormaEnBlancoRequestDTO req = new TrxFormaEnBlancoRequestDTO();
				req.setCodigoTransaccion(Consts.TRX_DESCARGA_FORMA_EN_BLANCO);
				req.setMonedaForma(producto.getMoneda().getCodigo());
				req.setTipoForma(producto.getTipoForma());
				req.setNoFormaInicial(cuenta.getDatoGeneral().getProductoCampo1());
				req.setNoFormaFinal(cuenta.getDatoGeneral().getProductoCampo1());
				req.setAgencia(cajero.getAgencia());
				req.setDepartamento(cajero.getDepartamento());
				req.setFechaOperacion(cuenta.getFechaOperacion());
				req.setReferenciaForma(cconcate);
				req.setNombrePrograma(Consts.PLAT);
				req.setUsuario(cajero.getUsuario());
				TrxFormaEnBlancoResponseDTO trxResponse = transaccionFormaEnBlancoService.procesar(req);
				if (null != trxResponse && trxResponse.getCodigo().compareTo(1) == 0) {
					String message = ErrorMessage.RANGOS_DE_FORMAS_NO_DESCARGADOS;
					if (req.getNoFormaInicial().compareTo(req.getNoFormaFinal()) == 0) {
						message = ErrorMessage.NUMERO_FORMA_NO_DESCARGADA;
					}
					throw new ServiceAccessException(message);
				}
			}
			// GRABA BENEFICIARIOS DE LA CUENTA
			String cb = producto.getParameterValue(ParameterProduct.CAPTURA_BENEFICIARIOS);
			if (!Consts.NO.equals(cb)) {
				if (null != cuenta.getBeneficiarios() && !cuenta.getBeneficiarios().isEmpty()) {
					Integer correlativo = 1;
					for (BeneficiarioDTO beneficiario : cuenta.getBeneficiarios()) {
						beneficiario.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						beneficiario.setAgencia(cuenta.getAgencia());
						beneficiario.setCorrelativo(cuenta.getCorrelativo());
						beneficiario.setDigitoVerificador(cuenta.getDigitoVerificador());
						beneficiario.setCorrelativoBeneficiario(correlativo);
						beneficiario.setNombreCompleto(cuentaHelper.getNombreCompleto(beneficiario));
						personaAsociada = dao.saveBeneficiario(beneficiario);
						if (null != personaAsociada) {
							cuenta.getPersonasRelacionadas().add(personaAsociada);
						}
						correlativo += 1;
					}
				}
			}
			// GRABA PERSONAS MANCOMUNADAS DE LA CUENTA
			if (cuenta.getDatoGeneral().getCuentaMancomunada()) {
				if (null != cuenta.getPersonasAsociadas() && !cuenta.getPersonasAsociadas().isEmpty()) {
					for (PersonaMancomunadaDTO personaMancomunada : cuenta.getPersonasAsociadas()) {
						personaMancomunada.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						personaMancomunada.setAgencia(cuenta.getAgencia());
						personaMancomunada.setCorrelativo(cuenta.getCorrelativo());
						personaMancomunada.setDigitoVerificador(cuenta.getDigitoVerificador());
						personaAsociada = dao.saveCuentaMancomunada(personaMancomunada);
						if (null != personaAsociada) {
							cuenta.getPersonasRelacionadas().add(personaAsociada);
						}
					}
				}
			}
			/** SI ES CUENTA DE TRASLADO **/
			if (producto.getPermiteTraslados()) {
				if (null != cuenta.getCuentasTraslados() && !cuenta.getCuentasTraslados().isEmpty()) {
					Integer prioridad = 1;
					for (CuentaResumen ct : cuenta.getCuentasTraslados()) {
						ct.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						ct.setAgencia(cuenta.getAgencia());
						ct.setCorrelativo(cuenta.getCorrelativo());
						ct.setDigitoVerificador(cuenta.getDigitoVerificador());
						ct.setPrioridad(prioridad);
						dao.saveCuentaTraslado(ct);
						prioridad += 1;
					}
				}
			}
			/** GRABA DPCTAT **/
			// GRABA FIRMANTES DE LA CUENTA
			if (null != cuenta.getFirma()) {
				if (null != cuenta.getFirma().getFirmantes() && !cuenta.getFirma().getFirmantes().isEmpty()) {
					Integer correlativo = 1;
					for (FirmanteDTO firmante : cuenta.getFirma().getFirmantes()) {
						firmante.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						firmante.setAgencia(cuenta.getAgencia());
						firmante.setCorrelativo(cuenta.getCorrelativo());
						firmante.setDigitoVerificador(cuenta.getDigitoVerificador());
						firmante.setCorrelativoFirma(correlativo);
						// CAMBIO PARA GRABAR LOS DATOS DEL CLIENTE EN LA TABLA DE FIRMAS -- PLAT-660
						ClienteIndividual individual = catalogoService.findClienteIndividualById(firmante.getCliente().getId().getTipoIdentificacion(), firmante.getCliente().getId().getIdentificacion());
						if (null != individual) {
							firmante.setIndividual(individual);
						} else {
							firmante.setIndividual(new ClienteIndividual());
						}
						personaAsociada = dao.saveFirma(firmante);
						if (null != personaAsociada) {
							if (!firmante.getEditable() && TipoPersona.J.equals(cuenta.getCliente().getTipoPersona())) {
								personaAsociada.setIdentificacion(firmante.getCliente().getId().getIdentificacion());
								personaAsociada.setTipoDeIdentificacion(firmante.getCliente().getTipoDeIdentificacion());
								personaAsociada.setNumeroIdentificacion(firmante.getCliente().getId().getIdentificacion());
								personaAsociada.setNombre(firmante.getCliente().getNombre());
							}
							cuenta.getPersonasRelacionadas().add(personaAsociada);
						}
						correlativo += 1;
					}
				}
			}
			/** GRABA LOG ESTANDAR DE FIRMAS **/
			// ES TIPO DE PRODUCTO PLAZO FIJO ??
			Parametro plazoFijo = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_PLAZO_FIJO);
			if (tipoProducto.toString().equalsIgnoreCase(plazoFijo.getValor())) {
				cuenta.getPlazoFijo().setTasaInteres(producto.getCodigoTasaInteres());
				dao.saveCuentaPlazoFijo(cuenta);
				dao.saveCuentaTasaInteresCertificado(cuenta);
			}
			/** GRABA SERVICIOS ELECTRONICOS **/
			if (null != cuenta.getServiciosElectronicos() && !cuenta.getServiciosElectronicos().isEmpty()) {
				for (ServicioElectronico servicioElectronico : cuenta.getServiciosElectronicos()) {
					if (null != servicioElectronico.getAcepta() && servicioElectronico.getAcepta()) {
						servicioElectronico.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						servicioElectronico.setAgencia(cuenta.getAgencia());
						servicioElectronico.setCorrelativo(cuenta.getCorrelativo());
						servicioElectronico.setDigitoVerificador(cuenta.getDigitoVerificador());
						dao.saveServicioElectronico(servicioElectronico);
					}
				}
			}
			this.afterSave(cuenta, producto);
			success = true;
		}  catch (ServiceAccessException sae) {
			sae.printStackTrace();
			throw sae;
		} /*catch (TransactionException te) {
			te.printStackTrace();
			throw new ServiceAccessException(te.getMessage(), te.isOverride());
		} */catch (Exception e) {
			e.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.ERROR_EN_APERTURA_CUENTA);
		} finally {
			if (!success && response.isTransactionOk()) { // REVERSAR
				this.revertTransaction(request);
			}
		}
        return cuenta;
	}
	
	@Override
	public void afterTransactionSave(CuentaDTO cuenta) {
		CajeroDTO cajero = (CajeroDTO) ((Usuario) this.getAuthentication().getPrincipal()).getInfoAdicional();
		// ACREDITAR A CUENTA ??
		if (debitaCuenta(cuenta.getPlazoFijo()) && null != cuenta.getTransaccion()) {
			TransaccionRequestDTO request = new TransaccionRequestDTO();
			boolean revert = false;
			try {
				request.setModalidad(TransactionMode.NORMAL);
				request.setCodigoTransaccion(0);
				request.setCajero(cajero.getCodigo());
				request.setFecha(cuenta.getFechaOperacion());
				request.setHora(new Date());
				request.setAgencia(cajero.getAgencia());
				request.setIndicadores(0);
				request.setEquivalente(Transaction.ACREDITA_CUENTA);
				request.setMoneda(cuenta.getValorMoneda());
				request.setTipoProducto(cuenta.getValorTipoProducto());
				ContenidoRequestDTO contenido = new ContenidoRequestDTO();
				contenido.setTrx01(cuentaHelper.getCuentaEditada(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador(), Consts.EMPTY));
				contenido.setTrx04(cuenta.getPlazoFijo().getMonto());
				request.setContenido(contenido);
				TransaccionResponseDTO response = transaccionService.procesarTransaccion(request);
				if (null != response && response.isTransactionError()) {
					revert = true;
				}
			} catch (ServiceAccessException sae) {
				sae.printStackTrace();
				revert = true;
			} finally {
				if (revert) {
					this.revertTransaction(cuenta.getTransaccion());
				}
			}
		}
		// GRABA INDICES DE LA CUENTA
		try {
			this.generateAccountIndex(cuenta);
		} catch (Exception e) {
			e.printStackTrace();
			logger.error("ERROR AL GENERAR INDICES: ", e);
		}
		// TRANSACCION DE APERTURA
		try {
			TransaccionRequestDTO request = new TransaccionRequestDTO();
			request.setModalidad(TransactionMode.NORMAL);
			request.setCodigoTransaccion(0);
			request.setCajero(cajero.getCodigo());
			request.setFecha(cuenta.getFechaOperacion());
			request.setHora(new Date());
			request.setAgencia(cajero.getAgencia());
			request.setIndicadores(0);
			request.setEquivalente(Transaction.APERTURA);
			request.setMoneda(cuenta.getValorMoneda());
			request.setTipoProducto(cuenta.getValorTipoProducto());
			ContenidoRequestDTO contenido = new ContenidoRequestDTO();
			contenido.setTrx01(cuentaHelper.getCuentaEditada(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador(), Consts.EMPTY));
			contenido.setTrx04(cuenta.getDatoGeneral().getValorApertura());
			request.setContenido(contenido);
			transaccionService.procesarTransaccion(request);
		} catch (ServiceAccessException sae) {
			sae.printStackTrace();
			logger.error("ERROR EN TRANSACCION DE APERTURA: ", sae);
		}
	}
	
	private void revertTransaction(TransaccionRequestDTO request) {
		try {
			request.setHora(new Date());
			request.setModalidad(TransactionMode.REVERSA);
			transaccionService.procesarTransaccion(request);
		} catch (ServiceAccessException sae) {
			sae.printStackTrace();
			logger.error("ERROR AL REVERSAR TRANSACCION: ", sae);
		}
	}
	
	private void generateAccountIndex(CuentaDTO cuenta) throws ServiceAccessException {
		GeneraIndiceRequestDTO req = new GeneraIndiceRequestDTO();
		req.setDigitoIdentificador(cuenta.getDigitoIdentificador());
		req.setAgencia(cuenta.getAgencia());
		req.setCorrelativo(cuenta.getCorrelativo());
		req.setDigitoVerificador(cuenta.getDigitoVerificador());
		transaccionService.generarIndiceCuenta(req);
	}
	
	@Override
	@Transactional(readOnly = true)
	public CuentaResumen findCuentaToPortal(String numeroCuenta) throws ResourceNotFoundException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == bo) {
			throw new ResourceNotFoundException();
		}
		String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
		String nombre = (String) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_CUENTA_NOMBRE, idCuenta);
		if (null != nombre) {
			bo.setNombre(nombre);
		}
		TipoProducto tipoProducto = null;
		try {
			tipoProducto = catalogoService.findTipoProductoById(bo.getTipoProducto());
			bo.setDescripcionTipoProducto(null != tipoProducto ? tipoProducto.getDescripcion() : null);
		} catch (NoSuchElementException e) {
			logger.error(e.getMessage(), e);
		}
		ProductoResumen producto = catalogoService.findProductoResumenById(bo.getTipoProducto(), bo.getSubProducto());
		bo.setDescripcionSubProducto(null != producto ? producto.getDescripcion() : null);
		return bo;
	}
	
	@Override
	@Transactional(readOnly = true)
	public CuentaDTO findCuentaToUpdateNombre(String numeroCuenta) throws ResourceNotFoundException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == bo) {
			throw new ResourceNotFoundException();
		}
		String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
		String nombre = (String) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_CUENTA_NOMBRE, idCuenta);
		if (null != nombre) {
			bo.setNombre(nombre);
		}
		return new CuentaDTO(bo, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateDatoGeneral(String numeroCuenta) throws NoResultException {
		Cuenta bo = new Cuenta();
		try {
			bo = catalogoService.findCuentaByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		if (null != bo.getId()) {
			String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
			Object nombre = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_CUENTA_NOMBRE, idCuenta);
			if (null != nombre) {
				bo.setNombre((String) nombre);
			}
			Object proposito = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_PROPOSITO_CUENTA, idCuenta);
			if (null != proposito) {
				bo.setProposito((String) proposito);
			}
			Object bancaEmpresarialPyme = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BANCA_EMPRESARIAL, idCuenta);
			if (null != bancaEmpresarialPyme) {
				bo.setBancaEmpresarialPyme((Boolean) bancaEmpresarialPyme);
			} else {
				bo.setBancaEmpresarialPyme(false);
			}
			Object fechaInicio = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_FECHA_INICIAL_FUTURO_CRECE, idCuenta);
			if (null != fechaInicio) {
				bo.setFechaInicio((Date)fechaInicio);
			}
		}
		return new CuentaDTO(bo, true, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateDatoInteres(String numeroCuenta) throws NoResultException {
		Cuenta bo = new Cuenta();
		try {
			bo = catalogoService.findCuentaByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		return new CuentaDTO(bo, false, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateChequera(String numeroCuenta) throws NoResultException {
		Chequera bo = new Chequera();
		try {
			bo = catalogoService.findChequeraByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		List<PersonaChequera> pcs = catalogoService.findPersonasChequeraByCuentaId(bo.getId());
		return new CuentaDTO(bo, pcs, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateBeneficiarios(String numeroCuenta) throws NoResultException {
		Cuenta bo = new Cuenta();
		try {
			bo = catalogoService.findCuentaByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		return new CuentaDTO(bo, bo.getBeneficiarios(), Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateBeneficiariosFinales(String numeroCuenta) throws NoResultException {
		Cuenta bo = new Cuenta();
		try {
			bo = catalogoService.findCuentaByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		return new CuentaDTO(bo.getBeneficiariosFinales(), bo, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateFirmas(String numeroCuenta) throws ResourceNotFoundException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == bo) {
			throw new ResourceNotFoundException();
		}
		List<Firma> frms = catalogoService.findFirmasByNumeroCuenta(numeroCuenta);
		CuentaAdicional adicional = catalogoService.findCuentaAdicionalById(bo.getId());
		CuentaDTO cuenta = new CuentaDTO(bo, frms, adicional, Modalidad.U);
		if (null != cuenta.getFirma() && null != cuenta.getFirma().getFirmantes() && !cuenta.getFirma().getFirmantes().isEmpty()) {
			for (FirmanteDTO firmante : cuenta.getFirma().getFirmantes()) {
				ClienteResumen cliente = clienteService.findClienteResumenById(bo.getTipoDocumento(), bo.getDocumento());
				if (null != cliente) {
					if (null != cliente.getTipoDeIdentificacion() && null != cliente.getNumeroIdentificacion()) {	
						if (cliente.getTipoDeIdentificacion().equals(firmante.getCliente().getTipoDeIdentificacion()) && cliente.getNumeroIdentificacion().equals(firmante.getCliente().getNumeroIdentificacion())) {
							firmante.setEditable(false);
							break;
						}
					}
				}
			}
		}
		return cuenta;
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateServiciosElectronicos(String numeroCuenta) throws NoResultException {
		CuentaParaEditar bo = new CuentaParaEditar();
		try {
			bo = catalogoService.findCuentaParaEditarByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
		Object esBeneficiarioFinal = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, idCuenta);
		return new CuentaDTO(bo, (Boolean) esBeneficiarioFinal, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdatePersonasAsociadas(String numeroCuenta) throws NoResultException {
		CuentaParaEditar bo = new CuentaParaEditar();
		try {
			bo = catalogoService.findCuentaParaEditarByNumeroCuenta(numeroCuenta);
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		return new CuentaDTO(bo, null, Modalidad.U);
	}
	
	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToViewPlazoFijo(String numeroCuenta) throws NoResultException {
		CuentaResumen cta = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == cta) {
			throw new NoResultException();
		}
		PlazoFijo bo = new PlazoFijo();
		try {
			bo = catalogoService.findCuentaPlazoFijoById(cta.getId());
		} catch (NoResultException nre) {
			logger.error(nre.getMessage());
		}
		return new CuentaDTO(bo);
	}

	@Override
	@Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
	public CuentaDTO findCuentaToUpdateCuentasTraslados(String numeroCuenta) throws NoResultException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		if (null == bo) {
			throw new NoResultException();
		}
		List<CuentaTraslado> cts = catalogoService.findCuentasTrasladoByCuentaId(bo.getId());
		return new CuentaDTO(bo, cts, Modalidad.U);
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateNombre(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE NOMBRE
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.CAMBIO_DE_NOMBRE.name(), Permission.MODNOMCT)) {
            throw new AuthorizationRequiredException(Permission.MODNOMCT);
        }
        try {
        	dao.updateNombre(cuenta);
        	String idCuenta = getIdCuentaParaCamposAdicionales(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador());
            this.updateCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_CUENTA_NOMBRE, idCuenta, cuenta.getDatoGeneral().getNombre());
            
            // CAMBIAR INDICES DE LA CUENTA
    		try {
    			this.generateAccountIndex(cuenta);
    		} catch (Exception e) {
    			e.printStackTrace();
    			logger.error("ERROR AL GENERAR INDICES: ", e);
    		}
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_NOMBRE_CUENTA);
        }
        return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateDatoGeneral(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		this.validateDatoGeneralToUpdate(cuenta);
		try {
			dao.updateDatoGeneral(cuenta);
			CuentaId id = new CuentaId(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador());
			if (catalogoService.existsCuentaAdicionalById(id)) {
				dao.updateDatoGeneralAdicional(cuenta);
			} else {
				dao.saveCuentaInfoAdicional(cuenta);
			}
			String idCuenta = getIdCuentaParaCamposAdicionales(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador());
			String proposito = (String) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_PROPOSITO_CUENTA, idCuenta);
			if (cuenta.getDatoGeneral().isPropositoCambio(proposito)) {
				this.updateCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_PROPOSITO_CUENTA, idCuenta, cuenta.getDatoGeneral().getProposito());
			}
			Boolean bancaEmpresarialPyme = (Boolean) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BANCA_EMPRESARIAL, idCuenta);
			if (cuenta.getDatoGeneral().isBancaEmpresarialPymeCambio(bancaEmpresarialPyme)) {
				this.updateCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BANCA_EMPRESARIAL, idCuenta, cuenta.getDatoGeneral().getBancaEmpresarialPyme());
			}
			Date fechaInicio = (Date) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_FECHA_INICIAL_FUTURO_CRECE, idCuenta);
			if (cuenta.getDatoGeneral().isFechaInicioCambio(fechaInicio)) {
				this.updateCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_FECHA_INICIAL_FUTURO_CRECE, idCuenta, cuenta.getDatoGeneral().getFechaInicio());
			}
		} catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
			e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DATO_GENERAL);
		}
		return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateChequera(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE DATO CHEQUERA
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.DATO_CHEQUERA.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
		try {
			dao.updateCuentaInfoChequera(cuenta);
			if (null != cuenta.getDatoChequera().getPersonasAutorizadas() && !cuenta.getDatoChequera().getPersonasAutorizadas().isEmpty()) {
				for (PersonaChequeraDTO personaChequera : cuenta.getDatoChequera().getPersonasAutorizadas()) {
					if (null != personaChequera.getModalidad()) {
						personaChequera.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						personaChequera.setAgencia(cuenta.getAgencia());
						personaChequera.setCorrelativo(cuenta.getCorrelativo());
						personaChequera.setDigitoVerificador(cuenta.getDigitoVerificador());
						if (Modalidad.I.equals(personaChequera.getModalidad())) {
        					dao.saveCuentaPersonaChequera(personaChequera);
        				}
        				if (Modalidad.U.equals(personaChequera.getModalidad())) {
        					dao.updateCuentaPersonaChequera(personaChequera);
        				}
        				if (Modalidad.D.equals(personaChequera.getModalidad())) {
        					dao.deleteCuentaPersonaChequera(personaChequera);
        				}
        				if (Modalidad.U.equals(personaChequera.getModalidad()) || Modalidad.I.equals(personaChequera.getModalidad())) {
        					personaChequera.setModalidad(null);
                        }
					} else {
						logger.info("persona chequera sin cambios : " + cuenta.getNumeroCuenta());
					}
				}
				cuenta.getDatoChequera().getPersonasAutorizadas().removeIf(p -> Modalidad.D.equals(p.getModalidad()));
			}
		} catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
			e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DATO_CHEQUERA);
		}
		return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateDatoInteres(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE DATO INTERES
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.DATO_INTERES.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
		try {
			dao.updateDatoInteres(cuenta);
		} catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
			e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DATO_INTERES);
		}
		return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateBeneficiarios(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE BENEFICIARIOS
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.BENEFICIARIOS.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
        if (null != cuenta.getBeneficiarios() && !cuenta.getBeneficiarios().isEmpty()) {
        	try {
        		for (BeneficiarioDTO beneficiario : cuenta.getBeneficiarios()) {
        			if (null != beneficiario.getModalidad()) {
        				beneficiario.setDigitoIdentificador(cuenta.getDigitoIdentificador());
        				beneficiario.setAgencia(cuenta.getAgencia());
        				beneficiario.setCorrelativo(cuenta.getCorrelativo());
        				beneficiario.setDigitoVerificador(cuenta.getDigitoVerificador());
        				beneficiario.setNombreCompleto(cuentaHelper.getNombreCompleto(beneficiario));
        				if (Modalidad.I.equals(beneficiario.getModalidad())) {
        					Integer correlativo = dao.getSiguienteCorrelativoBeneficiario(beneficiario);
            				beneficiario.setCorrelativoBeneficiario(correlativo);
        					dao.saveBeneficiario(beneficiario);
        				}
        				if (Modalidad.U.equals(beneficiario.getModalidad())) {
        					dao.updateBeneficiario(beneficiario);
        				}
        				if (Modalidad.D.equals(beneficiario.getModalidad())) {
        					dao.deleteBeneficiario(beneficiario);
        				}
        				if (Modalidad.U.equals(beneficiario.getModalidad()) || Modalidad.I.equals(beneficiario.getModalidad())) {
        					beneficiario.setModalidad(null);
                        }
        			} else {
        				logger.info("beneficiario sin cambios : " + cuenta.getNumeroCuenta() + " correlativo: " + beneficiario.getCorrelativoBeneficiario());
        			}
        		}
        		cuenta.getBeneficiarios().removeIf(b -> Modalidad.D.equals(b.getModalidad()));
        	} catch (DeadlockLoserDataAccessException e) {
                e.printStackTrace();
                throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
            } catch (Exception e) {
        		e.printStackTrace();
        		throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_BENEFICIARIOS);
        	}
        }
		return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateBeneficiariosFinales(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE BENEFICIARIOS FINALES
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.BENEFICIARIOS_FINALES.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
        if (null != cuenta.getBeneficiariosFinales() && !cuenta.getBeneficiariosFinales().isEmpty()) {
        	try {
        		for (BeneficiarioFinalDTO beneficiario : cuenta.getBeneficiariosFinales()) {
        			if (null != beneficiario.getModalidad()) {
        				beneficiario.setDigitoIdentificador(cuenta.getDigitoIdentificador());
        				beneficiario.setAgencia(cuenta.getAgencia());
        				beneficiario.setCorrelativo(cuenta.getCorrelativo());
        				beneficiario.setDigitoVerificador(cuenta.getDigitoVerificador());
        				beneficiario.setNombreCompleto(cuentaHelper.getNombreCompleto(beneficiario));
        				if (Modalidad.I.equals(beneficiario.getModalidad())) {
        					Integer correlativo = dao.getSiguienteCorrelativoBeneficiarioFinal(beneficiario);
        					beneficiario.setCorrelativoBeneficiarioFinal(correlativo);
        					dao.saveBeneficiarioFinal(beneficiario);
        				}
        				if (Modalidad.U.equals(beneficiario.getModalidad())) {
        					dao.updateBeneficiarioFinal(beneficiario);
        				}
        				if (Modalidad.D.equals(beneficiario.getModalidad())) {
        					dao.deleteBeneficiarioFinal(beneficiario);
        				}
        				if (Modalidad.U.equals(beneficiario.getModalidad()) || Modalidad.I.equals(beneficiario.getModalidad())) {
        					beneficiario.setModalidad(null);
                        }
        			} else {
        				logger.info("beneficiario final sin cambios : " + cuenta.getNumeroCuenta() + " correlativo: " + beneficiario.getCorrelativoBeneficiarioFinal());
        			}
        		}
        		cuenta.getBeneficiariosFinales().removeIf(b -> Modalidad.D.equals(b.getModalidad()));
        	} catch (DeadlockLoserDataAccessException e) {
                e.printStackTrace();
                throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
            } catch (Exception e) {
        		e.printStackTrace();
        		throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_BENEFICIARIOS_FINALES);
        	}
        }
		return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateFirmas(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE FIRMAS
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.FIRMAS.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
        try {
        	dao.updateFirmaEncabezado(cuenta);
        	if (null != cuenta.getFirma()) {
				if (null != cuenta.getFirma().getFirmantes() && !cuenta.getFirma().getFirmantes().isEmpty()) {
					for (FirmanteDTO firmante : cuenta.getFirma().getFirmantes()) {
						if (null != firmante.getModalidad()) {
							firmante.setDigitoIdentificador(cuenta.getDigitoIdentificador());
							firmante.setAgencia(cuenta.getAgencia());
							firmante.setCorrelativo(cuenta.getCorrelativo());
							firmante.setDigitoVerificador(cuenta.getDigitoVerificador());
							if (Modalidad.U.equals(firmante.getModalidad()) || Modalidad.I.equals(firmante.getModalidad())) { // CAMBIO PARA ACTUALIZAR LOS DATOS DEL CLIENTE EN LA TABLA DE FIRMAS -- PLAT-660
								ClienteIndividual individual = catalogoService.findClienteIndividualById(firmante.getCliente().getId().getTipoIdentificacion(), firmante.getCliente().getId().getIdentificacion());
								if (null != individual) {
									firmante.setIndividual(individual);
								} else {
									firmante.setIndividual(new ClienteIndividual());
								}
							}
							if (Modalidad.I.equals(firmante.getModalidad())) {
								Integer correlativo = dao.getSiguienteCorrelativoFirma(firmante);
								firmante.setCorrelativoFirma(correlativo);
	        					dao.saveFirma(firmante);
	        				}
	        				if (Modalidad.U.equals(firmante.getModalidad())) {
	        					dao.updateFirma(firmante);
	        				}
	        				if (Modalidad.D.equals(firmante.getModalidad())) {
	        					dao.deleteFirma(firmante);
	        				}
	        				if (Modalidad.U.equals(firmante.getModalidad()) || Modalidad.I.equals(firmante.getModalidad())) {
	        					firmante.setModalidad(null);
	                        }
						} else {
							logger.info("firma sin cambios : " + cuenta.getNumeroCuenta() + " correlativo: " + firmante.getCorrelativoFirma());
						}
					}
					cuenta.getFirma().getFirmantes().removeIf(f -> Modalidad.D.equals(f.getModalidad()));
				}
        	}
			CuentaId id = new CuentaId(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador());
			if (catalogoService.existsCuentaAdicionalById(id)) {
				dao.updateCuentaInfoAdicional(cuenta);
			} else {
				dao.saveCuentaInfoAdicional(cuenta);
			}
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_FIRMAS);
        }
        return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateServiciosElectronicos(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE SERVICIOS ELECTRONICOS
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.SERVICIOS_ELECTRONICOS.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
        try {
        	dao.deleteServicioElectronico(cuenta);
        	if (null != cuenta.getServiciosElectronicos() && !cuenta.getServiciosElectronicos().isEmpty()) {
				for (ServicioElectronico servicioElectronico : cuenta.getServiciosElectronicos()) {
					if (null != servicioElectronico.getAcepta() && servicioElectronico.getAcepta()) {
						servicioElectronico.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						servicioElectronico.setAgencia(cuenta.getAgencia());
						servicioElectronico.setCorrelativo(cuenta.getCorrelativo());
						servicioElectronico.setDigitoVerificador(cuenta.getDigitoVerificador());
						dao.saveServicioElectronico(servicioElectronico);
					}
				}
			}
        	String idCuenta = getIdCuentaParaCamposAdicionales(cuenta.getDigitoIdentificador(), cuenta.getAgencia(), cuenta.getCorrelativo(), cuenta.getDigitoVerificador());
        	Boolean esBeneficiarioFinal = (Boolean) this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, idCuenta);
			if (cuenta.isBeneficiarioFinalCambio(esBeneficiarioFinal)) {
				this.updateCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, idCuenta, cuenta.getClienteEsBeneficiarioFinal());
			}
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_SERVICIOS_ELECTRONICOS);
        }
        return cuenta;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updatePersonasAsociadas(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE PERSONAS MANCOMUNADAS
        if (!cuenta.isAuthorized(SeccionFormularioCuenta.PERSONAS_ASOCIADAS.name(), Permission.CAMBICTA)) {
            throw new AuthorizationRequiredException(Permission.CAMBICTA);
        }
        try {
        	if (null != cuenta.getPersonasAsociadas() && !cuenta.getPersonasAsociadas().isEmpty()) {
				for (PersonaMancomunadaDTO personaMancomunada : cuenta.getPersonasAsociadas()) {
					if (null != personaMancomunada.getModalidad()) {
						personaMancomunada.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						personaMancomunada.setAgencia(cuenta.getAgencia());
						personaMancomunada.setCorrelativo(cuenta.getCorrelativo());
						personaMancomunada.setDigitoVerificador(cuenta.getDigitoVerificador());
						if (Modalidad.I.equals(personaMancomunada.getModalidad())) {
        					dao.saveCuentaMancomunada(personaMancomunada);
        				}
						if (Modalidad.U.equals(personaMancomunada.getModalidad())) {
        					dao.updateCuentaMancomunada(personaMancomunada);
        				}
        				if (Modalidad.D.equals(personaMancomunada.getModalidad())) {
        					dao.deleteCuentaMancomunada(personaMancomunada);
        				}
        				if (Modalidad.U.equals(personaMancomunada.getModalidad()) || Modalidad.I.equals(personaMancomunada.getModalidad())) {
        					personaMancomunada.setModalidad(null);
                        }
					} else {
						logger.info("mancomunado sin cambios : " + cuenta.getNumeroCuenta() + " cldoc: " + personaMancomunada.getCliente().getId().getIdentificacion());
					}
				}
				cuenta.getPersonasAsociadas().removeIf(m -> Modalidad.D.equals(m.getModalidad()));
			}
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_PERSONAS_ASOCIADAS);
        }
        return cuenta;
	}

	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public CuentaDTO updateCuentasTraslados(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException {
		// PERMISO DE CAMBIO DE CUENTAS DE TRASLADOS
		if (!cuenta.isAuthorized(SeccionFormularioCuenta.CUENTAS_TRASLADOS.name(), Permission.CAMBICTA)) {
			throw new AuthorizationRequiredException(Permission.CAMBICTA);
		}
		try {
			if (Modalidad.U.equals(cuenta.getModalidad())) {
				dao.deleteCuentasTraslados(cuenta);
				if (null != cuenta.getCuentasTraslados() && !cuenta.getCuentasTraslados().isEmpty()) {
					Integer prioridad = 1;
					for (CuentaResumen ct : cuenta.getCuentasTraslados()) {
						ct.setDigitoIdentificador(cuenta.getDigitoIdentificador());
						ct.setAgencia(cuenta.getAgencia());
						ct.setCorrelativo(cuenta.getCorrelativo());
						ct.setDigitoVerificador(cuenta.getDigitoVerificador());
						ct.setPrioridad(prioridad);
						dao.saveCuentaTraslado(ct);
						prioridad += 1;
					}
				}
			} else {
				logger.info("cuentas de traslados sin cambios : " + cuenta.getNumeroCuenta() + " cldoc: " + cuenta.getCliente().getId().getIdentificacion());
			}
		} catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
			e.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_CUENTAS_TRASLADOS);
		}
		return cuenta;
	}
	
	public void beforeSave(CuentaDTO cuenta) throws ServiceAccessException {
		/** RUTINAS ANTES DE GRABAR CUENTA **/
	}

	public void afterSave(CuentaDTO cuenta, ProductoDTO producto) throws ServiceAccessException {
		/** RUTINAS DESPUES DE GRABAR CUENTA **/
	}
	
	private boolean debitaCuenta(PlazoFijoDTO pf) {
		return (null != pf.getDebitarCuenta() && null != pf.getDebitarCuenta().getNumeroCuenta() && null != pf.getMonto() && pf.getMonto().compareTo(BigDecimal.ZERO) > 0) && pf.getDebita();
	}
	
	private String getIdCuentaParaCamposAdicionales(CuentaId id){
		return cuentaHelper.getCuentaEditada(id.getDigitoIdentificador(), id.getAgencia(), id.getCorrelativo(), id.getDigitoVerificador(), Consts.EMPTY);
	}
	
	private String getIdCuentaParaCamposAdicionales(Integer digitoIdentificador, Integer agencia, Integer correlativo, Integer digitoVerificador){
		return cuentaHelper.getCuentaEditada(digitoIdentificador, agencia, correlativo, digitoVerificador, Consts.EMPTY);
	}

	public void saveCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
		campoAdicionalService.saveCampoAdicional(entidad, campo, id, valor);
	}

	public Object getValorCampoAdicional(String entidad, String campo, String id) {
		return campoAdicionalService.getValorCampoAdicional(entidad, campo, id);
	}

	public void updateCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
		campoAdicionalService.updateCampoAdicional(entidad, campo, id, valor);
	}

	@Transactional
	public Integer getCorrelativoCuenta(Integer tipoProducto, Integer agencia) throws ServiceAccessException {
		Integer correlativo = 0;
		try {
			correlativo = dao.getCorrelativo(tipoProducto, agencia);
			if (null == correlativo) {
				correlativo = dao.saveCorrelativo(tipoProducto, agencia);
			}
			logger.info("DPCCAP --> GET [" + tipoProducto + " - " + agencia + " - " + correlativo + "]");
			boolean existe = dao.existeCorrelativo(tipoProducto, agencia, correlativo + 1);
			if (existe) {
				Integer disponible = correlativo + 2;
				List<Integer> correlativos = dao.getListaCorrelativo(tipoProducto, agencia, correlativo + 1);
				if (null != correlativos && !correlativos.isEmpty()) {
					for (Integer siguiente : correlativos) {
						if (disponible.compareTo(siguiente) == 0) {
							disponible += 1;
							continue;
						} else if ((siguiente - disponible) > 1) {
							break;
						}
					}
					correlativo = disponible;
				} else {
				    correlativo = disponible;
                }
			} else {
				correlativo += 1;
			}
			logger.info("DPCCAP --> UPDATE [" + correlativo + "]");
			dao.updateCorrelativo(tipoProducto, agencia, correlativo);
		} catch (Exception e) {
			e.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.ERROR_CALCULO_CORRELATIVO_NUMERO_CUENTA);
		}
		return correlativo;
	}
	
	@Transactional
	public Integer getDigitoVerificador(TipoProducto tipoProducto, Integer prtipo, Integer dpagen, Integer dpcorr) throws ServiceAccessException {
		CalculoDigitoVerificador cdv = catalogoService.findCalculoDigitoVerificador(tipoProducto.getTipoDigito());
		if (null == cdv) {
			throw new ServiceAccessException(ErrorMessage.ERROR_RECUPERAR_CALCULO_DIGITO_VERIFICADOR);
		}
		Integer response = 0;
		if (cdv.getModulo().compareTo(10) == 0) {
			response = cuentaHelper.getDigitoVerificador10(prtipo, dpagen, dpcorr, cdv);
		} else if (cdv.getModulo().compareTo(11) == 0) {
			response = cuentaHelper.getDigitoVerificador11(prtipo, dpagen, dpcorr, cdv);
		}
		if (null == response) {
			throw new ServiceAccessException(ErrorMessage.ERROR_CALCULO_DIGITO_VERIFICADOR);
		}
		logger.info("DIGITO VERIFICADOR --> [" + prtipo + " - " + dpagen + " - " + dpcorr + " - " + response + "]");
		return response;
	}
	
	@Transactional(readOnly = true)
	public String findParametroPorProducto(ProductoDTO producto, String parametro) {
		String valor = producto.getParameterValue(parametro);
		try {
			if (null == valor) {
				ParametroGenerico mnemonico = mnemonicoService.findParametroGenerico(parametro);
				valor = mnemonico.getValor();
			}
		} catch (NoResultException nre) {
			nre.printStackTrace();
			valor = null;
			logger.error("ERROR AL RECUPERAR PARAMETRO DEL PRODUCTO", nre);
		}
		return valor;
	}
	
	@Override
	@Transactional(readOnly = true)
	public CuentaSeccionPendiente findSeccionesPendientesByCuenta(String numeroCuenta) throws ResourceNotFoundException {
		CuentaResumen bo = cuentaResumenRepository.findByNumeroCuenta(numeroCuenta);
		
		if (null == bo) {
			throw new ResourceNotFoundException();
		}
		
		CuentaSeccionPendiente seccion = new CuentaSeccionPendiente();
		String idCuenta = getIdCuentaParaCamposAdicionales(bo.getId());
		
		Object esBeneficiarioFinal = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_ES_BENEFICIARIO_FINAL, idCuenta);
		Object datoGeneral = this.getValorCampoAdicional(ENTIDAD_CUENTA_PASIVA, CAMPO_PROPOSITO_CUENTA, idCuenta);
		
		if (null != esBeneficiarioFinal) {
			if (!(Boolean) esBeneficiarioFinal) {
				esBeneficiarioFinal = catalogoService.existsBeneficiarioFinalByCuentaId(bo.getId());
			}
		} else {
			esBeneficiarioFinal = true;
		}
		
		seccion.setId(bo.getId());
		seccion.setBeneficiarioFinal((Boolean) esBeneficiarioFinal);
		seccion.setDatoGeneral(null != datoGeneral);
		
		return seccion;
	}

	private Authentication getAuthentication() {
		return SecurityContextHolder.getContext().getAuthentication();
	}
	
}