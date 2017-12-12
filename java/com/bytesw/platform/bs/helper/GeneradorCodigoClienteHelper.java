package com.bytesw.platform.bs.helper;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.bytesw.platform.bs.dao.clientes.ClienteDao;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.service.MnemonicoService;
import com.bytesw.platform.eis.bo.clientes.ParametroGeneral;
import com.bytesw.platform.eis.dto.clientes.ClienteDTO;
import com.bytesw.platform.utilities.ErrorMessage;

@Component
public class GeneradorCodigoClienteHelper {

	private static final String GENERACION_CODIGO_CLIENTE_CORRELATIVO = "A";
	private static final int LONGITUD_CODIGO = 18;

	@Autowired
	@Qualifier("clienteIntegrationDao")
	private ClienteDao clienteDao;
	
	@Autowired
	private MnemonicoService mnemonicoService;

	public GeneradorCodigoClienteHelper() {
		super();
	}

	public ClienteDTO generateCode(String empresa, ClienteDTO c) throws ServiceAccessException {
		ParametroGeneral params = mnemonicoService.findParametroGeneral();
		if (GENERACION_CODIGO_CLIENTE_CORRELATIVO.equals(params.getTipoAsignacionCodigoCliente())) {
			Long correlativo = clienteDao.getUltimoCorrelativoCodigoCliente(c) + 1;
			clienteDao.updateCorrelativoCodigoCliente(correlativo);
			c.setTipoDocumento("");
			c.setDocumento(StringUtils.leftPad(correlativo.toString(), LONGITUD_CODIGO, ' '));
			return c;
		} else {
			throw new ServiceAccessException(ErrorMessage.METODO_DE_GENERACION_CODIGO_CLIENTE_NO_IMPLEMENTADO);
		}
	}
}