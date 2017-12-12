package com.bytesw.platform.bs.service;

import com.bytesw.platform.bs.dao.depositos.ProductoResumenRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.eis.bo.clientes.*;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;
import com.bytesw.platform.eis.bo.clientes.identifier.SupervisorOperacionId;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.depositos.*;
import com.bytesw.platform.eis.bo.depositos.dominio.EstadoCuenta;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;
import com.bytesw.platform.eis.bo.depositos.identifier.ProductoId;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.eis.dto.depositos.ProductoDTO;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.ParameterPlatform;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.text.ParseException;
import java.util.*;

@SuppressWarnings("unchecked")
@Service
public class CatalogoService {

    private EntityManager manager;
    private ProductoResumenRepository productoResumenRepository;
    private MnemonicoService mnemonicoService;
    
    @Autowired
    public CatalogoService(EntityManager manager, ProductoResumenRepository productoResumenRepository, MnemonicoService mnemonicoService) {
    	this.manager = manager;
    	this.productoResumenRepository = productoResumenRepository;
    	this.mnemonicoService = mnemonicoService;
    }

    /** CL NamedQueries **/

    @Transactional(readOnly = true)
    public Iterable<TipoDocumento> findTipoDocumentosByTipoPersona(String tipoPersona) {
        Query query = manager.createNamedQuery("tipoDocumentos-por-tipoPersona");
        query.setParameter("TIPO_PERSONA", tipoPersona);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public TipoDocumento findTipoDocumentoByCodigo(String codigo) throws NoResultException {
        Query query = manager.createNamedQuery("tipoDocumento-por-codigo");
        query.setParameter("CODIGO", codigo);
        return (TipoDocumento) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Moneda findMonedaDefault() throws NoResultException {
        Query query = manager.createNamedQuery("moneda-default");
        query.setMaxResults(Consts.ONE_RESULT);
        return (Moneda) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Iterable<Moneda> findMonedasExistenEnProductos() {
        Query query = manager.createNamedQuery("monedas-en-productos");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<ActividadEconomica> findActividadesEconomicas(Integer codigo) {
        Query query = manager.createNamedQuery("actividades-economicas-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<SectorEconomico> findSectoresEconomicos(Integer codigo) {
        Query query = manager.createNamedQuery("sectores-economicos-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<SupervisorOperacion> findSupervisoresOperacion(String empresa, Integer codigo, List<String> estados) {
        Query query = manager.createNamedQuery("supervisores-operacion-por-id");
        query.setParameter("CODIGO_EMPRESA", null != empresa ? empresa : Consts.SQL_NULL);
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        query.setParameter("ESTADOS", null != estados ? estados : Arrays.asList(Consts.SUPERVISORES_ACTIVOS));
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public SupervisorOperacion findSupervisorOperacion(String empresa, String usuario) throws NoResultException {
        Query query = manager.createNamedQuery("supervisor-operacion-por-usuario");
        query.setParameter("CODIGO_EMPRESA", empresa);
        query.setParameter("CODIGO_USUARIO", usuario);
        query.setParameter("ESTADO", Consts.SUPERVISORES_ACTIVOS);
        return (SupervisorOperacion) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Iterable<EjecutivoNegocio> findEjecutivosNegocio(String empresa, Integer codigo) {
        Query query = manager.createNamedQuery("ejecutivos-negocio-por-id");
        query.setParameter("CODIGO_EMPRESA", null != empresa ? empresa : Consts.SQL_NULL);
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Agencia findAgencia(String empresa, Integer codigo) throws NoResultException {
        Query query = manager.createNamedQuery("agencia-por-codigo");
        query.setParameter("CODIGO_EMPRESA", empresa);
        query.setParameter("CODIGO", codigo);
        return (Agencia) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Iterable<Agencia> findAgencias(String empresa) {
        Query query = manager.createNamedQuery("agencias-resumen");
        query.setParameter("CODIGO_EMPRESA", null != empresa ? empresa : Consts.SQL_NULL);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Ruta> findRutas(Integer codigo) {
        Query query = manager.createNamedQuery("rutas-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Zona> findZonas(Integer codigo) {
        Query query = manager.createNamedQuery("zonas-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Cliente findClienteById(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("cliente-por-codigo");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return (Cliente) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public ClienteIndividual findClienteIndividualById(String tipoIdentificacion, String identificacion) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        return manager.find(ClienteIndividual.class, id);
    }
    
    @Transactional(readOnly = true)
    public RepresentanteLegal findRepresentanteLegalById(String tipoIdentificacion, String identificacion) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        return manager.find(RepresentanteLegal.class, id);
    }
    
    @Transactional(readOnly = true)
    public boolean existsRepresentanteLegal(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("existe-representante-legal");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setMaxResults(Consts.ONE_RESULT);
        Long exists = (Long) query.getSingleResult();
        return exists > 0;
    }
    
    @Transactional(readOnly = true)
    public ClienteAdicional findDatosAdicionalesById(String tipoIdentificacion, String identificacion) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        return manager.find(ClienteAdicional.class, id);
    }
    
    @Transactional(readOnly = true)
    public ClienteJuridicoNivelVentas findClienteJuridicoNivelVentasById(String tipoIdentificacion, String identificacion) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        return manager.find(ClienteJuridicoNivelVentas.class, id);
    }

    @Transactional(readOnly = true)
    public Iterable<Pais> findPaises(String codigo) {
        Query query = manager.createNamedQuery("pais-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : Consts.BLANK);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Pais findPaisByNacionalidad(String nacionalidad) throws NoResultException {
        Query query = manager.createNamedQuery("pais-por-nacionalidad");
        query.setMaxResults(1);
        query.setParameter("NACIONALIDAD", nacionalidad);
        List<Pais> results = query.getResultList();
        if (results == null || results.isEmpty()) {
            return null;
        }
        return results.get(0);
    }

    @Transactional(readOnly = true)
    public Iterable<Profesion> findProfesiones() {
        Query query = manager.createNamedQuery("profesiones-cliente");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<ClaseCliente> findClasesCliente() {
        Query query = manager.createNamedQuery("clase-cliente");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<TipoCliente> findTiposCliente() {
        Query query = manager.createNamedQuery("tipo-cliente");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Vinculacion> findVinculaciones() {
        Query query = manager.createNamedQuery("vinculaciones");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<TipoInstitucion> findTipoInstituciones() {
        Query query = manager.createNamedQuery("tipos-institucion");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Institucion> findInstituciones(Integer tipo) {
        Query query = manager.createNamedQuery("instituciones-por-tipo");
        query.setParameter("CODIGO", null != tipo ? tipo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoRequerido> findDocumentosRequeridosPorClaseCliente(Integer claseCliente) {
        Query query = manager.createNamedQuery("documentos-requeridos-por-clase-cliente");
        query.setParameter("CODIGO", null != claseCliente ? claseCliente : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Region> findRegiones() {
        Query query = manager.createNamedQuery("regiones");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Departamento> findDepartamentos(Integer region) {
        Query query = manager.createNamedQuery("departamentos-por-region");
        query.setParameter("REGION", null != region ? region : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Municipio> findMunicipios(Integer departamento) {
        Query query = manager.createNamedQuery("municipios-por-departamento");
        query.setParameter("DEPARTAMENTO", null != departamento ? departamento : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Barrio> findBarrios(Integer municipio) {
        Query query = manager.createNamedQuery("barrios-por-municipio");
        query.setParameter("MUNICIPIO", null != municipio ? municipio : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<TipoDireccion> findTiposDirecciones() {
        Query query = manager.createNamedQuery("tipos-direcciones");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Integer> findCodigosClientesEmpleados() {
        Query query = manager.createNamedQuery("codigos-clientes-empleados");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public boolean existsMunicipioByDepartamentoAndCodigo(Integer codigoDepartamento, Integer codigoMunicipio) {
        Query query = manager.createNamedQuery("existe-municipio");
        query.setParameter("DEPARTAMENTO", codigoDepartamento);
        query.setParameter("MUNICIPIO", codigoMunicipio);
        query.setMaxResults(Consts.ONE_RESULT);
        Long exists = (Long) query.getSingleResult();
        return exists > 0;
    }

    @Transactional(readOnly = true)
    public List<TipoReferencia> findTiposReferencias() {
        Query query = manager.createNamedQuery("tipos-referencia");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<TipoSociedad> findTiposSociedades() {
        Query query = manager.createNamedQuery("tipos-sociedad");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<NivelVentas> findNivelesVentas() {
        Query query = manager.createNamedQuery("nivel-ventas");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<RangoSueldos> findRangosSueldos() {
        Query query = manager.createNamedQuery("rango-sueldos");
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaDependiente> findReferenciaDependientes(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("referencia-dependientes-por-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public List<DocumentoPresentado> findDocumentosPresentados(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("documentos-presentados-por-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<DireccionCliente> findDireccionesCliente(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("direcciones-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public DireccionCliente findDireccionClienteById(String tipoIdentificacion, String identificacion, Integer codigo) throws NoResultException {
        Query query = manager.createNamedQuery("direccion-cliente-by-codigo");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CODIGO", codigo);
        return (DireccionCliente) query.getSingleResult();
    }

    /** REFERENCES **/

    @Transactional(readOnly = true)
    public List<ReferenciaAccionista> findReferenciaAccionistaByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-accionista-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public ReferenciaAccionista findReferenciaAccionistaById(String tipoIdentificacion, String identificacion, Integer correlativo) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-accionista-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativo);
        return (ReferenciaAccionista) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaComercial> findReferenciaComercialByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-comercial-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaComerciante> findReferenciaComercianteByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-comerciante-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaComerciante findReferenciaComercianteById(String tipoIdentificacion, String identificacion, Integer correlativo) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-comerciante-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativo);
        return (ReferenciaComerciante) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public List<ReferenciaComercianteDatoContador> findReferenciaComercianteDatoContadorByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-comerciante-dato-contador-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaConyugue> findReferenciaConyugueByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-conyugue-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaCredito> findReferenciaCreditoByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-credito-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public ReferenciaCredito findReferenciaCreditoById(String tipoIdentificacion, String identificacion, Integer correlativoReferencia) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-credito-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativoReferencia);
        return (ReferenciaCredito) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaCuenta> findReferenciaCuentaByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-cuenta-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public ReferenciaCuenta findReferenciaCuentaById(String tipoIdentificacion, String identificacion, Integer tipoInstitucion, Integer codigoInstitucion, String numeroCuenta) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-cuenta-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("TIPO_INSTITUCION", tipoInstitucion);
        query.setParameter("CODIGO_INSTITUCION", codigoInstitucion);
        query.setParameter("NUMERO_CUENTA", numeroCuenta);
        return (ReferenciaCuenta) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaDependiente> findReferenciaDependienteByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-dependiente-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaLaboral> findReferenciaLaboralByCliente(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("referencia-laboral-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaLaboral findReferenciaLaboralById(String tipoIdentificacion, String identificacion, Integer correlativo) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-laboral-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativo);
        return (ReferenciaLaboral) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaParentescoEmpleado findReferenciaParentescoEmpleadoById(String tipoIdentificacion, String identificacion, Integer codigoEmpleado) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-parentesco-empleado-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CODIGO_EMPLEADO", codigoEmpleado);
        return (ReferenciaParentescoEmpleado) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaPersonalFamiliar> findReferenciaPersonalFamiliarByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-personal-familiar-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaPersonalFamiliar findReferenciaPersonalFamiliarById(String tipoIdentificacion, String identificacion, Integer correlativo) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-personal-familiar-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativo);
        return (ReferenciaPersonalFamiliar) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaPropiedad> findReferenciaPropiedadByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-propiedad-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaProveedor> findReferenciaProveedorByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-proveedor-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaProveedor findReferenciaProveedorById(String tipoIdentificacion, String identificacion,Integer correlativo) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-proveedor-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CORRELATIVO", correlativo);
        return (ReferenciaProveedor) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaSeguro> findReferenciaSeguroByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-seguro-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaSeguro findReferenciaSeguroById(String tipoIdentificacion, String identificacion, Integer codigoAseguradora) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-seguro-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("CODIGO_ASEGURADORA", codigoAseguradora);
        return (ReferenciaSeguro) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaTarjetaCredito> findReferenciaTarjetaCreditoByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-tarjeta-credito-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public List<ReferenciaVehiculo> findReferenciaVehiculoByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-vehiculo-by-cliente");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ReferenciaVehiculo findReferenciaVehiculoById(String tipoIdentificacion, String identificacion, String placa) throws NoResultException {
        Query query = manager.createNamedQuery("referencia-vehiculo-by-id");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", identificacion);
        query.setParameter("PLACA", placa);
        return (ReferenciaVehiculo) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public boolean existsClienteAdicionalByCodigo(String tipoIdentificacion, String identificacion) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        final CriteriaBuilder cb = manager.getCriteriaBuilder();
        final CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        final Root<ClienteAdicional> from = cq.from(ClienteAdicional.class);
        cq.select(cb.count(from));
        cq.where(cb.equal(from.get("id"), id));
        final TypedQuery<Long> tq = manager.createQuery(cq);
        return tq.getSingleResult() > 0;
    }

    /** CL NativeNamedQueries **/

    @Transactional(readOnly = true)
    public boolean isEnListaNegraPorIdentificacion(String tipoIdentificacion, String numeroIdentificacion) {
        Query query = manager.createNamedQuery("sql-en-lista-negra-por-identificacion");
        query.setParameter("TIPO_IDENTIFICACION", tipoIdentificacion);
        query.setParameter("IDENTIFICACION", numeroIdentificacion);
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public boolean isEnListaNegraPorNombre(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("sql-en-lista-negra-por-nombre");
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public boolean isEnListaNegraPorNombres(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("sql-en-lista-negra-por-nombres");
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public boolean isEnListaNegraPersonaNatural(String primerApellido, String segundoApellido, String apellidoCasada, String primerNombre, String segundoNombre) {
    	if (isEmpty(primerApellido) && isEmpty(segundoApellido) && isEmpty(apellidoCasada) && isEmpty(primerNombre) && isEmpty(segundoNombre)) {
    		return false;
    	}
        Query query = manager.createNamedQuery("sql-en-lista-negra-solo-por-nombres-persona-natural");
        query.setParameter("PRIMER_NOMBRE", primerNombre == null || primerNombre.isEmpty() ? Consts.SQL_NULL : primerNombre + "%");
        query.setParameter("SEGUNDO_NOMBRE", segundoNombre == null || segundoNombre.isEmpty() ? Consts.SQL_NULL : segundoNombre + "%");
        query.setParameter("PRIMER_APELLIDO", primerApellido == null || primerApellido.isEmpty() ? Consts.SQL_NULL : primerApellido + "%");
        query.setParameter("SEGUNDO_APELLIDO", segundoApellido == null || segundoApellido.isEmpty() ? Consts.SQL_NULL : segundoApellido + "%");
        query.setParameter("APELLIDO_CASADA", apellidoCasada == null || apellidoCasada.isEmpty() ? Consts.SQL_NULL : apellidoCasada + "%");
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public boolean isEnListaNegraPersonaJuridica(String nombre) {
        Query query = manager.createNamedQuery("sql-en-lista-negra-solo-por-nombres-persona-juridica");
        query.setParameter("NOMBRE", nombre);
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public SupervisorOperacion findSupervisorOperacionJefe(String empresa, Integer agencia, Integer jornada) throws NoResultException {
        Query query = manager.createNamedQuery("sql-supervisor-operacion-jefe", SupervisorOperacion.class);
        query.setParameter("CODIGO_EMPRESA", empresa);
        query.setParameter("ESTADO", Consts.SUPERVISORES_ACTIVOS);
        query.setParameter("CODIGO_AGENCIA", agencia);
        query.setParameter("CODIGO_JORNADA", jornada);
        query.setMaxResults(Consts.ONE_RESULT);
        return (SupervisorOperacion) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Iterable<NivelGeografico> findDireccion(String pais, String nombreBarrio) {
        Query query = manager.createNamedQuery("sql-ubicacion-geografica", NivelGeografico.class);
        query.setParameter("PAIS", pais);
        query.setParameter("NOMBRE_BARRIO", null != nombreBarrio ? "%" + nombreBarrio + "%" : Consts.SQL_NULL);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<NivelRiesgo> findNivelRiesgo(Integer region, Integer departamento, Integer municipio, Integer barrio) {
        Query query = manager.createNamedQuery("sql-nivel-riesgo", NivelRiesgo.class);
        query.setParameter("REGION", null != region ? region : 0);
        query.setParameter("DEPARTAMENTO", null != departamento ? departamento : 0);
        query.setParameter("MUNICIPIO", null != municipio ? municipio : 0);
        query.setParameter("BARRIO", null != barrio ? barrio : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Empleado> findEmpleadosNoClientes(String empresa) {
        Query query = manager.createNamedQuery("sql-empleados-no-son-clientes", Empleado.class);
        query.setParameter("CODIGO_EMPRESA", empresa);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public Iterable<Empleado> findEmpleadosByEmpresa(String empresa) {
        Query query = manager.createNamedQuery("sql-empleados", Empleado.class);
        query.setParameter("CODIGO_EMPRESA", empresa);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public PerfilEconomico findPerfilEconomicoByClienteId(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("sql-perfil-economico-por-cliente-view");
        query.setParameter("TIPODOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        return (PerfilEconomico) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public boolean existsEnRegistroNacional(String identificacion) {
        Query query = manager.createNamedQuery("sql-existe-en-registro-nacional-persona");
        query.setParameter("DOCUMENTO", identificacion);
        Integer result = (Integer) query.getSingleResult();
        return result > 0;
    }

    @Transactional(readOnly = true)
    public List<ReferenciaParentescoEmpleado> findReferenciaParentescoEmpleadoByCliente(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("sql-referencia-parentesco-empleado-por-cliente", ReferenciaParentescoEmpleado.class);
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public CambioSituacionEconomicaSeccion findDirtySectionByCliente(String tipoIdentificacion, String identificacion, Integer tipoDireccionTrabajo, Integer tipoDireccionComercio) throws NoResultException {
        Query query = manager.createNamedQuery("sql-cambio-relacion-economica-seccion", CambioSituacionEconomicaSeccion.class);
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        query.setParameter("TIPO_DIRECCION_TRABAJO", tipoDireccionTrabajo);
        query.setParameter("TIPO_DIRECCION_COMERCIO", tipoDireccionComercio);
        return (CambioSituacionEconomicaSeccion) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public List<GrupoEconomico> findGruposEconomicos() {
        Query query = manager.createNamedQuery("sql-grupos-economicos", GrupoEconomico.class);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public List<GrupoEconomico> findGruposEconomicosByCliente(String tipoIdentificacion, String identificacion) {
        Query query = manager.createNamedQuery("sql-grupos-economicos-por-cliente", GrupoEconomico.class);
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public ClienteSeccionPendiente findSeccionesPendientesByCliente(String tipoIdentificacion, String identificacion) throws NoResultException {
        Query query = manager.createNamedQuery("sql-secciones-pendientes-por-cliente", ClienteSeccionPendiente.class);
        query.setParameter("TIPO_DOCUMENTO", tipoIdentificacion);
        query.setParameter("DOCUMENTO", identificacion);
        return (ClienteSeccionPendiente) query.getSingleResult();
    }

    /** DP NamedQueries **/

    @Transactional(readOnly = true)
    public Iterable<TipoProducto> findTipoProductos(Integer codigo) {
        Query query = manager.createNamedQuery("tipo-productos-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Producto findProductoById(Integer producto, Integer subProducto) throws NoResultException {
        Query query = manager.createNamedQuery("producto-por-codigo");
        query.setParameter("PRODUCTO", producto);
        query.setParameter("SUB_PRODUCTO", subProducto);
        return (Producto) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public Iterable<OrigenFondo> findOrigenesFondo(Integer codigo) {
        Query query = manager.createNamedQuery("origenes-fondo-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<UsoCuenta> findUsosCuenta(Integer codigo) {
        Query query = manager.createNamedQuery("usos-cuenta-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Promocion> findPromociones(Integer codigo) {
        Query query = manager.createNamedQuery("promociones-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<TipoChequera> findTipoChequera(Integer codigo, String moneda) {
        Query query = manager.createNamedQuery("tipochequera-por-codigo");
        query.setParameter("MONEDA", null != moneda ? moneda : Consts.SQL_NULL);
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Parentesco> findParentescos(String codigo) {
        Query query = manager.createNamedQuery("parentesco-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : Consts.SQL_NULL);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<TipoFormaPagoInteres> findTiposFormaPagoInteres(Integer codigo) {
        Query query = manager.createNamedQuery("tipos-forma-pago-interes-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public Iterable<Frecuencia> findFrecuencias(Integer codigo) {
        Query query = manager.createNamedQuery("frecuencias-por-codigo");
        query.setParameter("CODIGO", null != codigo ? codigo : 0);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public TasaDia findTasaDia(String moneda, Integer rangoFinalDias) throws NoResultException {
        Query query = manager.createNamedQuery("tasaDia-por-codigo");
        query.setParameter("MONEDA", moneda);
        query.setParameter("RANGO_FINAL_DIAS", rangoFinalDias);
        query.setMaxResults(Consts.ONE_RESULT);
        return (TasaDia) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public TasaInteres findTasaInteresPorCodigo(String codigo) throws NoResultException {
        Query query = manager.createNamedQuery("tasaInteres-por-codigo");
        query.setParameter("CODIGO", codigo);
        return (TasaInteres) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public TipoFormaEnBlanco findTipoFormaEnBlanco(String moneda, Integer tipoForma) throws NoResultException {
        Query query = manager.createNamedQuery("tipoForma-por-codigo");
        query.setParameter("MONEDA", moneda);
        query.setParameter("TIPO_FORMA", null != tipoForma ? tipoForma : 0);
        return (TipoFormaEnBlanco) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public List<PlanFuturoCrece> findPlanFuturoCrece(String moneda, Boolean estado) {
        Query query = manager.createNamedQuery("planFuturoCrece-por-moneda-estado");
        query.setParameter("MONEDA", moneda);
        query.setParameter("ESTADO", estado);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public Cuenta findCuentaByNumeroCuenta(String numeroCuenta) throws NoResultException {
    	Query query = manager.createNamedQuery("cuenta-por-numero-cuenta");
        query.setParameter("NUMERO_CUENTA", numeroCuenta);
    	return (Cuenta) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public CuentaParaEditar findCuentaParaEditarByNumeroCuenta(String numeroCuenta) throws NoResultException {
    	Query query = manager.createNamedQuery("cuenta-para-editar-por-numero-cuenta");
        query.setParameter("NUMERO_CUENTA", numeroCuenta);
    	return (CuentaParaEditar) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public CuentaParaEditar findCuentaParaEditarById(CuentaId id) throws NoResultException {
    	Query query = manager.createNamedQuery("cuenta-para-editar-por-id");
        query.setParameter("ID", id);
    	return (CuentaParaEditar) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public Cuenta findCuentaById(Integer digitoIdentificador, Integer agencia, Integer correlativo, Integer digitoVerificador) {
    	CuentaId id = new CuentaId(digitoIdentificador, agencia, correlativo, digitoVerificador);
    	return manager.find(Cuenta.class, id);
    }
    
    @Transactional(readOnly = true)
    public Cuenta findCuentaById(CuentaId id) {
    	return manager.find(Cuenta.class, id);
    }
    
    @Transactional(readOnly = true)
    public CuentaAdicional findCuentaAdicionalById(CuentaId id) {
    	return manager.find(CuentaAdicional.class, id);
    }

    @Transactional(readOnly = true)
    public boolean existsCuentaAdicionalById(CuentaId id) {
        final CriteriaBuilder cb = manager.getCriteriaBuilder();
        final CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        final Root<CuentaAdicional> from = cq.from(CuentaAdicional.class);
        cq.select(cb.count(from));
        cq.where(cb.equal(from.get("id"), id));
        final TypedQuery<Long> tq = manager.createQuery(cq);
        return tq.getSingleResult() > 0;
    }
    
    @Transactional(readOnly = true)
    public List<CuentaServicioElectronico> findServiciosElectronicosByCuenta(Integer digitoIdentificador, Integer agencia, Integer correlativo, Integer digitoVerificador) {
    	Query query = manager.createNamedQuery("servicios-electronicos-por-id-cuenta");
    	query.setParameter("DIGITO_IDENTIFICADOR", digitoIdentificador);
    	query.setParameter("AGENCIA", agencia);
    	query.setParameter("CORRELATIVO", correlativo);
    	query.setParameter("DIGITO_VERIFICADOR", digitoVerificador);
    	return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public List<PersonaChequera> findPersonasChequeraByCuentaId(CuentaId id) {
    	Query query = manager.createNamedQuery("personas-chequera-por-id-cuenta");
    	query.setParameter("DIGITO_IDENTIFICADOR", id.getDigitoIdentificador());
    	query.setParameter("AGENCIA", id.getAgencia());
    	query.setParameter("CORRELATIVO", id.getCorrelativo());
    	query.setParameter("DIGITO_VERIFICADOR", id.getDigitoVerificador());
    	return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public List<PersonaMancomunada> findPersonasMancomunadasByCuentaId(CuentaId id) {
    	Query query = manager.createNamedQuery("personas-mancomunadas-por-id-cuenta");
    	query.setParameter("ID", id);
    	return query.getResultList();
    }	

    @Transactional(readOnly = true)
    public PlazoFijo findCuentaPlazoFijoById(CuentaId id) {
    	return (PlazoFijo) manager.find(PlazoFijo.class, id);
    }

    @Transactional(readOnly = true)
    public List<CuentaTraslado> findCuentasTrasladoByCuentaId(CuentaId id) {
        Query query = manager.createNamedQuery("cuentas-traslados-por-id-cuenta");
        query.setParameter("DIGITO_IDENTIFICADOR", id.getDigitoIdentificador());
        query.setParameter("AGENCIA", id.getAgencia());
        query.setParameter("CORRELATIVO", id.getCorrelativo());
        query.setParameter("DIGITO_VERIFICADOR", id.getDigitoVerificador());
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public boolean existsAddressAssociatedToAccount(String tipoIdentificacion, String identificacion, Integer codigo) {
        ClienteId id = new ClienteId(tipoIdentificacion, identificacion);
        final CriteriaBuilder cb = manager.getCriteriaBuilder();
        final CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        final Root<Cuenta> from = cq.from(Cuenta.class);
        cq.select(cb.count(from));
        cq.where(cb.equal(from.get("cliente").get("id"), id), cb.equal(from.get("direccionCorrespondiente"), codigo));
        final TypedQuery<Long> tq = manager.createQuery(cq);
        return tq.getSingleResult() > 0;
    }

    @Transactional(readOnly = true)
    public ProductoEspecial findProductoEspecialByCuentaId(CuentaId id) throws NoResultException {
        final CriteriaBuilder cb = manager.getCriteriaBuilder();
        final CriteriaQuery<ProductoEspecial> cq = cb.createQuery(ProductoEspecial.class);
        final Root<ProductoEspecial> from = cq.from(ProductoEspecial.class);
        cq.select(from);
        cq.where(cb.equal(from.get("id").get("cuenta"), id));
        final TypedQuery<ProductoEspecial> query = manager.createQuery(cq);
        return query.getSingleResult();
    }

    /** DP NativeNamedQueries **/

    @Transactional(readOnly = true)
    public boolean containsCuentaPorClienteProducto(String tipoDocumento, String documento, Integer producto, Integer subProducto, String moneda, List<String> estados) {
        Query query = manager.createNamedQuery("sql-contiene-cuentas-por-cliente-producto");
        query.setParameter("TIPO_DOCUMENTO", tipoDocumento);
        query.setParameter("DOCUMENTO", documento);
        query.setParameter("PRODUCTO", producto);
        query.setParameter("SUBPRODUCTO", null != subProducto ? subProducto : 0);
        query.setParameter("MONEDA", null != moneda ? moneda : Consts.SQL_NULL);
        query.setParameter("ESTADOS", null != estados ? estados : Arrays.asList(EstadoCuenta.ACTIVA.getEstado()));
        Integer response = (Integer) query.getSingleResult();
        return response > 0;
    }

    @Transactional(readOnly = true)
    public CalculoDigitoVerificador findCalculoDigitoVerificador(Integer codigo) throws NoResultException {
        Query query = manager.createNamedQuery("sql-calculo-digito-verificador-por-codigo");
        query.setParameter("CODIGO", codigo);
        return (CalculoDigitoVerificador) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public RegistroControl findRegistroControl(String empresa) throws NoResultException {
        Query query = manager.createNamedQuery("sql-registro-control-por-empresa");
        query.setParameter("EMPRESA", empresa);
        return (RegistroControl) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public List<Firma> findFirmasByNumeroCuenta(String numeroCuenta) {
        Query query = manager.createNamedQuery("sql-firmas-por-numero-cuenta", Firma.class);
        query.setParameter("NUMERO_CUENTA", numeroCuenta);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public Chequera findChequeraByNumeroCuenta(String numeroCuenta) {
        Query query = manager.createNamedQuery("sql-chequera-por-numero-cuenta", Chequera.class);
        query.setParameter("NUMERO_CUENTA", numeroCuenta);
        return (Chequera) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public CuentaParaPermiso findCuentaParaPermisoById(CuentaId id) throws NoResultException {
        Query query = manager.createNamedQuery("sql-cuenta-para-permiso", CuentaParaPermiso.class);
        query.setParameter("DIGITO_IDENTIFICADOR", id.getDigitoIdentificador());
    	query.setParameter("AGENCIA", id.getAgencia());
    	query.setParameter("CORRELATIVO", id.getCorrelativo());
    	query.setParameter("DIGITO_VERIFICADOR", id.getDigitoVerificador());
        return (CuentaParaPermiso) query.getSingleResult();
    }
    
    @Transactional(readOnly = true)
    public boolean existsBeneficiarioFinalByCuentaId(CuentaId id) {
        Query query = manager.createNamedQuery("sql-existe-beneficiario-final-por-cuenta");
        query.setParameter("DIGITO_IDENTIFICADOR", id.getDigitoIdentificador());
    	query.setParameter("AGENCIA", id.getAgencia());
    	query.setParameter("CORRELATIVO", id.getCorrelativo());
    	query.setParameter("DIGITO_VERIFICADOR", id.getDigitoVerificador());
    	Integer response = (Integer) query.getSingleResult();
        return response > 0;
    }

    /** TRX **/

    @Transactional(readOnly = true)
    public List<TransaccionEquivalente> findTransaccionEquivalente(String equivalente) {
        Query query = manager.createNamedQuery("sql-transaccion-equivalente");
        query.setParameter("EQUIVALENTE", null != equivalente ? equivalente : Consts.SQL_NULL);
        return query.getResultList();
    }

    @Transactional(readOnly = true)
    public ContenidoTransaccion findContenidoTransaccion(Integer codigoTransaccion) throws NoResultException {
        Query query = manager.createNamedQuery("sql-contenido-por-transaccion");
        query.setParameter("CODIGO_TRANSACCION", codigoTransaccion);
        return (ContenidoTransaccion) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public MensajeError findMensajeError(Integer codigoError) throws NoResultException {
        Query query = manager.createNamedQuery("mensajeError-por-codigo");
        query.setParameter("CODIGO", codigoError);
        return (MensajeError) query.getSingleResult();
    }

    /** Security **/

    @Transactional(readOnly = true)
    public EquivalenciaPermiso findEquivalenciaPermiso(String nombreEquivalente) throws NoResultException {
        Query query = manager.createNamedQuery("equivalencia-permiso-por-nombre-equivalente");
        query.setParameter("NOMBRE_EQUIVALENTE", nombreEquivalente);
        query.setMaxResults(Consts.ONE_RESULT);
        return (EquivalenciaPermiso) query.getSingleResult();
    }

    @Transactional(readOnly = true)
    public boolean containsPermisoFuncionario(String empresa, Integer supervisor, String tabla, Integer permiso) {
        Query query = manager.createNamedQuery("sql-contiene-permiso-por-funcionario");
        query.setParameter("CODIGO_EMPRESA", empresa);
        query.setParameter("CODIGO_SUPERVISOR", supervisor);
        query.setParameter("CODIGO_TABLA", tabla);
        query.setParameter("CODIGO_PERMISO", permiso);
        Integer response = (Integer) query.getSingleResult();
        return response > 0;
    }

    @Transactional(readOnly = true)
    public SupervisorOperacion findSupervisor(String empresa, Integer codigo) throws NoResultException {
        Query query = manager.createNamedQuery("supervisor-operacion-por-id");
        query.setParameter("CODIGO_EMPRESA", empresa);
        query.setParameter("CODIGO", codigo);
        return (SupervisorOperacion) query.getSingleResult();
    }

    /** ValidationsInternal **/

    @Transactional(readOnly = true)
    public Iterable<EjecutivoNegocio> findEjecutivosNoSonClientes(String empresa, Integer codigo) {
        Iterable<Integer> clientes = this.findCodigosClientesEmpleados();
        Iterable<EjecutivoNegocio> fuente = this.findEjecutivosNegocio(empresa, codigo);
        List<EjecutivoNegocio> response = new ArrayList<>();
        for (EjecutivoNegocio so : fuente) {
            boolean found = false;
            for (Integer codigoCliente : clientes) {
                if (so.getId().getCodigo().compareTo(codigoCliente) == 0) {
                    found = true;
                    break;
                }
                found = false;
            }
            if (!found) {
                response.add(so);
            }
        }
        return response;
    }

    @Transactional(readOnly = true)
    public Iterable<NivelGeografico> findDireccion(String nombreBarrio) {
        Parametro paisDefault = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_PAIS_DEFAULT);
        return this.findDireccion(paisDefault.getValor(), nombreBarrio);
    }

    @Transactional(readOnly = true)
    public ProductoDTO findProducto(Integer producto, Integer subProducto) throws ResourceNotFoundException {
        Producto p = this.findProductoById(producto, subProducto);
        if (null == p) {
            throw new ResourceNotFoundException();
        }
        TipoFormaEnBlanco tf = null;
        if (null != p.getTipoForma() && p.getTipoForma().compareTo(0) > 0) {
            tf = this.findTipoFormaEnBlanco(p.getMoneda().getCodigo(), p.getTipoForma());
        }
        return new ProductoDTO(p, tf);
    }

    @Transactional(readOnly = true)
    public SupervisorOperacion findSupervisorOperacionDefault(String empresa) throws ResourceNotFoundException {
        SupervisorOperacion response = null;
        Authentication auth = this.getAuthentication();
        if (null == auth || (auth instanceof AnonymousAuthenticationToken)) {
            throw new ResourceNotFoundException(ErrorMessage.SUPERVISOR_OPERACION_NO_DISPONIBLE);
        }
        CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
        if (null == cajero.getCodigoFuncionario() || cajero.getCodigoFuncionario().compareTo(0) == 0) {
            try {
                response = this.findSupervisorOperacion(empresa, cajero.getUsuario());
            } catch (NoResultException nre) {
                response = this.findSupervisorOperacionJefe(empresa, cajero.getAgencia(), cajero.getJornada());
            }
        } else {
            response = new SupervisorOperacion();
            SupervisorOperacionId id = new SupervisorOperacionId();
            id.setCodigoEmpresa(cajero.getEmpresaFuncionario());
            id.setCodigo(cajero.getCodigoFuncionario());
            response.setId(id);
            response.setNombre(cajero.getNombreFuncionario());
        }
        return response;
    }

    @Transactional(readOnly = true)
    public Agencia findAgenciaDefault(String empresa) throws ResourceNotFoundException {
        Authentication auth = this.getAuthentication();
        if (null == auth || (auth instanceof AnonymousAuthenticationToken)) {
            throw new ResourceNotFoundException(ErrorMessage.AGENCIA_NO_DISPONIBLE);
        }
        CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
        return this.findAgencia(empresa, cajero.getAgencia());
    }

    @Transactional(readOnly = true)
    public TipoProducto findTipoProductoById(Integer codigo) throws NoSuchElementException {
        return this.findTipoProductos(codigo).iterator().next();
    }
    
    @Transactional(readOnly = true)
    public List<ServicioElectronico> findServiciosElectronicosByCuentaId(Integer digitoIdentificador, Integer agencia, Integer correlativo, Integer digitoVerificador) {
    	List<ServicioElectronico> response = null;
    	List<CuentaServicioElectronico> cses = this.findServiciosElectronicosByCuenta(digitoIdentificador, agencia, correlativo, digitoVerificador);
    	if (null != cses && !cses.isEmpty()) {
    		response = new ArrayList<>();
    		for (CuentaServicioElectronico cse : cses) {
    			response.add(new ServicioElectronico(cse));
			}
    	}
    	return response;
    }
    
    @Transactional(readOnly = true)
	public Integer[] findFechaOperacionAS400(String empresa) {
    	Integer[] response = new Integer[] {0 , 0, 0};
		Date fechaOperacion = null;
		try {
			RegistroControl rc = this.findRegistroControl(empresa);
			fechaOperacion = Consts.getFechaOperacion(rc.getFecha());
		} catch (NoResultException mre) {
			return response;
		} catch (ParseException pe) {
			return response;
		}
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(fechaOperacion);
		return new Integer[] { calendar.get(Calendar.DAY_OF_MONTH), calendar.get(Calendar.MONTH) + 1, calendar.get(Calendar.YEAR) };
	}

    /** Repository **/

    @Transactional(readOnly = true)
    public Iterable<ProductoResumen> findProductoResumenByMonedaAndTipoProducto(String moneda, Integer tipoProducto) {
        if (null == moneda) {
            moneda = Consts.SQL_NULL;
        }
        if (null == tipoProducto) {
            tipoProducto = 0;
        }
        return productoResumenRepository.findProductoResumenByMonedaAndTipoProducto(moneda, tipoProducto);
    }

    @Transactional(readOnly = true)
    public ProductoResumen findProductoResumenById(Integer producto, Integer subProducto) {
        ProductoId id = new ProductoId(producto, subProducto);
        return productoResumenRepository.findProductoResumenById(id);
    }
    
    private boolean isEmpty(String str) {
    	return (null == str || str.isEmpty());
    }

    private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

}
