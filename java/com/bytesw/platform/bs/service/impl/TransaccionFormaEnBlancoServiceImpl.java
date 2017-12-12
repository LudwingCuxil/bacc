package com.bytesw.platform.bs.service.impl;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.TramaServiceHelper;
import com.bytesw.platform.bs.queue.exception.MQAccessException;
import com.bytesw.platform.bs.queue.service.BaseJmsMQService;
import com.bytesw.platform.bs.service.TransaccionFormaEnBlancoService;
import com.bytesw.platform.eis.dto.depositos.TrxFormaEnBlancoRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TrxFormaEnBlancoResponseDTO;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.trama.exception.InvalidSizeException;
import com.bytesw.platform.utilities.trama.exception.NullException;
import com.bytesw.platform.utilities.trama.exception.UnknownException;

@Service
public class TransaccionFormaEnBlancoServiceImpl implements TransaccionFormaEnBlancoService {

	protected final Log logger = LogFactory.getLog(getClass());
	
	@Autowired
	private TramaServiceHelper tramaServiceHelper;
	
	@Autowired
	private BaseJmsMQService baseJmsMQService;
	
	@Value("${web-app.queue.input-forma-en-blanco}")
	private String inputFormaEnBlanco;
	
	@Value("${web-app.queue.output-forma-en-blanco}")
    private String outputFormaEnBlanco;

	@Override
	public TrxFormaEnBlancoResponseDTO procesar(TrxFormaEnBlancoRequestDTO req) throws ServiceAccessException {
		String key = null;
		try {
			req.setKey(System.currentTimeMillis());
			key = req.getKey().toString();
			key = key.substring(0, key.length() - 1);
			req.setKey(new Long(key)); // KEY LENGTH = 12
			String trama = tramaServiceHelper.getTramaFromDTO(req);
			this.baseJmsMQService.write(inputFormaEnBlanco, trama);
			trama = this.baseJmsMQService.read(outputFormaEnBlanco, key);
			return (TrxFormaEnBlancoResponseDTO) tramaServiceHelper.getDTOFromTrama(trama, new TrxFormaEnBlancoResponseDTO());
		} catch (NullException ne) {
			ne.printStackTrace();
           	throw new ServiceAccessException(ErrorMessage.ERROR_PARAMETRO_VALOR_NULO);
        } catch (InvalidSizeException ise) {
        	ise.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_PARAMETRO_LONGITUD_INCORRECTA);
        } catch (UnknownException ue) {
        	ue.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_PARAMETRO_NO_SE_ENCONTRO);
        } catch (MQAccessException mqae) {
        	mqae.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_AL_INTENTAR_LEER_COLA_AS400);
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_AL_INTENTAR_LEER_COLA_AS400);
        }
	}
	
}
