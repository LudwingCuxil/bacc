package com.bytesw.platform.bs.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Query;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.depositos.CuentaDao;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.CuentaHelper;
import com.bytesw.platform.eis.bo.clientes.ActividadEconomica;
import com.bytesw.platform.eis.bo.clientes.Institucion;
import com.bytesw.platform.eis.bo.clientes.Pais;
import com.bytesw.platform.eis.bo.clientes.ReferenciaComercial;
import com.bytesw.platform.eis.bo.clientes.ReferenciaCuenta;
import com.bytesw.platform.eis.bo.clientes.ReferenciaDependiente;
import com.bytesw.platform.eis.bo.clientes.ReferenciaPersonalFamiliar;
import com.bytesw.platform.eis.bo.clientes.TipoDocumento;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.depositos.PersonaMancomunada;
import com.bytesw.platform.eis.bo.depositos.dominio.EstadoCuenta;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.bo.reportes.CuentasServiciosElectronicos;
import com.bytesw.platform.eis.bo.reportes.DireccionesTrabajoReporte;
import com.bytesw.platform.eis.bo.reportes.ReporteBeneficiario;
import com.bytesw.platform.eis.bo.reportes.ReporteBeneficiarioAhorro;
import com.bytesw.platform.eis.bo.reportes.ReporteBeneficiarioFinal;
import com.bytesw.platform.eis.bo.reportes.ReporteComplemento;
import com.bytesw.platform.eis.bo.reportes.ReporteCuenta;
import com.bytesw.platform.eis.bo.reportes.ReporteCuentaGenerales;
import com.bytesw.platform.eis.bo.reportes.ReporteDependiente;
import com.bytesw.platform.eis.bo.reportes.ReporteDependienteIndividual;
import com.bytesw.platform.eis.bo.reportes.ReporteDetalleFuturoCrece;
import com.bytesw.platform.eis.bo.reportes.ReporteDireccionCliente;
import com.bytesw.platform.eis.bo.reportes.ReporteFirmante;
import com.bytesw.platform.eis.bo.reportes.ReporteFirmanteAhorro;
import com.bytesw.platform.eis.bo.reportes.ReporteFirmantesAhorro;
import com.bytesw.platform.eis.bo.reportes.ReporteFirmasAutorizadas;
import com.bytesw.platform.eis.bo.reportes.ReporteFormantoJuridico;
import com.bytesw.platform.eis.bo.reportes.ReporteFormantoNatural;
import com.bytesw.platform.eis.bo.reportes.ReporteFuturoCrece;
import com.bytesw.platform.eis.bo.reportes.ReporteIdFirmantes;
import com.bytesw.platform.eis.bo.reportes.ReportePersonaJuridica;
import com.bytesw.platform.eis.bo.reportes.ReportePersonaNatural;
import com.bytesw.platform.eis.bo.reportes.ReporteProducto;
import com.bytesw.platform.eis.bo.reportes.ReporteProveedor;
import com.bytesw.platform.eis.bo.reportes.ReporteRefPersonales;
import com.bytesw.platform.eis.bo.reportes.ReporteReferencia;
import com.bytesw.platform.eis.bo.reportes.ReporteRepresentante;
import com.bytesw.platform.eis.bo.reportes.ReporteSocio;
import com.bytesw.platform.eis.bo.reportes.ReportesCuentas;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaResponseDTO;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.DetalleParametro;
import com.bytesw.platform.utilities.ParameterPlatform;
import com.bytesw.platform.utilities.Parametro;
import com.bytesw.platform.utilities.ReportServiceImpl;
import com.bytesw.platform.utilities.ReporteRequestDTO;
import com.bytesw.platform.utilities.TipoParametro;
import com.bytesw.platform.utilities.TipoReporte;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
@PropertySource("classpath:error-message.properties")
@SuppressWarnings("unchecked")
public class ReporteService {

	private EntityManager manager;
	private CuentaHelper cuentaHelper;
	private MnemonicoService mnemonicoService;
	private Environment env;
	private ReportServiceImpl reportServiceImpl;
	private CampoAdicionalService campoAdicionalService;
	private CuentaDao dao;
	private CatalogoService catalogoService;
	private CuentaService cuentaService;

	Integer tipoDirDomiciliar;
	Integer tipoDirTrabajo;
	Integer tipoDirComercio;

	@Autowired
	public ReporteService(EntityManager manager, CuentaHelper cuentaHelper, MnemonicoService mnemonicoService,
			Environment env, ReportServiceImpl reportServiceImpl, CampoAdicionalService campoAdicionalService,
			@Qualifier("cuentaIntegrationDao") CuentaDao dao, CatalogoService catalogoService,
			CuentaService cuentaService) {
		this.manager = manager;
		this.cuentaHelper = cuentaHelper;
		this.mnemonicoService = mnemonicoService;
		this.env = env;
		this.reportServiceImpl = reportServiceImpl;
		this.campoAdicionalService = campoAdicionalService;
		this.dao = dao;
		this.catalogoService = catalogoService;
		this.cuentaService = cuentaService;
	}

	/** Report NamedNativeQueries **/

	private String instrucciones;

	public byte[] generarReporte(String empresa, CuentaResponseDTO cuenta, int supervisor) {
		boolean ok = true;
		try {
			return generarReporte(empresa, cuenta);
		} catch (Exception e) {
			ok = false;
		} finally {
			if (ok) {
				saveLog(cuenta, supervisor);
			}
		}
		return null;
	}

	@Transactional
	public void saveLog(CuentaResponseDTO cuenta, int supervisor) {
		if (null != this.getAuthentication()) {
			CajeroDTO cajero = (CajeroDTO) ((Usuario) this.getAuthentication().getPrincipal()).getInfoAdicional();
			if (null != cajero) {
				cuenta.setSupervisor(supervisor);
				cuenta.setUsuario(cajero.getUsuario().toUpperCase());
				cuenta.setAgenciaUsuario(cajero.getAgencia());
				dao.saveLogReimpresion(cuenta);
			}
		}
	}

	public byte[] generarReporte(String empresa, CuentaResponseDTO cta) {

		ReporteCuenta cpValidate = getCuentaReporte(cta.getDigitoIdentificador(), cta.getAgencia(),
				cta.getCorrelativo(), cta.getDigitoVerificador(), empresa);// 21-001-000031-0
		CuentaId ct = new CuentaId();
		ct.setAgencia(cta.getAgencia());
		ct.setCorrelativo(cta.getCorrelativo());
		ct.setDigitoIdentificador(cta.getDigitoIdentificador());
		ct.setDigitoVerificador(cta.getDigitoVerificador());
		Boolean mancomunada = false;
		if (cpValidate.getMancomunada().equals("2")) {
			mancomunada = true;
		}

		byte[] bt = null;
		ArrayList<ReporteCuenta> reporteCuenta = new ArrayList<>();
		ReportesCuentas reportesCuentas = new ReportesCuentas();
		ReporteCuenta cp;

		cp = new ReporteCuenta();
		Usuario userLog = new Usuario();

		tipoDirDomiciliar = Integer.parseInt(mnemonicoService
				.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_DOMICILIO).getValor());
		tipoDirTrabajo = Integer.parseInt(mnemonicoService
				.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_TRABAJO).getValor());
		tipoDirComercio = Integer.parseInt(mnemonicoService
				.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_COMERCIO).getValor());
		try {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			userLog = (Usuario) auth.getPrincipal();
		} catch (Exception e) {
			userLog.setUsername("OCISNEROS");
		}

		cp = getCuentaReporte(cta.getDigitoIdentificador(), cta.getAgencia(), cta.getCorrelativo(),
				cta.getDigitoVerificador(), empresa);// 21-001-000031-0

		ReporteCuentaGenerales rcg = new ReporteCuentaGenerales();

		try {
			rcg = getCuentaReporteGenerales(cta.getDigitoIdentificador(), cta.getAgencia(), cta.getCorrelativo(),
					cta.getDigitoVerificador());// 21-001-000031-0

		} catch (NoResultException e) {
			System.out.println("Error L 384 getCuentaReporteGenerales");
			// e.printStackTrace();
		}

		// Calendar c1 = Calendar.getInstance();
		// String fecha = "" + c1.get(Calendar.DATE) + "/" +
		// c1.get(Calendar.MONTH) + "/" + c1.get(Calendar.YEAR);
		String fecha = cp.getFecha();
		ReporteFuturoCrece reporteFuturoCrece = null;
		try {
			// Integer agencia, Integer correlativo,Integer dive,Integer
			// tipo
			reporteFuturoCrece = getFuturoCrece(cta.getAgencia(), cta.getCorrelativo(), cta.getDigitoVerificador(),
					cta.getDigitoIdentificador());
		} catch (NoResultException e) {
			System.out.println("Error L 397 ò getFuturoCrece");
			// e.printStackTrace();
		}

		if (reporteFuturoCrece != null) {
			reporteFuturoCrece.setDetalle(
					getDetalleFuturoCrece(cta.getDigitoIdentificador().toString(), cta.getAgencia().toString(),
							cta.getCorrelativo().toString(), cta.getDigitoVerificador().toString()));
		}

		try {
			String y = fecha.substring(0, 4);
			String m = fecha.substring(4, 6);
			String d = fecha.substring(6, 8);

			SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
			Date date = null;

			try {

				date = formatter.parse(fecha);
				System.out.println(date);
				System.out.println(formatter.format(date));

			} catch (ParseException e) {
				e.printStackTrace();
			}

			SimpleDateFormat formatoLargoEsMX = new SimpleDateFormat(

					"EEEE, d 'de' MMMM 'de' yyyy", new Locale("ES", "MX"));

			System.out.println(formatoLargoEsMX.format(date));

			cp.setFecha(formatoLargoEsMX.format(date));
			if (reporteFuturoCrece != null) {
				reporteFuturoCrece.setFecha(formatoLargoEsMX.format(date));
				reporteFuturoCrece.setAgencia(cp.getAgencia());
			}
			fecha = d + "/" + m + "/" + y;
		} catch (Exception e) {
			e.printStackTrace();

		}
		String nombreCompleto = "";
		Map<String, ReporteComplemento> mp = new HashMap<>();
		List<ReporteRepresentante> firmanteRepresentante = new ArrayList<ReporteRepresentante>();
		ReporteFirmanteAhorro reporteAhorro = new ReporteFirmanteAhorro();
		List<ReporteComplemento> valoresAlfa = new ArrayList<ReporteComplemento>();

		valoresAlfa = getValoresAlfa(cp.getCltdoc() + cp.getCldoc());
		for (ReporteComplemento reporteComplemento : valoresAlfa) {
			mp.put(reporteComplemento.getEntidad() + reporteComplemento.getCodigo(), reporteComplemento);
		}

		valoresAlfa = getValoresAlfa(cp.getCltdoc() + cp.getCldoc());
		for (ReporteComplemento reporteComplemento : valoresAlfa) {
			mp.put(reporteComplemento.getEntidad() + reporteComplemento.getCodigo(), reporteComplemento);
		}
		String cuenta = cuentaHelper.getCuentaEditada(cta.getDigitoIdentificador(), cta.getAgencia(),
				cta.getCorrelativo(), cta.getDigitoVerificador(), Consts.EMPTY);

		valoresAlfa = getValoresAlfa(cuenta);
		for (ReporteComplemento reporteComplemento : valoresAlfa) {
			mp.put(reporteComplemento.getEntidad() + reporteComplemento.getCodigo(), reporteComplemento);
		}

		// Object proposito =
		// campoAdicionalService.getValorCampoAdicional("CUENTAPAS",
		// "PROPCUENTA",
		// cuenta);

		// if (proposito != null) {
		// propositoCuenta = proposito.toString();
		// } else {
		// propositoCuenta = "--------";
		// }

		String propositoCuenta = null;
		if (rcg != null && rcg.getPropositoCuenta() != null) {
			propositoCuenta = rcg.getPropositoCuenta();
		} else {
			propositoCuenta = "--------";
		}

		Object benficiarioFinal = campoAdicionalService.getValorCampoAdicional("CUENTAPAS", "ESBENFIN", cuenta);

		List<ReporteProducto> reportesProducto = new ArrayList<ReporteProducto>();
		Map<String, ReporteProducto> reportes = new HashMap<String, ReporteProducto>();
		try {
			Integer p = Integer.parseInt(cp.getProducto());
			Integer sp = Integer.parseInt(cp.getSubProducto());
			reportesProducto = getProducto(cp.getTipo(), p, sp);
		} catch (NoResultException e) {
			// e.printStackTrace();
		}
		if (reportesProducto.size() == 0) {
			try {
				Integer p = Integer.parseInt(cp.getProducto());
				reportesProducto = getProducto(cp.getTipo(), p, 0);
			} catch (NoResultException e) {
				// e.printStackTrace();
			}
		}

		for (ReporteProducto reporteProducto : reportesProducto) {
			reportes.put(reporteProducto.getIdReporte(), reporteProducto);
		}

		String declaracion = "";

		com.bytesw.platform.eis.bo.plataforma.Parametro cont = null;

		cont = mnemonicoService.findParametroPlataforma("PARAM_DOC_CAOPA");

		if (cp.getDeposito() != null) {
			try {
				Double dep = Double.parseDouble(cp.getDeposito());
				String deps = String.format("%,.2f", dep);
				cp.setDeposito("***" + deps);
			} catch (Exception e) {
				// e.printStackTrace();
			}
		}
		declaracion = env.getProperty("core.reportes.etiquetas.cuenta.declaracion");

		if (cp.getTipo().equals("N") && reportes.get("1") != null) {
			List<DireccionesTrabajoReporte> listDirecciones = new ArrayList<>();
			cp.setTipo("natural");
			cp.setTipoSolicitud(reportes.get("1").getTitulo());
			System.out.println("****  " + cp.getCldoc() + " **** " + cp.getCltdoc());

			ReportePersonaNatural rpnatural = new ReportePersonaNatural();
			rpnatural = generarPersona(cp.getCldoc(), cp.getCltdoc(), cta.getDigitoIdentificador().toString(),
					cta.getAgencia().toString(), cta.getCorrelativo().toString(), cta.getDigitoVerificador().toString(),
					true);

			cp.setPersonaNatural(rpnatural);
			String corre = "0";
			String telefonoNatural = null;
			List<ReporteDireccionCliente> direcciones = getDireccionesCliente(cp.getCltdoc(), cp.getCldoc());
			try {
				int trabIndex = 0;
				for (ReporteDireccionCliente rd : direcciones) {
					if (tipoDirTrabajo.equals(rd.getTipoDireccion())) {
						trabIndex++;
						cp.getPersonaNatural().setDireccionEmpresa(rd.getDireccion());
						cp.getPersonaNatural().setTelefonoEmpresa(rd.getTelefono());
						DireccionesTrabajoReporte d = null;
						try {
							d = getDetalleDireccion(cp.getCltdoc(), cp.getCldoc(), trabIndex);
							d.setTelefonoEmpresa(rd.getTelefono()==null ? "-------" :rd.getTelefono());
						} catch (Exception e) {

						}
						
						SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
						Date fechaIngreso = null;
						try {
							fechaIngreso = formato.parse(d.getFechaIngreso());
							SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
							d.setFechaIngreso(nuevoFormato.format(fechaIngreso));
						} catch (ParseException ex) {
							// System.out.println(ex);

						}
						

						String idCliente = getIdClienteParaCamposAdicionales(cp.getCltdoc(), cp.getCldoc());
						String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rd.getId().getCodigo());

						Object laboralCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EMAILXDIR",
								idDireccion);
						Object exteUno = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EXT_1", idDireccion);
						if (d != null) {
							d.setDireccionEmpresa(rd.getDireccion());
							
								cp.getPersonaNatural().setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
								d.setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
							

							if (exteUno != null) {
								cp.getPersonaNatural().setExtencionEmpresa(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
								d.setExtencionEmpresa(exteUno.toString() == null  ?"-------" : exteUno.toString());
							}
							listDirecciones.add(d);
						} else {
							if (laboralCorreo != null) {
								cp.getPersonaNatural().setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());

							}

							if (exteUno != null) {
								cp.getPersonaNatural().setExtencionEmpresa(exteUno.toString() == null  ?"-------" : exteUno.toString());

							}
						}

					} else {
						if (tipoDirComercio.equals(rd.getTipoDireccion())) {
							cp.getPersonaNatural().setDireccionDelNegocio(rd.getDireccion());
							cp.getPersonaNatural().setTelefonoNegocio(rd.getTelefono());
						} else {
							if (tipoDirDomiciliar.equals(rd.getTipoDireccion())) {
								cp.getPersonaNatural().setCorrelativoEmail("" + rd.getTipoDireccion());
								cp.getPersonaNatural().setMunicipio(rd.getMunicipio());
								cp.getPersonaNatural().setDireccion(rd.getDireccion());
								cp.getPersonaNatural().setTelefono(rd.getTelefono2());
								telefonoNatural = rd.getTelefono() == null ? "--------" : rd.getTelefono();
								cp.getPersonaNatural().setCelular(rd.getTelefono());
								cp.getPersonaNatural().setDepartamento(rd.getDepartamento());
								String idCliente = getIdClienteParaCamposAdicionales(cp.getCltdoc(), cp.getCldoc());
								String idDireccion = getIdDireccionParaCamposAdicionales(idCliente,
										rd.getId().getCodigo());
								Object personalCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE",
										"EMAILXDIR", idDireccion);
								if (personalCorreo != null) {
									cp.getPersonaNatural().setCorreoelectronico(personalCorreo.toString());
								}
							}
						}
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}

			if (!listDirecciones.isEmpty() && cp.getPersonaNatural() != null) {
				cp.getPersonaNatural().setDireccionTrabajos(listDirecciones);
			}

			if (cp.getPersonaNatural() != null && cp.getPersonaNatural().getCorrelativoEmail() != null) {
				try {
					corre = String.format("%02d", Integer.parseInt(cp.getPersonaNatural().getCorrelativoEmail()));
				} catch (Exception e) {
					// e.printStackTrace();
				}
			}
			valoresAlfa = getValoresAlfa(cp.getCltdoc() + cp.getCldoc() + corre);
			for (ReporteComplemento reporteComplemento : valoresAlfa) {
				mp.put(reporteComplemento.getEntidad() + reporteComplemento.getCodigo(), reporteComplemento);
			}

			try {
				Double ingresoNeg = Double.parseDouble(cp.getPersonaNatural().getIngresoNegocio());
				String ingresoS = String.format("%,.2f", ingresoNeg);
				cp.getPersonaNatural().setIngresoNegocio(cp.getMoneda().trim() + " " + ingresoS);
			} catch (Exception e) {
				// e.printStackTrace();
			}

			cp.setDeclaracion(declaracion);
			String fechaNac = cp.getPersonaNatural().getFechaNacimiento();

			if (fechaNac != null) {
				try {
					int y1 = Integer.parseInt(fechaNac.substring(0, 4));
					int m1 = Integer.parseInt(fechaNac.substring(4, 6));
					int d1 = Integer.parseInt(fechaNac.substring(6, 8));

					cp.getPersonaNatural()
							.setFechaNacimiento(fechaNac.substring(6, 8) + "/" + fechaNac.substring(4, 6) + "/" + y1);

					// Objeto con la fecha actual
					GregorianCalendar fechaActual = new GregorianCalendar();
					int y2 = fechaActual.get(GregorianCalendar.YEAR);
					int m2 = fechaActual.get(GregorianCalendar.MONTH);
					int d2 = fechaActual.get(GregorianCalendar.DAY_OF_MONTH);
					int diffYears = (y2 - y1 - 1) + (m2 == m1 ? (d2 >= d1 ? 1 : 0) : m2 >= m1 ? 1 : 0);
					System.out.println(diffYears + " aÃ±osxxxx");
					cp.getPersonaNatural().setEdad("" + diffYears);
				} catch (Exception e) {
					// e.printStackTrace();
				}
			}

			String fechaInicio = cp.getPersonaNatural().getFechaInicioOperaciones();
			if (fechaInicio != null) {
				try {
					String y1 = fechaInicio.substring(0, 4);
					String m1 = fechaInicio.substring(4, 6);
					String d1 = fechaInicio.substring(6, 8);
					cp.getPersonaNatural().setFechaInicioOperaciones(d1 + "/" + m1 + "/" + y1);
				} catch (Exception e) {
					// e.printStackTrace();
				}
			}
			ReporteFormantoNatural rfn = new ReporteFormantoNatural();

			if (cp.getPersonaNatural() != null) {
				cp.getPersonaNatural().setFormantoNatural(rfn);
				cp.getPersonaNatural().setCldoc(cp.getCldoc());
			}

			if (cp.getPersonaNatural().getFechaIngreso() != null) {
				SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
				Date fechaIngreso = null;
				try {
					fechaIngreso = formato.parse(cp.getPersonaNatural().getFechaIngreso());
				} catch (ParseException ex) {
					// System.out.println(ex);

				}
				SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
				if (fechaIngreso != null) {
					cp.getPersonaNatural().setFechaIngreso(nuevoFormato.format(fechaIngreso));
				}

			}

			ReportePersonaNatural rpAhorro = cp.getPersonaNatural();

			if (cp.getPersonaNatural().getSexo() != null && cp.getPersonaNatural().getSexo().equals("M")) {

				cp.getPersonaNatural().setSexo(env.getProperty("core.reportes.etiquetas.sexo.masculino"));

			} else {
				if (cp.getPersonaNatural().getSexo() != null && cp.getPersonaNatural().getSexo().equals("F")) {

					cp.getPersonaNatural().setSexo(env.getProperty("core.reportes.etiquetas.sexo.femenino"));

				}
			}

			nombreCompleto = cp.getPersonaNatural().getPrimerNombre().trim() + " "
					+ cp.getPersonaNatural().getSegundoNombre().trim() + " "
					+ cp.getPersonaNatural().getPrimerApellido().trim() + " "
					+ cp.getPersonaNatural().getSegundoApellido().trim();

			if (reporteFuturoCrece != null && reportes.get("12") != null) {
				reporteFuturoCrece.setNombre(nombreCompleto);
				reporteFuturoCrece.setCuenta(cp.getNumeroCuenta());

			}
			cp.getPersonaNatural().setDeclaracion(declaracion);
			reporteAhorro.setDomicilio(rpAhorro.getDireccion());
			reporteAhorro.setExtencion("--------");
			reporteAhorro.setExtencionTrabajo(rpAhorro.getExtencionEmpresa());
			reporteAhorro.setFechaApertura(fecha);
			reporteAhorro.setFechaCancelacion("---------");
			reporteAhorro.setIdentidad(cp.getPersonaNatural().getIdCliente());
			reporteAhorro.setLugarTrabajo(rpAhorro.getDireccionEmpresa());
			reporteAhorro.setNumeroCuenta(cp.getNumeroCuenta());
			reporteAhorro.setObservaciones("---------");
			reporteAhorro.setPerfil(cp.getCldoc());
			reporteAhorro.setPrimerNombre(rpAhorro.getPrimerNombre());
			reporteAhorro.setSegundoNombre(rpAhorro.getSegundoNombre());
			reporteAhorro.setPrimerApellido(rpAhorro.getPrimerApellido());
			reporteAhorro.setSegundoApellido(rpAhorro.getSegundoApellido());
			reporteAhorro.setRtn(cp.getPersonaNatural().getRegistroTributario());
			reporteAhorro.setTelefono(rpAhorro.getCelular());
			cp.getPersonaNatural().setProposito(propositoCuenta);
			if (rcg != null) {
				try {
					Double mov = Double.parseDouble(rcg.getMontoMovimiento());
					String movs = String.format("%,.2f", mov);
					cp.getPersonaNatural().setVolumen(cp.getMoneda().trim() + " " + movs);
				} catch (Exception e) {
					e.printStackTrace();
				}

				cp.getPersonaNatural().setEspecificar(rcg.procedenciaFondo);

			} else {
				cp.getPersonaNatural().setVolumen("--------");
				cp.getPersonaNatural().setEspecificar("-------");
			}

			if (cp.getPersonaNatural().getDependientes() == null
					|| cp.getPersonaNatural().getDependientes().size() == 0) {
				List<ReporteDependiente> rpl = new ArrayList<>();
				ReporteDependiente rp = new ReporteDependiente();
				rp.setIdImp("2");
				rp.setIdPar("1");
				rp.setNombreDepImp("--------");
				rp.setNombreDepPar("--------");
				rp.setParentescoImp("--------");
				rp.setParentescoPar("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setDependientes(rpl);
			}
			if (cp.getPersonaNatural().getBeneficiarios() == null
					|| cp.getPersonaNatural().getBeneficiarios().size() == 0) {
				List<ReporteBeneficiario> rpl = new ArrayList<>();
				ReporteBeneficiario rp = new ReporteBeneficiario();
				rp.setDireccion("--------");
				rp.setId("1");
				rp.setNombre("");
				rp.setParentesco("--------");
				rp.setPorcentaje("--------");
				rp.setTelefono("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setBeneficiarios(rpl);
			}
			if (cp.getPersonaNatural().getBeneficiarios() != null) {
				int dba = 1;
				List<ReporteBeneficiarioAhorro> beneAhorro = new ArrayList<>();
				ReporteBeneficiarioAhorro bena = null;
				for (ReporteBeneficiario rd : cp.getPersonaNatural().getBeneficiarios()) {
					if (dba % 2 == 0) {
						bena.setIdImp("" + (dba + 1));
						bena.setNombreBenImp(rd.getNombre());
						bena.setPorcentajeImp(rd.getPorcentaje());
						beneAhorro.add(bena);
					} else {
						bena = new ReporteBeneficiarioAhorro();
						bena.setIdPar("" + (dba + 1));
						bena.setNombreBenPar(rd.getNombre());
						bena.setPorcentajePar(rd.getPorcentaje());
						if (dba == cp.getPersonaNatural().getBeneficiarios().size()) {
							bena.setIdImp("" + (dba + 2));
							bena.setNombreBenImp("--------");
							bena.setPorcentajeImp("--------");
							beneAhorro.add(bena);
						}

					}
					dba++;
				}
				reporteAhorro.setBeneficiarios(beneAhorro);
			}
			Boolean se = false;
			rfn.setAcepta("");
			rfn.setNoAcepta("x");
			rfn.setAceptaRobo("");
			rfn.setNoAcetaRobo("x");
			rfn.setAceptaMobil("");
			rfn.setNoAceptaMobil("x");
			rfn.setAcentaEnLinea("");
			rfn.setNoAceptaEnLinea("x");
			rfn.setCelular("--------");

			List<ServicioElectronico> sxl = new ArrayList<>();
			sxl = catalogoService.findServiciosElectronicosByCuentaId(cta.getDigitoIdentificador(), cta.getAgencia(),
					cta.getCorrelativo(), cta.getDigitoVerificador());
			cta.setServiciosElectronicos(sxl);

			if (cta.getServiciosElectronicos() != null) {
				for (ServicioElectronico s : cta.getServiciosElectronicos()) {

					if (s.getId() != null && s.getId().equals(1)) {// debito
						if (s.getAcepta() != null && s.getAcepta()) {
							rfn.setAcepta("x");
							rfn.setNoAcepta("");
							se = true;
						} else {
							rfn.setAcepta("");
							rfn.setNoAcepta("x");
						}
					} else {
						if (s.getId() != null && s.getId().equals(2)) {// robo
							if (s.getAcepta() != null && s.getAcepta()) {
								rfn.setAceptaRobo("x");
								rfn.setNoAcetaRobo("");
								se = true;
							} else {
								rfn.setAceptaRobo("");
								rfn.setNoAcetaRobo("x");
							}
						} else {
							if (s.getId() != null && s.getId().equals(3)) {// mobil
								if (s.getAcepta() != null && s.getAcepta()) {
									rfn.setAceptaMobil("x");
									rfn.setNoAceptaMobil("");
									List<Integer> excluir = null;
									List<String> estados = null;
									List<String> monedas = null;
									List<CuentasServiciosElectronicos> list = new ArrayList<>();
									if (null == excluir) {
										excluir = new ArrayList<Integer>();
										excluir.add(3);
									}
									if (null == estados) {
										estados = new ArrayList<String>();
										estados.add(EstadoCuenta.PENDIENTE_ACTIVACION.getEstado());
										estados.add(EstadoCuenta.ACTIVA.getEstado());
										estados.add(EstadoCuenta.EMBARGADA.getEstado());
										estados.add(EstadoCuenta.INACTIVA.getEstado());
									}
									if (monedas == null) {
										monedas = new ArrayList<String>();
										monedas.add("LPS");
									}
									Iterable ctas = cuentaService.findAllCuentas(cp.getCltdoc(), cp.getCldoc(), excluir,
											estados, monedas);
									List<CuentaResumen> ctasRe = new ArrayList<>();
									for (Object object : ctas) {
										CuentaResumen c = (CuentaResumen) object;
										ctasRe.add(c);
									}
									ctasRe.sort((CuentaResumen o1, CuentaResumen o2) -> o1.getNumeroCuenta()
											.compareTo(o2.getNumeroCuenta()));
									Integer i = 1;
									for (CuentaResumen c : ctasRe) {
										CuentasServiciosElectronicos cuentaServicioElectronico = new CuentasServiciosElectronicos();
										cuentaServicioElectronico.setId(i);
										cuentaServicioElectronico.setCuenta(c.getNumeroCuenta());
										list.add(cuentaServicioElectronico);
										i++;
									}
									rfn.setCuentaBtMovil(list);
									rfn.setCuentaDebitar(
											cp.getNumeroCuenta() == null ? "-------" : cp.getNumeroCuenta());
									rfn.setCelular(telefonoNatural == null ?  "-------" : telefonoNatural);
									se = true;
								} else {
									rfn.setAceptaMobil("");
									rfn.setNoAceptaMobil("x");
								}
							} else {
								if (s.getId() != null && s.getId().equals(4)) {// en
																				// linea
									if (s.getAcepta() != null && s.getAcepta()) {
										rfn.setAcentaEnLinea("x");
										rfn.setNoAceptaEnLinea("");
										rfn.setAceptaMobil("x");
										rfn.setNoAceptaMobil("");
										List<Integer> excluir = null;
										List<String> estados = null;
										List<String> monedas = null;
										List<CuentasServiciosElectronicos> list = new ArrayList<>();
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
										}
										if (monedas == null) {
											monedas = new ArrayList<String>();
											monedas.add("LPS");
										}
										Iterable ctas = cuentaService.findAllCuentas(cp.getCltdoc(), cp.getCldoc(),
												null, estados, monedas);

										List<CuentaResumen> ctasRe = new ArrayList<>();
										for (Object object : ctas) {
											CuentaResumen c = (CuentaResumen) object;
											ctasRe.add(c);
										}
										ctasRe.sort((CuentaResumen o1, CuentaResumen o2) -> o1.getNumeroCuenta()
												.compareTo(o2.getNumeroCuenta()));
										Integer i = 1;
										for (CuentaResumen c : ctasRe) {
											CuentasServiciosElectronicos cuentaServicioElectronico = new CuentasServiciosElectronicos();
											cuentaServicioElectronico.setId(i);
											cuentaServicioElectronico.setCuenta(c.getNumeroCuenta());
											list.add(cuentaServicioElectronico);
											i++;
										}
										rfn.setCuentaBtLinea(list);
										se = true;
									} else {
										rfn.setAcentaEnLinea("");
										rfn.setNoAceptaEnLinea("x");
									}
								}
							}
						}
					}
				}
			}

			if (se && reportes.get("9") != null) {
				rfn.setFecha(fecha);
				rfn.setIdentidad(cp.getPersonaNatural().getTipoDocto().trim() + " - "
						+ cp.getPersonaNatural().getIdCliente().trim());
				rfn.setNombreCompleto(nombreCompleto);
				rfn.setPerfil(cp.getCldoc());
				cp.getPersonaNatural().setFormantoNatural(rfn);
			} else {
				cp.getPersonaNatural().setFormantoNatural(null);
			}

			if (cp.getPersonaNatural().getProveedores() == null
					|| cp.getPersonaNatural().getProveedores().size() == 0) {
				List<ReporteProveedor> rpl = new ArrayList<>();
				ReporteProveedor rp = new ReporteProveedor();
				rp.setActividadEconomica("--------");
				rp.setActividadEconomicad("--------");
				rp.setActividadEconomicat("--------");
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setProveedores(rpl);
			}

			if (cp.getPersonaNatural().getReferenciasBancarias() == null
					|| cp.getPersonaNatural().getReferenciasBancarias().size() == 0) {
				List<ReporteReferencia> rpl = new ArrayList<>();
				ReporteReferencia rp = new ReporteReferencia();
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rp.setTelefono("--------");
				rp.setTelefonod("--------");
				rp.setTelefonot("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setReferenciasBancarias(rpl);
			}
			if (cp.getPersonaNatural().getReferenciasComerciales() == null
					|| cp.getPersonaNatural().getReferenciasComerciales().size() == 0) {
				List<ReporteReferencia> rpl = new ArrayList<>();
				ReporteReferencia rp = new ReporteReferencia();
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rp.setTelefono("--------");
				rp.setTelefonod("--------");
				rp.setTelefonot("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setReferenciasComerciales(rpl);
			}
			if (cp.getPersonaNatural().getReferenciasPersonales() == null
					|| cp.getPersonaNatural().getReferenciasPersonales().size() == 0) {
				List<ReporteRefPersonales> rpl = new ArrayList<>();
				ReporteRefPersonales rp = new ReporteRefPersonales();
				rp.setDireccion("--------");
				rp.setId("1");
				rp.setNombre("--------");
				rp.setParentesco("--------");
				rp.setTelefono("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setReferenciasPersonales(rpl);
			}

			if (reportes.get("8") != null) {
				cp.setRegistroFirmasCuentaAhorro(reporteAhorro);
			} else {
				cp.setRegistroFirmasCuentaAhorro(null);
			}

		}
		if (cp.getTipo().equals("J") && reportes.get("11") != null) {
			ReportePersonaJuridica pj = new ReportePersonaJuridica();
			cp.setTipo("juridica");
			cp.setTipoSolicitud(reportes.get("11").getTitulo());
			pj = getReportePersonaJuridica(cp.getCltdoc(), cp.getCldoc());

			String corre = "0";
			if (pj != null && pj.getEmail() != null) {
				try {
					corre = String.format("%02d", Integer.parseInt(pj.getEmail()));
				} catch (Exception e) {
					// e.printStackTrace();
				}
			}
			valoresAlfa = getValoresAlfa(cp.getCltdoc() + cp.getCldoc() + corre);
			for (ReporteComplemento reporteComplemento : valoresAlfa) {
				mp.put(reporteComplemento.getEntidad() + reporteComplemento.getCodigo(), reporteComplemento);
			}

			List<ReporteDireccionCliente> direcciones = getDireccionesCliente(cp.getCltdoc(), cp.getCldoc());

			String telefonoJuridico = "--------";
			if (direcciones != null) {
				for (ReporteDireccionCliente rd : direcciones) {
					if (rd.getTipoDireccion().equals(tipoDirDomiciliar)) {
						telefonoJuridico = rd.getTelefono();
					}
				}
			}

			pj.setEmail(mp.get("DIRXCLTE  " + "EMAILXDIR ") == null ? "--------"
					: mp.get("DIRXCLTE  " + "EMAILXDIR ").getValor());
			pj.setNombreSocial(mp.get("CLIENTE   " + "RAZSOCIAL ") == null ? pj.getNombreSocial()
					: mp.get("CLIENTE   " + "RAZSOCIAL ").getValor());
			pj.setNombreComercial(mp.get("CLIENTE   " + "NOMBRECOM ") == null ? pj.getNombreComercial()
					: mp.get("CLIENTE   " + "NOMBRECOM ").getValor());

			if (pj.getNombreComercial() != null) {
				nombreCompleto = pj.getNombreComercial();
			}

			if (pj != null) {
				pj.setCldoc(cp.getCldoc());
			}

			if (reporteFuturoCrece != null && reportes.get("12") != null) {
				reporteFuturoCrece.setNombre(pj.getNombreComercial());
				reporteFuturoCrece.setCuenta(cp.getNumeroCuenta());

			}

			if (pj.getEscrituraDeFecha() != null) {
				try {
					String yf = pj.getEscrituraDeFecha().substring(0, 4);
					String mf = pj.getEscrituraDeFecha().substring(4, 6);
					String df = pj.getEscrituraDeFecha().substring(6, 8);
					pj.setEscrituraDeFecha(df + "/" + mf + "/" + yf);
				} catch (Exception e) {
					// e.printStackTrace();
				}

			}

			// se obtiene el tipo de documento y se verifica si es carnet o
			// pasaporte para contador

			boolean carnetPasaporte = false;
			if (cont != null) {
				if (cont.getValores() != null && !cont.getValores().isEmpty()) {
					for (ParametroDetalle valores : cont.getValores()) {
						if (pj.getTipoIdentificacionContador() != null
								&& pj.getTipoIdentificacionContador().equals(valores.getValor())) {
							carnetPasaporte = true;
							break;
						}
					}
				}
			}
			try {
				if (carnetPasaporte || pj.getDescIdentificacionContador().contains("PASAPORTE")
						|| pj.getDescIdentificacionContador().contains("CARNET DE RESIDENTE")) {
					String p = pj.getDescIdentificacionContador().trim() + " - " + pj.getIdentidadContador().trim();
					pj.setPasaporteResidente("-------");
					pj.setIdentidadContador(p);
				} else {
					String p = pj.getDescIdentificacionContador().trim() + " - " + pj.getIdentidadContador().trim();
					pj.setPasaporteResidente("-------");
					pj.setIdentidadContador(p);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			// socios
			List<ReporteSocio> so = new ArrayList<ReporteSocio>();
			so = getAccionistas(cp.getCldoc(), cp.getCltdoc());

			int soc = 0;

			for (ReporteSocio reporteSocio : so) {

				valoresAlfa = new ArrayList<ReporteComplemento>();
				String id = null;
				so.get(soc).setNacionalidad("--------");
				so.get(soc).setIdentidad("-------");
				so.get(soc).setCargoEmpresa("--------");
				so.get(soc).setPasaporteCarnet("--------");
				try {
					id = String.format("%02d", Integer.parseInt(reporteSocio.getId()));

				} catch (Exception e) {
					id = reporteSocio.getId();
					e.printStackTrace();
				}
				// valoresAlfa = getValoresAlfa(cp.getCltdoc() +
				// cp.getCldoc() +
				// id);

				// getDescDocumento(cp.getCltdoc() + cp.getCldoc() + id);

				Object valor = campoAdicionalService.getValorCampoAdicional("REFACCI", "NACIONALID",
						cp.getCltdoc() + cp.getCldoc() + id);

				if (valor != null) {
					Pais p = getPais(valor.toString());
					so.get(soc).setNacionalidad(p.getNombre());
				}

				valor = campoAdicionalService.getValorCampoAdicional("REFACCI", "DOCIDENTIF",
						cp.getCltdoc() + cp.getCldoc() + id);

				try {
					Object[] valores = valor.toString().split(" ");
					TipoDocumento tp = manager.find(TipoDocumento.class, valores[0]);
					Integer sizeVal = valores[0].toString().length();
					if (tp != null && tp.getDescripcion().contains("PASAPORTE")
							|| tp.getDescripcion().contains("CARNET DE RESIDENTE")) {
						String p = tp.getDescripcion() + " - "
								+ valor.toString().substring(sizeVal, valor.toString().length() - 1);
						so.get(soc).setIdentidad(p);
						// pj.setPasaporteResidente("-------");
						// pj.setIdentidadContador(p);
					} else {
						String p = tp.getDescripcion() + " - "
								+ valor.toString().substring(sizeVal, valor.toString().length() - 1);
						;
						so.get(soc).setIdentidad(p);
					}
				} catch (Exception e) {
					so.get(soc).setIdentidad("-------");
					e.printStackTrace();
				}

				valor = campoAdicionalService.getValorCampoAdicional("REFACCI", "CARGO",
						cp.getCltdoc() + cp.getCldoc() + id);
				so.get(soc).setCargoEmpresa(valor.toString());

				valor = campoAdicionalService.getValorCampoAdicional("REFACCI", "ACTECONOM",
						cp.getCltdoc() + cp.getCldoc() + id);
				try {
					ActividadEconomica actEcon = getActividadEconomica(Integer.parseInt(valor.toString()));
					so.get(soc).setActividadEconomica(actEcon.getDescripcion());
				} catch (Exception e) {
					// e.printStackTrace();
				}
				soc++;
			}

			if (so != null && so.isEmpty()) {
				ReporteSocio s = new ReporteSocio();
				s.setActividadEconomica("--------");
				s.setCargoEmpresa("--------");
				s.setId("1");
				s.setIdentidad("--------");
				s.setNacionalidad("--------");
				s.setNombre("--------");
				s.setPasaporteCarnet("--------");
				so.add(s);

			}

			// proveedores
			List<ReporteProveedor> rprov = new ArrayList<ReporteProveedor>();
			rprov = getProveedores(cp.getCldoc(), cp.getCltdoc());
			Integer rpc = 0;
			for (ReporteProveedor reporteProveedor : rprov) {
				valoresAlfa = new ArrayList<ReporteComplemento>();
				Integer in = null;
				Object valor = null;
				try {
					in = Integer.parseInt(reporteProveedor.getId());
					valor = campoAdicionalService.getValorCampoAdicional("REFPROV", "GIRONEG",
							cp.getCltdoc() + cp.getCldoc() + String.format("%02d", in));
				} catch (Exception e) {
					e.printStackTrace();
				}

				if (null != valor) {
					reporteProveedor.setActividadEconomica((String) valor);
				} else {
					reporteProveedor.setActividadEconomica("---------");
				}

				rpc++;
			}

			pj.setPrincipalesProveedores(rprov);
			pj.setPropositoCuenta(propositoCuenta);

			if (rcg != null) {
				Double mov = Double.parseDouble(rcg.getMontoMovimiento());
				String movs = String.format("%,.2f", mov);
				pj.setVolumenManejar(cp.getMoneda().trim() + " " + movs);
				pj.setProcedenciaFondos(rcg.getProcedenciaFondo());

			} else {
				pj.setVolumenManejar("--------");
				pj.setProcedenciaFondos("--------");
			}

			try {
				pj.setInstruccionesEspeciales(rcg.getInstrucciones());
				instrucciones = rcg.getInstrucciones();
			} catch (Exception e) {
				e.printStackTrace();
			}

			declaracion = env.getProperty("core.reportes.etiquetas.cuenta.declaracion");
			pj.setDeclaracion(declaracion);

			// comerciales***bancarias///beneficiarios
			List<ReporteReferencia> rc = new ArrayList<ReporteReferencia>();
			rc = getReferenciasComerciales(cp.getCldoc(), cp.getCltdoc());

			List<ReporteReferencia> rb = new ArrayList<ReporteReferencia>();
			rb = getReferenciasBancarias(cp.getCldoc(), cp.getCltdoc());
			List<ReporteBeneficiario> bn = new ArrayList<ReporteBeneficiario>();
			bn = getBeneficiarios(cta.getDigitoIdentificador().toString(), cta.getAgencia().toString(),
					cta.getCorrelativo().toString(), cta.getDigitoVerificador().toString());
			pj.setReferenciasComerciales(rc);
			pj.setReferenciasBancarias(rb);
			pj.setBeneficiarios(bn);
			pj.setSocios(so);
			ReporteFormantoJuridico rpj = new ReporteFormantoJuridico();
			// rpj.setInicio(".");
			rpj.setSeleccion1n("x");
			rpj.setSeleccion1y("");
			rpj.setSeleccion2n("x");
			rpj.setSeleccion2y("");
			rpj.setCelular("--------");
			// if (pj.getCelular() != null) {
			// rpj.setTelefono(pj.getCelular());
			// } else {
			// rpj.setTelefono("--------");
			// }

			Boolean se = false;
			List<ServicioElectronico> sxl = new ArrayList<>();
			sxl = catalogoService.findServiciosElectronicosByCuentaId(cta.getDigitoIdentificador(), cta.getAgencia(),
					cta.getCorrelativo(), cta.getDigitoVerificador());
			cta.setServiciosElectronicos(sxl);
			if (cta.getServiciosElectronicos() != null) {
				for (ServicioElectronico s : cta.getServiciosElectronicos()) {
					if (s.getId() != null && s.getId().equals(3)) {
						if (s.getAcepta() != null && s.getAcepta()) {
							rpj.setSeleccion1y("x");
							rpj.setSeleccion1n("");
							List<CuentasServiciosElectronicos> list = new ArrayList<>();
							List<Integer> excluir = null;
							List<String> estados = null;
							List<String> monedas = null;
							if (null == excluir) {
								excluir = new ArrayList<Integer>();
								excluir.add(3);
							}
							if (null == estados) {
								estados = new ArrayList<String>();
								estados.add(EstadoCuenta.PENDIENTE_ACTIVACION.getEstado());
								estados.add(EstadoCuenta.ACTIVA.getEstado());
								estados.add(EstadoCuenta.EMBARGADA.getEstado());
								estados.add(EstadoCuenta.INACTIVA.getEstado());
								estados.add(EstadoCuenta.CANCELADA.getEstado());
							}
							if (monedas == null) {
								monedas = new ArrayList<String>();
								monedas.add("LPS");
							}

							Iterable ctas = cuentaService.findAllCuentas(cp.getCltdoc(), cp.getCldoc(), excluir,
									estados, monedas);
							List<CuentaResumen> ctasRe = new ArrayList<>();
							for (Object object : ctas) {
								CuentaResumen c = (CuentaResumen) object;
								ctasRe.add(c);
							}
							ctasRe.sort((CuentaResumen o1, CuentaResumen o2) -> o1.getNumeroCuenta()
									.compareTo(o2.getNumeroCuenta()));
							Integer i = 1;
							for (CuentaResumen c : ctasRe) {
								CuentasServiciosElectronicos cuentaServicioElectronico = new CuentasServiciosElectronicos();
								cuentaServicioElectronico.setId(i);
								cuentaServicioElectronico.setCuenta(c.getNumeroCuenta());
								list.add(cuentaServicioElectronico);
								i++;
							}
							rpj.setCuentaBtMovil(list);
							rpj.setCuentaDebitar(cp.getNumeroCuenta() == null ? "-------" : cp.getNumeroCuenta());
							rpj.setCelular(telefonoJuridico == null ? "--------" : telefonoJuridico);
							se = true;
						} else {
							rpj.setSeleccion1n("x");
							rpj.setSeleccion1y("");
						}

					} else {
						if (s.getId() != null && s.getId().equals(4)) {

							if (s.getAcepta() != null && s.getAcepta()) {
								rpj.setSeleccion2y("x");
								rpj.setSeleccion2n("");
								List<Integer> excluir = null;
								List<String> estados = null;
								List<String> monedas = null;
								List<CuentasServiciosElectronicos> list = new ArrayList<>();
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
								}
								if (monedas == null) {
									monedas = new ArrayList<String>();
									monedas.add("LPS");
								}
								Iterable ctas = cuentaService.findAllCuentas(cp.getCltdoc(), cp.getCldoc(), null,
										estados, monedas);

								List<CuentaResumen> ctasRe = new ArrayList<>();
								for (Object object : ctas) {
									CuentaResumen c = (CuentaResumen) object;
									ctasRe.add(c);
								}
								ctasRe.sort((CuentaResumen o1, CuentaResumen o2) -> o1.getNumeroCuenta()
										.compareTo(o2.getNumeroCuenta()));
								Integer i = 1;
								for (CuentaResumen c : ctasRe) {
									CuentasServiciosElectronicos cuentaServicioElectronico = new CuentasServiciosElectronicos();
									cuentaServicioElectronico.setId(i);
									cuentaServicioElectronico.setCuenta(c.getNumeroCuenta());
									list.add(cuentaServicioElectronico);
									i++;
								}
								rpj.setCuentaBtLinea(list);
								se = true;
							} else {
								rpj.setSeleccion2n("x");
								rpj.setSeleccion2y("");
							}
						}

					}
				}
			}

			cp.setPersonaJuridica(pj);
			if (se && reportes.get("10") != null) {
				rpj.setFecha(fecha);
				rpj.setNoEntidad(cp.getPersonaJuridica().getIdentidad());
				rpj.setNombreRepresentante(pj.getNombreRepLegal());
				rpj.setPerfil(cp.getCldoc());
				rpj.setRazonSocial(pj.getNombreSocial());
				rpj.setRtn(pj.getRtn());
				pj.setFormantoJuridico(rpj);
			} else {
				pj.setFormantoJuridico(null);
			}

			if (pj.getRtn() == null || pj.getRtn().trim().equals("")) {
				try {
					pj.setRtn(pj.getIdentificacionUnica());
					pj.getFormantoJuridico().setRtn(pj.getIdentificacionUnica());

					pj.setEtiquetaRtn(pj.getTipoDocumento());
					pj.getFormantoJuridico().setEtiquetaRtn(pj.getTipoDocumento());
				} catch (Exception e) {
					// e.printStackTrace();
				}
			} else {

				pj.setEtiquetaRtn("RTN:");
				if (pj.getFormantoJuridico() != null) {
					pj.getFormantoJuridico().setEtiquetaRtn("RTN:");
				}

			}

			int dba = 1;
			if (bn != null) {
				List<ReporteBeneficiarioAhorro> beneAhorro = new ArrayList<>();
				ReporteBeneficiarioAhorro bena = null;
				for (ReporteBeneficiario rd : bn) {
					if (dba % 2 == 0) {
						bena.setIdImp("" + (dba + 1));
						bena.setNombreBenImp(rd.getNombre());
						bena.setPorcentajeImp(rd.getPorcentaje());
						beneAhorro.add(bena);
					} else {
						bena = new ReporteBeneficiarioAhorro();
						bena.setIdPar("" + (dba + 1));
						bena.setNombreBenPar(rd.getNombre());
						bena.setPorcentajePar(rd.getPorcentaje());
						if (dba == cp.getPersonaJuridica().getBeneficiarios().size()) {
							bena.setIdImp("" + (dba + 2));
							bena.setNombreBenImp("--------");
							bena.setPorcentajeImp("--------");
							beneAhorro.add(bena);
						}

					}
					dba++;
				}
				reporteAhorro.setBeneficiarios(beneAhorro);

			}

			firmanteRepresentante = getFirmanteRepresentante(cp.getCldoc(), cp.getCltdoc());
			if (firmanteRepresentante != null && !firmanteRepresentante.isEmpty()) {
				ReporteRepresentante rp = new ReporteRepresentante();
				rp = firmanteRepresentante.get(0);
				cp.getPersonaJuridica().setDireccionRepLegal(rp.getDireccion());
				cp.getPersonaJuridica().setProfesion(rp.getProfesion());
				String dia = "";
				String mes = "";
				String anio = "";
				try {
					if (rp.getDiaNombramiento() != null) {
						dia = String.format("%02d", Integer.parseInt(rp.getDiaNombramiento()));
					}

					if (rp.getAnioNombramiento() != null) {
						anio = String.format("%04d", Integer.parseInt(rp.getAnioNombramiento()));
					}

					if (rp.getMesNombramiento() != null) {
						mes = String.format("%02d", Integer.parseInt(rp.getMesNombramiento()));
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				cp.getPersonaJuridica().setNombramiento(dia + "/" + mes + "/" + anio);
				cp.getPersonaJuridica().setTelefonoRepresentante(rp.getTelefono());
				cp.getPersonaJuridica().setCelular("-------");

			}
			if (cp.getPersonaJuridica().getBeneficiarios() == null
					|| cp.getPersonaJuridica().getBeneficiarios().size() == 0) {
				List<ReporteBeneficiario> rpl = new ArrayList<>();
				ReporteBeneficiario rp = new ReporteBeneficiario();
				rp.setDireccion("--------");
				rp.setId("1");
				rp.setNombre("");
				rp.setParentesco("--------");
				rp.setPorcentaje("--------");
				rp.setTelefono("--------");
				rpl.add(rp);
				cp.getPersonaJuridica().setBeneficiarios(rpl);
			}
			if (cp.getPersonaJuridica().getPrincipalesProveedores() == null
					|| cp.getPersonaJuridica().getPrincipalesProveedores().size() == 0) {
				List<ReporteProveedor> rpl = new ArrayList<>();
				ReporteProveedor rp = new ReporteProveedor();
				rp.setActividadEconomica("--------");
				rp.setActividadEconomicad("--------");
				rp.setActividadEconomicat("--------");
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rpl.add(rp);
				cp.getPersonaJuridica().setPrincipalesProveedores(rpl);
			}

			if (cp.getPersonaJuridica().getReferenciasBancarias() == null
					|| cp.getPersonaJuridica().getReferenciasBancarias().size() == 0) {
				List<ReporteReferencia> rpl = new ArrayList<>();
				ReporteReferencia rp = new ReporteReferencia();
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rp.setTelefono("--------");
				rp.setTelefonod("--------");
				rp.setTelefonot("--------");
				rpl.add(rp);
				cp.getPersonaJuridica().setReferenciasBancarias(rpl);
			}
			if (cp.getPersonaJuridica().getReferenciasComerciales() == null
					|| cp.getPersonaJuridica().getReferenciasComerciales().size() == 0) {
				List<ReporteReferencia> rpl = new ArrayList<>();
				ReporteReferencia rp = new ReporteReferencia();
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rp.setTelefono("--------");
				rp.setTelefonod("--------");
				rp.setTelefonot("--------");
				rpl.add(rp);
				cp.getPersonaJuridica().setReferenciasComerciales(rpl);
			}
			if (cp.getNumeroCuenta() != null) {
				rpj.setCuentaDebitar(cp.getNumeroCuenta().trim());
			}

		}

		if (reportes.get("3") != null) {
			List<ReporteBeneficiarioFinal> bn = new ArrayList<>();
			if (benficiarioFinal != null && benficiarioFinal.toString().equals("false")) {
				bn = getBeneficiarioFinal(cp.getPrtipo(), cp.getAgen(), cp.getCorr(), cp.getDive());
				cp.setReporteBeneficiarioFinal(bn);
				int x = 0;
				for (ReporteBeneficiarioFinal reporteBeneficiarioFinal : bn) {
					System.out.println(reporteBeneficiarioFinal);
					bn.get(x).setDeclaracion(declaracion);
					x++;
				}
			}

			if (bn == null || bn.isEmpty()) {
				if (cp.getTipo().equals("juridica")) {
					// ReporteBeneficiarioFinal rbf = new
					// ReporteBeneficiarioFinal();
					//
					// ReportePersonaJuridica rpji =
					// cp.getPersonaJuridica();
					//
					// rbf.setCelular(rpji.getCelular());
					// rbf.setCorreo(rpji.getEmail());
					// rbf.setDepartamento(rpji.getDepartamento());
					// rbf.setNumeroId(rpji.getIdentidad());
					// rbf.setPrimerApellido(primerApellido);

				} else {
					if (cp.getTipo().equals("natural")) {
						ReporteBeneficiarioFinal rbf = new ReporteBeneficiarioFinal();
						ReportePersonaNatural rpni = cp.getPersonaNatural();
						rbf.setCelular(rpni.getCelular());
						rbf.setCelular2(rpni.getCelular2());
						rbf.setCorreo(rpni.getCorreoelectronico());
						rbf.setDepartamento(rpni.getDepartamento());
						rbf.setDocumentoId(rpni.getTipoDocto());
						rbf.setMunicipio(rpni.getMunicipio());
						rbf.setNacionalidad(rpni.getNacionalidad());
						rbf.setNumeroId(rpni.getIdCliente());
						rbf.setPrimerApellido(rpni.getPrimerApellido());
						rbf.setSegundoApellido(rpni.getSegundoApellido());
						rbf.setPrimerNombre(rpni.getPrimerNombre());
						rbf.setSegundoNombre(rpni.getSegundoNombre());
						rbf.setRtn(rpni.getRegistroTributario());
						rbf.setTelefono(rpni.getTelefono());
						rbf.setDeclaracion(declaracion);
						rbf.setDireccion(rpni.getDireccion());
						bn = new ArrayList<>();
						bn.add(rbf);
						cp.setReporteBeneficiarioFinal(bn);
					}
				}

			}

		}
		if (cp.getReporteBeneficiarioFinal() != null && cp.getReporteBeneficiarioFinal().isEmpty()) {
			cp.setReporteBeneficiarioFinal(null);
		}
		if (reportes.get("1") != null || reportes.get("11") != null) {
			List<ReporteIdFirmantes> frid = new ArrayList<ReporteIdFirmantes>();

			frid.addAll(getFirmantes(cp.getPrtipo(), cp.getAgen(), cp.getCorr(), cp.getDive()));

			ReporteFirmasAutorizadas rfa = new ReporteFirmasAutorizadas();
			rfa.setInstruccionesEspeciales(rcg.getInstrucciones());
			CajeroDTO cajero = null;
			try {
				Authentication auth = SecurityContextHolder.getContext().getAuthentication();
				cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
			} catch (Exception e) {
				e.printStackTrace();
			}
			if (cajero != null) {
				rfa.setAgencia(cajero.getAgencia() + "-" + cajero.getNombreAgencia());
			} else {
				rfa.setAgencia("-------");
			}
			rfa.setFecha(fecha);
			rfa.setNombreCuentahabiente(nombreCompleto);
			rfa.setNumeroCuenta(cp.getNumeroCuenta());
			// List<ReporteFirmanteAhorro> firmantesAhorro = new
			// ArrayList<>();
			List<ReporteFirmante> firmantes = new ArrayList<ReporteFirmante>();
			List<ReportePersonaNatural> lita = new ArrayList<ReportePersonaNatural>();
			// se obtienen los firmantes y se buscan comp persona individual
			int crfi = 1;
			int cofi = 0;
			ReporteFirmante fr = null;
			ReportePersonaNatural rpne = null;

			List<ReporteFirmantesAhorro> firmanteAhorro = new ArrayList<>();
			Integer contadorFirmantes = 0;
			for (ReporteIdFirmantes reporteIdFirmantes : frid) {

				ReportePersonaNatural rpn = new ReportePersonaNatural();
				rpn = getReportePersonaNatural(reporteIdFirmantes.getCltdoc(), reporteIdFirmantes.getCldoc());
				ReportePersonaNatural r = new ReportePersonaNatural();
				r = generarPersona(reporteIdFirmantes.getCldoc(), reporteIdFirmantes.getCltdoc(),
						reporteIdFirmantes.getPrtipo(), reporteIdFirmantes.getDpagen(), reporteIdFirmantes.getDpcorr(),
						reporteIdFirmantes.getDpdive(), true);

				if (r.getSexo() != null && r.getSexo().equals("M")) {

					r.setSexo(env.getProperty("core.reportes.etiquetas.sexo.masculino"));

				} else {
					if (r.getSexo() != null && r.getSexo().equals("F")) {

						r.setSexo(env.getProperty("core.reportes.etiquetas.sexo.femenino"));

					}
				}

				List<ReporteDireccionCliente> direcciones = getDireccionesCliente(reporteIdFirmantes.getCltdoc(),
						reporteIdFirmantes.getCldoc());
				List<DireccionesTrabajoReporte> listDirecciones2 = new ArrayList<>();
				try {
					int trabIndex = 0;
					for (ReporteDireccionCliente rd : direcciones) {
						String idCliente = getIdClienteParaCamposAdicionales(reporteIdFirmantes.getCltdoc(),
								reporteIdFirmantes.getCldoc());
						String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rd.getId().getCodigo());
						if (tipoDirTrabajo.equals(rd.getTipoDireccion())) {
							trabIndex++;
							r.setDireccionEmpresa(rd.getDireccion());
							r.setTelefonoEmpresa(rd.getTelefono());
							
							DireccionesTrabajoReporte direcc = null;
							try {
								direcc = getDetalleDireccion(cp.getCltdoc(), cp.getCldoc(), trabIndex);
								direcc.setTelefonoEmpresa(rd.getTelefono()==null ? "-------" :rd.getTelefono());
							} catch (Exception e) {

							}
							
							SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
							Date fechaIngreso = null;
							try {
								fechaIngreso = formato.parse(direcc.getFechaIngreso());
								SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
								direcc.setFechaIngreso(nuevoFormato.format(fechaIngreso));
							} catch (ParseException ex) {
								// System.out.println(ex);

							}
							
							
							
							Object laboralCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EMAILXDIR",
									idDireccion);
							if (laboralCorreo != null) {
								r.setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
							}
							Object exteUno = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EXT_1",
									idDireccion);
							if (exteUno != null) {
								r.setExtencionEmpresa(exteUno.toString() == null  ?"-------" : exteUno.toString());
							}
							
							if (direcc != null) {
								direcc.setDireccionEmpresa(rd.getDireccion());
								if (laboralCorreo != null) {
									r.setCorreoTrabajo(laboralCorreo.toString());
									direcc.setCorreoTrabajo(laboralCorreo.toString());
								}

								if (exteUno != null) {
									r.setExtencionEmpresa(exteUno.toString());
									direcc.setExtencionEmpresa(exteUno.toString());
								}
								listDirecciones2.add(direcc);
							} else {
								if (laboralCorreo != null) {
									r.setCorreoTrabajo(laboralCorreo.toString());

								}

								if (exteUno != null) {
									cp.getPersonaNatural().setExtencionEmpresa(exteUno.toString());

								}
							}
							
						} else {
							if (tipoDirComercio.equals(rd.getTipoDireccion())) {
								r.setDireccionDelNegocio(rd.getDireccion());
								r.setTelefonoNegocio(rd.getTelefono());
								List<ReporteComplemento> valoresNegocio = new ArrayList<ReporteComplemento>();
							} else {
								if (tipoDirDomiciliar.equals(rd.getTipoDireccion())) {
									r.setCorrelativoEmail("" + rd.getTipoDireccion());
									r.setMunicipio(rd.getMunicipio());
									r.setDireccion(rd.getDireccion());
									r.setTelefono(rd.getTelefono());
									r.setCelular(rd.getTelefono2());
									r.setDepartamento(rd.getDepartamento());

									Object personalCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE",
											"EMAILXDIR", idDireccion);
									if (personalCorreo != null) {
										r.setCorreoelectronico(personalCorreo.toString());
									}
								}
							}
						}
						r.setDireccionTrabajos(listDirecciones2);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				try {
					int y1 = Integer.parseInt(r.getFechaNacimiento().substring(0, 4));
					int m1 = Integer.parseInt(r.getFechaNacimiento().substring(4, 6));
					int d1 = Integer.parseInt(r.getFechaNacimiento().substring(6, 8));

					r.setFechaNacimiento(r.getFechaNacimiento().substring(6, 8) + "/"
							+ r.getFechaNacimiento().substring(4, 6) + "/" + y1);

					// Objeto con la fecha actual
					GregorianCalendar fechaActual = new GregorianCalendar();
					int y2 = fechaActual.get(GregorianCalendar.YEAR);
					int m2 = fechaActual.get(GregorianCalendar.MONTH);
					int d2 = fechaActual.get(GregorianCalendar.DAY_OF_MONTH);
					int diffYears = (y2 - y1 - 1) + (m2 == m1 ? (d2 >= d1 ? 1 : 0) : m2 >= m1 ? 1 : 0);
					System.out.println(diffYears + " aÃ±os");
					r.setEdad("" + diffYears);

					if (r.getFechaIngreso() != null) {
						SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
						Date fechaIngreso = null;
						try {
							fechaIngreso = formato.parse(r.getFechaIngreso());
						} catch (ParseException ex) {
							// System.out.println(ex);

						}
						SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
						if (fechaIngreso != null) {
							r.setFechaIngreso(nuevoFormato.format(fechaIngreso));
						}

					}
				} catch (Exception e) {
					// e.printStackTrace();
				}
				if (cp.getAnexoDosV() == null) {
					List<ReportePersonaNatural> l = new ArrayList<ReportePersonaNatural>();
					cp.setAnexoDosV(l);
				}
				if (r.getDependientes() == null || r.getDependientes().isEmpty()) {
					List<ReporteDependiente> rpl = new ArrayList<>();
					ReporteDependiente rp = new ReporteDependiente();
					rp.setIdImp("2");
					rp.setIdPar("1");
					rp.setNombreDepImp("--------");
					rp.setNombreDepPar("--------");
					rp.setParentescoImp("--------");
					rp.setParentescoPar("--------");
					rpl.add(rp);
					r.setDependientes(rpl);
				}
				cp.getAnexoDosV().add(r);
				if (rpn != null) {
					ReporteFirmantesAhorro rrfa = new ReporteFirmantesAhorro();
					rrfa.setIdentidad(rpn.getIdCliente());
					rrfa.setPrimerNombre(rpn.getPrimerNombre());
					rrfa.setPrimerApellido(rpn.getPrimerApellido());
					rrfa.setSegundoApellido(rpn.getSegundoApellido());
					rrfa.setSegudoNombre(rpn.getSegundoNombre());
					rrfa.setRtn(rpn.getRegistroTributario());
					firmanteAhorro.add(rrfa);
					if (firmanteRepresentante != null && firmanteRepresentante.size() == 1 && crfi == 2) {
						fr.setId2("" + crfi);
						fr.setIdentidad2(rpn.getIdCliente());
						fr.setPrimerApellido2(rpn.getPrimerApellido());
						fr.setPrimerNombre2(rpn.getPrimerNombre());
						fr.setSegundoApellido2(rpn.getSegundoApellido());
						fr.setSegundoNombre2(rpn.getSegundoNombre());
						fr.setRtn2(rpn.getRegistroTributario());
						contadorFirmantes++;
						firmantes.add(fr);
					} else {
						if (crfi % 2 != 0) {
							fr = new ReporteFirmante();
							fr.setId("" + crfi);
							fr.setIdentidad(rpn.getIdCliente());
							fr.setPrimerApellido(rpn.getPrimerApellido());
							fr.setPrimerNombre(rpn.getPrimerNombre());
							fr.setSegundoApellido(rpn.getSegundoApellido());
							fr.setSegundoNombre(rpn.getSegundoNombre());
							fr.setRtn(rpn.getRegistroTributario());
							contadorFirmantes++;
							if (((crfi % 2 != 0) && (crfi == (frid.size())) && (firmanteRepresentante.size() == 1))
									|| ((crfi % 2 != 0) && (crfi == frid.size()) && firmanteRepresentante.isEmpty())) {
								fr.setId2("" + (crfi + 1));
								fr.setIdentidad2("-------");
								fr.setPrimerApellido2("-------");
								fr.setPrimerNombre2("-------");
								fr.setSegundoApellido2("-------");
								fr.setSegundoNombre2("-------");
								fr.setRtn2("-------");
								firmantes.add(fr);
								contadorFirmantes++;

							}
						} else {
							fr.setId2("" + crfi);
							fr.setIdentidad2(rpn.getIdCliente());
							fr.setPrimerApellido2(rpn.getPrimerApellido());
							fr.setPrimerNombre2(rpn.getPrimerNombre());
							fr.setSegundoApellido2(rpn.getSegundoApellido());
							fr.setSegundoNombre2(rpn.getSegundoNombre());
							fr.setRtn2(rpn.getRegistroTributario());
							contadorFirmantes++;
							firmantes.add(fr);

						}
					}

				}

				crfi++;
				cofi++;

			}

			if (contadorFirmantes != null && (contadorFirmantes % 4 != 0)) {
				// && firmanteRepresentante.isEmpty()
				fr = new ReporteFirmante();
				fr.setId("" + (contadorFirmantes + 1));
				fr.setIdentidad("-------");
				fr.setPrimerApellido("-------");
				fr.setPrimerNombre("-------");
				fr.setSegundoApellido("-------");
				fr.setSegundoNombre("-------");
				fr.setRtn("-------");
				fr.setId2("" + (contadorFirmantes + 2));
				fr.setIdentidad2("-------");
				fr.setPrimerApellido2("-------");
				fr.setPrimerNombre2("-------");
				fr.setSegundoApellido2("-------");
				fr.setSegundoNombre2("-------");
				fr.setRtn2("-------");
				firmantes.add(fr);
			}

			rfa.setFirmantes(firmantes);

			reporteAhorro.setPerfil(cp.getCldoc());
			reporteAhorro.setFirmantes(firmanteAhorro);

			if (reportes.get("7") != null) {
				if (rfa.getFirmantes() != null && !rfa.getFirmantes().isEmpty()) {
					cp.setFirmasAutorizadas(rfa);
				} else {
					cp.setFirmasAutorizadas(null);
				}

			} else {
				cp.setFirmasAutorizadas(null);
			}

			if (reporteFuturoCrece != null && reportes.get("12") != null) {
				if (reporteFuturoCrece.getApertura() != null) {
					try {
						String a = reporteFuturoCrece.getApertura().substring(0, 4);
						String m = reporteFuturoCrece.getApertura().substring(4, 6);
						String d = reporteFuturoCrece.getApertura().substring(6, 8);
						reporteFuturoCrece.setApertura(d + "/" + m + "/" + a);
					} catch (Exception e) {
						e.printStackTrace();
					}

				}
				if (reporteFuturoCrece.getVencimiento() != null) {
					try {
						String a = reporteFuturoCrece.getVencimiento().substring(0, 4);
						String m = reporteFuturoCrece.getVencimiento().substring(4, 6);
						String d = reporteFuturoCrece.getVencimiento().substring(6, 8);
						reporteFuturoCrece.setVencimiento(d + "/" + m + "/" + a);
					} catch (Exception e) {
						e.printStackTrace();
					}

				}

				if (reporteFuturoCrece.getInteresesProyectados() != null) {
					try {
						// String proyectados = String.format("%,.2f",
						// Double.parseDouble(reporteFuturoCrece.getInteresesProyectados()));
						// reporteFuturoCrece.setInteresesProyectados(proyectados);
					} catch (Exception e) {

					}
				}

				if (reporteFuturoCrece.getTasaInteres() != null) {
					try {
						String tasa = String.format("%,.2f", Double.parseDouble(reporteFuturoCrece.getTasaInteres()));
						reporteFuturoCrece.setTasaInteres(tasa + " %");
					} catch (Exception e) {

					}
				}

				int v = 0;
				Double d = 0d;

				if (reporteFuturoCrece.getDetalle() != null) {
					for (ReporteDetalleFuturoCrece dt : reporteFuturoCrece.getDetalle()) {
						if (dt.getValorCuota() != null && dt.getInteresesPeriodo() != null) {
							try {
								d = d + Double.parseDouble(dt.getValorCuota())
										+ Double.parseDouble(dt.getInteresesPeriodo());
								String finPeriodo = String.format("%,.2f", d);
								reporteFuturoCrece.getDetalle().get(v).setSaldoFinPeriodo(finPeriodo);
							} catch (Exception e) {
								// e.printStackTrace();
							}
						}
						if (dt.getValorCuota() != null) {
							try {
								String cuota = String.format("%,.2f", Double.parseDouble(dt.getValorCuota()));
								reporteFuturoCrece.getDetalle().get(v).setValorCuota(cuota);
							} catch (Exception e) {
								// e.printStackTrace();
							}
						}
						if (dt.getInteresesPeriodo() != null) {
							try {
								String interes = String.format("%,.2f", Double.parseDouble(dt.getInteresesPeriodo()));
								reporteFuturoCrece.getDetalle().get(v).setInteresesPeriodo(interes);
							} catch (Exception e) {
								// e.printStackTrace();
							}
						}

						try {
							String anio = dt.getVencimiento().substring(0, 4);
							String mes = dt.getVencimiento().substring(4, 6);
							String dia = dt.getVencimiento().substring(6, 8);
							reporteFuturoCrece.getDetalle().get(v).setVencimiento(dia + "/" + mes + "/" + anio);
						} catch (Exception e) {
							e.printStackTrace();
						}

						v++;
					}

				}

				reporteFuturoCrece.setTitulo(reportes.get("12").getTitulo());

				reporteFuturoCrece.setUsuario(userLog.getUsername());
				cp.setFuturoCrece(reporteFuturoCrece);

			}
			cp.setDeclaracion(declaracion);
			if (cp.getRegistroFirmasCuentaAhorro() != null) {
				cp.getRegistroFirmasCuentaAhorro().setUsuario(userLog.getUsername());
			}
			try {
				System.out.println("NacionalidadByte: " + cp.getPersonaNatural().getNacionalidad());
				System.out.println("NacionalidadByte: " + cp.getPersonaJuridica().getNacionalidadContador());
			} catch (Exception e) {
				System.out.println("NacionalidadError " + e);
			}

			if (cp.getPersonaNatural() != null && (cp.getPersonaNatural().getProveedores() == null
					|| cp.getPersonaNatural().getProveedores().size() == 0)) {
				List<ReporteProveedor> rpl = new ArrayList<>();
				ReporteProveedor rp = new ReporteProveedor();
				rp.setActividadEconomica("--------");
				rp.setActividadEconomicad("--------");
				rp.setActividadEconomicat("--------");
				rp.setId("1");
				rp.setIdd("2");
				rp.setIdt("3");
				rp.setNombre("--------");
				rp.setNombred("--------");
				rp.setNombret("--------");
				rpl.add(rp);
				cp.getPersonaNatural().setProveedores(rpl);
			}
		}
		reportesCuentas.setSolicitud(reporteCuenta);
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, true);
		List<ReportePersonaNatural> mancomunadas = null;
		if (cpValidate.getMancomunada().equals("2")) {
			mancomunadas = new ArrayList<>();
			List<PersonaMancomunada> listaMancomunadas = catalogoService.findPersonasMancomunadasByCuentaId(ct);
			for (PersonaMancomunada personaMancomunada : listaMancomunadas) {
				ReportePersonaNatural r = personasMancomunadas(
						personaMancomunada.getId().getCliente().getId().getIdentificacion(),
						personaMancomunada.getId().getCliente().getId().getTipoIdentificacion(), propositoCuenta, rcg,
						cp.getMoneda());
				if (benficiarioFinal != null && benficiarioFinal.toString().equals("true")) {
					ReporteBeneficiarioFinal rbf = new ReporteBeneficiarioFinal();
					rbf.setCelular(r.getCelular());
					rbf.setCelular2(r.getCelular2());
					rbf.setCorreo(r.getCorreoelectronico());
					rbf.setDepartamento(r.getDepartamento());
					rbf.setDocumentoId(r.getTipoDocto());
					rbf.setMunicipio(r.getMunicipio());
					rbf.setNacionalidad(r.getNacionalidad());
					rbf.setNumeroId(r.getIdCliente());
					rbf.setPrimerApellido(r.getPrimerApellido());
					rbf.setSegundoApellido(r.getSegundoApellido());
					rbf.setPrimerNombre(r.getPrimerNombre());
					rbf.setSegundoNombre(r.getSegundoNombre());
					rbf.setRtn(r.getRegistroTributario());
					rbf.setTelefono(r.getTelefono());
					rbf.setDeclaracion(declaracion);
					rbf.setDireccion(r.getDireccion());
					cp.getReporteBeneficiarioFinal().add(rbf);
				}
				mancomunadas.add(r);
			}
		}
		cp.setPersonasMancomunadas(mancomunadas);
		String jsonInString = "";

		try {
			jsonInString = mapper.writeValueAsString(cp);
		} catch (JsonProcessingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		System.out.println(jsonInString);
		ReporteRequestDTO reporteRequestDTO = new ReporteRequestDTO();
		reporteRequestDTO.setTipoReporte(TipoReporte.PDF);
		reporteRequestDTO.setIp("");
		DetalleParametro detpa = new DetalleParametro();
		detpa.setTipo(TipoParametro.JSON_DATA_SOURCE);
		detpa.setValue(jsonInString);
		detpa.setXpath("solicitud");

		DetalleParametro nombre = new DetalleParametro();
		nombre.setValue("/reports/SolicitudApertura.jrxml");
		nombre.setClase(String.class);

		DetalleParametro imagen = new DetalleParametro();
		imagen.setTipo(TipoParametro.IMAGE);
		imagen.setValue("/reports/images/logo.jpg");

		DetalleParametro imagenAnulada = new DetalleParametro();
		imagenAnulada.setTipo(TipoParametro.IMAGE);
		imagenAnulada.setValue("/reports/images/anulado.png");

		Parametro prm = new Parametro();
		prm.setKey("name");
		prm.setDetalleParametro(nombre);

		Parametro prm2 = new Parametro();
		prm2.setKey("");
		prm2.setDetalleParametro(detpa);

		Parametro prm3 = new Parametro();
		prm3.setKey("imagen");
		prm3.setDetalleParametro(imagen);

		Parametro prm4 = new Parametro();
		prm4.setKey("anulado");
		prm4.setDetalleParametro(imagenAnulada);

		ArrayList<Parametro> lpr = new ArrayList<Parametro>();
		lpr.add(prm);
		lpr.add(prm2);
		lpr.add(prm3);
		lpr.add(prm4);

		reporteRequestDTO.setParam(lpr);

		try {
			bt = reportServiceImpl.generateReport(reporteRequestDTO);
		} catch (ServiceAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return bt;

	}

	@Transactional(readOnly = true)
	public ReportePersonaNatural generarPersona(String cldoc, String cltdoc, String prtipo, String dpagen,
			String dpcorr, String dpdive, Boolean isPrincipal) {
		ReportePersonaNatural pn = new ReportePersonaNatural();

		// se agrega beneficiario final
		pn = getReportePersonaNatural(cltdoc, cldoc);
		if (pn != null) {

			// se recuperan los dependientes
			if (isPrincipal) {
				// List<ReporteDependiente> dependientes = new
				// ArrayList<ReporteDependiente>();
				// dependientes = getDependientes(cldoc,
				// cltdoc);
				List<ReferenciaDependiente> dependientes = new ArrayList<ReferenciaDependiente>();
				dependientes = catalogoService.findReferenciaDependientes(cltdoc, cldoc);

				// if (dependientes.size() != 0 && dependientes.size() % 2 != 0)
				// {
				// ReporteDependiente rp = new ReporteDependiente();
				// rp.setIdPar("");
				// rp.setNombreDepPar("---------");en
				// rp.setParentescoPar("--------");
				// dependientes.add(rp);
				// }
				int dpct = 1;
				int contador = 0;
				ReporteDependiente rpin = null;
				List<ReporteDependiente> rpac = new ArrayList<ReporteDependiente>();
				for (ReferenciaDependiente reporteDependiente : dependientes) {
					if (dpct % 2 == 0) {
						rpin.setIdImp("" + dpct);
						rpin.setNombreDepImp(
								reporteDependiente.getNombre() == null ? "" : reporteDependiente.getNombre());
						if (reporteDependiente.getParentesco() == null) {
							rpin.setParentescoImp(reporteDependiente.getParentescoDescripcion() == null ? ""
									: reporteDependiente.getParentescoDescripcion());
						} else {
							rpin.setParentescoImp(reporteDependiente.getParentesco().getDescripcion() == null ? ""
									: reporteDependiente.getParentesco().getDescripcion());
						}
						contador++;

					} else {
						rpin = new ReporteDependiente();
						rpin.setIdPar("" + dpct);
						rpin.setNombreDepPar(
								reporteDependiente.getNombre() == null ? "" : reporteDependiente.getNombre());

						if (reporteDependiente.getParentesco() == null) {
							rpin.setParentescoPar(reporteDependiente.getParentescoDescripcion() == null ? ""
									: reporteDependiente.getParentescoDescripcion());
						} else {
							rpin.setParentescoPar(reporteDependiente.getParentesco().getDescripcion() == null ? ""
									: reporteDependiente.getParentesco().getDescripcion());
						}

						rpac.add(rpin);

						// rpac.add(rpin);
					}

					dpct++;
				}

				if (dependientes.size() != 0 && dependientes.size() % 2 != 0) {
					rpac.get(contador).setIdImp("");
					rpac.get(contador).setNombreDepImp("---------");
					rpac.get(contador).setParentescoImp("--------");
				}
				pn.setDependientes(rpac);

			}

			// se agregan los proveedores

			List<ReporteProveedor> rprov = new ArrayList<ReporteProveedor>();
			rprov = getProveedores(cldoc, cltdoc);

			int dpro = 1;
			int cont = 0;
			ReporteProveedor rpro = null;
			List<ReporteProveedor> lprov = new ArrayList<ReporteProveedor>();
			for (ReporteProveedor reporteProveedor : rprov) {
				if (dpro == 1) {
					rpro = new ReporteProveedor();
					Object valor = null;
					try {
						Integer in = Integer.parseInt(reporteProveedor.getId());
						valor = campoAdicionalService.getValorCampoAdicional("REFPROV", "GIRONEG",
								cltdoc + cldoc + String.format("%02d", in));
					} catch (Exception e) {
						e.printStackTrace();
					}
					if (null != valor) {
						reporteProveedor.setActividadEconomica((String) valor);
					} else {
						reporteProveedor.setActividadEconomica("---------");
					}
					rpro = reporteProveedor;
					if (((rprov.size() - (cont + 1)) == 0)) {
						rpro.setActividadEconomicad("----------");
						rpro.setIdd("" + (cont + 2));
						rpro.setNombred("---------");
						rpro.setActividadEconomicat("----------");
						rpro.setIdt("" + (cont + 3));
						rpro.setNombret("---------");
						lprov.add(rpro);
					}
					System.out.println("1-----" + dpro);
				} else {
					if (dpro == 2) {
						Object valor = null;
						try {
							Integer in = Integer.parseInt(reporteProveedor.getId());
							valor = campoAdicionalService.getValorCampoAdicional("REFPROV", "GIRONEG",
									cltdoc + cldoc + String.format("%02d", in));
						} catch (Exception e) {
							e.printStackTrace();
						}
						if (null != valor) {
							reporteProveedor.setActividadEconomica((String) valor);
						} else {
							reporteProveedor.setActividadEconomica("---------");
						}
						rpro.setIdd(reporteProveedor.getId());
						rpro.setNombred(reporteProveedor.getNombre());
						rpro.setActividadEconomicad(reporteProveedor.getActividadEconomica());
						if (((rprov.size() - (cont + 1)) == 0)) {
							rpro.setActividadEconomicat("----------");
							rpro.setIdt("" + (cont + 2));
							rpro.setNombret("---------");
							lprov.add(rpro);
						}
					} else {
						if (dpro == 3) {
							System.out.println("3-----" + dpro);
							Object valor = null;
							try {
								Integer in = Integer.parseInt(reporteProveedor.getId());
								valor = campoAdicionalService.getValorCampoAdicional("REFPROV", "GIRONEG",
										cltdoc + cldoc + String.format("%02d", in));
							} catch (Exception e) {
								// e.printStackTrace();
							}
							if (null != valor) {
								reporteProveedor.setActividadEconomica((String) valor);
							} else {
								reporteProveedor.setActividadEconomica("---------");
							}
							rpro.setIdt(reporteProveedor.getId());
							rpro.setNombret(reporteProveedor.getNombre());
							lprov.add(rpro);

						}
					}
				}

				if (dpro % 3 == 0) {
					dpro = 1;
				} else {
					dpro++;
				}
				cont++;
			}
			pn.setProveedores(lprov);
			// se agregan los comerciales referencias

			List<ReporteReferencia> rc = new ArrayList<ReporteReferencia>();
			List<ReferenciaComercial> referenciaComercial = new ArrayList<ReferenciaComercial>();
			referenciaComercial = catalogoService.findReferenciaComercialByCliente(cltdoc, cldoc);

			rc = getReferenciasComerciales(cldoc, cltdoc);
			int drefco = 1;
			int contdre = 0;
			ReporteReferencia rrefco = null;
			List<ReporteReferencia> lrc = new ArrayList<ReporteReferencia>();

			if (referenciaComercial.size() == 0) {
				rrefco = new ReporteReferencia();
				rrefco.setTelefono("----------");
				rrefco.setId("" + (contdre + 1));
				rrefco.setNombre("---------");
				rrefco.setTelefonod("----------");
				rrefco.setIdd("" + (contdre + 2));
				rrefco.setNombred("---------");
				lrc.add(rrefco);
			}
			for (ReferenciaComercial rfcom : referenciaComercial) {
				if (drefco == 1) {
					rrefco = new ReporteReferencia();
					rrefco.setId("" + (contdre + 1));
					rrefco.setNombre(rfcom.getNombreComercio());
					rrefco.setTelefono(rfcom.getTelefonoComercio());
					if (((rc.size() - (contdre + 1)) == 0)) {
						rrefco.setTelefonod("----------");
						rrefco.setIdd("" + (contdre + 2));
						rrefco.setNombred("---------");
						lrc.add(rrefco);
					}
				} else {
					if (drefco == 2) {
						rrefco.setIdd("" + (contdre + 1));
						rrefco.setTelefonod(rfcom.getTelefonoComercio());
						rrefco.setNombred(rfcom.getNombreComercio());
						lrc.add(rrefco);
					}
				}

				if (drefco % 2 == 0) {
					drefco = 1;
				} else {
					drefco++;
				}
				contdre++;
			}

			pn.setReferenciasComerciales(lrc);

			// se agregan los comerciales referencias

			List<ReferenciaCuenta> referenciaBancaria = new ArrayList<ReferenciaCuenta>();
			referenciaBancaria = catalogoService.findReferenciaCuentaByCliente(cltdoc, cldoc);

			int drefba = 1;
			int contba = 0;
			ReporteReferencia rrefba = null;
			List<ReporteReferencia> lreba = new ArrayList<ReporteReferencia>();
			if (referenciaBancaria.size() == 0) {
				rrefba = new ReporteReferencia();
				rrefba.setTelefono("----------");
				rrefba.setId("" + (contba + 1));
				rrefba.setNombre("---------");
				rrefba.setTelefonod("----------");
				rrefba.setIdd("" + (contba + 2));
				rrefba.setNombred("---------");
				lreba.add(rrefba);
			}
			for (ReferenciaCuenta rfban : referenciaBancaria) {
				if (drefba == 1) {
					rrefba = new ReporteReferencia();
					rrefba.setTelefono("---------");
					Map<String, Object> map = new HashMap<>();
					map.put("tipoInstitucion.codigo", rfban.getId().getTipoInstitucion());
					Institucion i = manager.find(Institucion.class, rfban.getId().getCodigoInstitucion(), map);
					rrefba.setNombre(i.getDescripcion());
					rrefba.setId("" + (contba + 1));
					if (((referenciaBancaria.size() - (contba + 1)) == 0)) {
						rrefba.setTelefonod("----------");
						rrefba.setIdd("" + (contba + 2));
						rrefba.setNombred("---------");
						lreba.add(rrefba);
					}
				} else {
					if (drefba == 2) {
						rrefba.setIdd("" + (contba + 1));
						Map<String, Object> map = new HashMap<>();
						map.put("tipoInstitucion.codigo", rfban.getId().getTipoInstitucion());
						Institucion i = manager.find(Institucion.class, rfban.getId().getCodigoInstitucion(), map);
						rrefba.setTelefonod("---------");
						rrefba.setNombred(i.getDescripcion());
						lreba.add(rrefba);
					}
				}

				if (drefba % 2 == 0) {
					drefba = 1;
				} else {
					drefba++;
				}
				contba++;
			}
			pn.setReferenciasBancarias(lreba);

			// se agregar referenciasPersonales
			List<ReferenciaPersonalFamiliar> referenciaPersonal = new ArrayList<ReferenciaPersonalFamiliar>();
			referenciaPersonal = catalogoService.findReferenciaPersonalFamiliarByCliente(cltdoc, cldoc);
			List<ReporteRefPersonales> rf = new ArrayList<ReporteRefPersonales>();
			Integer contador = 1;
			for (ReferenciaPersonalFamiliar rp : referenciaPersonal) {
				ReporteRefPersonales rfi = new ReporteRefPersonales();
				rfi.setDireccion(rp.getDireccion());
				rfi.setId("" + contador);
				rfi.setNombre(rp.getNombre());
				String parentesco;
				if (rp.getParentesco() != null) {
					parentesco = rp.getParentesco().getDescripcion() == null ? "" : rp.getParentesco().getDescripcion();
				} else {
					parentesco = rp.getParentescoDescripcion() == null ? "" : rp.getParentescoDescripcion();
				}
				rfi.setParentesco(parentesco);

				rfi.setTelefono(rp.getTelefono1());
				rf.add(rfi);
				contador++;
			}

			// rf = getReferenciasPersonales(cldoc, cltdoc);
			if (rf.size() == 0) {
				ReporteRefPersonales rfi = new ReporteRefPersonales();
				rfi.setDireccion("------------");
				rfi.setId("1");
				rfi.setNombre("--------");
				rfi.setParentesco("--------");
				rfi.setTelefono("--------");
				rf.add(rfi);

			}
			pn.setReferenciasPersonales(rf);

			// se agregan Benefeciarios
			List<ReporteBeneficiario> bn = new ArrayList<ReporteBeneficiario>();
			if (prtipo != null && dpagen != null && dpcorr != null && dpdive != null) {
				bn = getBeneficiarios(prtipo, dpagen, dpcorr, dpdive);
				pn.setBeneficiarios(bn);
			}

			return pn;
		} else {
			return new ReportePersonaNatural();
		}
	}

	public String getInstrucciones() {
		return instrucciones;
	}

	public void setInstrucciones(String instrucciones) {
		this.instrucciones = instrucciones;
	}

	private Authentication getAuthentication() {
		return SecurityContextHolder.getContext().getAuthentication();
	}

	private static String getIdClienteParaCamposAdicionales(String tipoDocumento, String documento) {
		tipoDocumento = StringUtils.leftPad(tipoDocumento, 1, ' ');
		documento = StringUtils.leftPad(documento, 18, ' ');
		return tipoDocumento.concat(documento);
	}

	private static String getIdDireccionParaCamposAdicionales(String idClienteAdicional, Integer correlativoDireccion) {
		return (idClienteAdicional + StringUtils.leftPad(correlativoDireccion.toString(), 2, '0'));
	}

	private static String getIdReferenciaParaCamposAdicionales(String idClienteAdicional,
			Integer correlativoReferencia) {
		return (idClienteAdicional + StringUtils.leftPad(correlativoReferencia.toString(), 2, '0'));
	}

	@Transactional(readOnly = true)
	public ReporteCuenta getCuentaReporte(Integer digitoIdentificador, Integer agencia, Integer correlativo,
			Integer digitoVerificador, String empresa) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-cuenta", ReporteCuenta.class);
		query.setParameter("PRTIPO", digitoIdentificador);
		query.setParameter("DPAGEN", agencia);
		query.setParameter("DPCORR", correlativo);
		query.setParameter("DPDIVE", digitoVerificador);
		query.setParameter("EMPCOD", empresa);
		return (ReporteCuenta) query.getSingleResult();
	}

	@Transactional(readOnly = true)
	public ReporteCuentaGenerales getCuentaReporteGenerales(Integer digitoIdentificador, Integer agencia,
			Integer correlativo, Integer digitoVerificador) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-generales", ReporteCuentaGenerales.class);
		query.setParameter("PRTIPO", digitoIdentificador);
		query.setParameter("DPAGEN", agencia);
		query.setParameter("DPCORR", correlativo);
		query.setParameter("DPDIVE", digitoVerificador);
		return (ReporteCuentaGenerales) query.getSingleResult();
	}

	@Transactional(readOnly = true)
	public ReportePersonaNatural getReportePersonaNatural(String tipoIdentificacion, String identificacion)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-persona-natural", ReportePersonaNatural.class);
		query.setParameter("CLTDOC", tipoIdentificacion);
		query.setParameter("CLDOC", identificacion);
		return (ReportePersonaNatural) query.getSingleResult();
	}

	@Transactional(readOnly = true)
	public List<ReporteRefPersonales> getReferenciasPersonales(String identificacion, String tipoIdentificacion)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-personales", ReporteRefPersonales.class);
		query.setParameter("CLTDOC", tipoIdentificacion);
		query.setParameter("CLDOC", identificacion);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteDetalleFuturoCrece> getDetalleFuturoCrece(String digitoIdentificador, String agencia,
			String correlativo, String digitoVerificador) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reportes-detalleFuturo", ReporteDetalleFuturoCrece.class);
		query.setParameter("PRTIPO", digitoIdentificador);
		query.setParameter("DPAGEN", agencia);
		query.setParameter("DPCORR", correlativo);
		query.setParameter("DPDIVE", digitoVerificador);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteReferencia> getReferenciasComerciales(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-comerciales", ReporteReferencia.class);
		query.setParameter("CLDOC", cldoc);
		query.setParameter("CLTDOC", cltdoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteReferencia> getReferenciasBancarias(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-bancarias", ReporteReferencia.class);
		query.setParameter("CLDOC", cldoc);
		query.setParameter("CLTDOC", cltdoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteProveedor> getProveedores(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-proveedores", ReporteProveedor.class);
		query.setParameter("CLDOC", cldoc);
		query.setParameter("CLTDOC", cltdoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public ReporteFuturoCrece getFuturoCrece(Integer agencia, Integer correlativo, Integer dive, Integer tipo)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reportes-cabezeraFuturo", ReporteFuturoCrece.class);
		query.setParameter("DPAGEN", agencia.toString());
		query.setParameter("DPCORR", correlativo.toString());
		query.setParameter("DPDIVE", dive.toString());
		query.setParameter("PRTIPO", tipo.toString());
		query.getResultList();
		return (ReporteFuturoCrece) query.getSingleResult();
	}

	@Transactional(readOnly = true)
	public List<ReporteProducto> getProducto(String tipoPersona, Integer codigoProduto, Integer subProducto)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reportes-producto", ReporteProducto.class);
		query.setParameter("TIPO", tipoPersona);
		query.setParameter("PRODUCTO", codigoProduto);
		query.setParameter("SUBPRODUCTO", subProducto);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getReporteComplemento(String vaadid) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-valoresNume", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteDependiente> getReporteDependiente(String tipoDocumento, String documento)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-dependientes", ReporteDependiente.class);
		query.setParameter("CLTDOC", tipoDocumento);
		query.setParameter("CLDOC", documento);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getActividadEconomica(String vaadid) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-actividadEconomica", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getDocumento(String vaadid) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-actividadEconomica", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getValoresAlfa(String vaadid) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-valoresAlfa", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getGiroNegocio(String vaadid) throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-giroNego", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public ReportePersonaJuridica getReportePersonaJuridica(String tipoIdentificacion, String identificacion)
			throws NoResultException {
		Query query = manager.createNamedQuery("sql-reporte-juridica", ReportePersonaJuridica.class);
		query.setParameter("CLTDOC", tipoIdentificacion);
		query.setParameter("CLDOC", identificacion);
		return (ReportePersonaJuridica) query.getSingleResult();
	}

	// public List<ReporteProducto> getReportesImprimir(String producto, String
	// subProducto,String tipo) {
	// Query query = manager.createNamedQuery("sql-reportes-producto",
	// ReportePersonaJuridica.class);
	// query.setParameter("PRODUCTO", producto);
	// query.setParameter("SUBPRODUCTO", subProducto);
	// query.setParameter("TIPO", tipo);
	// return query.getResultList();
	// }

	@Transactional(readOnly = true)
	public List<ReporteDireccionCliente> getDireccionesCliente(String cltdoc, String cldoc) {
		Query query = manager.createNamedQuery("sql-reporte-direcciones", ReporteDireccionCliente.class);
		query.setParameter("CLTDOC", cltdoc);
		query.setParameter("CLDOC", cldoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public DireccionesTrabajoReporte getDetalleDireccion(String cltdoc, String cldoc, Integer correlativo) {
		Query query = manager.createNamedQuery("sql-detalle-direcciones", DireccionesTrabajoReporte.class);
		query.setParameter("CLTDOC", cltdoc);
		query.setParameter("CLDOC", cldoc);
		query.setParameter("LABCOR", correlativo);
		return (DireccionesTrabajoReporte) query.getSingleResult();
	}

	@Transactional(readOnly = true)
	public List<ReporteSocio> getAccionistas(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-accionistas", ReporteSocio.class);
		query.setParameter("CLTDOC", cltdoc);
		query.setParameter("CLDOC", cldoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteComplemento> getDescDocumento(String vaadid) {
		Query query = manager.createNamedQuery("sql-reporte-documento", ReporteComplemento.class);
		query.setParameter("VAADID", vaadid);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteBeneficiario> getBeneficiarios(String prtipo, String dpagen, String dpcorr, String dpdive) {
		Query query = manager.createNamedQuery("sql-reporte-beneficiarios", ReporteBeneficiario.class);
		query.setParameter("PRTIPO", prtipo);
		query.setParameter("DPAGEN", dpagen);
		query.setParameter("DPCORR", dpcorr);
		query.setParameter("DPDIVE", dpdive);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public Pais getPais(String id) {
		Pais pais = (Pais) manager.find(Pais.class, id);
		return pais;
	}

	@Transactional(readOnly = true)
	public ActividadEconomica getActividadEconomica(Integer id) {
		ActividadEconomica ctEcon = manager.find(ActividadEconomica.class, id);
		System.out.println(ctEcon);
		return ctEcon;
	}

	@Transactional(readOnly = true)
	public List<ReporteRepresentante> getFirmanteRepresentante(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-firmantes-representante", ReporteRepresentante.class);
		query.setParameter("CLDOC", cldoc);
		query.setParameter("CLTDOC", cltdoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteBeneficiarioFinal> getBeneficiarioFinal(String prtipo, String dpagen, String dpcorr,
			String dpdive) {
		Query query = manager.createNamedQuery("sql-reporte-beneficiarios-principales", ReporteBeneficiarioFinal.class);
		query.setParameter("PRTIPO", prtipo);
		query.setParameter("DPAGEN", dpagen);
		query.setParameter("DPCORR", dpcorr);
		query.setParameter("DPDIVE", dpdive);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteIdFirmantes> getFirmantes(String prtipo, String agen, String corr, String dive) {
		Query query = manager.createNamedQuery("sql-reporte-firmantes", ReporteIdFirmantes.class);
		query.setParameter("PRTIPO", prtipo);
		query.setParameter("PRTIPO", prtipo);
		query.setParameter("AGEN", agen);
		query.setParameter("CORR", corr);
		query.setParameter("DIVE", dive);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteDependiente> getDependientes(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-dependientes", ReporteDependiente.class);
		query.setParameter("CLTDOC", cltdoc);
		query.setParameter("CLDOC", cldoc);
		return query.getResultList();
	}

	@Transactional(readOnly = true)
	public List<ReporteDependienteIndividual> getDependientesIndividual(String cldoc, String cltdoc) {
		Query query = manager.createNamedQuery("sql-reporte-dependientes-individual",
				ReporteDependienteIndividual.class);
		query.setParameter("CLTDOC", cltdoc);
		query.setParameter("CLDOC", cldoc);
		return query.getResultList();
	}

	public ReportePersonaNatural personasMancomunadas(String cldoc, String cltdoc, String propositoCuenta,
			ReporteCuentaGenerales rcg, String modeda) {
		ReportePersonaNatural rpnatural = new ReportePersonaNatural();
		rpnatural = generarPersona(cldoc, cltdoc, null, null, null, null, true);
		String corre = "0";
		List<ReporteDireccionCliente> direcciones = getDireccionesCliente(cltdoc, cldoc);
		List<DireccionesTrabajoReporte> listDirecciones = new ArrayList<>();
		try {
			int trabIndex = 0;
			for (ReporteDireccionCliente rd : direcciones) {
				if (tipoDirTrabajo.equals(rd.getTipoDireccion())) {
					trabIndex++;
					rpnatural.setDireccionEmpresa(rd.getDireccion());
					rpnatural.setTelefonoEmpresa(rd.getTelefono());
					DireccionesTrabajoReporte dtrabajo = null;
					try {
						dtrabajo = getDetalleDireccion(cltdoc, cldoc, trabIndex);
						dtrabajo.setTelefonoEmpresa(rd.getTelefono()==null ? "-------" :rd.getTelefono());
					} catch (Exception e) {

					}
					SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
					Date fechaIngreso = null;
					try {
						fechaIngreso = formato.parse(dtrabajo.getFechaIngreso());
						SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
						dtrabajo.setFechaIngreso(nuevoFormato.format(fechaIngreso));
					} catch (ParseException ex) {
						// System.out.println(ex);

					}
					
					String idCliente = getIdClienteParaCamposAdicionales(cltdoc, cldoc);
					String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rd.getId().getCodigo());
					Object laboralCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EMAILXDIR",
							idDireccion);
					Object exteUno = campoAdicionalService.getValorCampoAdicional("DIRXCLTE", "EXT_1", idDireccion);
					if (dtrabajo != null) {
						dtrabajo.setDireccionEmpresa(rd.getDireccion());
						
							rpnatural.setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
							dtrabajo.setCorreoTrabajo(rpnatural.getCorreoTrabajo());
						

						
							rpnatural.setExtencionEmpresa(exteUno.toString() == null  ?"-------" : exteUno.toString() );
							dtrabajo.setExtencionEmpresa(rpnatural.getExtencionEmpresa());
						
						listDirecciones.add(dtrabajo);
					} else {
						if (laboralCorreo != null) {
							rpnatural.setCorreoTrabajo(laboralCorreo.toString() == null  ?"-------" : laboralCorreo.toString());
						}
						if (exteUno != null) {
							rpnatural.setExtencionEmpresa(exteUno.toString() == null  ?"-------" : exteUno.toString());
						}
					}

				} else {
					if (tipoDirComercio.equals(rd.getTipoDireccion())) {
						rpnatural.setDireccionDelNegocio(rd.getDireccion());
						rpnatural.setTelefonoNegocio(rd.getTelefono());
					} else {
						if (tipoDirDomiciliar.equals(rd.getTipoDireccion())) {
							rpnatural.setCorrelativoEmail("" + rd.getTipoDireccion());
							rpnatural.setMunicipio(rd.getMunicipio());
							rpnatural.setDireccion(rd.getDireccion());
							rpnatural.setTelefono(rd.getTelefono());
							rpnatural.setCelular(rd.getTelefono2());
							rpnatural.setDepartamento(rd.getDepartamento());
							String idCliente = getIdClienteParaCamposAdicionales(cltdoc, cldoc);
							String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rd.getId().getCodigo());
							Object personalCorreo = campoAdicionalService.getValorCampoAdicional("DIRXCLTE",
									"EMAILXDIR", idDireccion);
							if (personalCorreo != null) {
								rpnatural.setCorreoelectronico(personalCorreo.toString());
							}
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (rpnatural != null && rpnatural.getCorrelativoEmail() != null) {
			try {
				corre = String.format("%02d", Integer.parseInt(rpnatural.getCorrelativoEmail()));
			} catch (Exception e) {
				// e.printStackTrace();
			}
		}
		// valoresAlfa = getValoresAlfa(cp.getCltdoc() + cp.getCldoc() + corre);
		// for (ReporteComplemento reporteComplemento : valoresAlfa) {
		// mp.put(reporteComplemento.getEntidad() +
		// reporteComplemento.getCodigo(), reporteComplemento);
		// }

		try {
			Double ingresoNeg = Double.parseDouble(rpnatural.getIngresoNegocio());
			String ingresoS = String.format("%,.2f", ingresoNeg);
			rpnatural.setIngresoNegocio(modeda + " " + ingresoS);
		} catch (Exception e) {
			// e.printStackTrace();
		}

		String fechaNac = rpnatural.getFechaNacimiento();

		if (fechaNac != null) {
			try {
				int y1 = Integer.parseInt(fechaNac.substring(0, 4));
				int m1 = Integer.parseInt(fechaNac.substring(4, 6));
				int d1 = Integer.parseInt(fechaNac.substring(6, 8));

				rpnatural.setFechaNacimiento(fechaNac.substring(6, 8) + "/" + fechaNac.substring(4, 6) + "/" + y1);

				// Objeto con la fecha actual
				GregorianCalendar fechaActual = new GregorianCalendar();
				int y2 = fechaActual.get(GregorianCalendar.YEAR);
				int m2 = fechaActual.get(GregorianCalendar.MONTH);
				int d2 = fechaActual.get(GregorianCalendar.DAY_OF_MONTH);
				int diffYears = (y2 - y1 - 1) + (m2 == m1 ? (d2 >= d1 ? 1 : 0) : m2 >= m1 ? 1 : 0);
				System.out.println(diffYears + " aÃ±osxxxx");
				rpnatural.setEdad("" + diffYears);
			} catch (Exception e) {
				// e.printStackTrace();
			}
		}

		String fechaInicio = rpnatural.getFechaInicioOperaciones();
		if (fechaInicio != null) {
			try {
				String y1 = fechaInicio.substring(0, 4);
				String m1 = fechaInicio.substring(4, 6);
				String d1 = fechaInicio.substring(6, 8);
				rpnatural.setFechaInicioOperaciones(d1 + "/" + m1 + "/" + y1);
			} catch (Exception e) {
				// e.printStackTrace();
			}
		}
		ReporteFormantoNatural rfn = new ReporteFormantoNatural();

		if (rpnatural != null) {
			rpnatural.setFormantoNatural(rfn);
			rpnatural.setCldoc(cldoc);
		}

		if (rpnatural.getFechaIngreso() != null) {
			SimpleDateFormat formato = new SimpleDateFormat("yyyyMMdd");
			Date fechaIngreso = null;
			try {
				fechaIngreso = formato.parse(rpnatural.getFechaIngreso());
			} catch (ParseException ex) {
				// System.out.println(ex);

			}
			SimpleDateFormat nuevoFormato = new SimpleDateFormat("dd/MM/yyyy");
			if (fechaIngreso != null) {
				rpnatural.setFechaIngreso(nuevoFormato.format(fechaIngreso));
			}

		}

		ReportePersonaNatural rpAhorro = rpnatural;

		if (rpnatural.getSexo() != null && rpnatural.getSexo().equals("M")) {

			rpnatural.setSexo(env.getProperty("core.reportes.etiquetas.sexo.masculino"));

		} else {
			if (rpnatural.getSexo() != null && rpnatural.getSexo().equals("F")) {

				rpnatural.setSexo(env.getProperty("core.reportes.etiquetas.sexo.femenino"));

			}
		}

		String nombreCompleto = rpnatural.getPrimerNombre().trim() + " " + rpnatural.getSegundoNombre().trim() + " "
				+ rpnatural.getPrimerApellido().trim() + " " + rpnatural.getSegundoApellido().trim();

		// if (reporteFuturoCrece != null && reportes.get("12") != null) {
		// reporteFuturoCrece.setNombre(nombreCompleto);
		// reporteFuturoCrece.setCuenta(cp.getNumeroCuenta());
		//
		// }
		String declaracion = env.getProperty("core.reportes.etiquetas.cuenta.declaracion");
		rpnatural.setDeclaracion(declaracion);
		// reporteAhorro.setDomicilio(rpAhorro.getDireccion());
		// reporteAhorro.setExtencion("--------");
		// reporteAhorro.setExtencionTrabajo(rpAhorro.getExtencionEmpresa());
		// reporteAhorro.setFechaApertura(fecha);
		// reporteAhorro.setFechaCancelacion("---------");
		// reporteAhorro.setIdentidad(rpnatural.getIdCliente());
		// reporteAhorro.setLugarTrabajo(rpAhorro.getDireccionEmpresa());
		// reporteAhorro.setNumeroCuenta(cp.getNumeroCuenta());
		// reporteAhorro.setObservaciones("---------");
		// reporteAhorro.setPerfil(cp.getCldoc());
		// reporteAhorro.setPrimerNombre(rpAhorro.getPrimerNombre());
		// reporteAhorro.setSegundoNombre(rpAhorro.getSegundoNombre());
		// reporteAhorro.setPrimerApellido(rpAhorro.getPrimerApellido());
		// reporteAhorro.setSegundoApellido(rpAhorro.getSegundoApellido());
		// reporteAhorro.setRtn(rpnatural.getRegistroTributario());
		// reporteAhorro.setTelefono(rpAhorro.getCelular());
		rpnatural.setProposito(propositoCuenta);
		if (rcg != null) {
			try {
				Double mov = Double.parseDouble(rcg.getMontoMovimiento());
				String movs = String.format("%,.2f", mov);
				rpnatural.setVolumen(modeda + " " + movs);
			} catch (Exception e) {
				e.printStackTrace();
			}

			rpnatural.setEspecificar(rcg.procedenciaFondo);

		} else {
			rpnatural.setVolumen("--------");
			rpnatural.setEspecificar("-------");
		}

		if (rpnatural.getDependientes() == null || rpnatural.getDependientes().size() == 0) {
			List<ReporteDependiente> rpl = new ArrayList<>();
			ReporteDependiente rp = new ReporteDependiente();
			rp.setIdImp("2");
			rp.setIdPar("1");
			rp.setNombreDepImp("--------");
			rp.setNombreDepPar("--------");
			rp.setParentescoImp("--------");
			rp.setParentescoPar("--------");
			rpl.add(rp);
			rpnatural.setDependientes(rpl);
		}
		if (rpnatural.getBeneficiarios() == null || rpnatural.getBeneficiarios().size() == 0) {
			List<ReporteBeneficiario> rpl = new ArrayList<>();
			ReporteBeneficiario rp = new ReporteBeneficiario();
			rp.setDireccion("--------");
			rp.setId("1");
			rp.setNombre("");
			rp.setParentesco("--------");
			rp.setPorcentaje("--------");
			rp.setTelefono("--------");
			rpl.add(rp);
			rpnatural.setBeneficiarios(rpl);
		}
		if (rpnatural.getBeneficiarios() != null) {
			int dba = 1;
			List<ReporteBeneficiarioAhorro> beneAhorro = new ArrayList<>();
			ReporteBeneficiarioAhorro bena = null;
			for (ReporteBeneficiario rd : rpnatural.getBeneficiarios()) {
				if (dba % 2 == 0) {
					bena.setIdImp("" + (dba + 1));
					bena.setNombreBenImp(rd.getNombre());
					bena.setPorcentajeImp(rd.getPorcentaje());
					beneAhorro.add(bena);
				} else {
					bena = new ReporteBeneficiarioAhorro();
					bena.setIdPar("" + (dba + 1));
					bena.setNombreBenPar(rd.getNombre());
					bena.setPorcentajePar(rd.getPorcentaje());
					if (dba == rpnatural.getBeneficiarios().size()) {
						bena.setIdImp("" + (dba + 2));
						bena.setNombreBenImp("--------");
						bena.setPorcentajeImp("--------");
						beneAhorro.add(bena);
					}

				}
				dba++;
			}
		}
		Boolean se = false;
		rfn.setAcepta("");
		rfn.setNoAcepta("x");
		rfn.setAceptaRobo("");
		rfn.setNoAcetaRobo("x");
		rfn.setAceptaMobil("");
		rfn.setNoAceptaMobil("x");
		rfn.setAcentaEnLinea("");
		rfn.setNoAceptaEnLinea("x");

		if (rpnatural.getProveedores() == null || rpnatural.getProveedores().size() == 0) {
			List<ReporteProveedor> rpl = new ArrayList<>();
			ReporteProveedor rp = new ReporteProveedor();
			rp.setActividadEconomica("--------");
			rp.setActividadEconomicad("--------");
			rp.setActividadEconomicat("--------");
			rp.setId("1");
			rp.setIdd("2");
			rp.setIdt("3");
			rp.setNombre("--------");
			rp.setNombred("--------");
			rp.setNombret("--------");
			rpl.add(rp);
			rpnatural.setProveedores(rpl);
		}

		if (rpnatural.getReferenciasBancarias() == null || rpnatural.getReferenciasBancarias().size() == 0) {
			List<ReporteReferencia> rpl = new ArrayList<>();
			ReporteReferencia rp = new ReporteReferencia();
			rp.setId("1");
			rp.setIdd("2");
			rp.setIdt("3");
			rp.setNombre("--------");
			rp.setNombred("--------");
			rp.setNombred("--------");
			rp.setNombret("--------");
			rp.setTelefono("--------");
			rp.setTelefonod("--------");
			rp.setTelefonot("--------");
			rpl.add(rp);
			rpnatural.setReferenciasBancarias(rpl);
		}
		if (rpnatural.getReferenciasComerciales() == null || rpnatural.getReferenciasComerciales().size() == 0) {
			List<ReporteReferencia> rpl = new ArrayList<>();
			ReporteReferencia rp = new ReporteReferencia();
			rp.setId("1");
			rp.setIdd("2");
			rp.setIdt("3");
			rp.setNombre("--------");
			rp.setNombred("--------");
			rp.setNombred("--------");
			rp.setNombret("--------");
			rp.setTelefono("--------");
			rp.setTelefonod("--------");
			rp.setTelefonot("--------");
			rpl.add(rp);
			rpnatural.setReferenciasComerciales(rpl);
		}
		if (rpnatural.getReferenciasPersonales() == null || rpnatural.getReferenciasPersonales().size() == 0) {
			List<ReporteRefPersonales> rpl = new ArrayList<>();
			ReporteRefPersonales rp = new ReporteRefPersonales();
			rp.setDireccion("--------");
			rp.setId("1");
			rp.setNombre("--------");
			rp.setParentesco("--------");
			rp.setTelefono("--------");
			rpl.add(rp);
			rpnatural.setReferenciasPersonales(rpl);
		}

		return rpnatural;

	}

}
