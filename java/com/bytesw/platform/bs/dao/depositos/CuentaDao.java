package com.bytesw.platform.bs.dao.depositos;

import java.util.List;

import com.bytesw.platform.eis.bo.depositos.CuentaResumen;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioDTO;
import com.bytesw.platform.eis.dto.depositos.BeneficiarioFinalDTO;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaDTO;
import com.bytesw.platform.eis.dto.depositos.CuentaResponseDTO;
import com.bytesw.platform.eis.dto.depositos.FirmanteDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaChequeraDTO;
import com.bytesw.platform.eis.dto.depositos.PersonaMancomunadaDTO;
import com.bytesw.platform.eis.dto.depositos.PlanFuturoCreceDTO;

public interface CuentaDao {

	public CajeroDTO getCajeroInformacion(String username);
	public Integer getCorrelativo(Integer tipoProducto, Integer agencia);
	public Integer saveCorrelativo(Integer tipoProducto, Integer agencia);
	public void updateCorrelativo(Integer tipoProducto, Integer agencia, Integer correlativo);
	public boolean existeCorrelativo(Integer tipoProducto, Integer agencia, Integer correlativo);
	public List<Integer> getListaCorrelativo(Integer tipoProducto, Integer agencia, Integer correlativo);
	public Integer getSiguienteCorrelativoBeneficiario(BeneficiarioDTO beneficiario);
	public Integer getSiguienteCorrelativoBeneficiarioFinal(BeneficiarioFinalDTO beneficiarioFinal);
	public Integer getSiguienteCorrelativoFirma(FirmanteDTO firmante);
	
	// GRABA 
	
	public Integer saveCuenta(CuentaDTO cuenta);
	public void saveCuentaInfoAdicional(CuentaDTO cuenta);
	public void saveCuentaInfoChequera(CuentaDTO cuenta);
	public void saveCuentaPersonaChequera(PersonaChequeraDTO personaChequera);
	public ClienteResumenDTO saveBeneficiario(BeneficiarioDTO beneficiario);
	public ClienteResumenDTO saveCuentaMancomunada(PersonaMancomunadaDTO personaMancomunada);
	public ClienteResumenDTO saveFirma(FirmanteDTO firmante);
	public void saveCuentaPlazoFijo(CuentaDTO cuenta);
	public void saveCuentaTasaInteresCertificado(CuentaDTO cuenta);
	public Integer savePlanFuturoCreceEncabezado(CuentaDTO cuenta);
	public void savePlanFuturoCreceDetalle(CuentaDTO cuenta, PlanFuturoCreceDTO planFuturoCrece, Integer correlativo);
	public void saveCuentaSolicitudChequera(CuentaDTO cuenta);
	public ClienteResumenDTO saveBeneficiarioFinal(BeneficiarioFinalDTO beneficiarioFinal);
	public void saveServicioElectronico(ServicioElectronico servicioElectronico);
	public void saveCuentaTraslado(CuentaResumen cuenta);
	
	// CAMBIOS 
	
	public void updateNombre(CuentaDTO cuenta);
	public void updateDatoGeneral(CuentaDTO cuenta);
	public void updateDatoGeneralAdicional(CuentaDTO cuenta);
	public void updateCuentaInfoChequera(CuentaDTO cuenta);
	public void updateCuentaPersonaChequera(PersonaChequeraDTO personaChequera);
	public void updateDatoInteres(CuentaDTO cuenta);
	public void updateBeneficiario(BeneficiarioDTO beneficiario);
	public void updateBeneficiarioFinal(BeneficiarioFinalDTO beneficiarioFinal);
	public void updateFirmaEncabezado(CuentaDTO cuenta);
	public void updateFirma(FirmanteDTO firmante);
	public void updateCuentaInfoAdicional(CuentaDTO cuenta);
	public void updateCuentaMancomunada(PersonaMancomunadaDTO personaMancomunada);
	
	// ELIMINA
	
	public void deleteCuentaPersonaChequera(PersonaChequeraDTO personaChequera);
	public void deleteBeneficiario(BeneficiarioDTO beneficiario);
	public void deleteBeneficiarioFinal(BeneficiarioFinalDTO beneficiarioFinal);
	public void deleteFirma(FirmanteDTO firmante);
	public void deleteServicioElectronico(CuentaDTO cuenta);
	public void deleteCuentaMancomunada(PersonaMancomunadaDTO personaMancomunada);
	public void deleteCuentasTraslados(CuentaDTO cuenta);
	
	// LOG
	
	public void saveLogReimpresion(CuentaResponseDTO cuenta);
	
}
