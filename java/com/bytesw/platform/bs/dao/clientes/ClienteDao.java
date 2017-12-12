package com.bytesw.platform.bs.dao.clientes;

import com.bytesw.platform.eis.bo.clientes.Cliente;
import com.bytesw.platform.eis.bo.clientes.GrupoEconomico;
import com.bytesw.platform.eis.dto.clientes.ClienteDTO;
import com.bytesw.platform.eis.dto.clientes.ClienteResumenDTO;
import com.bytesw.platform.eis.dto.clientes.DireccionDTO;
import com.bytesw.platform.eis.dto.clientes.DocumentoAperturaDTO;
import com.bytesw.platform.eis.dto.clientes.IndiceDTO;
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
import com.bytesw.platform.eis.dto.clientes.RegistroPersonasRequestDTO;

public interface ClienteDao {

	public ClienteResumenDTO getDatosRegistroPersonas(RegistroPersonasRequestDTO registroPersonaDTO);
	public Long getUltimoCorrelativoCodigoCliente(ClienteDTO clienteDTO);
	
	public void updateCorrelativoCodigoCliente(Long correlativo);
	
	// GRABA
	
	public Integer saveInformacionGeneralCliente(ClienteDTO clienteDTO);
	public Integer saveInformacionPersonaNatural(ClienteDTO clienteDTO);
	public Integer saveInformacionPersonaJuridica(ClienteDTO clienteDTO);
	public Integer saveNivelVentasPersonaJuridica(ClienteDTO clienteDTO);
	public Integer saveRepresentanteLegal(ClienteDTO clienteDTO);
	public Integer saveIndice(IndiceDTO indiceDTO);
	public Integer saveDireccion(DireccionDTO direccionDTO);
    public Integer saveInformacionGeneralClienteTemporal(ClienteDTO clienteDTO);
	public Integer saveDatosAdicionales(ClienteDTO clienteDTO);
	
	public void saveDocumentoApertura(DocumentoAperturaDTO documentoAperturaDTO);
	public void saveGrupoEconomico(GrupoEconomico grupoEconomico);

	// GRABA REFERENCIAS
	
	public Integer saveReferenciasLaborales(ReferenciaLaboralDTO referenciaDTO);
	public Integer saveReferenciasSeguros(ReferenciaSeguroDTO referenciaDTO);
	public Integer saveReferenciasCredito(ReferenciaCreditoDTO referenciaDTO);
	public Integer saveReferenciasCuentas(ReferenciaCuentaDTO referenciaDTO);
	public Integer saveReferenciasPersonalesFamiliares(ReferenciaPersonalFamiliarDTO referenciaDTO);
	public Integer saveReferenciasVehiculos(ReferenciaVehiculoDTO referenciaDTO);
	public Integer saveReferenciasDependientes(ReferenciaDependienteDTO referenciaDTO);
	public Integer saveReferenciasLaboralesConyugue(ReferenciaLaboralConyugueDTO referenciaDTO);
	public Integer saveReferenciasAccionistas(ReferenciaAccionistaDTO referenciaDTO);
	public Integer saveReferenciasComerciales(ReferenciaComercialDTO referenciaDTO);
	public Integer saveReferenciasPropiedades(ReferenciaPropiedadDTO referenciaDTO);
	public Integer saveReferenciasProveedores(ReferenciaProveedorDTO referenciaDTO);
	public Integer saveReferenciasTarjetasCredito(ReferenciaTarjetaCreditoDTO referenciaDTO);
	public Integer saveReferenciasConyugue(ReferenciaConyugueDTO referenciaDTO);
	public Integer saveReferenciasComerciante(ReferenciaComercianteDTO referenciaDTO);
	public Integer saveReferenciasComercianteDatosContador(ReferenciaComercianteDTO referenciaDTO);
	public Integer saveReferenciasParentestoEmpleados(ReferenciaParentescoEmpleadoDTO referenciaDTO);
	
	// GRABA CAMPOS ADICIONALES POR INSTALACION
	
	public Integer saveCamposBCH(ClienteDTO clienteDTO);
	
	// GRABA LOGS
	
    public Integer saveLogInformacionPersonaNatural(ClienteDTO clienteDTO);
    public Integer saveLogInformacionPersonaJuridica(ClienteDTO clienteDTO);
    public Integer saveLogDatosAdicionalesCliente(ClienteDTO clienteDTO);
    public Integer saveLogUsoRegistroPersonas(ClienteDTO clienteDTO);
    public void saveLogDatosGenerales(ClienteDTO clienteDTO);
    public void saveLogDatosGeneralesClientes(Cliente cliente);

    public void saveDireccionLog(DireccionDTO direccionDTO);

    // CAMBIOS
    
    public void updateNombre(ClienteDTO clienteDTO);
    public void updateId(ClienteDTO clienteDTO);
    public void updateNombrePersonaNatural(ClienteDTO clienteDTO);
    public void updateNombrePersonaJuridica(ClienteDTO clienteDTO);
    public void updateDatosGeneralesCliente(ClienteDTO clienteDTO);
    public void updateDatosGeneralesPersonaNatural(ClienteDTO clienteDTO);
    public void updateNumeroDependientes(ClienteDTO clienteDTO);
    public void updateDatosGeneralesPersonaJuridica(ClienteDTO clienteDTO);
    public void updateNivelVentasPersonaJuridica(ClienteDTO clienteDTO);
    public void updatePerfilEconomico(ClienteDTO clienteDTO);
    public void updateCamposBCH(ClienteDTO clienteDTO);
    public void updateRepresentanteLegal(ClienteDTO clienteDTO);
    public void updateRepresentanteLegalNombreCompleto(ClienteDTO clienteDTO);
    public void updateRepresentanteLegalPersonaJuridica(ClienteDTO clienteDTO);
    public void updateDatosAdicionales(ClienteDTO clienteDTO);
    public void updateDireccion(DireccionDTO direccionDTO);
    
    public void updatePerfilEconomicoAdicional(ClienteDTO clienteDTO);
    
    // CAMBIOS REFERENCIAS
    
    public void updateReferenciasDependientes(ReferenciaDependienteDTO referenciaDTO);
    public void updateReferenciasAccionista(ReferenciaAccionistaDTO referenciaDTO);
    public void updateReferenciasCredito(ReferenciaCreditoDTO referenciaDTO);
    public void updateReferenciasCuenta(ReferenciaCuentaDTO referenciaDTO);
    public void updateReferenciasPersonalesFamiliares(ReferenciaPersonalFamiliarDTO referenciaDTO);
    public void updateReferenciasVehiculos(ReferenciaVehiculoDTO referenciaDTO);
    public void updateReferenciasSeguros(ReferenciaSeguroDTO referenciaDTO);
    public void updateReferenciasLaborales(ReferenciaLaboralDTO referenciaDTO);
    public void updateReferenciasParentescoEmpleados(ReferenciaParentescoEmpleadoDTO referenciaParentescoEmpleadoDTO);
    public void updateReferenciasProveedores(ReferenciaProveedorDTO referenciaProveedorDTO);
    public void updateReferenciaComerciante(ReferenciaComercianteDTO referenciaComercianteDTO);
    public void updateReferenciasComercianteDatosContador(ReferenciaComercianteDTO referenciaDTO);

    // ELIMINA
    
    public void deleteIndice(IndiceDTO indiceDTO);
    public void deleteDocumentoApertura(DocumentoAperturaDTO documentoAperturaDTO);
    public void deleteDireccion(DireccionDTO DireccionDTO);
    public void deleteRepresentanteLegal(ClienteDTO clienteDTO);
    public void deleteGrupoEconomico(GrupoEconomico grupoEconomico);
    public void deleteGruposEconomicos(ClienteDTO clienteDTO);
    
    // ELIMINA REFERENCIAS
    
    public void deleteReferenciasDependientes(ReferenciaDependienteDTO referenciaDTO);
    public void deleteReferenciasAccionista(ReferenciaAccionistaDTO referenciaDTO);
    public void deleteReferenciasCredito(ReferenciaCreditoDTO referenciaDTO);
    public void deleteReferenciasCuenta(ReferenciaCuentaDTO referenciaDTO);
    public void deleteReferenciasPersonalesFamiliares(ReferenciaPersonalFamiliarDTO referenciaDTO);
    public void deleteReferenciasVehiculos(ReferenciaVehiculoDTO referenciaDTO);
    public void deleteReferenciasSeguros(ReferenciaSeguroDTO referenciaDTO);
    public void deleteReferenciasLaborales(ReferenciaLaboralDTO referenciaDTO);
    public void deleteReferenciasParentescoEmpleados(ReferenciaParentescoEmpleadoDTO referenciaParentescoEmpleadoDTO);
    public void deleteReferenciasProveedores(ReferenciaProveedorDTO referenciaProveedorDTO);
    public void deleteReferenciaComerciante(ReferenciaComercianteDTO referenciaComercianteDTO);
    public void deleteReferenciasComercianteDatosContador(ReferenciaComercianteDTO referenciaDTO);

}
