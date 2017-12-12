package com.bytesw.platform.bs.service.impl;

import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_GENERA_DIVISAS;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_NOMBRE_COMERCIAL;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_PAIS_RESIDENCIA;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_PARENTESTO_EMPLEADO;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_RAZON_SOCIAL;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_SITUACION_EMPLEO;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_CLIENTE_TIN;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_DIRECCION_EMAIL;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_DIRECCION_EXTENSION;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_REF_ACCIONISTA_ACT_ECO;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_REF_ACCIONISTA_CARGO;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_REF_ACCIONISTA_DOC_IDENT;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_REF_ACCIONISTA_NACIONALIDAD;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_CLIENTE;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_DIRECCION_CLIENTE;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_REFERENCIA_ACCIONISTA;
import static com.bytesw.platform.utilities.CamposAdicionalesUtil.ENTIDAD_REFERENCIA_PROVEEDORES;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;
import javax.persistence.NoResultException;

import com.bytesw.platform.eis.bo.clientes.*;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.clientes.ClienteDao;
import com.bytesw.platform.bs.dao.clientes.ClienteResumenRepository;
import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.GeneradorCodigoClienteHelper;
import com.bytesw.platform.bs.service.CampoAdicionalService;
import com.bytesw.platform.bs.service.CatalogoService;
import com.bytesw.platform.bs.service.ClienteService;
import com.bytesw.platform.bs.service.HuellaFotoService;
import com.bytesw.platform.bs.service.MnemonicoService;
import com.bytesw.platform.bs.service.plataforma.ReferenciaClienteDetalleService;
import com.bytesw.platform.bs.service.ResourceService;
import com.bytesw.platform.eis.bo.clientes.dominio.EstadoCivil;
import com.bytesw.platform.eis.bo.clientes.dominio.EstadoCliente;
import com.bytesw.platform.eis.bo.clientes.dominio.Modalidad;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;
import com.bytesw.platform.eis.dto.AuthorizedDTO;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteInformacionDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.clientes.ContadorDTO;
import com.bytesw.platform.eis.dto.clientes.DatosGeneralesPersonaJuridicaDTO;
import com.bytesw.platform.eis.dto.clientes.DireccionDTO;
import com.bytesw.platform.eis.dto.clientes.DocumentoAperturaDTO;
import com.bytesw.platform.eis.dto.clientes.IndiceDTO;
import com.bytesw.platform.eis.dto.clientes.PerfilEconomicoDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaAccionistaDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaComercialDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaComercianteDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaConyugueDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaCreditoDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaCuentaDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaDependienteDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaLaboralConyugueDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaLaboralDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaParentescoEmpleadoDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaPersonalFamiliarDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaPropiedadDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaProveedorDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaSeguroDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaTarjetaCreditoDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciaVehiculoDTO;
import com.bytesw.platform.eis.dto.clientes.ReferenciasDTO;
import com.bytesw.platform.eis.dto.clientes.RegistroPersonasRequestDTO;
import com.bytesw.platform.eis.dto.clientes.TipoEdadClienteDTO;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.search.SearchCriteria;
import com.bytesw.platform.search.SearchSpecificationsBuilder;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.ParameterPlatform;
import com.bytesw.platform.utilities.Permission;
import com.bytesw.platform.utilities.SeccionFormularioCliente;

public class ClienteServiceImpl implements ClienteService {

    protected final Log logger = LogFactory.getLog(getClass());

    private static final int LONGITUD_MAXIMA_INDICE = 15;
    private static final int LONTIGUD_MINIMA_INDICE = 4;
    private static final String PAPELERIA_PENDIENTE = "P";
    private static final String PAPELERIA_COMPLETA = "C";

    @Resource
    protected ClienteResumenRepository clienteResumenRepository;

    @Autowired
    @Qualifier("clienteIntegrationDao")
    protected ClienteDao dao;

    @Autowired
    protected MnemonicoService mnemonicoService;

    @Autowired
    protected CatalogoService catalogoService;

    @Autowired
    protected ReferenciaClienteDetalleService referenciaClienteDetalleService;

    @Autowired
    protected GeneradorCodigoClienteHelper generadorCodigoClienteHelper;

    @Autowired
    protected CampoAdicionalService campoAdicionalService;

    @Autowired
    protected ResourceService resourceService;
    
    @Autowired
    protected HuellaFotoService huellaFotoService;

    public static int LONGITUD_CODIGO_CLIENTE = 18;

    @Override
    @Transactional(readOnly = true)
    public Iterable<ClienteResumen> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return clienteResumenRepository.findAll(this.getSpecificationSearch(searchDTO), page);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteInformacionDTO findCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        Cliente bo = catalogoService.findClienteById(tipoIdentificacion, identificacion);
        Iterable<TipoDireccion> tds = catalogoService.findTiposDirecciones();
        return new ClienteInformacionDTO(bo, tds);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] findAvatarByClienteId(String tipoIdentificacion, String identificacion) {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        Foto bo = resourceService.findResourceById(id);
        if (null == bo) {
            bo = new Foto(tipoIdentificacion, identificacion, resourceService.getBytesDefaultImage());
        }
        return bo.getImagen();
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResumen findClienteToPortal(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        ClienteResumen bo = clienteResumenRepository.findById(id);
        if (null == bo) {
            throw new ResourceNotFoundException();
        }
        TipoDocumento td = catalogoService.findTipoDocumentoByCodigo(bo.getTipoDeIdentificacion());
        if (null != td) {
        	bo.setDescripcionTipoDeIdentificacion(td.getDescripcion());
        }
        return bo;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Iterable<GrupoEconomico> findGrupoEconomicoByCliente(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<GrupoEconomico> ges = catalogoService.findGruposEconomicosByCliente(tipoIdentificacion, identificacion);
        if (null == ges || ges.isEmpty()) {
        	throw new ResourceNotFoundException();
        }
        return ges;
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO findClienteToUpdateNombre(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        Cliente bo = catalogoService.findClienteById(tipoIdentificacion, identificacion);
        // JURIDICA
        if (TipoPersona.J.equals(bo.getTipoPersona())) {
            String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
            String razonSocial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente);
            if (null != razonSocial) {
                bo.getJuridico().setRazonSocial(razonSocial.toUpperCase());
            }
        }
        return new ClienteDTO(bo, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateDatosGenerales(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        Cliente bo = catalogoService.findClienteById(tipoIdentificacion, identificacion);
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        // INDIVIDUAL
        if (TipoPersona.N.equals(bo.getTipoPersona())) {
            Pais nacionalidad = null;
            try {
                nacionalidad = catalogoService.findPaisByNacionalidad(bo.getIndividual().getNacionalidad());
            } catch (NoResultException nre) {
                logger.error(nre.getMessage(), nre);
            }
            bo.getIndividual().setPaisNacionalidad(nacionalidad);
            String paisResidencia = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PAIS_RESIDENCIA, idCliente);
            bo.getIndividual().setPaisResidencia(paisResidencia);
        }
        // JURIDICA
        if (TipoPersona.J.equals(bo.getTipoPersona())) {
            String razonSocial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente);
            if (null != razonSocial) {
                bo.getJuridico().setRazonSocial(razonSocial);
            }
            String nombreComercial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_NOMBRE_COMERCIAL, idCliente);
            bo.getJuridico().setNombreComercial(nombreComercial);
            ClienteJuridicoNivelVentas nv = catalogoService.findClienteJuridicoNivelVentasById(tipoIdentificacion, identificacion);
            if (null != nv) {
                bo.getJuridico().setNivelVentas(nv.getNivelVentas());
            }
        }
        return new ClienteDTO(bo, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO findClienteToUpdateDependientes(String tipoIdentificacion, String identificacion) {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaDependiente> dependientes = catalogoService.findReferenciaDependientes(tipoIdentificacion, identificacion);
        return new ClienteDTO(tipoIdentificacion, identificacion, dependientes, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdatePerfilEconomico(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        PerfilEconomico bo = catalogoService.findPerfilEconomicoByClienteId(tipoIdentificacion, identificacion);
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        // CAMPOS ADICIONALES
        Object tin = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_TIN, idCliente);
        if (null != tin) {
            bo.setTin((String) tin);
        }
        Object generadorDivisas = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_GENERA_DIVISAS, idCliente);
        if (null != generadorDivisas) {
            bo.setGeneradorDivisas((Boolean) generadorDivisas);
        } else {
            bo.setGeneradorDivisas(false);
        }
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        if (null != relacionEconomica) {
            bo.setRelacionEconomica((Integer) relacionEconomica);
        }
        Object parentescoEmpleadoBanco = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PARENTESTO_EMPLEADO, idCliente);
        if (null != parentescoEmpleadoBanco) {
            bo.setParentescoEmpleadoBanco((Boolean) parentescoEmpleadoBanco);
        } else {
            bo.setParentescoEmpleadoBanco(false);
        }
        if (null != bo.getNacionalidad()) {
            Pais nacionalidad = null;
            try {
                nacionalidad = catalogoService.findPaisByNacionalidad(bo.getNacionalidad());
            } catch (NoResultException nre) {
                logger.error(nre.getMessage(), nre);
            }
            bo.setPaisNacionalidad(nacionalidad);
        }
        List<ReferenciaParentescoEmpleado> rpes = null;
        if (bo.getParentescoEmpleadoBanco()) {
        	try {
        		rpes = catalogoService.findReferenciaParentescoEmpleadoByCliente(tipoIdentificacion, identificacion);
        	} catch (NoResultException nre) {
        		logger.error(nre.getMessage());
        	}
        }
        List<GrupoEconomico> ges = catalogoService.findGruposEconomicosByCliente(tipoIdentificacion, identificacion);
        return new ClienteDTO(bo, rpes, ges, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO findClienteToUpdateRepresentanteLegal(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        RepresentanteLegal bo = catalogoService.findRepresentanteLegalById(tipoIdentificacion, identificacion);
        if (null == bo) {
            ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
            bo = new RepresentanteLegal(id);
            bo.setExiste(false);
        }
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            bo.setTipoPersona(resumen.getTipoPersona());
        }
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        if (null != relacionEconomica) {
            bo.setRelacionEconomica((Integer) relacionEconomica);
        }
        return new ClienteDTO(bo, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO findClienteToUpdateDatosAdicionales(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteAdicional bo = catalogoService.findDatosAdicionalesById(tipoIdentificacion, identificacion);
        if (null == bo) {
            throw new NoResultException();
        }
        return new ClienteDTO(bo, Modalidad.U);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO findClienteToUpdateDocumentosPresentados(String tipoIdentificacion, String identificacion) {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<DocumentoPresentado> dps = catalogoService.findDocumentosPresentados(tipoIdentificacion, identificacion);

        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));

        return new ClienteDTO(Modalidad.U, dps, resumen, tipoIdentificacion, identificacion);
    }

    @Transactional(readOnly = true)
    @Override
    public boolean existsByIdentificacion(String tipoDeIdentificacion, String numeroIdentificacion) {
        return clienteResumenRepository.existsByTipoDeIdentificacionAndNumeroIdentificacion(tipoDeIdentificacion, numeroIdentificacion);
    }

    @Transactional(readOnly = true)
    @Override
    public boolean existsByNombre(String nombre) {
        return clienteResumenRepository.existsByNombre(nombre);
    }

    @Transactional(readOnly = true)
    @Override
    public boolean existsByNombreAndDoNotBeIdentifier(String nombre, String tipoDocumento, String documento) {
        ClienteId id = new ClienteId(tipoDocumento, documento);
        return clienteResumenRepository.countByNombreAndDoNotBeIdentifier(nombre, id) > 0;
    }

    @Transactional(readOnly = true)
    @Override
    public boolean isClienteEnListaNegraPorIdentificacion(ClienteResumen cliente) {
        return catalogoService.isEnListaNegraPorIdentificacion(cliente.getTipoDeIdentificacion(), cliente.getNumeroIdentificacion());
    }

    @Transactional(readOnly = true)
    @Override
    public boolean isClienteEnListaNegraPorNombres(ClienteResumen cliente) {
        boolean response = catalogoService.isEnListaNegraPorNombre(cliente.getId().getTipoIdentificacion(), cliente.getId().getIdentificacion());
        if (!response && TipoPersona.N.equals(cliente.getTipoPersona())) {
            response = catalogoService.isEnListaNegraPorNombres(cliente.getId().getTipoIdentificacion(), cliente.getId().getIdentificacion());
        }
        return response;
    }

    @Transactional(readOnly = true)
    @Override
    public ClienteResumenDTO getDatosRegistroPersonas(String tipoIdentificacion, String identificacion) throws ServiceAccessException, AuthorizationRequiredException {
        if (tipoIdentificacion == null || identificacion == null || tipoIdentificacion.trim().length() == 0 || identificacion.trim().length() == 0) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        Parametro registroPersonasActivo = this.mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_VERIFICAR_REGISTRO_PERSONAS);
        if (Boolean.FALSE.equals(new Boolean(registroPersonasActivo.getValor()))) {
            throw new ServiceAccessException(ErrorMessage.REGISTRO_PERSONAS_NO_HABILITADO);
        } else {
            Parametro tipoIdRegistroPersonas = this.mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_REGISTRO_PERSONAS_TIPO_ID);
            if (!tipoIdentificacion.equals(tipoIdRegistroPersonas.getValor())) {
                throw new ServiceAccessException(ErrorMessage.REGISTRO_PERSONAS_TIPO_ID_INVALIDO);
            }
        }
        ClienteResumenDTO resumen = dao.getDatosRegistroPersonas(new RegistroPersonasRequestDTO(tipoIdentificacion, identificacion));
        if (resumen != null) {
            resumen.setTipoDeIdentificacion(tipoIdentificacion);
        } else {
            throw new AuthorizationRequiredException(Permission.NEXISRPE);
        }
        return resumen;
    }

    @Transactional(readOnly = true)
    @Override
    public List<ParametroDetalle> getClaseCuentasReferencias() throws ServiceAccessException {
        Parametro claseCuentas = this.mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CLASE_CUENTAS_REFERENCIAS);
        if (null == claseCuentas || claseCuentas.getValores().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.CLASE_CUENTAS_NO_DISPONIBLES);
        }
        return claseCuentas.getValores();
    }

    @Transactional(readOnly = true)
    @Override
    public boolean validateSeccion(ClienteDTO cliente, SeccionFormularioCliente seccion) throws ServiceAccessException, AuthorizationRequiredException {

        // VALIDACION DE CADA SECCION DEL FORMULARIO

        if (SeccionFormularioCliente.TIPO_PERSONA_IDENTIFICACION == seccion) {
            return validateTipoPersonaEIdentificacion(cliente);
        } else if (SeccionFormularioCliente.DATOS_GENERALES == seccion) {
            return validateDatosGenerales(cliente);
        } else if (SeccionFormularioCliente.REPRESENTANTE_LEGAL == seccion) {
            return validateRepresentanteLegal(cliente);
        } else if (SeccionFormularioCliente.PERFIL_ECONOMICO == seccion) {
            return validatePerfilEconomico(cliente);
        } else if (SeccionFormularioCliente.DATOS_ADICIONALES == seccion) {
            return validateDatosAdicionales(cliente);
        } else if (SeccionFormularioCliente.DOCUMENTOS == seccion) {
            return validateDocumentos(cliente);
        } else if (SeccionFormularioCliente.DIRECCIONES == seccion) {
            return validateDirecciones(cliente);
        } else if (SeccionFormularioCliente.REFERENCIAS == seccion) {
            return validateReferencias(cliente);
        }

        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateTipoPersonaEIdentificacion(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {

        // VERIFICAR QUE CLIENTE NO ESTE EN LISTA NEGRA POR IDENTIFICACION

        boolean enListaNegra = catalogoService.isEnListaNegraPorIdentificacion(cliente.getTipoIdentificacion().getCodigo(), cliente.getIdentificacion());
        if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.TIPO_PERSONA_IDENTIFICACION.name(), Permission.DOCLISNE)) {
            throw new AuthorizationRequiredException(Permission.DOCLISNE);
        }

        // VERIFICAR QUE LA IDENTIFICACION DEL CLIENTE NO EXISTE

        boolean existeCliente = this.existsByIdentificacion(cliente.getTipoIdentificacion().getCodigo(), cliente.getIdentificacion());
        if (existeCliente && !cliente.isAuthorized(SeccionFormularioCliente.TIPO_PERSONA_IDENTIFICACION.name(), Permission.DOCEXIST)) {
            throw new AuthorizationRequiredException(Permission.DOCEXIST);
        }

        return true;
    }

    @Override
    public boolean validateIdentificacion(String tipoIdentificacion, String identificacion) throws ServiceAccessException {
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateDatosGenerales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        TipoDocumento td = catalogoService.findTipoDocumentoByCodigo(cliente.getTipoIdentificacion().getCodigo());
        Boolean mascaraValida = this.validarMascaraTipoDocumento(td.getMascara(), cliente.getIdentificacion());

        // VALIDACION MASCARA

        if (!mascaraValida) {
            throw new ServiceAccessException(ErrorMessage.MASCARA_INVALIDA);
        }
        // Validacion Apellido Casada
        // CAMBIO REQUERIMIENTO DEL CLIENTE (QUITAR APELLIDO DE CASADA CODE =
        // 35)
        // if (TipoPersona.N == cliente.getTipoPersona() && Genero.F ==
        // cliente.getDatosGeneralesPersonaNatural().getGenero()
        // && EstadoCivil.C ==
        // cliente.getDatosGeneralesPersonaNatural().getEstadoCivil() &&
        // isEmpty(cliente.getDatosGeneralesPersonaNatural().getApellidoCasada()))
        // {
        // throw new
        // CoreServiceAccessException(ErrorMessage.APELLIDO_CASADA_REQUERIDO);
        // }

        // SI ES PERSONA JURÍDICA Y NO ESTÁ EN FORMACIÓN Y REGISTRO MERCANTIL ES
        // NULO

        if (TipoPersona.J == cliente.getTipoPersona() && !cliente.getDatosGeneralesPersonaJuridica().getEnFormacion() && (isEmpty(cliente.getDatosGeneralesPersonaJuridica().getRegistroMercantilNumero())
                || isEmpty(cliente.getDatosGeneralesPersonaJuridica().getRegistroMercantilPagina()) || isEmpty(cliente.getDatosGeneralesPersonaJuridica().getRegistroMercantilTomo()))) {
            throw new ServiceAccessException(ErrorMessage.DATOS_REGISTRO_MERCANTIL_REQUERIDOS);
        }

        // VERIFICAR QUE NOMBRES NO EXISTAN EN EL MAESTRO DE CLIENTES

        boolean existenNombres = false;
        if (Modalidad.I.equals(cliente.getModalidad())) {
            existenNombres = this.existsByNombre(cliente.getNombreCompleto());
        }
        if (existenNombres && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.NOMEXIST)) {
            throw new AuthorizationRequiredException(Permission.NOMEXIST);
        }

        // VERIFICAR EDAD DEL CLIENTE

        if (TipoPersona.N == cliente.getTipoPersona()) {
        	if (null != cliente.getDatosGeneralesPersonaNatural().getFechaNacimientoCreacion()) {
	            int edad = Consts.getEdad(cliente.getDatosGeneralesPersonaNatural().getFechaNacimientoCreacion());
	            Parametro mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
	            int value = Integer.parseInt(mnemonico.getValor());
	            if (edad < value && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.MENOEDAD)) {
	                throw new AuthorizationRequiredException(Permission.MENOEDAD);
	            }
	            mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MAXIMA);
	            value = Integer.parseInt(mnemonico.getValor());
	            if (edad > value && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.MAYOEDAD)) {
	                throw new AuthorizationRequiredException(Permission.MAYOEDAD);
	            }
        	}
        }

        // VERIFICAR QUE EL CLIENTE NO ESTE EN LA LISTA NEGRA POR NOMBRES

        if (TipoPersona.N == cliente.getTipoPersona()) {
            boolean enListaNegra = catalogoService.isEnListaNegraPersonaNatural(cliente.getDatosGeneralesPersonaNatural().getPrimerApellido(), cliente.getDatosGeneralesPersonaNatural().getSegundoApellido(),
                    cliente.getDatosGeneralesPersonaNatural().getApellidoCasada(), cliente.getDatosGeneralesPersonaNatural().getPrimerNombre(), cliente.getDatosGeneralesPersonaNatural().getSegundoNombre());
            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.NOMLISNE)) {
                throw new AuthorizationRequiredException(Permission.NOMLISNE);
            }
        } else {
            boolean enListaNegra = catalogoService.isEnListaNegraPersonaJuridica(cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.NOMLISNE)) {
                throw new AuthorizationRequiredException(Permission.NOMLISNE);
            }
        }

        return true;
    }

    @Transactional(readOnly = true)
    private boolean validateDatosGeneralesToUpdate(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDatosGenerales(cliente);

        // PERMISO DE CAMBIO DE DATOS GENERALES

        if (!cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validatePerfilEconomico(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        if (TipoPersona.N == cliente.getTipoPersona()) {
            Parametro param = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_PAIS_USA);

            // SI NACIONALIDAD ES USA Y TIN ES NULO
            if (null != cliente.getDatosGeneralesPersonaNatural() && null != cliente.getDatosGeneralesPersonaNatural().getNacionalidad()) {
            	if (param.getValor().equals(cliente.getDatosGeneralesPersonaNatural().getNacionalidad().getCodigo()) && isEmpty(cliente.getPerfilEconomico().getTin())) {
            		throw new ServiceAccessException(ErrorMessage.TIN_ES_REQUERIDO);
            	}
            }
        }
        if (cliente.getPerfilEconomico().getParentescoEmpleadoBanco()) {
        	if (cliente.getReferencias() == null || isEmpty(cliente.getReferencias().getReferenciasParentestoEmpleados())){
        		throw new ServiceAccessException(ErrorMessage.REFERENCIAS_PARENTESCO_EMPLEADOS_REQUERIDAS);
        	}
        }
        if (!cliente.getPerfilEconomico().getAfectoISR()) {
            Parametro defecto = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_PERFIL_ECONOMICO_AFECTA_ISR);
            if (Boolean.parseBoolean(defecto.getValor()) && !cliente.isAuthorized(SeccionFormularioCliente.PERFIL_ECONOMICO.name(), Permission.EXCENISR)) {
                throw new AuthorizationRequiredException(Permission.EXCENISR);
            }
        }
        return true;
    }

    @Transactional(readOnly = true)
    private boolean validatePerfilEconomicoToUpdate(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validatePerfilEconomico(cliente);

        // PERMISO DE CAMBIO PERFIL ECONOMICO

        if (!cliente.isAuthorized(SeccionFormularioCliente.PERFIL_ECONOMICO.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }
    
    private boolean validateDependientes(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {

        // PERMISO DE CAMBIO DE DEPENDIENTES

        if (!cliente.isAuthorized(SeccionFormularioCliente.REFERENCIAS.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateRepresentanteLegal(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        if (Modalidad.I.equals(cliente.getModalidad())) {
            if (TipoPersona.N == cliente.getTipoPersona()) {
                Parametro param = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
                Integer mayoriaEdad = Integer.parseInt(param.getValor());
                Calendar fechaMinimaDeMayoriaEdad = Calendar.getInstance();
                fechaMinimaDeMayoriaEdad.set(Calendar.YEAR, (-1 * mayoriaEdad));
                fechaMinimaDeMayoriaEdad.set(Calendar.HOUR, 0);
                fechaMinimaDeMayoriaEdad.set(Calendar.MINUTE, 0);
                fechaMinimaDeMayoriaEdad.set(Calendar.SECOND, 0);
                fechaMinimaDeMayoriaEdad.set(Calendar.MILLISECOND, 0);

                // SI ES MENOR DE EDAD Y REPRESENTANTE LEGAL ES NULO

                if (fechaMinimaDeMayoriaEdad.before(cliente.getDatosGeneralesPersonaNatural().getFechaNacimientoCreacion())) {
                    if (cliente.getRepresentanteLegalTutor() == null || isEmpty(cliente.getRepresentanteLegalTutor().getPrimerApellido()) || isEmpty(cliente.getRepresentanteLegalTutor().getPrimerNombre())) {
                        throw new ServiceAccessException(ErrorMessage.REPRESENTANTE_LEGAL_REQUERIDO);
                    }
                }
            } else {

                // SI ES PERSONA JURIDICA Y REPRESENTANTE LEGAL ES NULO

                if (cliente.getRepresentanteLegalTutor() == null || isEmpty(cliente.getRepresentanteLegalTutor().getPrimerApellido()) || isEmpty(cliente.getRepresentanteLegalTutor().getPrimerNombre())) {
                    throw new ServiceAccessException(ErrorMessage.REPRESENTANTE_LEGAL_REQUERIDO);
                }
            }
        }

        // VALIDAR IDENTIFICACION

        validateIdentificacion(cliente.getRepresentanteLegalTutor().getTipoIdentificacion().getCodigo(), cliente.getRepresentanteLegalTutor().getIdentificacion());

        // VERIFICAR QUE REPRESENTANTE NO ESTE EN LISTA NEGRA POR IDENTIFICACION

        boolean enListaNegra = catalogoService.isEnListaNegraPorIdentificacion(cliente.getRepresentanteLegalTutor().getTipoIdentificacion().getCodigo(), cliente.getRepresentanteLegalTutor().getIdentificacion());
        if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.REPRESENTANTE_LEGAL.name(), Permission.DOCLISNE)) {
            throw new AuthorizationRequiredException(Permission.DOCLISNE);
        }

        // VERIFICAR QUE REPRESENTANTE NO ESTE EN LISTA NEGRA POR NOMBRES

        enListaNegra = catalogoService.isEnListaNegraPersonaNatural(cliente.getRepresentanteLegalTutor().getPrimerApellido(), cliente.getRepresentanteLegalTutor().getSegundoApellido(), cliente.getRepresentanteLegalTutor().getApellidoCasada(), cliente.getRepresentanteLegalTutor().getPrimerNombre(), cliente.getRepresentanteLegalTutor().getSegundoNombre());
        if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.REPRESENTANTE_LEGAL.name(), Permission.NOMLISNE)) {
            throw new AuthorizationRequiredException(Permission.NOMLISNE);
        }

        return true;
    }

    @Transactional(readOnly = true)
    private boolean validateRepresentanteLegalToUpdate(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateRepresentanteLegal(cliente);

        // PERMISO DE CAMBIO REPRESENTANTE LEGAL

        if (!cliente.isAuthorized(SeccionFormularioCliente.REPRESENTANTE_LEGAL.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }

    @Override
    public boolean validateDatosAdicionales(ClienteDTO cliente) throws ServiceAccessException {
        return true;
    }

    private boolean validateDatosAdicionalesToUpdate(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDatosAdicionales(cliente);

        // PERMISO DE CAMBIO DATOS ADICIONALES

        if (!cliente.isAuthorized(SeccionFormularioCliente.DATOS_ADICIONALES.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateDocumentos(ClienteDTO cliente) throws ServiceAccessException {
        List<DocumentoRequerido> documentosRequeridos = catalogoService.findDocumentosRequeridosPorClaseCliente(cliente.getPerfilEconomico().getClaseCliente().getCodigo());
        if (isEmpty(cliente.getDocumentosApertura()) && !isEmpty(documentosRequeridos)) {
            principal: for (DocumentoRequerido dr : documentosRequeridos) {
                for (DocumentoAperturaDTO presentado : cliente.getDocumentosApertura()) {
                    if (dr.getId().getDocumentoApertura().getCodigo().equals(presentado.getCodigo())) {
                        continue principal;
                    }
                }
                throw new ServiceAccessException(ErrorMessage.DOCUMENTOS_APERTURA_INCOMPLETOS);
            }
        }
        return true;
    }

    @Transactional(readOnly = true)
    private boolean validateDocumentosToUpdate(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDocumentos(cliente);

        // PERMISO DE CAMBIO DATOS ADICIONALES

        if (!cliente.isAuthorized(SeccionFormularioCliente.DOCUMENTOS.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateDirecciones(ClienteDTO cliente) throws ServiceAccessException {
        if (TipoPersona.N == cliente.getTipoPersona()) {
            if (isEmpty(cliente.getDirecciones())) {
                throw new ServiceAccessException(ErrorMessage.DIRECCIONES_REQUERIDAS);
            }
        }
        
        Integer tipoDirDomiciliar = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_DOMICILIO).getValor());
        Integer tipoDirTrabajo = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_TRABAJO).getValor());
        Integer tipoDirComercio = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_COMERCIO).getValor());

        int direccionComercial = 0;
        List<DireccionCliente> direccionesCliente;
        for (DireccionDTO d : cliente.getDirecciones()) {
            if (d.getModalidad() != null && d.getModalidad() != Modalidad.D) {
                if (d.getTipoDireccion().getCodigo().equals(tipoDirDomiciliar) && isEmpty(d.getTelefono1())) {
                    throw new ServiceAccessException(ErrorMessage.TELEFONO_ES_REQUERIDO_EN_DIRECCION_DOMICILIARIA);
                } else if (d.getTipoDireccion().getCodigo().equals(tipoDirTrabajo) && isEmpty(d.getEmail())) {
                    // throw new ServiceAccessException(ErrorMessage.EMAIL_ES_REQUERIDO_EN_DIRECCION_DE_TRABAJO);
                } else if (d.getTipoDireccion().getCodigo().equals(tipoDirComercio)) {
                    direccionComercial++;
                }
            }
        }

        if (TipoPersona.J == cliente.getTipoPersona() && direccionComercial == 0) {
            throw new ServiceAccessException(ErrorMessage.DIRECCION_COMERCIAL_REQUERIDA);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateAddressToDelete(DireccionDTO d) throws ServiceAccessException {
        d.setTipoDocumento(StringUtils.leftPad(d.getTipoDocumento(), 1, ' '));
        d.setDocumento(StringUtils.leftPad(d.getDocumento(), 18, ' '));
        if (catalogoService.existsAddressAssociatedToAccount(d.getTipoDocumento(), d.getDocumento(), d.getCorrelativoDireccion())) {
            throw new ServiceAccessException(ErrorMessage.DIRECCION_ESTA_ASOCIADA_A_CUENTA);
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateReferencias(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUso(cliente.getTipoPersona());

        // PARAMETROS UTILIZADOS

        Integer paramAsalariado = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_ASALARIADO).getValor());
        Integer paramComerciante = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_COMERCIANTE).getValor());
        Integer paramOtros = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_OTROS).getValor());
        // Integer paramAsalariadoYComerciante =
        // Integer.parseInt(this.mnemonicoService.getParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_AMBOS).getValor());

        for (ReferenciaClienteDetalle rc : referencias) {
            int cantidadReferencias = 0;
            if (ParameterPlatform.REF_LABORALES.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasLaborales());
                if (paramComerciante.equals(cliente.getPerfilEconomico().getRelacionEconomica())) {

                    // POR SER COMERCIANTE NO HAY REFERENCIAS LABORALES
                    continue;
                } else if (paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {

                    // SELECCIONO OTROS, NO HAY REFERENCIAS LABORALES
                    continue;
                }
            } else if (ParameterPlatform.REF_SEGUROS.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasSeguros());

            } else if (ParameterPlatform.REF_CREDITO.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasCredito());

            } else if (ParameterPlatform.REF_CUENTAS.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasCuentas());

            } else if (ParameterPlatform.REF_PERSONALES_FAMILIARES.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasPersonalesFamiliares());

            } else if (ParameterPlatform.REF_VEHICULOS.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasVehiculos());

            } else if (ParameterPlatform.REF_DEPENDIENTES.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasDependientes());
                if (TipoPersona.N == cliente.getTipoPersona()) {
                    Integer dependientes = cliente.getDatosGeneralesPersonaNatural().getDependientes();
                    cantidadReferencias = dependientes == null ? 0 : dependientes;
                }

            } else if (ParameterPlatform.REF_LABORALES_CONYUGUE.equals(rc.getReferencia().getTipoReferencia())) {

                // NO VALIDAR LAS DEL CONYUGUE CUANDO ES SOLTERO

                if (TipoPersona.N == cliente.getTipoPersona() && EstadoCivil.S == cliente.getDatosGeneralesPersonaNatural().getEstadoCivil()) {
                    continue;
                }
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasLaboralesConyugue());

            } else if (ParameterPlatform.REF_ACCIONISTAS.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasAccionistas());
                if (cantidadReferencias >= 2) {
                    continue;
                }
            } else if (ParameterPlatform.REF_COMERCIALES.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasComerciales());

            } else if (ParameterPlatform.REF_PROPIEDADES.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasPropiedades());

            } else if (ParameterPlatform.REF_PROVEEDORES.equals(rc.getReferencia().getTipoReferencia())) {
                if (TipoPersona.N == cliente.getTipoPersona()) {
                    if (paramAsalariado.equals(cliente.getPerfilEconomico().getRelacionEconomica()) || paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {
                        continue;
                    }
                }
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasProveedores());

            } else if (ParameterPlatform.REF_TARJETAS_CREDITO.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasTarjetasCredito());

            } else if (ParameterPlatform.REF_CONYUGUE.equals(rc.getReferencia().getTipoReferencia())) {

                // NO VALIDAR LAS DEL CONYUGUE CUANDO ES SOLTERO

                if (TipoPersona.N == cliente.getTipoPersona() && EstadoCivil.S == cliente.getDatosGeneralesPersonaNatural().getEstadoCivil()) {
                    continue;
                }
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasConyugue());

            } else if (ParameterPlatform.REF_COMERCIANTE.equals(rc.getReferencia().getTipoReferencia())) {
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasComerciante());
                if (paramAsalariado.equals(cliente.getPerfilEconomico().getRelacionEconomica())) {

                    // POR SER ASALARIADO NO HAY REFERENCIAS DE COMERCIANTE

                    continue;
                } else if (paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {

                    // SELECCIONO OTROS, NO HAY REFERENCIAS COMERCIANTE

                    continue;
                } else {
                    if (cliente.getReferencias().getReferenciasComerciante() != null) {
                        for (ReferenciaComercianteDTO refComer : cliente.getReferencias().getReferenciasComerciante()) {
                            if (refComer.getContador() != null && refComer.getContador().getNumeroIdentificacion() != null) {
                                validateIdentificacion(refComer.getContador().getTipoIdentificacion().getCodigo(), refComer.getContador().getNumeroIdentificacion());
                            }
                        }
                    }
                }
            } else if (ParameterPlatform.REF_PARENTESCO_EMPLEADOS.equals(rc.getReferencia().getTipoReferencia())) {
                if (!cliente.getPerfilEconomico().getParentescoEmpleadoBanco()) {
                    continue;
                }
                cantidadReferencias = getSize(cliente.getReferencias().getReferenciasParentestoEmpleados());
            } else {
                continue;
            }

            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }

        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateCambioDeNombre(ClienteDTO cliente) throws AuthorizationRequiredException {

        // VERIFICAR QUE NOMBRES NO EXISTAN EN EL MAESTRO DE CLIENTES

        boolean existenNombres = this.existsByNombreAndDoNotBeIdentifier(cliente.getNombreCompleto(), cliente.getTipoDocumento(), cliente.getDocumento());
        if (existenNombres && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMEXIST)) {
            throw new AuthorizationRequiredException(Permission.NOMEXIST);
        }

        // VERIFICAR QUE EL CLIENTE NO ESTE EN LISTA NEGRA POR NOMBRES

        if (TipoPersona.N == cliente.getTipoPersona()) {
            boolean enListaNegra = catalogoService.isEnListaNegraPersonaNatural(cliente.getDatosGeneralesPersonaNatural().getPrimerApellido(), cliente.getDatosGeneralesPersonaNatural().getSegundoApellido(),
                    cliente.getDatosGeneralesPersonaNatural().getApellidoCasada(), cliente.getDatosGeneralesPersonaNatural().getPrimerNombre(), cliente.getDatosGeneralesPersonaNatural().getSegundoNombre());
            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMLISNE)) {
                throw new AuthorizationRequiredException(Permission.NOMLISNE);
            }
        } else {
            boolean enListaNegra = catalogoService.isEnListaNegraPersonaJuridica(cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMLISNE)) {
                throw new AuthorizationRequiredException(Permission.NOMLISNE);
            }
        }

        // PERMISO DE CAMBIO DE NOMBRE

        if (!cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.CAMBNOCL)) {
            throw new AuthorizationRequiredException(Permission.CAMBNOCL);
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateCambioDeId(ClienteDTO cliente) throws AuthorizationRequiredException {

//        // VERIFICAR QUE NOMBRES NO EXISTAN EN EL MAESTRO DE CLIENTES
//
//        boolean existenNombres = this.existsByNombreAndDoNotBeIdentifier(cliente.getNombreCompleto(), cliente.getTipoDocumento(), cliente.getDocumento());
//        if (existenNombres && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMEXIST)) {
//            throw new AuthorizationRequiredException(Permission.NOMEXIST);
//        }
//
//        // VERIFICAR QUE EL CLIENTE NO ESTE EN LISTA NEGRA POR NOMBRES
//
//        if (TipoPersona.N == cliente.getTipoPersona()) {
//            boolean enListaNegra = catalogoService.isEnListaNegraPersonaNatural(cliente.getDatosGeneralesPersonaNatural().getPrimerApellido(), cliente.getDatosGeneralesPersonaNatural().getSegundoApellido(),
//                    cliente.getDatosGeneralesPersonaNatural().getApellidoCasada(), cliente.getDatosGeneralesPersonaNatural().getPrimerNombre(), cliente.getDatosGeneralesPersonaNatural().getSegundoNombre());
//            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMLISNE)) {
//                throw new AuthorizationRequiredException(Permission.NOMLISNE);
//            }
//        } else {
//            boolean enListaNegra = catalogoService.isEnListaNegraPersonaJuridica(cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
//            if (enListaNegra && !cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_NOMBRE.name(), Permission.NOMLISNE)) {
//                throw new AuthorizationRequiredException(Permission.NOMLISNE);
//            }
//        }

        // PERMISO DE CAMBIO DE ID

        if (!cliente.isAuthorized(SeccionFormularioCliente.CAMBIO_DE_IDENTIFICACION.name(), Permission.CAMBDOCU)) {
            throw new AuthorizationRequiredException(Permission.CAMBDOCU);
        }

        return true;
    }
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = ServiceAccessException.class)
    public ClienteDTO save(String empresa, ClienteDTO cliente) throws ServiceAccessException {
        try {

            // OBTENCION DE PARAMETROS

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
            
            // FECHA APERTURA
            
            Integer[] fechaOperacion = catalogoService.findFechaOperacionAS400(empresa);

            Date now = new Date();
            logger.info(cliente.toString());
            cliente = generadorCodigoClienteHelper.generateCode(empresa, cliente);

            // GRABAR INFORMACION GENERAL

            cliente.setFecha(now);
            cliente.setHora(Consts.getHora(now));
            cliente.setEmpresa(empresa);
            cliente.setAgencia(cajero.getAgencia());
            cliente.setUsuario(cajero.getUsuario());
            cliente.setAnioApertura(fechaOperacion[2]);
            cliente.setMesApertura(fechaOperacion[1]);
            cliente.setDiaApertura(fechaOperacion[0]);

            try {
                this.validateDocumentos(cliente);
                cliente.setEstadoPapeleria(PAPELERIA_COMPLETA);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
                cliente.setEstadoPapeleria(PAPELERIA_PENDIENTE);
            }
            this.dao.saveInformacionGeneralCliente(cliente);
            //graba log
            cliente.setlogOper(" ");
            cliente.setlogTipo("A");
            this.dao.saveLogDatosGenerales(cliente);
            // GRABAR INFORMACION PERSONA INDIVIDUAL O JURIDICA

            if (TipoPersona.N == cliente.getTipoPersona()) {
                Parametro param = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
                Integer mayoriaEdad = Integer.parseInt(param.getValor());
                cliente.getDatosGeneralesPersonaNatural().setMayoriaEdad(mayoriaEdad);
                this.dao.saveInformacionPersonaNatural(cliente);
            } else {
                this.dao.saveInformacionPersonaJuridica(cliente);
                this.dao.saveNivelVentasPersonaJuridica(cliente);
            }
            
            // GRABAR GRUPOS ECONOMICOS
            
            if (null != cliente.getPerfilEconomico() && cliente.getPerfilEconomico().getPerteneceGrupoEconomico()) {
            	if (null != cliente.getPerfilEconomico().getGruposEconomicos() && !cliente.getPerfilEconomico().getGruposEconomicos().isEmpty()) {
            		for (GrupoEconomico ge : cliente.getPerfilEconomico().getGruposEconomicos()) {
                        ge.setTipoDocumento(cliente.getTipoDocumento());
                        ge.setDocumento(cliente.getDocumento());
                        this.dao.saveGrupoEconomico(ge);
            		}
            	}
            }

            // GRABAR REPRESENTANTE LEGAL

            if (cliente.getRepresentanteLegalTutor() != null && !isEmpty(cliente.getRepresentanteLegalTutor().getPrimerApellido())) {
                // this.saveCampoAdicional(ENTIDAD_CLIENTE,
                // CAMPO_CLIENTE_REPRESENTANTE_PROFESION, idCliente,
                // clienteDTO.getRepresentanteLegalTutor().getProfesion());
                // this.saveCampoAdicional(ENTIDAD_CLIENTE,
                // CAMPO_CLIENTE_REPRESENTANTE_DIRECCION, idCliente,
                // clienteDTO.getRepresentanteLegalTutor().getDireccion());
                // this.saveCampoAdicional(ENTIDAD_CLIENTE,
                // CAMPO_CLIENTE_REPRESENTANTE_FECHA_NOMBRAMIENTO, idCliente,
                // clienteDTO.getRepresentanteLegalTutor().getFechaNombramiento());
            	if (cliente.getRepresentanteLegalTutor().getRegistraRepresentanteLegal()) {
            		this.dao.saveRepresentanteLegal(cliente);
            	}
            }

            // GRABAR DOCUMENTOS PRESENTADOS

            if (cliente.getDocumentosApertura() != null) {
                for (DocumentoAperturaDTO doc : cliente.getDocumentosApertura()) {
                    doc.setTipoDocumento(cliente.getTipoDocumento());
                    doc.setDocumento(cliente.getDocumento());
                    this.dao.saveDocumentoApertura(doc);
                }
            }

            // GRABAR INDICES

            List<String> indices = getIndicesCliente(cliente.getNombreCompleto());
            for (String i : indices) {
                this.dao.saveIndice(new IndiceDTO(cliente.getTipoDocumento(), cliente.getDocumento(), i));
            }

            // GRABAR DIRECCIONES

            for (DireccionDTO d : cliente.getDirecciones()) {
            	if (!cliente.getReferencias().containsReferenciaDireccion(d.getCorrelativoDireccion())) {
	                d.setTipoDocumento(cliente.getTipoDocumento());
	                d.setDocumento(cliente.getDocumento());
	                Integer correlativoGenerado = this.dao.saveDireccion(d);
	                d.setCorrelativoDireccion(correlativoGenerado);
                    d.setFecha();
                    d.setLogHora(Consts.getHora(now));
                    d.setUsuario(cajero.getUsuario());
                    d.setAgenciaUser(cajero.getAgencia());
                    d.setLogTipo("A");
                    d.setLogOper(" ");
                    this.dao.saveDireccionLog(d);
            	}
            }

            // CAMPOS ADICIONALES

            this.dao.saveInformacionGeneralClienteTemporal(cliente);
            this.dao.saveDatosAdicionales(cliente);

            String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
            this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_GENERA_DIVISAS, idCliente, cliente.getPerfilEconomico().getGeneradorDivisas());
            this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PARENTESTO_EMPLEADO, idCliente, cliente.getPerfilEconomico().getParentescoEmpleadoBanco());
            this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente, cliente.getPerfilEconomico().getRelacionEconomica());
            if (TipoPersona.J.equals(cliente.getTipoPersona())) {
                this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente, cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
                this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_NOMBRE_COMERCIAL, idCliente, cliente.getDatosGeneralesPersonaJuridica().getNombreComercial());
            } else {
                this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PAIS_RESIDENCIA, idCliente, cliente.getDatosGeneralesPersonaNatural().getPaisResidencia().getCodigo());
            }
            if (!isEmpty(cliente.getPerfilEconomico().getTin())) {
                this.saveCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_TIN, idCliente, cliente.getPerfilEconomico().getTin());
            }
            for (DireccionDTO d : cliente.getDirecciones()) {
            	if (!cliente.getReferencias().containsReferenciaDireccion(d.getCorrelativoDireccion())) {
            		this.saveCamposAdicionalesDireccion(idCliente, d);
            	}
            }

            // FIN CAMPOS ADICIONALES

            // GRABAR REFERENCIAS ENVIADAS

            cliente = this.saveReferencias(empresa, cliente);

            // GRABAR CAMPOS SEGUN INSTALACION

            this.saveCamposAdicionalesPorInstalacion(empresa, cliente);

            // RECUPERA CLIENTE RESUMEN (INTEGRACION FLUJO CREAR CUENTA)

            cliente.setClienteResumen(this.getClienteResumen(cliente));

            // GRABAR LOG

            this.saveLogCreacionCliente(empresa, cliente);

            return cliente;
        } catch (ServiceAccessException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_GUARDAR_CLIENTE);
        }
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO saveReferencias(String empresa, ClienteDTO cliente) throws ServiceAccessException {
        try {

            String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
            Date now = new Date();

            // GRABAR REFERENCIAS

            if (cliente.getReferencias() != null) {

                if (!isEmpty(cliente.getReferencias().getReferenciasLaborales())) {
                    for (ReferenciaLaboralDTO ref : cliente.getReferencias().getReferenciasLaborales()) {
                        if (!ref.isGuardada()) {

                            // GUARDAR DIRECCION PRIMERO

                            if (ref.getDireccion() != null) {
                                ref.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                                ref.getDireccion().setDocumento(cliente.getDocumento());
                                Integer correlativoGenerado = this.dao.saveDireccion(ref.getDireccion());
                                ref.getDireccion().setCorrelativoDireccion(correlativoGenerado);
                                DireccionDTO d = ref.getDireccion();
                                d.setFecha();
                                d.setLogHora(Consts.getHora(now));
                                d.setUsuario(cajero.getUsuario());
                                d.setAgenciaUser(cajero.getAgencia());
                                d.setLogTipo("A");
                                d.setLogOper(" ");
                                this.dao.saveDireccionLog(d);
                                this.saveCamposAdicionalesDireccion(idCliente, ref.getDireccion());
                            }
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasLaborales(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasSeguros())) {
                    for (ReferenciaSeguroDTO ref : cliente.getReferencias().getReferenciasSeguros()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasSeguros(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasCredito())) {
                    for (ReferenciaCreditoDTO ref : cliente.getReferencias().getReferenciasCredito()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasCredito(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasCuentas())) {
                    for (ReferenciaCuentaDTO ref : cliente.getReferencias().getReferenciasCuentas()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasCuentas(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasPersonalesFamiliares())) {
                    for (ReferenciaPersonalFamiliarDTO ref : cliente.getReferencias().getReferenciasPersonalesFamiliares()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasPersonalesFamiliares(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasVehiculos())) {
                    for (ReferenciaVehiculoDTO ref : cliente.getReferencias().getReferenciasVehiculos()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasVehiculos(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasDependientes())) {
                    for (ReferenciaDependienteDTO ref : cliente.getReferencias().getReferenciasDependientes()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasDependientes(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasLaboralesConyugue())) {
                    for (ReferenciaLaboralConyugueDTO ref : cliente.getReferencias().getReferenciasLaboralesConyugue()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasLaboralesConyugue(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasAccionistas())) {
                    for (ReferenciaAccionistaDTO ref : cliente.getReferencias().getReferenciasAccionistas()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            Integer correlativoGenerado = this.dao.saveReferenciasAccionistas(ref);
                            ref.setCorrelativoReferencia(correlativoGenerado);
                            ref.setGuardada(true);

                            // CAMPOS ADICIONALES

                            String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, ref.getCorrelativoReferencia());
                            this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia, ref.getNacionalidad().getCodigo());
                            this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia, getIdClienteParaCamposAdicionales(ref.getDocumentoIdentificacion().getCodigo(), ref.getIdentificacion()));
                            this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia, ref.getActividadEconomica().getCodigo());
                            this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia, ref.getCargo());
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasComerciales())) {
                    for (ReferenciaComercialDTO ref : cliente.getReferencias().getReferenciasComerciales()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasComerciales(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasPropiedades())) {
                    for (ReferenciaPropiedadDTO ref : cliente.getReferencias().getReferenciasPropiedades()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasPropiedades(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasProveedores())) {
                    for (ReferenciaProveedorDTO ref : cliente.getReferencias().getReferenciasProveedores()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            Integer correlativoGenerado = this.dao.saveReferenciasProveedores(ref);
                            ref.setCorrelativoReferencia(correlativoGenerado);
                            ref.setGuardada(true);

                            // CAMPOS ADICIONALES

                            String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, ref.getCorrelativoReferencia());
                            this.saveCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia, ref.getGiroNegocio());
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasTarjetasCredito())) {
                    for (ReferenciaTarjetaCreditoDTO ref : cliente.getReferencias().getReferenciasTarjetasCredito()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasTarjetasCredito(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasConyugue())) {
                    for (ReferenciaConyugueDTO ref : cliente.getReferencias().getReferenciasConyugue()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasConyugue(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasComerciante())) {
                    for (ReferenciaComercianteDTO ref : cliente.getReferencias().getReferenciasComerciante()) {
                        if (!ref.isGuardada()) {

                            // GUARDAR DIRECCION PRIMERO

                            if (ref.getDireccion() != null) {
                                ref.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                                ref.getDireccion().setDocumento(cliente.getDocumento());
                                Integer correlativoGenerado = this.dao.saveDireccion(ref.getDireccion());
                                ref.getDireccion().setCorrelativoDireccion(correlativoGenerado);
                                ref.setCodigoDireccion(correlativoGenerado);
                                DireccionDTO d = ref.getDireccion();
                                d.setFecha();
                                d.setLogHora(Consts.getHora(now));
                                d.setUsuario(cajero.getUsuario());
                                d.setAgenciaUser(cajero.getAgencia());
                                d.setLogTipo("A");
                                d.setLogOper(" ");
                                this.dao.saveDireccionLog(d);
                                this.saveCamposAdicionalesDireccion(idCliente, ref.getDireccion());
                            }
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            if (TipoPersona.N == cliente.getTipoPersona()) {
                                this.dao.saveReferenciasComerciante(ref);
                            }
                            if (ref.getContador() != null && !isEmpty(ref.getContador().getNombre())) {
                                this.dao.saveReferenciasComercianteDatosContador(ref);
                            }
                            ref.setGuardada(true);
                        }
                    }
                }
                if (!isEmpty(cliente.getReferencias().getReferenciasParentestoEmpleados())) {
                    for (ReferenciaParentescoEmpleadoDTO ref : cliente.getReferencias().getReferenciasParentestoEmpleados()) {
                        if (!ref.isGuardada()) {
                            ref.setTipoDocumento(cliente.getTipoDocumento());
                            ref.setDocumento(cliente.getDocumento());
                            this.dao.saveReferenciasParentestoEmpleados(ref);
                            ref.setGuardada(true);
                        }
                    }
                }
            }

            // CLIENTE RESUMEN (INTEGRACION FLUJO CREAR CUENTA)

            cliente.setClienteResumen(this.getClienteResumen(cliente));

            return cliente;

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_GUARDAR_REFERENCIAS);
        }
    }

    protected void saveCamposAdicionalesDireccion(String idCliente, DireccionDTO d) throws ServiceAccessException {
        String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, d.getCorrelativoDireccion());
        if (!isEmpty(d.getEmail())) {
            this.saveCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion, d.getEmail());
        }
        if (!isEmpty(d.getExtension())) {
            this.saveCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion, d.getExtension());
        }
    }

    protected void saveCamposAdicionalesPorInstalacion(String empresa, ClienteDTO cliente) {
        // ESTE METODO TIENE QUE SER SOBREESCRITO EN LAS IMPLEMENTACIONES QUE
        // TENGAN QUE GUARDAR CAMPOS ADICIONALES A LOS DEFINICOS EN EL CORE
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO saveLogCreacionCliente(String empresa, ClienteDTO cliente) throws ServiceAccessException {
        /*
         * SE CAPTURAN TODAS LAS EXCEPCIONES POR SI FALLA EL GUARDADO DE LOG EL
         * CLIENTE PUEDA CONTINUAR
         */

        // LOG TIPO PERSONA

        try {
            cliente.setlogTipo("A");
            cliente.setlogOper(" ");
            if (TipoPersona.N == cliente.getTipoPersona()) {

                this.dao.saveLogInformacionPersonaNatural(cliente);
            } else if (TipoPersona.J == cliente.getTipoPersona()) {
                this.dao.saveLogInformacionPersonaJuridica(cliente);
            }
        } catch (Exception e) {
            logger.error("ERROR AL GUARDAR LOG DE CLIENTE", e);
            e.printStackTrace();
        }

        // LOG DATOS ADICIONALES

        try {
            cliente.setlogTipo("A");
            cliente.setlogOper(" ");
            this.dao.saveLogDatosAdicionalesCliente(cliente);
        } catch (Exception e) {
            logger.error("ERROR AL GUARDAR LOG DE CLIENTE", e);
            e.printStackTrace();
        }

        // LOG USO REGISTRO DE PERSONAS

        try {
            if (TipoPersona.N == cliente.getTipoPersona() && cliente.getAutorizaciones() != null) {
                for (AuthorizedDTO a : cliente.getAutorizaciones()) {
                    if (Permission.MODREGPE.equals(a.getPermiso())) {
                        cliente.setTipoRegistro("MOD");
                        this.dao.saveLogUsoRegistroPersonas(cliente);
                        break;
                    } else if (Permission.NEXISRPE.equals(a.getPermiso())) {
                        cliente.setTipoRegistro("NVO");
                        this.dao.saveLogUsoRegistroPersonas(cliente);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("ERROR AL GUARDAR LOG DE USO DE REGISTRO DE PERSONAS", e);
            e.printStackTrace();
        }

        return cliente;
    }

    private static String getIdClienteParaCamposAdicionales(String tipoDocumento, String documento) {
        tipoDocumento = StringUtils.leftPad(tipoDocumento, 1, ' ');
        documento = StringUtils.leftPad(documento, 18, ' ');
        return tipoDocumento.concat(documento);
    }

    private static String getIdDireccionParaCamposAdicionales(String idClienteAdicional, Integer correlativoDireccion) {
        return (idClienteAdicional + StringUtils.leftPad(correlativoDireccion.toString(), 2, '0'));
    }

    private static String getIdReferenciaParaCamposAdicionales(String idClienteAdicional, Integer correlativoReferencia) {
        return (idClienteAdicional + StringUtils.leftPad(correlativoReferencia.toString(), 2, '0'));
    }

    private void saveCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
        campoAdicionalService.saveCampoAdicional(entidad, campo, id, valor);
    }

    private Object getValorCampoAdicional(String entidad, String campo, String id) {
        return campoAdicionalService.getValorCampoAdicional(entidad, campo, id);
    }

    private void updateCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
        campoAdicionalService.updateCampoAdicional(entidad, campo, id, valor);
    }

    private void deleteCampoAdicional(String entidad, String campo, String id) {
        campoAdicionalService.deleteCampoAdicional(entidad, campo, id);
    }

    public static List<String> getIndicesCliente(String indice) {
        List<String> lista = new ArrayList<>();
        int fin = 0;
        while (indice.length() >= LONTIGUD_MINIMA_INDICE) {
            fin = (indice.length() < LONGITUD_MAXIMA_INDICE) ? indice.length() : LONGITUD_MAXIMA_INDICE;
            lista.add(indice.substring(0, fin));
            indice = indice.substring(1);
        }
        return lista;
    }

    private ClienteResumen getClienteResumen(ClienteDTO dto) {
        ClienteResumen resumen = new ClienteResumen();
        ClienteId id = new ClienteId(dto.getTipoDocumento(), dto.getDocumento());
        resumen.setId(id);
        resumen.setTipoDeIdentificacion(dto.getTipoIdentificacion().getCodigo());
        resumen.setNumeroIdentificacion(dto.getIdentificacion());
        resumen.setNombre(dto.getNombreCompleto());
        resumen.setClase(dto.getPerfilEconomico().getClaseCliente());
        resumen.setTipoPersona(dto.getTipoPersona());
        resumen.setEstado(EstadoCliente.A);
        if (TipoPersona.N.equals(resumen.getTipoPersona())) {
            resumen.setFechaNacimiento(dto.getDatosGeneralesPersonaNatural().getFechaNacimientoCreacion());
        }
        return resumen;
    }

    public static void main(String[] args) {
        // List<String> indices = getIndicesCliente("Marvin David Diaz
        // Linares");
        // for(String i : indices){
        // System.out.println(i);
        // }
        System.out.println("[" + getIdClienteParaCamposAdicionales("", "45") + "]");
    }

    @Override
    public boolean validarMascaraTipoDocumento(String mascara, String valor) {
        return true;
    }

    public static boolean isEmpty(String s) {
        return s == null || s.trim().length() == 0;
    }

    public static boolean isEmpty(List<?> l) {
        return l == null || l.size() == 0;
    }

    public static int getSize(List<?> l) {
        return l == null ? 0 : l.size();
    }

    @Override
    @Transactional(readOnly = true)
    public TipoEdadClienteDTO getTipoEdadCliente(Integer edad) throws ServiceAccessException {
        Parametro mnemonico = null;
        Boolean esMenorEdad = false;
        Boolean esTerceraEdad = false;
        int value = 0;
        mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MINIMA);
        value = Integer.parseInt(mnemonico.getValor());
        if (edad < value) {
            esMenorEdad = true;
        }
        mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EDAD_MAXIMA);
        value = Integer.parseInt(mnemonico.getValor());
        if (edad > value) {
            esTerceraEdad = true;
        }
        return new TipoEdadClienteDTO(esMenorEdad, esTerceraEdad);
    }

    @Override
    @Transactional(readOnly = true)
    public void autorizaRegistroPersonas() throws AuthorizationRequiredException {
        Parametro mnemonico = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_AUTORIZA_REGISTRO_PERSONAS);
        if (Boolean.parseBoolean(mnemonico.getValor())) {
            throw new AuthorizationRequiredException(Permission.MODREGPE);
        }
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateNombre(ClienteDTO cliente, boolean validate) throws ServiceAccessException, AuthorizationRequiredException {
        if (validate) {
            this.validateCambioDeNombre(cliente);
        }
        try {
            dao.updateNombre(cliente);
            // INDIVIDUAL
            if (TipoPersona.N.equals(cliente.getTipoPersona())) {
                dao.updateNombrePersonaNatural(cliente);
            }
            // JURIDICA
            if (TipoPersona.J.equals(cliente.getTipoPersona())) {
                String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente, cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
            }
            dao.deleteIndice(new IndiceDTO(cliente.getTipoDocumento(), cliente.getDocumento(), ""));
            List<String> indices = getIndicesCliente(cliente.getNombreCompleto());
            for (String i : indices) {
                dao.saveIndice(new IndiceDTO(cliente.getTipoDocumento(), cliente.getDocumento(), i));
            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_NOMBRE);
        }
    }
    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateId(ClienteDTO cliente, boolean validate) throws ServiceAccessException, AuthorizationRequiredException {
        if (validate) {
            this.validateCambioDeId(cliente);
        }
        try {
            dao.updateId(cliente);
//            dao.updateNombre(cliente);
//            // INDIVIDUAL
//            if (TipoPersona.N.equals(cliente.getTipoPersona())) {
//                dao.updateNombrePersonaNatural(cliente);
//            }
//            // JURIDICA
//            if (TipoPersona.J.equals(cliente.getTipoPersona())) {
//                String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
//                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente, cliente.getDatosGeneralesPersonaJuridica().getRazonSocial());
//            }
//            dao.deleteIndice(new IndiceDTO(cliente.getTipoDocumento(), cliente.getDocumento(), ""));
//            List<String> indices = getIndicesCliente(cliente.getNombreCompleto());
//            for (String i : indices) {
//                dao.saveIndice(new IndiceDTO(cliente.getTipoDocumento(), cliente.getDocumento(), i));
//            }

            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_NOMBRE);
        }
    }
    public ClienteDTO updateDatosGenerales(ClienteDTO cliente) {
        ClienteDTO oldClient = findClienteToUpdateDatosGenerales(cliente.getTipoDocumento(),cliente.getDocumento());
        Cliente oldClmcte = catalogoService.findClienteById(cliente.getTipoDocumento(), cliente.getDocumento());
        return this.preUpdateDatosGenerales(cliente, oldClient, oldClmcte);
    }
    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO preUpdateDatosGenerales(ClienteDTO cliente, ClienteDTO oldClient, Cliente oldClmcte) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDatosGeneralesToUpdate(cliente);
        try {
            String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
            dao.updateDatosGeneralesCliente(cliente);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
            oldClient.setFecha(new Date());
            oldClient.setHora(Consts.getHora(new Date()));
            oldClient.setUsuario(cajero.getUsuario());
            oldClient.setAgencia(cajero.getAgencia());
            cliente.setFecha(new Date());
            cliente.setHora(Consts.getHora(new Date()));
            cliente.setUsuario(cajero.getUsuario());
            cliente.setAgencia(cajero.getAgencia());
            // INDIVIDUAL
            if (TipoPersona.N.equals(cliente.getTipoPersona())) {
                dao.updateDatosGeneralesPersonaNatural(cliente);
                if (cliente.getDatosGeneralesPersonaNatural().isEstadoCivilSOrV()) {
                    cliente.getDatosGeneralesPersonaNatural().setApellidoCasada("");
                    cliente.getDatosGeneralesPersonaNatural().setConyuge("");
                }
                ClienteIndividual individual = catalogoService.findClienteIndividualById(cliente.getTipoDocumento(), cliente.getDocumento());
                if (null != individual) {
                    if (cliente.isNombreCompletoCambio(individual.getApellidoCasada())) {
                        logger.info("iniciando cambio de nombre : cldoc = " + cliente.getDocumento());
                        this.updateNombre(cliente, false);
                        individual.setApellidoCasada(cliente.getDatosGeneralesPersonaNatural().getApellidoCasada());
                    }
                }
                String paisResidencia = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PAIS_RESIDENCIA, idCliente);
                if (cliente.getDatosGeneralesPersonaNatural().isPaisResidenciaCambio(paisResidencia)) {
                    this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PAIS_RESIDENCIA, idCliente, cliente.getDatosGeneralesPersonaNatural().getPaisResidencia().getCodigo());
                }
                //log CLLOIN
                oldClient.setlogTipo("C");
                oldClient.setlogOper("A");
                dao.saveLogInformacionPersonaNatural(oldClient);
                cliente.setlogTipo("C");
                cliente.setlogOper("D");
                dao.saveLogInformacionPersonaNatural(cliente);
                //log CLMCLO
                oldClmcte.setHora(Consts.getHora(new Date()));
                oldClmcte.setUsuario(cajero.getUsuario());
                oldClmcte.setAgencia(cajero.getAgencia());
                oldClmcte.setlogTipo("C");
                oldClmcte.setlogOper("A");
                oldClmcte.setFecha(new Date());
                dao.saveLogDatosGeneralesClientes(oldClmcte);
                oldClmcte.setPaisOrigen(cliente.getPaisOrigen().getCodigo());
                oldClmcte.setHora(Consts.getHora(new Date()));
                oldClmcte.setUsuario(cajero.getUsuario());
                oldClmcte.setAgencia(cajero.getAgencia());
                oldClmcte.setlogTipo("C");
                oldClmcte.setlogOper("D");
                oldClmcte.setFecha(new Date());
                dao.saveLogDatosGeneralesClientes(oldClmcte);
            }
            // JURIDICA
            if (TipoPersona.J.equals(cliente.getTipoPersona())) {
                dao.updateDatosGeneralesPersonaJuridica(cliente);
                dao.updateNivelVentasPersonaJuridica(cliente);
                String nombreComercial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_NOMBRE_COMERCIAL, idCliente);
                if (cliente.getDatosGeneralesPersonaJuridica().isNombreComercialCambio(nombreComercial)) {
                    this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_NOMBRE_COMERCIAL, idCliente, cliente.getDatosGeneralesPersonaJuridica().getNombreComercial());
                }
                oldClient.setlogTipo("C");
                oldClient.setlogOper("A");
                dao.saveLogInformacionPersonaJuridica(oldClient);
                cliente.setlogTipo("C");
                cliente.setlogOper("D");
                dao.saveLogInformacionPersonaJuridica(cliente);

            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DATOS_GENERALES);
        }
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateDependientes(ClienteDTO cliente) throws ServiceAccessException {
    	this.validateDependientes(cliente);
        if (null != cliente.getReferencias() && !isEmpty(cliente.getReferencias().getReferenciasDependientes())) {
            try {
                for (ReferenciaDependienteDTO rd : cliente.getReferencias().getReferenciasDependientes()) {
                    if (null != rd.getModalidad()) {
                        rd.setTipoDocumento(cliente.getTipoDocumento());
                        rd.setDocumento(cliente.getDocumento());
                        if (Modalidad.U.equals(rd.getModalidad())) {
                            dao.updateReferenciasDependientes(rd);
                        }
                        if (Modalidad.D.equals(rd.getModalidad())) {
                            dao.deleteReferenciasDependientes(rd);
                        }
                        if (Modalidad.I.equals(rd.getModalidad())) {
                            dao.saveReferenciasDependientes(rd);
                        }
                        if (Modalidad.U.equals(rd.getModalidad()) || Modalidad.I.equals(rd.getModalidad())) {
                            rd.setModalidad(null);
                        }
                    } else {
                        logger.info("referencia dependiente sin cambios : cldoc = " + cliente.getDocumento() + " correlativo = " + rd.getCorrelativo());
                    }
                }
                cliente.getReferencias().getReferenciasDependientes().removeIf(rd -> Modalidad.D.equals(rd.getModalidad()));
                cliente.getDatosGeneralesPersonaNatural().setDependientes(cliente.getReferencias().getReferenciasDependientes().size());
                dao.updateNumeroDependientes(cliente);
            } catch (DeadlockLoserDataAccessException e) {
                e.printStackTrace();
                throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
            } catch (Exception e) {
                e.printStackTrace();
                throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DEPENDIENTES);
            }
        }
        return cliente;
    }

    @Override
    public ClienteDTO updatePerfilEconomico(ClienteDTO clienteDTO) {
        ClienteDTO oldClient = findClienteToUpdatePerfilEconomico(clienteDTO.getTipoDocumento(),clienteDTO.getDocumento());
        Cliente oldClmcte = catalogoService.findClienteById(clienteDTO.getTipoDocumento(),clienteDTO.getDocumento());
        return this.preUpdatePerfilEconomico(clienteDTO,oldClient,oldClmcte);
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO preUpdatePerfilEconomico(ClienteDTO cliente, ClienteDTO oldClient, Cliente oldClmcte) throws ServiceAccessException, AuthorizationRequiredException {
        this.validatePerfilEconomicoToUpdate(cliente);
        try {
            String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());

            dao.updatePerfilEconomico(cliente);
            if (catalogoService.existsClienteAdicionalByCodigo(cliente.getTipoDocumento(), cliente.getDocumento())) {
                dao.updatePerfilEconomicoAdicional(cliente);
            } else {
                dao.saveDatosAdicionales(cliente);
            }
            //LOG
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();

            oldClient.setFecha(new Date());
            oldClient.setHora(Consts.getHora(new Date()));
            oldClient.setUsuario(cajero.getUsuario());
            oldClient.setAgencia(cajero.getAgencia());
            oldClient.setlogTipo("C");
            oldClient.setlogOper("A");
            dao.saveLogDatosAdicionalesCliente(oldClient);
            cliente.setFecha(new Date());
            cliente.setHora(Consts.getHora(new Date()));
            cliente.setUsuario(cajero.getUsuario());
            cliente.setAgencia(cajero.getAgencia());
            cliente.setlogTipo("C");
            cliente.setlogOper("D");
            dao.saveLogDatosAdicionalesCliente(cliente);
            try {
                dao.saveCamposBCH(cliente);
            } catch (DuplicateKeyException dk){
                dao.updateCamposBCH(cliente);
            }
            // CAMPOS ADICIONALES
            String tin = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_TIN, idCliente);
            if (cliente.getPerfilEconomico().isTinCambio(tin)) {
                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_TIN, idCliente, cliente.getPerfilEconomico().getTin());
            }
            Boolean generadorDivisas = (Boolean) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_GENERA_DIVISAS, idCliente);
            if (cliente.getPerfilEconomico().isGeneradorDivisasCambio(generadorDivisas)) {
                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_GENERA_DIVISAS, idCliente, cliente.getPerfilEconomico().getGeneradorDivisas());
            }
            Integer relacionEconomica = (Integer) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
            if (cliente.getPerfilEconomico().isRelacionEconomicaCambio(relacionEconomica)) {
                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente, cliente.getPerfilEconomico().getRelacionEconomica());
            }
            Boolean parentescoEmpleadoBanco = (Boolean) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PARENTESTO_EMPLEADO, idCliente);
            if (cliente.getPerfilEconomico().isParentescoEmpleadoBancoCambio(parentescoEmpleadoBanco)) {
                this.updateCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_PARENTESTO_EMPLEADO, idCliente, cliente.getPerfilEconomico().getParentescoEmpleadoBanco());
            }
            if (cliente.getPerfilEconomico().getParentescoEmpleadoBanco()) {
            	this.validateReferenciasParentescoEmpleados(cliente);
                if (null != cliente.getReferencias() && !isEmpty(cliente.getReferencias().getReferenciasParentestoEmpleados())) {
                    for (ReferenciaParentescoEmpleadoDTO rpe : cliente.getReferencias().getReferenciasParentestoEmpleados()) {
                        if (null != rpe.getModalidad()) {
                            rpe.setTipoDocumento(cliente.getTipoDocumento());
                            rpe.setDocumento(cliente.getDocumento());
                            if (Modalidad.I.equals(rpe.getModalidad())) {
                                dao.saveReferenciasParentestoEmpleados(rpe);
                            }
                            if (Modalidad.U.equals(rpe.getModalidad())) {
                                dao.updateReferenciasParentescoEmpleados(rpe);
                            }
                            if (Modalidad.D.equals(rpe.getModalidad())) {
                                dao.deleteReferenciasParentescoEmpleados(rpe);
                            }
                            if (Modalidad.U.equals(rpe.getModalidad()) || Modalidad.I.equals(rpe.getModalidad())) {
                                rpe.setModalidad(null);
                            }
                        } else {
                            logger.info("referencia relación con empleados sin cambios : cldoc = " + cliente.getDocumento() + " codigo empleado = " + rpe.getEmpleado().getId().getCodigo());
                        }
                    }
                    cliente.getReferencias().getReferenciasParentestoEmpleados().removeIf(rpe -> Modalidad.D.equals(rpe.getModalidad()));
                }
            } else {
                logger.info("elimina todas la referencias de relación con empleados : cldoc = " + cliente.getDocumento());
                if (null != cliente.getReferencias() && !isEmpty(cliente.getReferencias().getReferenciasParentestoEmpleados())) {
                    for (ReferenciaParentescoEmpleadoDTO rpe : cliente.getReferencias().getReferenciasParentestoEmpleados()) {
                        rpe.setTipoDocumento(cliente.getTipoDocumento());
                        rpe.setDocumento(cliente.getDocumento());
                        dao.deleteReferenciasParentescoEmpleados(rpe);
                    }
                }
            }
            if (cliente.getPerfilEconomico().getPerteneceGrupoEconomico()) {
            	if (null != cliente.getPerfilEconomico().getGruposEconomicos() && !isEmpty(cliente.getPerfilEconomico().getGruposEconomicos())) {
            		for (GrupoEconomico ge : cliente.getPerfilEconomico().getGruposEconomicos()) {
            			if (null != ge.getModalidad()) {
            				ge.setTipoDocumento(cliente.getTipoDocumento());
            				ge.setDocumento(cliente.getDocumento());
            				if (Modalidad.I.equals(ge.getModalidad())) {
            					dao.saveGrupoEconomico(ge);
            					ge.setModalidad(null);
            				}
            				if (Modalidad.D.equals(ge.getModalidad())) {
            					dao.deleteGrupoEconomico(ge);
            				}
            			} else {
            				logger.info("grupo económico sin cambios : cldoc = " + cliente.getDocumento() + " id = " + ge.getId().getTipoGrupo() + ", " + ge.getId().getGrupo());
            			}
            		}
            		cliente.getPerfilEconomico().getGruposEconomicos().removeIf(ge -> Modalidad.D.equals(ge.getModalidad()));
            	}
            } else {
            	logger.info("elimina todas las agrupaciones económicas : cldoc = " + cliente.getDocumento());
            	dao.deleteGruposEconomicos(cliente);
            }
            //log CLMCLO
            oldClmcte.setHora(Consts.getHora(new Date()));
            oldClmcte.setUsuario(cajero.getUsuario());
            oldClmcte.setAgencia(cajero.getAgencia());
            oldClmcte.setlogTipo("C");
            oldClmcte.setlogOper("A");
            oldClmcte.setFecha(new Date());
            dao.saveLogDatosGeneralesClientes(oldClmcte);
            oldClmcte.setIdenTributaria(cliente.getPerfilEconomico().getRtn());
            oldClmcte.setSectorEconomico(cliente.getPerfilEconomico().getSectorEconomico().getCodigo());
            oldClmcte.setClase(cliente.getPerfilEconomico().getClaseCliente());
            oldClmcte.setActividadEconomica(cliente.getPerfilEconomico().getActividadEconomica().getCodigo());
            oldClient.setlogTipo("C");
            oldClient.setlogOper("D");
            oldClmcte.setFecha(new Date());
            dao.saveLogDatosGeneralesClientes(oldClmcte);
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_PERFIL_ECONOMICO);
        }
        return cliente;
    }
    @Override
    public ClienteDTO updateRepresentanteLegal(ClienteDTO cliente) {
        Cliente oldClmcte = catalogoService.findClienteById(cliente.getTipoDocumento(),cliente.getDocumento());
        return this.preUpdateRepresentanteLegal(cliente, oldClmcte);
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO preUpdateRepresentanteLegal(ClienteDTO cliente, Cliente oldClmcte) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateRepresentanteLegalToUpdate(cliente);
        try {

            if (!cliente.getRepresentanteLegalTutor().getRegistraRepresentanteLegal()) {
        		dao.deleteRepresentanteLegal(cliente);
        		cliente.getRepresentanteLegalTutor().setLimpiarNombre();
        		dao.updateRepresentanteLegalNombreCompleto(cliente);
        	} else {
	        	if (catalogoService.existsRepresentanteLegal(cliente.getTipoDocumento(), cliente.getDocumento())) {
		            dao.updateRepresentanteLegal(cliente);
		            dao.updateRepresentanteLegalNombreCompleto(cliente);
		            // JURIDICA
		            if (TipoPersona.J.equals(cliente.getTipoPersona())) {
		                dao.updateRepresentanteLegalPersonaJuridica(cliente);
		            }
	        	} else {
	        		dao.saveRepresentanteLegal(cliente);
	        	}
        	}
            //log CLMCLO
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
            oldClmcte.setHora(Consts.getHora(new Date()));
            oldClmcte.setUsuario(cajero.getUsuario());
            oldClmcte.setAgencia(cajero.getAgencia());
            oldClmcte.setlogTipo("C");
            oldClmcte.setlogOper("A");
            oldClmcte.setFecha(new Date());
            dao.saveLogDatosGeneralesClientes(oldClmcte);
            oldClmcte.setRepresentanteLegal(cliente.getRepresentanteLegalTutor().getIdReprLegalRecortado());
            oldClmcte.setHora(Consts.getHora(new Date()));
            oldClmcte.setUsuario(cajero.getUsuario());
            oldClmcte.setAgencia(cajero.getAgencia());
            oldClmcte.setlogTipo("C");
            oldClmcte.setlogOper("D");
            oldClmcte.setFecha(new Date());
            dao.saveLogDatosGeneralesClientes(oldClmcte);
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REPRESENTANTE_LEGAL);
        }
        return cliente;
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateDatosAdicionales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDatosAdicionalesToUpdate(cliente);
        try {
            dao.updateDatosAdicionales(cliente);
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DATOS_ADICIONALES);
        }
        return cliente;
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateDocumentosPresentados(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDocumentosToUpdate(cliente);
        try {
            dao.deleteDocumentoApertura(new DocumentoAperturaDTO(cliente.getTipoDocumento(), cliente.getDocumento()));
            if (null != cliente.getDocumentosApertura() && !cliente.getDocumentosApertura().isEmpty()) {
                for (DocumentoAperturaDTO documento : cliente.getDocumentosApertura()) {
                    documento.setTipoDocumento(cliente.getTipoDocumento());
                    documento.setDocumento(cliente.getDocumento());
                    dao.saveDocumentoApertura(documento);
                }
            }
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DOCUMENTOS_PRESENTADOS);
        }
        return cliente;
    }

    protected Specification<ClienteResumen> getSpecificationSearch(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<ClienteResumen> builder = new SearchSpecificationsBuilder<ClienteResumen>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {

                // FILTRO ID.IDENTIFICACION

                if (criteria.getKey().equals("id.identificacion")) {
                    String value = (String) criteria.getValue();
                    value = StringUtils.leftPad(value, 18, ' ');
                    criteria.setValue(value);
                }

                builder.with(criteria);

            }
        }
        Specification<ClienteResumen> spec = builder.build();
        return spec;
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateDirecciones(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<DireccionCliente> dcs = this.catalogoService.findDireccionesCliente(tipoIdentificacion, identificacion);
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        List<DireccionDTO> direcciones = new ArrayList<>();
        for (DireccionCliente dc : dcs) {
            DireccionDTO d = new DireccionDTO(dc);
            String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, dc.getId().getCodigo());
            String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
            String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
            if (email != null && !email.trim().isEmpty()) {
                d.setEmail(email);
            }
            if (extension != null && !extension.trim().isEmpty()) {
                d.setExtension(extension);
            }
            direcciones.add(d);
        }
        ClienteDTO clienteDTO = new ClienteDTO(tipoIdentificacion, identificacion, direcciones);
        PerfilEconomicoDTO economicoDTO = new PerfilEconomicoDTO();
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        economicoDTO.setRelacionEconomica((Integer) relacionEconomica);
        clienteDTO.setPerfilEconomico(economicoDTO);
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            clienteDTO.setTipoPersona(resumen.getTipoPersona());
            if (clienteDTO.getTipoPersona() != null) {
                ClienteDTO ref = this.findClienteToUpdateReferenciaComerciante(tipoIdentificacion, identificacion);
                clienteDTO.setReferencias(ref.getReferencias());
                // INDIVIDUAL
                if (TipoPersona.N.equals(clienteDTO.getTipoPersona())) {
                    ClienteDTO ref1 = this.findClienteToUpdateReferenciasLaborales(tipoIdentificacion, identificacion);
                    if (clienteDTO.getReferencias() != null) {
                        clienteDTO.getReferencias().setReferenciasLaborales(ref1.getReferencias().getReferenciasLaborales());
                    } else {
                        clienteDTO.setReferencias(ref.getReferencias());
                    }
                }
                // JURIDICA
                if (TipoPersona.J.equals(clienteDTO.getTipoPersona())) {
                	DatosGeneralesPersonaJuridicaDTO dg = new DatosGeneralesPersonaJuridicaDTO();
                    String razonSocial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_RAZON_SOCIAL, idCliente);
                    if (null != razonSocial) {
                    	dg.setRazonSocial(razonSocial);
                    }
                    String nombreComercial = (String) this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_NOMBRE_COMERCIAL, idCliente);
                    dg.setNombreComercial(nombreComercial);
                    clienteDTO.setDatosGeneralesPersonaJuridica(dg);
                }
            }
        }
        return clienteDTO;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateDirecciones(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateDirecciones(cliente);

        // PERMISO DE CAMBIO DE DATOS GENERALES

        if (!cliente.isAuthorized(SeccionFormularioCliente.DIRECCIONES.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
        String tipoIdentificacion = StringUtils.leftPad(cliente.getTipoDocumento(), 1, ' ');
        String identificacion = StringUtils.leftPad(cliente.getDocumento(), 18, ' ');
        try {
            ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
            ClienteDTO oldClient =  findClienteToUpdateDirecciones (tipoIdentificacion, identificacion);
            List <DireccionDTO> oldDirs = oldClient.getDirecciones();

            if (null != resumen) {
            	cliente.setTipoPersona(resumen.getTipoPersona());
            }


            if (cliente != null && cliente.getDirecciones() != null && !cliente.getDirecciones().isEmpty()) {
                int i=0;
                for (DireccionDTO direDTO : cliente.getDirecciones()) {
                    if (direDTO.getModalidad() != null) {
                    	direDTO.setTipoDocumento(cliente.getTipoDocumento());
                        direDTO.setDocumento(cliente.getDocumento());
                        String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, direDTO.getCorrelativoDireccion());
                        String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
                        String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
                        Date now = new Date();
                        if (Modalidad.I.equals(direDTO.getModalidad())) {
                            Integer correlativoGenerado = this.dao.saveDireccion(direDTO);
                            direDTO.setCorrelativoDireccion(correlativoGenerado);
                            this.saveCamposAdicionalesDireccion(idCliente, direDTO);
                            direDTO.setFecha();
                            direDTO.setLogHora(Consts.getHora(now));
                            direDTO.setUsuario(cajero.getUsuario());
                            direDTO.setAgenciaUser(cajero.getAgencia());
                            direDTO.setLogTipo("A");
                            direDTO.setLogOper(" ");
                            this.dao.saveDireccionLog(direDTO);
                        }
                        if (Modalidad.U.equals(direDTO.getModalidad())) {
                            DireccionDTO olddir = oldDirs.get(i);
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(now);
                            olddir.setFecha();
                            olddir.setLogHora(Consts.getHora(now));
                            olddir.setUsuario(cajero.getUsuario());
                            olddir.setAgenciaUser(cajero.getAgencia());
                            olddir.setLogTipo("C");
                            olddir.setLogOper("A");
                            this.dao.saveDireccionLog(olddir);
                            direDTO.setFecha();
                            direDTO.setLogHora(Consts.getHora(now));
                            direDTO.setUsuario(cajero.getUsuario());
                            direDTO.setAgenciaUser(cajero.getAgencia());
                            direDTO.setLogTipo("C");
                            direDTO.setLogOper("D");
                            this.dao.saveDireccionLog(direDTO);

                            this.dao.updateDireccion(direDTO);

                            if (direDTO.isEmailCambio(email)) {
                                this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion, direDTO.getEmail());
                            }
                            if (direDTO.isExtensionCambio(extension)) {
                                this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion, direDTO.getExtension());
                            }
                        }
                        if (Modalidad.D.equals(direDTO.getModalidad())) {
                        	if (!isEmpty(email)) {
                        		this.deleteCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
                        	}
                        	if (!isEmpty(extension)) {
                        		this.deleteCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
                        	}
                            auth = SecurityContextHolder.getContext().getAuthentication();
                            cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
                            now = new Date();
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(now);
                            direDTO.setFecha();
                            direDTO.setLogHora(Consts.getHora(now));
                            direDTO.setUsuario(cajero.getUsuario());
                            direDTO.setAgenciaUser(cajero.getAgencia());
                            direDTO.setLogTipo("B");
                            direDTO.setLogOper("D");
                            this.dao.saveDireccionLog(direDTO);
                            this.dao.deleteDireccion(direDTO);
                        }
                    } else {
                    	logger.error("direccion no cambio : " + cliente.getDocumento() + " correlativo: " + direDTO.getCorrelativoDireccion());
                    }
                    i++;
                }
            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_DIRECCION);
        }
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateReferencias(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException {
        ReferenciasDTO referenciasDTO = new ReferenciasDTO();

        referenciasDTO.setReferenciasAccionistas(this.getReferenciasAccionista(tipoIdentificacion, identificacion));
        referenciasDTO.setReferenciasCredito(this.getReferenciasCredito(tipoIdentificacion, identificacion));
        referenciasDTO.setReferenciasCuentas(this.getReferenciasCuenta(tipoIdentificacion, identificacion));
        referenciasDTO.setReferenciasPersonalesFamiliares(this.getReferenciasPersonalFamiliar(tipoIdentificacion, identificacion));
        referenciasDTO.setReferenciasVehiculos(this.getReferenciasVehiculos(tipoIdentificacion, identificacion));
        referenciasDTO.setReferenciasSeguros(this.getReferenciasSeguros(tipoIdentificacion, identificacion));

        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteDTO cliente = new ClienteDTO(tipoIdentificacion, identificacion, referenciasDTO);
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            cliente.setTipoPersona(resumen.getTipoPersona());
        }
        
        return cliente;
    }

    @Transactional(readOnly = true)
    public List<ReferenciaAccionistaDTO> getReferenciasAccionista(String tipoIdentificacion, String identificacion) {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        List<ReferenciaAccionistaDTO> response = new ArrayList<ReferenciaAccionistaDTO>();
        try {
            List<ReferenciaAccionista> referenciaAccionista = this.catalogoService.findReferenciaAccionistaByCliente(tipoIdentificacion, identificacion);
            if (referenciaAccionista != null && !referenciaAccionista.isEmpty()) {
                for (ReferenciaAccionista referencia : referenciaAccionista) {
                    String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, referencia.getId().getCorrelativo());
                    ReferenciaAccionistaDTO ref = new ReferenciaAccionistaDTO(referencia);

                    String nacionalidad = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia);
                    if (!isEmpty(nacionalidad)) {
                        ref.setNacionalidad(new Pais(nacionalidad));
                    }
                    String cargo = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia);
                    if (!isEmpty(cargo)) {
                        ref.setCargo(cargo);
                    }
                    Integer actividadEconomica = (Integer) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia);
                    if (actividadEconomica != null) {
                        ref.setActividadEconomica(new ActividadEconomica(actividadEconomica));
                    }
                    String docIdent = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia);
                    if (!isEmpty(docIdent)) {
                        ref.setDocumentoIdentificacion(new TipoDocumento(docIdent.substring(0, 1)));
                        ref.setIdentificacion(docIdent.substring(1));
                    }
                    response.add(ref);
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaComercialDTO> getReferenciasComerciales(String tipoIdentificacion, String identificacion) {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaComercialDTO> accionistas = new ArrayList<>();
        try {
            List<ReferenciaComercial> referenciaComercial = this.catalogoService.findReferenciaComercialByCliente(tipoIdentificacion, identificacion);
            if (referenciaComercial != null && !referenciaComercial.isEmpty()) {
                for (ReferenciaComercial referencia : referenciaComercial) {
                    ReferenciaComercialDTO ref = new ReferenciaComercialDTO(referencia);
                    ref.setTipoDocumento(tipoIdentificacion);
                    ref.setDocumento(identificacion);
                    accionistas.add(ref);
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return accionistas;
    }

    public List<ReferenciaComercianteDTO> getReferenciasComerciante(String tipoIdentificacion, String identificacion, ClienteDTO cliente) {
//        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        List<ReferenciaComercianteDTO> response = new ArrayList<ReferenciaComercianteDTO>();
        try {
        	// INDIVIDUAL
        	if (TipoPersona.N.equals(cliente.getTipoPersona())) {
	            List<ReferenciaComercianteDatoContador> rds = this.catalogoService.findReferenciaComercianteDatoContadorByCliente(tipoIdentificacion, identificacion);
	            List<ReferenciaComerciante> rcs = this.catalogoService.findReferenciaComercianteByCliente(tipoIdentificacion, identificacion);
	            if (rcs != null && !rcs.isEmpty()) {
	            	for (ReferenciaComerciante rf : rcs) {
	            		ReferenciaComercianteDTO referencia = new ReferenciaComercianteDTO(rf);
	//                    try {
	//                        DireccionCliente direccion = this.catalogoService.findDireccionClienteById(tipoIdentificacion, identificacion, referencia.getCodigoDireccion());
	//                        if (direccion != null) {
	//                            DireccionDTO direDTO = new DireccionDTO(direccion);
	//                            String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, direccion.getId().getCodigo());
	//                            String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
	//                            String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
	//                            if (email != null && !email.trim().isEmpty()) {
	//                                direDTO.setEmail(email);
	//                            }
	//                            if (extension != null && !extension.trim().isEmpty()) {
	//                                direDTO.setExtension(extension);
	//                            }
	//                            ref.setDireccion(direDTO);
	//                        }
	//
	//                    } catch (RuntimeException e) {
	//                        e.printStackTrace();
	//                    }
	            		if (null != rds && !rds.isEmpty()) {
	            			ContadorDTO c = null;
	            			contadores : for (ReferenciaComercianteDatoContador contador : rds) {
	            				if (referencia.getCorrelativoReferencia().compareTo(contador.getId().getCorrelativo()) == 0) {
	            					c = new ContadorDTO(contador);
	            					referencia.setContador(c);
	            					break contadores;
	            				}
	            			}
	            		}
	                    response.add(referencia);
	                }
	            }
        	}
        	// JURIDICA
        	if (TipoPersona.J.equals(cliente.getTipoPersona())) {
                ReferenciaComercianteDTO referencia = null;
                List<ReferenciaComercianteDatoContador> rds = this.catalogoService.findReferenciaComercianteDatoContadorByCliente(tipoIdentificacion, identificacion);
                if (null != rds && !rds.isEmpty()) {
                	ContadorDTO c = null;
                    for (ReferenciaComercianteDatoContador contador : rds) {
                    	referencia = new ReferenciaComercianteDTO();
                    	c = new ContadorDTO(contador);
                        referencia.setContador(c);
                        response.add(referencia);
                    }
                }
            }
        } catch (RuntimeException e) {
            e.printStackTrace();
        }
        
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaConyugueDTO> getReferenciasConyugue(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaConyugueDTO> response = new ArrayList<ReferenciaConyugueDTO>();
        try {
            List<ReferenciaConyugue> rcs = this.catalogoService.findReferenciaConyugueByCliente(tipoIdentificacion, identificacion);
            if (rcs != null && !rcs.isEmpty()) {
                for (ReferenciaConyugue referencia : rcs) {
                    ReferenciaConyugueDTO ref = new ReferenciaConyugueDTO(referencia);
                    ref.setTipoDocumento(tipoIdentificacion);
                    ref.setDocumento(identificacion);
                    response.add(ref);
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaCreditoDTO> getReferenciasCredito(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaCreditoDTO> response = new ArrayList<ReferenciaCreditoDTO>();
        try {
            List<ReferenciaCredito> rcs = this.catalogoService.findReferenciaCreditoByCliente(tipoIdentificacion, identificacion);
            if (rcs != null && !rcs.isEmpty()) {
                for (ReferenciaCredito referencia : rcs) {
                    response.add(new ReferenciaCreditoDTO(referencia));
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaCuentaDTO> getReferenciasCuenta(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaCuentaDTO> response = new ArrayList<ReferenciaCuentaDTO>();
        try {
            List<ReferenciaCuenta> rcs = this.catalogoService.findReferenciaCuentaByCliente(tipoIdentificacion, identificacion);
            if (rcs != null && !rcs.isEmpty()) {
                for (ReferenciaCuenta referencia : rcs) {
                    response.add(new ReferenciaCuentaDTO(referencia));
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaPersonalFamiliarDTO> getReferenciasPersonalFamiliar(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaPersonalFamiliarDTO> response = new ArrayList<ReferenciaPersonalFamiliarDTO>();
        try {
            List<ReferenciaPersonalFamiliar> rpfs = this.catalogoService.findReferenciaPersonalFamiliarByCliente(tipoIdentificacion, identificacion);
            if (rpfs != null && !rpfs.isEmpty()) {
                for (ReferenciaPersonalFamiliar referencia : rpfs) {
                    response.add(new ReferenciaPersonalFamiliarDTO(referencia));
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaVehiculoDTO> getReferenciasVehiculos(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaVehiculoDTO> response = new ArrayList<ReferenciaVehiculoDTO>();
        try {
            List<ReferenciaVehiculo> rvs = this.catalogoService.findReferenciaVehiculoByCliente(tipoIdentificacion, identificacion);
            if (rvs != null && !rvs.isEmpty()) {
                for (ReferenciaVehiculo referencia : rvs) {
                    response.add(new ReferenciaVehiculoDTO(referencia));
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public List<ReferenciaSeguroDTO> getReferenciasSeguros(String tipoIdentificacion, String identificacion) throws NoResultException {
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaSeguroDTO> response = new ArrayList<ReferenciaSeguroDTO>();
        try {
            List<ReferenciaSeguro> rss = this.catalogoService.findReferenciaSeguroByCliente(tipoIdentificacion, identificacion);
            if (rss != null && !rss.isEmpty()) {
                for (ReferenciaSeguro referencia : rss) {
                    response.add(new ReferenciaSeguroDTO(referencia));
                }
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateReferenciasLaborales(String tipoIdentificacion, String identificacion) throws ServiceAccessException {
        ReferenciasDTO referenciasDTO = new ReferenciasDTO();
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        List<ReferenciaLaboralDTO> laborales = new ArrayList<>();
        
        List<ReferenciaLaboral> rls = this.catalogoService.findReferenciaLaboralByCliente(tipoIdentificacion, identificacion);
        if (rls != null && !rls.isEmpty()) {
        	for (ReferenciaLaboral rf : rls) {
        		laborales.add(new ReferenciaLaboralDTO(rf));
//                    try {
//                        DireccionCliente direccion = this.catalogoService.findDireccionClienteById(tipoIdentificacion, identificacion, referencia.getCodigoDireccion());
//                        if (direccion != null) {
//                            DireccionDTO direDTO = new DireccionDTO(direccion);
//                            String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, direccion.getId().getCodigo());
//                            String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
//                            String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
//                            if (email != null && !email.trim().isEmpty()) {
//                                direDTO.setEmail(email);
//                            }
//                            if (extension != null && !extension.trim().isEmpty()) {
//                                direDTO.setExtension(extension);
//                            }
//                            ref.setDireccion(direDTO);
//                        }
//                    } catch (NoResultException e) {
//                        e.printStackTrace();
//                    }
        	}
        	referenciasDTO.setReferenciasLaborales(laborales);
        }
        ClienteDTO cliente = new ClienteDTO(tipoIdentificacion, identificacion, referenciasDTO);
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            cliente.setTipoPersona(resumen.getTipoPersona());
        }
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        if (null != relacionEconomica) {
            cliente.setPerfilEconomico(new PerfilEconomicoDTO());
            cliente.getPerfilEconomico().setRelacionEconomica((Integer) relacionEconomica);
        }
        return cliente;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasLaborales(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_LABORALES);
        // PARAMETROS UTILIZADOS
        Integer paramComerciante = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_COMERCIANTE).getValor());
        Integer paramOtros = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_OTROS).getValor());

        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_LABORALES.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasLaborales());
            if (cliente.getPerfilEconomico() != null && cliente.getPerfilEconomico().getRelacionEconomica() != null && paramComerciante.equals(cliente.getPerfilEconomico().getRelacionEconomica())) {
                // POR SER COMERCIANTE NO HAY REFERENCIAS LABORALES
                continue;
            } else if (cliente.getPerfilEconomico() != null && cliente.getPerfilEconomico().getRelacionEconomica() != null && paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {
                // SELECCIONO OTROS, NO HAY REFERENCIAS LABORALES
                continue;
            }
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateReferenciasLaborales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
    	this.validateReferenciasLaborales(cliente);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
        Date now = new Date();
    	if (!cliente.isAuthorized(SeccionFormularioCliente.REFERENCIAS.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }

        String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
        
        try {
        	if (null != cliente.getReferencias() && !isEmpty(cliente.getReferencias().getReferenciasLaborales())) {
        		for (ReferenciaLaboralDTO rf : cliente.getReferencias().getReferenciasLaborales()) {
        			if (null != rf.getModalidad()) {
                        rf.setTipoDocumento(cliente.getTipoDocumento());
                        rf.setDocumento(cliente.getDocumento());
        				if (Modalidad.I.equals(rf.getModalidad())) {
        					
        					// GUARDAR DIRECCION PRIMERO
                            if (rf.getDireccion() != null) {
                                rf.getDireccion().setDocumento(cliente.getDocumento());
                                rf.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                                Integer correlativoGenerado = this.dao.saveDireccion(rf.getDireccion());
                                rf.getDireccion().setCorrelativoDireccion(correlativoGenerado);
                                DireccionDTO d = rf.getDireccion();
                                d.setFecha();
                                d.setLogHora(Consts.getHora(now));
                                d.setUsuario(cajero.getUsuario());
                                d.setAgenciaUser(cajero.getAgencia());
                                d.setLogTipo("A");
                                d.setLogOper(" ");
                                this.dao.saveDireccionLog(d);
                                this.saveCamposAdicionalesDireccion(idCliente, rf.getDireccion());
                            }

                            this.dao.saveReferenciasLaborales(rf);
                            rf.setGuardada(true);
        				}
        				if (Modalidad.U.equals(rf.getModalidad())) {
    
                            this.dao.updateReferenciasLaborales(rf);
                            
                            // CAMBIAR DIRECCION PRIMERO
                            if (rf.getDireccion() != null) {
                                String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rf.getDireccion().getCorrelativoDireccion());
                                String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
                                String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
                                rf.getDireccion().setDocumento(cliente.getDocumento());
                                rf.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                                this.dao.updateDireccion(rf.getDireccion());
                                if (!isEmpty(email) && !isEmpty(rf.getDireccion().getEmail()) && !email.equals(rf.getDireccion().getEmail())) {
                                    this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion, rf.getDireccion().getEmail());
                                }
                                if (!isEmpty(extension) && !isEmpty(rf.getDireccion().getExtension()) && !extension.equals(rf.getDireccion().getExtension())) {
                                    this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion, rf.getDireccion().getExtension());
                                }
                            }
                        }
        				if (Modalidad.D.equals(rf.getModalidad())) {
        					this.dao.deleteReferenciasLaborales(rf);
                        }
        				if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
                        	rf.setModalidad(null);
                        }
                    } else {
                    	logger.info("referencia laboral sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getCorrelativoReferencia());
                    }
                }
        		cliente.getReferencias().getReferenciasLaborales().removeIf(rl -> Modalidad.D.equals(rl.getModalidad()));
            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS_LABORALES);
        }
    }

    private boolean validateReferenciasParentescoEmpleados(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_PARENTESCO_EMPLEADOS);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_PARENTESCO_EMPLEADOS.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasParentestoEmpleados());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = NoResultException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateReferenciaProveedor(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException {
        ReferenciasDTO referenciasDTO = new ReferenciasDTO();
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        List<ReferenciaProveedorDTO> rps = new ArrayList<ReferenciaProveedorDTO>();
        try {
            List<ReferenciaProveedor> referenciaProveedor = this.catalogoService.findReferenciaProveedorByCliente(tipoIdentificacion, identificacion);
            if (referenciaProveedor != null && !referenciaProveedor.isEmpty()) {
                for (ReferenciaProveedor referencia : referenciaProveedor) {
                    ReferenciaProveedorDTO ref = new ReferenciaProveedorDTO(referencia);
                    String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, ref.getCorrelativoReferencia());
                    String giroNegocio = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia);
                    if (!isEmpty(giroNegocio)) {
                        ref.setGiroNegocio(giroNegocio);
                    }
                    rps.add(ref);
                }
                referenciasDTO.setReferenciasProveedores(rps);
            }
        } catch (NoResultException e) {
            e.printStackTrace();
        }
        ClienteDTO cliente = new ClienteDTO(tipoIdentificacion, identificacion, referenciasDTO);
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            cliente.setTipoPersona(resumen.getTipoPersona());
        }
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        if (null != relacionEconomica) {
            cliente.setPerfilEconomico(new PerfilEconomicoDTO());
            cliente.getPerfilEconomico().setRelacionEconomica((Integer) relacionEconomica);
        }
        return cliente;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciaProveedor(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_PROVEEDORES);
        // PARAMETROS UTILIZADOS
        Integer paramAsalariado = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_ASALARIADO).getValor());
        Integer paramOtros = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_OTROS).getValor());

        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_PROVEEDORES.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            if (TipoPersona.N == cliente.getTipoPersona()) {
                if (paramAsalariado.equals(cliente.getPerfilEconomico().getRelacionEconomica()) || paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {
                    continue;
                }
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasProveedores());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateReferenciaProveedor(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateReferenciaProveedor(cliente);
        if (!cliente.isAuthorized(SeccionFormularioCliente.REFERENCIAS.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }
        String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
        try {
            if (cliente != null && cliente.getReferencias() != null) {
                if (!isEmpty(cliente.getReferencias().getReferenciasProveedores())) {
                    for (ReferenciaProveedorDTO referencia : cliente.getReferencias().getReferenciasProveedores()) {
                        if (null != referencia.getModalidad()) {
                        	referencia.setDocumento(cliente.getDocumento());
                        	referencia.setTipoDocumento(cliente.getTipoDocumento());
                            if (Modalidad.I.equals(referencia.getModalidad())) {
                            	Integer correlativoGenerado = this.dao.saveReferenciasProveedores(referencia);
                            	referencia.setCorrelativoReferencia(correlativoGenerado);
                            	referencia.setGuardada(true);
                            	String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, referencia.getCorrelativoReferencia());
                            	this.saveCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia, referencia.getGiroNegocio());
                            }
                            if (Modalidad.U.equals(referencia.getModalidad())) {
                            	this.dao.updateReferenciasProveedores(referencia);
                            	
                            	// CAMPO ADICIONAL
                            	String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, referencia.getCorrelativoReferencia());
                            	String giroNegocio = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia);
                            	if (referencia.isGiroNegocioCambio(giroNegocio)) {
                            		this.updateCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia, referencia.getGiroNegocio());
                            	}
                            }
                            if (Modalidad.D.equals(referencia.getModalidad())) {
                                this.dao.deleteReferenciasProveedores(referencia);
                            	
                                // CAMPO ADICIONAL
                                String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, referencia.getCorrelativoReferencia());
                                this.deleteCampoAdicional(ENTIDAD_REFERENCIA_PROVEEDORES, CAMPO_REF_PROVEEDORES_GIRO_NEGOCIO, idReferencia);
                            }
                            if (Modalidad.U.equals(referencia.getModalidad()) || Modalidad.I.equals(referencia.getModalidad())) {
                            	referencia.setModalidad(null);
                            }
                        } else {
                        	logger.info("referencia proveedor no cambio : " + cliente.getDocumento() + " correlativo " + referencia.getCorrelativoReferencia());
                        }
                    }
                    cliente.getReferencias().getReferenciasProveedores().removeIf(rp -> Modalidad.D.equals(rp.getModalidad()));
                }
            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS_PROVEEDORES);
        }
    }

    @Override
    @Transactional(readOnly = true, noRollbackFor = RuntimeException.class, propagation = Propagation.SUPPORTS)
    public ClienteDTO findClienteToUpdateReferenciaComerciante(String tipoIdentificacion, String identificacion) throws ServiceAccessException {
        ReferenciasDTO referenciasDTO = new ReferenciasDTO();
        tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        ClienteDTO cliente = new ClienteDTO(tipoIdentificacion, identificacion);
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            cliente.setTipoPersona(resumen.getTipoPersona());
        }
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
        if (null != relacionEconomica) {
            cliente.setPerfilEconomico(new PerfilEconomicoDTO());
            cliente.getPerfilEconomico().setRelacionEconomica((Integer) relacionEconomica);
        }
        List<ReferenciaComercianteDTO> rcs = this.getReferenciasComerciante(tipoIdentificacion, identificacion, cliente);
        referenciasDTO.setReferenciasComerciante(rcs);
        cliente.setReferencias(referenciasDTO);
        return cliente;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciaComerciante(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_COMERCIANTE);
        // PARAMETROS UTILIZADOS
        Integer paramAsalariado = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_ASALARIADO).getValor());
        Integer paramOtros = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_RELACION_ECONOMICA_OTROS).getValor());

        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_COMERCIANTE.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasComerciante());
            if (paramAsalariado.equals(cliente.getPerfilEconomico().getRelacionEconomica())) {
                // POR SER ASALARIADO NO HAY REFERENCIAS DE COMERCIANTE
                continue;
            } else if (paramOtros<=cliente.getPerfilEconomico().getRelacionEconomica()) {
                // SELECCIONO OTROS, NO HAY REFERENCIAS COMERCIANTE
                continue;
            } else {
                if (cliente.getReferencias().getReferenciasComerciante() != null) {
                    for (ReferenciaComercianteDTO refComer : cliente.getReferencias().getReferenciasComerciante()) {
                        if (refComer.getContador() != null && refComer.getContador().getNumeroIdentificacion() != null&& refComer.getContador().getTipoIdentificacion() !=null && refComer.getContador().getTipoIdentificacion().getCodigo()!=null) {
                            validateIdentificacion(refComer.getContador().getTipoIdentificacion().getCodigo(), refComer.getContador().getNumeroIdentificacion());
                        }
                    }
                }
            }
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateReferenciasComerciante(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        this.validateReferenciaComerciante(cliente);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
        Date now = new Date();
        if (!cliente.isAuthorized(SeccionFormularioCliente.REFERENCIAS.name(), Permission.MODCLTE)) {
            throw new AuthorizationRequiredException(Permission.MODCLTE);
        }
        
        String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
        
        try {
            if (null != cliente.getReferencias() && !isEmpty(cliente.getReferencias().getReferenciasComerciante())) {
                for (ReferenciaComercianteDTO rf : cliente.getReferencias().getReferenciasComerciante()) {
                    if (null != rf.getModalidad()) {
                    	rf.setTipoDocumento(cliente.getTipoDocumento());
                    	rf.setDocumento(cliente.getDocumento());
                        if (Modalidad.I.equals(rf.getModalidad())) {

                            // GUARDAR DIRECCION PRIMERO
                            if (rf.getDireccion() != null) {
                                rf.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                                rf.getDireccion().setDocumento(cliente.getDocumento());
                                Integer correlativoGenerado = this.dao.saveDireccion(rf.getDireccion());
                                rf.getDireccion().setCorrelativoDireccion(correlativoGenerado);
                                rf.setCodigoDireccion(correlativoGenerado);
                                DireccionDTO d = rf.getDireccion();
                                d.setFecha();
                                d.setLogHora(Consts.getHora(now));
                                d.setUsuario(cajero.getUsuario());
                                d.setAgenciaUser(cajero.getAgencia());
                                d.setLogTipo("A");
                                d.setLogOper(" ");
                                this.dao.saveDireccionLog(d);
                                this.saveCamposAdicionalesDireccion(idCliente, rf.getDireccion());
                            }
                           
                            if (TipoPersona.N.equals(cliente.getTipoPersona())) {
                                this.dao.saveReferenciasComerciante(rf);
                            }
                            if (rf.getContador() != null && !isEmpty(rf.getContador().getNombre())) {
                                this.dao.saveReferenciasComercianteDatosContador(rf);
                            }
                            rf.setGuardada(true);
                        }
                        if (Modalidad.U.equals(rf.getModalidad())) {
                        	this.dao.updateReferenciaComerciante(rf);
                        	
                        	// ACTUALIZAR DIRECCION PRIMERO
                        	if (rf.getDireccion() != null) {
                        		String idDireccion = getIdDireccionParaCamposAdicionales(idCliente, rf.getCodigoDireccion());
                        		String email = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion);
                        		String extension = (String) this.getValorCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion);
                        		
                        		rf.getDireccion().setDocumento(cliente.getDocumento());
                        		rf.getDireccion().setTipoDocumento(cliente.getTipoDocumento());
                        		this.dao.updateDireccion(rf.getDireccion());
                        		if (!isEmpty(email) && !isEmpty(rf.getDireccion().getEmail()) && !email.equals(rf.getDireccion().getEmail())) {
                        			this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EMAIL, idDireccion, rf.getDireccion().getEmail());
                        		}
                        		if (!isEmpty(extension) && !isEmpty(rf.getDireccion().getExtension()) && !extension.equals(rf.getDireccion().getExtension())) {
                        			this.updateCampoAdicional(ENTIDAD_DIRECCION_CLIENTE, CAMPO_DIRECCION_EXTENSION, idDireccion, rf.getDireccion().getExtension());
                        		}
                        	}
                        	if (rf.getContador() != null && rf.getContador().getModalidad() != null) {
                        		if (Modalidad.I.equals(rf.getContador().getModalidad()) && !isEmpty(rf.getContador().getNombre())) {
                                    this.dao.saveReferenciasComercianteDatosContador(rf);
                                }
                                if (Modalidad.U.equals(rf.getContador().getModalidad())) {
                                    this.dao.updateReferenciasComercianteDatosContador(rf);
                                }
                                if (Modalidad.D.equals(rf.getContador().getModalidad())) {
                                    this.dao.deleteReferenciasComercianteDatosContador(rf);
                                }
                        	}
                        } 
                        if (Modalidad.D.equals(rf.getModalidad())) {
                            this.dao.deleteReferenciaComerciante(rf);
                            
                            if (null != rf.getContador() && null != rf.getContador().getCorrelativoContador()) {
                                this.dao.deleteReferenciasComercianteDatosContador(rf);
                            }
                        }
                        if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
                        	rf.setModalidad(null);
                        }
                    } else {
                    	logger.info("referencia comerciante sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getCorrelativoReferencia());
                    }
                }
                cliente.getReferencias().getReferenciasComerciante().removeIf(rc -> Modalidad.D.equals(rc.getModalidad()));
            }
            return cliente;
        } catch (DeadlockLoserDataAccessException e) {
            e.printStackTrace();
            throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
        } catch (Exception e) {
        	e.printStackTrace();
            throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
        }
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasAccionistas(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_ACCIONISTAS);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_ACCIONISTAS.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasAccionistas());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasCredito(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_CREDITO);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_CREDITO.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasCredito());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasCuentas(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_CUENTAS);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_CUENTAS.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasCuentas());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasPersonalesFamiliares(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_PERSONALES_FAMILIARES);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (ParameterPlatform.REF_PERSONALES_FAMILIARES.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasPersonalesFamiliares());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasVehiculos(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_VEHICULOS);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_VEHICULOS.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasVehiculos());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Transactional(readOnly = true, noRollbackFor = NoResultException.class)
    public boolean validateReferenciasSeguros(ClienteDTO cliente) throws ServiceAccessException {
        Iterable<ReferenciaClienteDetalle> referencias = referenciaClienteDetalleService.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(cliente.getTipoPersona(), ParameterPlatform.REF_SEGUROS);
        for (ReferenciaClienteDetalle rc : referencias) {
            if (!ParameterPlatform.REF_SEGUROS.equals(rc.getReferencia().getTipoReferencia())) {
                continue;
            }
            int cantidadReferencias = getSize(cliente.getReferencias().getReferenciasSeguros());
            if (cantidadReferencias < rc.getMinimo() || cantidadReferencias > rc.getMaximo()) {
                throw new ServiceAccessException(ErrorMessage.EL_NUMERO_DE_REFERENCIAS_ES_INVALIDO);
            }
        }
        return true;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = ServiceAccessException.class)
    public ClienteDTO updateReferencias(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        String idCliente = getIdClienteParaCamposAdicionales(cliente.getTipoDocumento(), cliente.getDocumento());
        String tipoIdentificacion = StringUtils.leftPad(cliente.getTipoDocumento(), 1, ' ');
        String identificacion = StringUtils.leftPad(cliente.getDocumento(), 18, ' ');
        ClienteResumen resumen = clienteResumenRepository.findById(new ClienteId(tipoIdentificacion, identificacion));
        if (null != resumen) {
            cliente.setTipoPersona(resumen.getTipoPersona());
        }
        if (cliente != null && cliente.getReferencias() != null) {
            if (!cliente.isAuthorized(SeccionFormularioCliente.REFERENCIAS.name(), Permission.MODCLTE)) {
                throw new AuthorizationRequiredException(Permission.MODCLTE);
            }

            // REFERENCIAS DE ACCIONISTAS
            
            if (!isEmpty(cliente.getReferencias().getReferenciasAccionistas())) {
                this.validateReferenciasAccionistas(cliente);
                try {
                    for (ReferenciaAccionistaDTO rf : cliente.getReferencias().getReferenciasAccionistas()) {
                    	if (null != rf.getModalidad()) {
                    		rf.setTipoDocumento(cliente.getTipoDocumento());
                    		rf.setDocumento(cliente.getDocumento());
                    		if (Modalidad.I.equals(rf.getModalidad())) {
                    			Integer correlativoGenerado = this.dao.saveReferenciasAccionistas(rf);
                    			rf.setCorrelativoReferencia(correlativoGenerado);
                    			rf.setGuardada(true);

                    			// CAMPOS ADICIONALES
                    			String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, rf.getCorrelativoReferencia());
                    			this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia, rf.getNacionalidad().getCodigo());
                    			this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia, getIdClienteParaCamposAdicionales(rf.getDocumentoIdentificacion().getCodigo(), rf.getIdentificacion()));
                    			this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia, rf.getActividadEconomica().getCodigo());
                    			this.saveCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia, rf.getCargo());
                    		}
                    		if (Modalidad.U.equals(rf.getModalidad())) {
                    			this.dao.updateReferenciasAccionista(rf);
                            
	                            // CAMPOS ADICIONALES
	                            String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, rf.getCorrelativoReferencia());
	                            String accionistaNac = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia);
	                            String accionistaDoc = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia);
	                            Integer accionistaAcEc = (Integer) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia);
	                            String accionistaCar = (String) this.getValorCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia);
	
	                            if (rf.isNacionalidadCambio(accionistaNac)) {
	                                this.updateCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia, rf.getNacionalidad().getCodigo());
	                            }
	                            if (rf.isDocumentoCambio(accionistaDoc)) {
	                            	this.updateCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia, getIdClienteParaCamposAdicionales(rf.getDocumentoIdentificacion().getCodigo(), rf.getIdentificacion()));
	                            }
	                            if (rf.isActividadEconomicaCambio(accionistaAcEc)) {
	                                this.updateCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia, rf.getActividadEconomica().getCodigo());
	                            }
	                            if (rf.isCargoCambio(accionistaCar)) {
	                                this.updateCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia, rf.getCargo());
	                            }
                    		}
                    		if (Modalidad.D.equals(rf.getModalidad())) {
                    			this.dao.deleteReferenciasAccionista(rf);
                            
	                            // CAMPOS ADICIONALES
	                            String idReferencia = getIdReferenciaParaCamposAdicionales(idCliente, rf.getCorrelativoReferencia());
	
	                            this.deleteCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_NACIONALIDAD, idReferencia);
	                            this.deleteCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_DOC_IDENT, idReferencia);
	                            this.deleteCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_ACT_ECO, idReferencia);
	                            this.deleteCampoAdicional(ENTIDAD_REFERENCIA_ACCIONISTA, CAMPO_REF_ACCIONISTA_CARGO, idReferencia);
                    		}
                    		if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
 	                            rf.setModalidad(null);
 	                        }
                    	} else {
                    		logger.info("referencia accionista sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getCorrelativoReferencia());
                    	}
                    }
                    cliente.getReferencias().getReferenciasAccionistas().removeIf(ra -> Modalidad.D.equals(ra.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }
            
            // REFERENCIAS DE CREDITO
            
            if (!isEmpty(cliente.getReferencias().getReferenciasCredito())) {
                this.validateReferenciasCredito(cliente);
                try {
                    for (ReferenciaCreditoDTO rf : cliente.getReferencias().getReferenciasCredito()) {
                    	if (null != rf.getModalidad()) {
	                        rf.setTipoDocumento(cliente.getTipoDocumento());
	                        rf.setDocumento(cliente.getDocumento());
	                        if (Modalidad.I.equals(rf.getModalidad())) {
	                            this.dao.saveReferenciasCredito(rf);
	                            rf.setGuardada(true);
	                        }
	                        if (Modalidad.U.equals(rf.getModalidad())) {
	                            this.dao.updateReferenciasCredito(rf);
	                        } 
	                        if (Modalidad.D.equals(rf.getModalidad())) {
	                        	this.dao.deleteReferenciasCredito(rf);
	                        }
	                        if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
	                            rf.setModalidad(null);
	                        }
                    	} else {
                    		logger.info("referencia de credito sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getCorrelativoReferencia());
                    	}
                    }
                    cliente.getReferencias().getReferenciasCredito().removeIf(rc -> Modalidad.D.equals(rc.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }
            
            // REFERENCIAS DE CUENTAS
            
            if (!isEmpty(cliente.getReferencias().getReferenciasCuentas())) {
                this.validateReferenciasCuentas(cliente);
                try {
                    for (ReferenciaCuentaDTO rf : cliente.getReferencias().getReferenciasCuentas()) {
                    	if (null != rf.getModalidad()) {
                    		rf.setTipoDocumento(cliente.getTipoDocumento());
                    		rf.setDocumento(cliente.getDocumento());
                    		if (Modalidad.I.equals(rf.getModalidad())) {
                    			this.dao.saveReferenciasCuentas(rf);
                    			rf.setGuardada(true);
                    		}
                    		if (Modalidad.U.equals(rf.getModalidad())) {
                    			this.dao.updateReferenciasCuenta(rf);
                    		} 
                    		if (Modalidad.D.equals(rf.getModalidad())) {
                                this.dao.deleteReferenciasCuenta(rf);
                            }
                    		if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
 	                            rf.setModalidad(null);
 	                        }
                    	} else {
                    		logger.info("referencia de cuentas sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getTipo());
                    	}
                    }
                    cliente.getReferencias().getReferenciasCuentas().removeIf(rc -> Modalidad.D.equals(rc.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }

            // REFERENCIAS PERSONALES FAMILIARES
            
            if (!isEmpty(cliente.getReferencias().getReferenciasPersonalesFamiliares())) {
                this.validateReferenciasPersonalesFamiliares(cliente);
                try {
                    for (ReferenciaPersonalFamiliarDTO rf : cliente.getReferencias().getReferenciasPersonalesFamiliares()) {
                    	if (null != rf.getModalidad()) {
                            rf.setTipoDocumento(cliente.getTipoDocumento());
                            rf.setDocumento(cliente.getDocumento());
                            if (Modalidad.I.equals(rf.getModalidad())) {
                            	this.dao.saveReferenciasPersonalesFamiliares(rf);
                            	rf.setGuardada(true);
                            }
                            if (Modalidad.U.equals(rf.getModalidad())) {
                            	this.dao.updateReferenciasPersonalesFamiliares(rf);
                            }
                            if (Modalidad.D.equals(rf.getModalidad())) {
                                this.dao.deleteReferenciasPersonalesFamiliares(rf);
                            }
                            if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
 	                            rf.setModalidad(null);
 	                        }
                    	} else {
                    		logger.info("referencia personales familiares sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getCorrelativoReferencia());
                    	}
                    }
                    cliente.getReferencias().getReferenciasPersonalesFamiliares().removeIf(rpf -> Modalidad.D.equals(rpf.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }
            
            // REFERENCIAS DE VEHICULOS

            if (!isEmpty(cliente.getReferencias().getReferenciasVehiculos())) {
                validateReferenciasVehiculos(cliente);
                try {
                    for (ReferenciaVehiculoDTO rf : cliente.getReferencias().getReferenciasVehiculos()) {
                    	if (null != rf.getModalidad()) {
                            rf.setTipoDocumento(cliente.getTipoDocumento());
                            rf.setDocumento(cliente.getDocumento());
                            if (Modalidad.I.equals(rf.getModalidad())) {
                            	this.dao.saveReferenciasVehiculos(rf);
                            	rf.setGuardada(true);
                            }
                            if (Modalidad.U.equals(rf.getModalidad())) {
                            	this.dao.updateReferenciasVehiculos(rf);
                            }
                            if (Modalidad.D.equals(rf.getModalidad())) {
                                this.dao.deleteReferenciasVehiculos(rf);
                            }
                            if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
 	                            rf.setModalidad(null);
 	                        }
                    	} else {
                    		logger.info("referencia personales familiares sin cambios : cldoc " + cliente.getDocumento() + " correlativo = " + rf.getEmpresaFinancia());
                    	}
                    }
                    cliente.getReferencias().getReferenciasVehiculos().removeIf(rpf -> Modalidad.D.equals(rpf.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }

            // REFERENCIAS DE SEGUROS
            
            if (!isEmpty(cliente.getReferencias().getReferenciasSeguros())) {
                this.validateReferenciasSeguros(cliente);
                try {
                    for (ReferenciaSeguroDTO rf : cliente.getReferencias().getReferenciasSeguros()) {
                    	if (null != rf.getModalidad()) {
                            rf.setTipoDocumento(cliente.getTipoDocumento());
                    		rf.setDocumento(cliente.getDocumento());
	                        if (Modalidad.I.equals(rf.getModalidad())) {
	                            this.dao.saveReferenciasSeguros(rf);
	                            rf.setGuardada(true);
	                        }
	                        if (Modalidad.U.equals(rf.getModalidad())) {
	                            this.dao.updateReferenciasSeguros(rf);
	                        }
	                        if (Modalidad.D.equals(rf.getModalidad())) {
	                        	this.dao.deleteReferenciasSeguros(rf);
	                        }
	                        if (Modalidad.U.equals(rf.getModalidad()) || Modalidad.I.equals(rf.getModalidad())) {
 	                            rf.setModalidad(null);
 	                        }
                    	} else {
                    		logger.info("referencia seguro sin cambios: cldoc " + cliente.getDocumento());
                    	}
                    }
                    cliente.getReferencias().getReferenciasSeguros().removeIf(rs -> Modalidad.D.equals(rs.getModalidad()));
                } catch (DeadlockLoserDataAccessException e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(((SQLException) e.getCause()).getMessage(), false);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new ServiceAccessException(ErrorMessage.ERROR_ACTUALIZAR_REFERENCIAS);
                }
            }
        }
        
        return cliente;
    }
    
    @Override
	public boolean updateHuellaFoto(String ip, String tipoDocumento, String documento, String nombre, String tipo) throws ServiceAccessException {
		return this.huellaFotoService.writeQueue(ip, tipoDocumento, documento, nombre, tipo);
	}
	
    @Override
    @Transactional(readOnly = true)
    public CambioSituacionEconomicaSeccion findDirtySection(String tipoIdentificacion, String identificacion) throws NoResultException {
    	CambioSituacionEconomicaSeccion bo = new CambioSituacionEconomicaSeccion();
    	
    	tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
        
        Integer tipoDireccionTrabajo = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_TRABAJO).getValor());
        Integer tipoDireccionComercio = Integer.parseInt(mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_TIPO_DIRECCION_COMERCIO).getValor());
        Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
       
        bo = catalogoService.findDirtySectionByCliente(tipoIdentificacion, identificacion, tipoDireccionTrabajo, tipoDireccionComercio);
        
        if (null != relacionEconomica) {
            bo.setRelacionEconomica((Integer) relacionEconomica);
        }
        
        if (null != bo) {
        	if (TipoPersona.J.equals(bo.getTipoPersona())) {
        		bo.setReferenciasComerciante(bo.getContador());
        	}
        }
        
        return bo;
   	}
    
    @Override
    @Transactional(readOnly = true)
    public ClienteResumen findClienteResumenById(String tipoIdentificacion, String identificacion) {
    	tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
    	return clienteResumenRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ClienteSeccionPendiente findSeccionesPendientesByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
    	ClienteSeccionPendiente bo = new ClienteSeccionPendiente();
    	
    	tipoIdentificacion = StringUtils.leftPad(tipoIdentificacion, 1, ' ');
        identificacion = StringUtils.leftPad(identificacion, 18, ' ');

        bo = catalogoService.findSeccionesPendientesByCliente(tipoIdentificacion, identificacion);

       	if (TipoPersona.N.equals(bo.getTipoPersona())) {
       		String idCliente = getIdClienteParaCamposAdicionales(tipoIdentificacion, identificacion);
            Object relacionEconomica = this.getValorCampoAdicional(ENTIDAD_CLIENTE, CAMPO_CLIENTE_SITUACION_EMPLEO, idCliente);
            bo.setRelacionEconomica(null != relacionEconomica && ((Integer) relacionEconomica).compareTo(0) > 0);
        }
       	
       	if (TipoPersona.J.equals(bo.getTipoPersona())) {
       		if (bo.getRepresentanteLegal() && bo.isEmptyNameRepresentanteLegal()) {
       			bo.setRepresentanteLegal(false);
       		}
       	}
        
        return bo;
   	}
	
}