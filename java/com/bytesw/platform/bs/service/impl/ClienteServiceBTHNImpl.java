package com.bytesw.platform.bs.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.exception.AuthorizationRequiredException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.service.ClienteService;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.dto.clientes.ClienteDTO;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.ParameterPlatform;
import com.bytesw.platform.utilities.Permission;
import com.bytesw.platform.utilities.SeccionFormularioCliente;

@Service
public class ClienteServiceBTHNImpl extends ClienteServiceImpl implements ClienteService {

	@Override
	@Transactional(readOnly = true)
    public boolean validateTipoPersonaEIdentificacion(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        super.validateTipoPersonaEIdentificacion(cliente);
        if (TipoPersona.N == cliente.getTipoPersona()) {
        	this.validateIdentificacion(cliente.getTipoIdentificacion().getCodigo(), cliente.getIdentificacion());
        }
        
        // CAMBIO VALIDA EXISTE REGISTRO DE PERSONAS SI ES CEDULA DE IDENTIDAD
        
        Parametro registroPersona = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_REGISTRO_PERSONAS_TIPO_ID);
        if (cliente.getTipoIdentificacion().getCodigo().equals(registroPersona.getValor())) {
        	registroPersona = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_VERIFICAR_REGISTRO_PERSONAS);
        	if (Boolean.TRUE.equals(new Boolean(registroPersona.getValor()))) {
        		if (!catalogoService.existsEnRegistroNacional(cliente.getIdentificacion())) {
        			throw new AuthorizationRequiredException(Permission.NEXISRPE);
        		}
        	}
        }
        
        return true;
    }
    
    public boolean validateIdentificacion(String tipoIdentificacion, String identificacion) throws ServiceAccessException {
    	Parametro cedula = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_CEDULA);
        if (cedula.getValor().equals(tipoIdentificacion)) {
        	String[] partesCedula = identificacion.split(" ");
            String departamento = partesCedula[0].substring(0, 2);
            String municipio = partesCedula[0].substring(2, 4);
            boolean existMunicipio = catalogoService.existsMunicipioByDepartamentoAndCodigo(Integer.parseInt(departamento), Integer.parseInt(municipio));
            if (!existMunicipio) {
            	throw new ServiceAccessException(ErrorMessage.DEPARTAMENTO_MUNICPIO_NO_COINCIDE_CON_IDENTIFICACION);
            }
        }
    	return true;
    }

    @Override
    public boolean validateDatosGenerales(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        super.validateDatosGenerales(cliente);
        if (TipoPersona.N == cliente.getTipoPersona()) {
            Parametro cedula = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_CODIGO_CEDULA);
            if (cedula.getValor().equals(cliente.getTipoIdentificacion().getCodigo())) {
                String[] partesCedula = cliente.getIdentificacion().split(" ");
                if (Integer.parseInt(partesCedula[1]) != cliente.getAnioAlta() && !cliente.isAuthorized(SeccionFormularioCliente.DATOS_GENERALES.name(), "ANINOCOI")) { // CAMBIO POR WARNING
                    throw new ServiceAccessException(ErrorMessage.ANIO_NO_COINCIDE_CON_CEDULA);
                }
            }
        }
        return true;
    }

    @Override
    public boolean validatePerfilEconomico(ClienteDTO cliente) throws ServiceAccessException, AuthorizationRequiredException {
        super.validatePerfilEconomico(cliente);
        if (cliente.getPerfilEconomico().getSectorEconomico() == null || cliente.getPerfilEconomico().getSectorEconomico().getCodigo() == null || cliente.getPerfilEconomico().getTipoInstitucion() == 0 || cliente.getPerfilEconomico().getInstitucion() == 0) {
            throw new ServiceAccessException(ErrorMessage.SECTORES_BCH_REQUERIDOS);
        }
        return true;
    }

    @Override
    public boolean validateDatosAdicionales(ClienteDTO cliente) throws ServiceAccessException {
        super.validateDatosAdicionales(cliente);
        /*if (cliente.getDatosAdicionales() != null && (cliente.getDatosAdicionales().getTipoDatoAdicional() == null || isEmpty(cliente.getDatosAdicionales().getNumeroIdentificacion()))) {
            throw new CoreServiceAccessException(ErrorMessage.DATOS_ADICIONALES_SON_REQUERIDOS);
        }*/
        return true;
    }

    @Override
    protected void saveCamposAdicionalesPorInstalacion(String empresa, ClienteDTO clienteDTO) {
        super.saveCamposAdicionalesPorInstalacion(empresa, clienteDTO);
        super.dao.saveCamposBCH(clienteDTO);
    }
    
}