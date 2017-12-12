package com.bytesw.platform.bs.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.queue.exception.MQAccessException;
import com.bytesw.platform.bs.queue.service.BaseJmsMQService;
import com.bytesw.platform.utilities.ErrorMessage;

@Service
public class HuellaFotoService {
  
	protected final Log logger = LogFactory.getLog(getClass());
	private final String TRANSACCTION = "C";
	private final int LECTURA = 4;
	private final int SI = 1;
	private final int NO = 0;

	@Autowired
	private BaseJmsMQService baseJmsMQService;
	
	@Value("${web-app.queue.lib-huella-foto}")
	private String libHuellaFoto;

	@Value("${web-app.queue.input-huella}")
	private String inputHuella;

	@Value("${web-app.queue.output-huella}")
	private String outputHuella;

	public boolean writeQueue(String ip, String cltdoc, String cldoc, String nombre, String tipo) throws ServiceAccessException {
		StringBuilder trama = buildMessage(ip, cltdoc, cldoc, nombre, tipo);
		try {
			logger.info("ip: " + formatKey(ip) + " trama: " + trama.toString());
			this.baseJmsMQService.write(libHuellaFoto, inputHuella, formatKey(ip), trama.toString());
			logger.info("respuesta : " + formatKey(ip));
		} catch (MQAccessException ex) {
			throw new ServiceAccessException(ErrorMessage.ERROR_PARAMETRO_VALOR_NULO);
		}
		return true;
	}
  
	public void readQueue(String ip) throws ServiceAccessException {
		try {
			this.baseJmsMQService.read(outputHuella, formatKey(ip));
		} catch (MQAccessException ex) {
			throw new ServiceAccessException(ErrorMessage.PARAMETROS_CLIENTES_NO_DISPONIBLE);
		}
	}
  
	public String formatKey(String ip) {
		return String.format("%1$-16s", ip);
	}

	public StringBuilder buildMessage(String ip, String cltdoc, String cldoc, String nombre, String tipo) {
		String key = String.format("%1$-16s", ip);
		StringBuilder trama = new StringBuilder();
		trama.append(key);
		trama.append(String.format("%1$1s", cltdoc));
		trama.append(String.format("%1$-18s", cldoc));
		trama.append(String.format("%1$-60s", nombre));
		trama.append(TRANSACCTION);
		trama.append(tipo);
		trama.append(LECTURA);
		trama.append(NO);
		trama.append(NO);
		trama.append(NO);
		trama.append(SI);
		trama.append(SI);
		trama.append(SI);
		trama.append(SI);
		trama.append(NO);
		trama.append(NO);
		trama.append(NO);
		return trama;
	}
	
}
