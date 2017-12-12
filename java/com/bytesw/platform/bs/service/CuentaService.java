package com.bytesw.platform.bs.service;

import java.util.Date;
import java.util.List;

import javax.persistence.NoResultException;

import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.depositos.CuentaSeccionPendiente;
import com.bytesw.platform.eis.bo.depositos.ProductoEspecial;
import com.bytesw.platform.eis.bo.depositos.TransaccionEquivalente;
import com.bytesw.platform.eis.bo.depositos.identifier.CuentaId;
import com.bytesw.platform.eis.bo.plataforma.CampoProducto;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.dto.depositos.CuentaDTO;
import com.bytesw.platform.eis.dto.depositos.FirmanteDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaChequeraDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaMancomunadaDTO;
import com.bytesw.platform.eis.dto.depositos.PlanFuturoCreceDTO;
import com.bytesw.platform.eis.dto.depositos.ProductoDTO;
import com.bytesw.platform.eis.dto.depositos.TasaInteresCalculoDTO;
import com.bytesw.platform.utilities.SeccionFormularioCuenta;

public interface CuentaService {
    
	public Iterable<CuentaResumen> findAllCuentas(String tipoDocumento, String documento, List<Integer> excluir, List<String> estados, List<String> monedas);
	
	public Date findFechaOperacion(String empresa) throws ResourceNotFoundException, ServiceAccessException;
	
	public TasaInteresCalculoDTO findTasaInteresResumen(CuentaDTO cuenta, String empresa) throws ResourceNotFoundException, ServiceAccessException;
	
	public TransaccionEquivalente findTransaccionEquivalente(String equivalente, String moneda, Integer tipoProducto) throws ServiceAccessException;
	
	public List<ServicioElectronico> findServiciosElectronicos(TipoPersona tipoPersona, Integer producto, Integer subProducto) throws ServiceAccessException;
	
	public List<PlanFuturoCreceDTO> findPlanFuturoCrece(String moneda) throws ServiceAccessException;
	
	public CampoProducto findCampoProducto(Integer producto, Integer subproducto, String campo);

	public ProductoEspecial findProductoEspecialByCuentaId(CuentaId id) throws NoResultException;
	
	public boolean validate(CuentaDTO cuenta, String empresa, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException;
	
	public boolean validateClienteProducto(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public boolean validateDatoGeneral(CuentaDTO cuenta, String empresa) throws ServiceAccessException, AuthorizationRequiredException;
	
	public boolean validatePlazoFijo(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public boolean validateBeneficiario(String tipoDocumento, String numeroDocumento) throws ServiceAccessException;
	
	public boolean validatePersonaMancomunada(PersonaMancomunadaDTO persona) throws ServiceAccessException;
	
	public boolean validatePersonaAutorizada(PersonaChequeraDTO persona) throws ServiceAccessException;
	
	public boolean validateFirmante(FirmanteDTO firmante) throws ServiceAccessException;
	
	public boolean isClienteBeneficiarioFinal(String numeroCuenta) throws ResourceNotFoundException;
	
	public void validateParametroProducto(CuentaDTO cuenta, ProductoDTO producto, SeccionFormularioCuenta seccion) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO save(String empresa, CuentaDTO cuenta) throws ServiceAccessException;
	
	public void afterTransactionSave(CuentaDTO cuenta);
	
	public CuentaResumen findCuentaToPortal(String numeroCuenta) throws ResourceNotFoundException;
	
	public CuentaDTO findCuentaToUpdateNombre(String numeroCuenta) throws ResourceNotFoundException;
	
	public CuentaDTO findCuentaToUpdateDatoGeneral(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdateDatoInteres(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdateChequera(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdateBeneficiarios(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdateBeneficiariosFinales(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdateFirmas(String numeroCuenta) throws ResourceNotFoundException;
	
	public CuentaDTO findCuentaToUpdateServiciosElectronicos(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToUpdatePersonasAsociadas(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO findCuentaToViewPlazoFijo(String numeroCuenta) throws NoResultException;

	public CuentaDTO findCuentaToUpdateCuentasTraslados(String numeroCuenta) throws NoResultException;
	
	public CuentaDTO updateNombre(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateDatoGeneral(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateChequera(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateDatoInteres(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateBeneficiarios(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateBeneficiariosFinales(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateFirmas(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updateServiciosElectronicos(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaDTO updatePersonasAsociadas(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;

	public CuentaDTO updateCuentasTraslados(CuentaDTO cuenta) throws ServiceAccessException, AuthorizationRequiredException;
	
	public CuentaSeccionPendiente findSeccionesPendientesByCuenta(String numeroCuenta) throws ResourceNotFoundException;
	
}
