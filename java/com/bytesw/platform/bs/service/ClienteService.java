package com.bytesw.platform.bs.service;

import java.util.List;

import javax.persistence.NoResultException;

import com.bytesw.platform.eis.bo.clientes.*;
import com.bytesw.platform.eis.dto.clientes.*;
import org.springframework.data.domain.Pageable;

import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.utilities.SeccionFormularioCliente;

public interface ClienteService {
    
    public Iterable<ClienteResumen> findAll(SearchDTO searchDTO, Pageable page);
    
    public ClienteInformacionDTO findCliente(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public byte[] findAvatarByClienteId(String tipoIdentificacion, String identificacion);
    
    public ClienteResumen findClienteToPortal(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException;
    
    public Iterable<GrupoEconomico> findGrupoEconomicoByCliente(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException;
    
    public ClienteDTO findClienteToUpdateNombre(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteDTO findClienteToUpdateDatosGenerales(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteDTO findClienteToUpdateDependientes(String tipoIdentificacion, String identificacion);
    
    public ClienteDTO findClienteToUpdatePerfilEconomico(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteDTO findClienteToUpdateRepresentanteLegal(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteDTO findClienteToUpdateDatosAdicionales(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteDTO findClienteToUpdateDocumentosPresentados(String tipoIdentificacion, String identificacion);
    
    public ClienteDTO findClienteToUpdateDirecciones(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException;
    
    public ClienteDTO findClienteToUpdateReferencias(String tipoIdentificacion, String identificacion) throws ResourceNotFoundException;
    
    public ClienteDTO findClienteToUpdateReferenciasLaborales(String tipoIdentificacion, String identificacion)  throws ResourceNotFoundException;

    public ClienteDTO findClienteToUpdateReferenciaProveedor(String tipoIdentificacion, String identificacion)  throws ResourceNotFoundException;

    public ClienteDTO findClienteToUpdateReferenciaComerciante(String tipoIdentificacion, String identificacion)  throws ResourceNotFoundException;

    public boolean existsByIdentificacion(String tipoDeIdentificacion, String numeroIdentificacion);
    
    public boolean existsByNombre(String nombre);
    
    public boolean existsByNombreAndDoNotBeIdentifier(String nombre, String tipoDocumento, String documento);
    
	public boolean isClienteEnListaNegraPorIdentificacion(ClienteResumen cliente);

	public boolean isClienteEnListaNegraPorNombres(ClienteResumen cliente);
    
    public ClienteResumenDTO getDatosRegistroPersonas(String tipoIdentificacion, String identificacion) throws ServiceAccessException, AuthorizationRequiredException;
    
    public List<ParametroDetalle> getClaseCuentasReferencias() throws ServiceAccessException;
    
    public boolean validateSeccion(ClienteDTO cliente, SeccionFormularioCliente seccion) throws ServiceAccessException, AuthorizationRequiredException;
    
    public boolean validateTipoPersonaEIdentificacion(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public boolean validateIdentificacion(String tipoIdentificacion, String identificacion) throws ServiceAccessException;
    
    public boolean validateDatosGenerales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public boolean validatePerfilEconomico(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public boolean validateRepresentanteLegal(ClienteDTO cliente) throws ServiceAccessException;
    
    public boolean validateDatosAdicionales(ClienteDTO cliente) throws ServiceAccessException;
    
    public boolean validateDocumentos(ClienteDTO cliente) throws ServiceAccessException;
    
    public boolean validateDirecciones(ClienteDTO cliente) throws ServiceAccessException;

    public boolean validateAddressToDelete(DireccionDTO d) throws ServiceAccessException;
    
    public boolean validateReferencias(ClienteDTO cliente) throws ServiceAccessException;
    
    public boolean validateCambioDeNombre(ClienteDTO cliente) throws AuthorizationRequiredException;

    public boolean validateCambioDeId(ClienteDTO cliente) throws AuthorizationRequiredException;

    public ClienteDTO save(String empresa, ClienteDTO cliente) throws ServiceAccessException;
    
    public ClienteDTO saveReferencias(String empresa, ClienteDTO cliente) throws ServiceAccessException;
    
    public ClienteDTO saveLogCreacionCliente(String empresa, ClienteDTO cliente) throws ServiceAccessException;
    
    public boolean validarMascaraTipoDocumento(String mascara, String valor);
    
    public TipoEdadClienteDTO getTipoEdadCliente(Integer edad) throws ServiceAccessException;
    
    public void autorizaRegistroPersonas() throws AuthorizationRequiredException;

    // UPDATE
    
    public ClienteDTO updateNombre(ClienteDTO cliente, boolean validate) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateId(ClienteDTO cliente, boolean validate) throws ServiceAccessException, AuthorizationRequiredException;

    public ClienteDTO updateDatosGenerales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;

    public ClienteDTO updateDependientes(ClienteDTO cliente) throws ServiceAccessException;
    
    public ClienteDTO updatePerfilEconomico(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateRepresentanteLegal(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateDatosAdicionales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateDocumentosPresentados(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateDirecciones(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateReferencias(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateReferenciasLaborales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;
    
    public ClienteDTO updateReferenciaProveedor(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException;

    public ClienteDTO updateReferenciasComerciante(ClienteDTO cliente) throws ResourceNotFoundException, AuthorizationRequiredException;
    
    // RESOURCES
    
    public boolean updateHuellaFoto(String ip, String tipoDocumento, String documento, String nombre, String tipo) throws ServiceAccessException;
    
    public CambioSituacionEconomicaSeccion findDirtySection(String tipoIdentificacion, String identificacion) throws NoResultException;
    
    public ClienteResumen findClienteResumenById(String tipoIdentificacion, String identificacion);
    
    public ClienteSeccionPendiente findSeccionesPendientesByCliente(String tipoIdentificacion, String identificacion) throws NoResultException;

    public ClienteDTO preUpdatePerfilEconomico(ClienteDTO cliente, ClienteDTO oldClient, Cliente oldClmcte);
    public ClienteDTO preUpdateDatosGenerales(ClienteDTO clienteDTO, ClienteDTO oldClient, Cliente oldClmcte);
    public ClienteDTO preUpdateRepresentanteLegal(ClienteDTO cliente, Cliente oldClmcte);

    }
