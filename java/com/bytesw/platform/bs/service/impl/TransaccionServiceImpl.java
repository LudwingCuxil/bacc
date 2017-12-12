package com.bytesw.platform.bs.service.impl;

import java.util.List;

import javax.persistence.NoResultException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bytesw.platform.bs.dao.depositos.TransaccionDao;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.TramaServiceHelper;
import com.bytesw.platform.bs.helper.TransaccionHelper;
import com.bytesw.platform.bs.queue.exception.MQAccessException;
import com.bytesw.platform.bs.queue.service.BaseJmsMQService;
import com.bytesw.platform.bs.service.CatalogoService;
import com.bytesw.platform.bs.service.TransaccionService;
import com.bytesw.platform.eis.bo.depositos.ContenidoTransaccion;
import com.bytesw.platform.eis.bo.depositos.MensajeError;
import com.bytesw.platform.eis.bo.depositos.TransaccionEquivalente;
import com.bytesw.platform.eis.dto.depositos.ContenidoRequestDTO;
import com.bytesw.platform.eis.dto.depositos.GeneraIndiceRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TransaccionRequestDTO;
import com.bytesw.platform.eis.dto.depositos.TransaccionResponseDTO;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.trama.exception.InvalidSizeException;
import com.bytesw.platform.utilities.trama.exception.NullException;
import com.bytesw.platform.utilities.trama.exception.UnknownException;

@Service
public class TransaccionServiceImpl implements TransaccionService {

	protected final Log logger = LogFactory.getLog(getClass());
	
	@Autowired
	private TransaccionDao dao;
	
	@Autowired
	private TransaccionHelper transaccionHelper;
	
	@Autowired
	private CatalogoService catalogoService;
	
	@Autowired
	private TramaServiceHelper tramaServiceHelper;
	
	@Autowired
	private BaseJmsMQService baseJmsMQService;
	
	@Value("${web-app.queue.input-debito-por-apertura}")
	private String inputDebitoPorApertura;
	
	@Value("${web-app.queue.output-debito-por-apertura}")
    private String outputDebitoPorApertura;
	
	@Value("${web-app.queue.input-genera-indice}")
    private String inputGeneraIndiceCuenta;
	
	private static final Integer ERROR = 1;

	@Override
	public TransaccionResponseDTO procesarTransaccion(TransaccionRequestDTO req) throws ServiceAccessException {
		TransaccionResponseDTO response = new TransaccionResponseDTO();
		String key = null;
		try {
			if (null == req.getContenido()) {
				throw new ServiceAccessException(ErrorMessage.ERROR_VALORES_REQUERIDOS);
			}
			TransaccionEquivalente trx = this.findTransaccionEquivalente(req.getEquivalente(), req.getMoneda(), req.getTipoProducto());
			Integer codigoTransaccion = trx.getCodigoTransaccion();
			ContenidoTransaccion contenido = null;
			try {
				logger.info("find conttrx => " + codigoTransaccion + " eq " + req.getEquivalente() + ":" + req.getMoneda() + ":" + req.getTipoProducto());
				contenido = catalogoService.findContenidoTransaccion(codigoTransaccion);
			} catch (NoResultException nre) {
				throw new ServiceAccessException(ErrorMessage.ERROR_NO_SE_ENCONTRO_CONTENIDO_DE_TRANSACCION);
			}
			Object[] object = new Object[Consts.CONTENIDOS_LENGTH];
			Long correlativo = this.getCorrelativoTransaccion(contenido.getCorrelativoTransaccion());
			if (contenido.getNumeroCuenta().compareTo(0) > 0) {
				object[contenido.getNumeroCuenta() - 1] = req.getContenido().getTrx01();
			}
			if (contenido.getNumeroDocumento().compareTo(0) > 0) {
				object[contenido.getNumeroDocumento() - 1] = correlativo.compareTo(0l) < 0 ? correlativo : req.getContenido().getTrx02();
			}
			if (contenido.getEfectivo().compareTo(0) > 0) {
				object[contenido.getEfectivo() - 1] = req.getContenido().getTrx03();
			}
			if (contenido.getValor().compareTo(0) > 0) {
				object[contenido.getValor() - 1] = req.getContenido().getTrx04();
			}
			if (contenido.getFecha().compareTo(0) > 0) {
				object[contenido.getFecha() - 1] = req.getContenido().getTrx05();
			}
			if (contenido.getContraCuenta().compareTo(0) > 0) {
				object[contenido.getContraCuenta() - 1] = req.getContenido().getTrx06();
			}
			if (contenido.getMotivo().compareTo(0) > 0) {
				object[contenido.getMotivo() - 1] = null != trx.getCodigoMotivo() ? trx.getCodigoMotivo() : req.getContenido().getTrx07();
			}
			if (contenido.getSaldoLibreta().compareTo(0) > 0) {
				object[contenido.getSaldoLibreta() - 1] = req.getContenido().getTrx08();
			}
			if (contenido.getNumeroLibreta().compareTo(0) > 0) {
				object[contenido.getNumeroLibreta() - 1] = req.getContenido().getTrx09();
			}
			if (contenido.getNumeroLinea().compareTo(0) > 0) {
				object[contenido.getNumeroLinea() - 1] = req.getContenido().getTrx10();
			}
			
			List<ContenidoRequestDTO> trm = transaccionHelper.getContenidoRequestDTO(object);
			req.setCodigoTransaccion(codigoTransaccion);
			req.setValoresNumericos(trm);
		
			req.setKey(System.currentTimeMillis());
			key = req.getKey().toString();
			key = key.substring(0, key.length() - 1);
			req.setKey(new Long(key));
			String trama = tramaServiceHelper.getTramaFromDTO(req);
			this.baseJmsMQService.write(inputDebitoPorApertura, trama);
			trama = this.baseJmsMQService.read(outputDebitoPorApertura, key);
			response = (TransaccionResponseDTO) tramaServiceHelper.getDTOFromTrama(trama, new TransaccionResponseDTO());
			if (null != response && response.getCodigo().compareTo(ERROR) == 0) {
				MensajeError error = null;
				try {
					error = catalogoService.findMensajeError(response.getCodigoRechazo());
				} catch (NoResultException nre) {
					error = null;
				}
				response.setMensajeError(null != error && null != error.getDescripcion() ? error.getDescripcion().trim() : null);
			}
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
        } catch (ServiceAccessException sae) {
        	throw sae;
        } catch (Exception e) {
        	e.printStackTrace();
        	throw new ServiceAccessException(ErrorMessage.ERROR_PROCESANDO_TRANSACCION);
        }
		return response;
	}
	
	@Override
	public boolean generarIndiceCuenta(GeneraIndiceRequestDTO req) throws ServiceAccessException {
		try {
			req.setKey(0l);
			String trama = tramaServiceHelper.getTramaFromDTO(req);
			this.baseJmsMQService.write(inputGeneraIndiceCuenta, trama);
			return true;
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
        }
	}
	
	@Override
	public TransaccionEquivalente findTransaccionEquivalente(String equivalente, String moneda, Integer tipoProducto) throws ServiceAccessException {
		logger.info("find trx => [" + equivalente + "]" );
		List<TransaccionEquivalente> trx = catalogoService.findTransaccionEquivalente(equivalente);
		TransaccionEquivalente response = new TransaccionEquivalente();
		if (null == trx || trx.isEmpty()) {
			throw new ServiceAccessException(ErrorMessage.TRANSACCION_NO_DISPONIBLE);
		}
		logger.info("equals trx => [" + equivalente + " - " + trx.size() + ", " + moneda + ", " + tipoProducto + "]");
		Integer prioridad = 0;
		response = transaccionHelper.getTransaccionEquivalente(trx, moneda, tipoProducto, prioridad);
		if (null == response) {
			throw new ServiceAccessException(ErrorMessage.TRANSACCION_NO_DISPONIBLE);
		}
		return response;
	}
	
	@Override
	public Long getCorrelativoTransaccion(String trxdc) throws ServiceAccessException {
		Long correlativo = 0l;
		try {
			correlativo = dao.getCorrelativoTransaccion(trxdc);
			if (null == correlativo) {
				throw new ServiceAccessException(ErrorMessage.ERROR_RECUPERAR_CORRELATIVO_TRANSACCION);
			}
			correlativo += 1l;
			dao.updateCorrelativoTransaccion(trxdc, correlativo);
		} catch (ServiceAccessException te) {
			te.printStackTrace();
			throw te;
		} catch (Exception e) {
			e.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.ERROR_CALCULO_CORRELATIVO_TRANSACCION);
		}
		return correlativo;
	}
	
}
