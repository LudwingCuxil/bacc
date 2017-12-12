package com.bytesw.platform.bs.service;

import java.math.BigDecimal;
import java.util.Date;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.plataforma.CampoAdicionalRepository;
import com.bytesw.platform.bs.dao.plataforma.ValorAdicionalRepository;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.plataforma.CampoAdicional;
import com.bytesw.platform.eis.bo.plataforma.Entidad;
import com.bytesw.platform.eis.bo.plataforma.ValorAdicional;
import com.bytesw.platform.eis.bo.plataforma.dominio.TipoCampo;
import com.bytesw.platform.eis.bo.plataforma.identifier.CampoAdicionalId;
import com.bytesw.platform.eis.bo.plataforma.identifier.ValorAdicionalId;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;

@Service
public class CampoAdicionalService {

	protected final Log logger = LogFactory.getLog(getClass());
	
    private CampoAdicionalRepository campoAdicionalRepository;
    private ValorAdicionalRepository valorAdicionalRepository;
    
    @Autowired
    public CampoAdicionalService(CampoAdicionalRepository campoAdicionalRepository, ValorAdicionalRepository valorAdicionalRepository){
    	this.campoAdicionalRepository = campoAdicionalRepository;
    	this.valorAdicionalRepository = valorAdicionalRepository;
    }
	
	@Transactional(rollbackFor = ServiceAccessException.class)
	public void saveCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
		if (null == valor) {
			logger.info("EL VALOR ES NULO, NO SE GRABA: " + entidad + " - " + campo);
			return;
		}
		Entidad e = new Entidad();
		e.setCodigo(entidad);
		
		CampoAdicionalId campoId = new CampoAdicionalId();
		campoId.setEntidad(e);
		campoId.setCodigo(campo);

		CampoAdicional campoAdicional = campoAdicionalRepository.findById(campoId);

		ValorAdicionalId valorId = new ValorAdicionalId();
		valorId.setIdentificador(id);
		valorId.setCampo(campoId);

		ValorAdicional valorAdicional = new ValorAdicional();
		valorAdicional.setSecuencia(1);
		valorAdicional.setId(valorId);

		String valorFormateado = null;
		if (TipoCampo.A == campoAdicional.getTipo()) {
			valorFormateado = valor.toString();
		} else if (TipoCampo.B == campoAdicional.getTipo()) {
			valorFormateado = ((Boolean) valor) ? Consts.SI : Consts.NO;
		} else if (TipoCampo.N == campoAdicional.getTipo()) {
			valorFormateado = ((Number) valor).toString();
		} else if (TipoCampo.F == campoAdicional.getTipo()) {
			valorFormateado = Consts.FORMAT_AAAAMMDD.format((Date) valor);
		} else if (TipoCampo.D == campoAdicional.getTipo()) {
			Integer decimales = campoAdicional.getDecimales() > 0 ? campoAdicional.getDecimales() : 1;
			BigDecimal bd = new BigDecimal(valor.toString());
			Long l = bd.longValue() * decimales;
			valorFormateado = l.toString();
		} else {
			valorFormateado = valor.toString();
		}

		if (valorFormateado != null && !valorFormateado.trim().isEmpty()) {
			valorAdicional.setValor(valorFormateado);
			try {
				valorAdicionalRepository.save(valorAdicional);
			} catch (Exception er) {
				er.printStackTrace();
				throw new ServiceAccessException(ErrorMessage.ERROR_AL_GUARDAR_CAMPO_ADICIONAL);
			}
		} else {
			logger.info("CAMPO ES VACIO, NO SE GRABA: " + entidad + " - " + campo);
		}
	}
	
	@Transactional(readOnly = true)
	public Object getValorCampoAdicional(String entidad, String campo, String id) {
		Entidad e = new Entidad();
		e.setCodigo(entidad);
		
		CampoAdicionalId campoAdicionalId = new CampoAdicionalId();
		campoAdicionalId.setEntidad(e);
		campoAdicionalId.setCodigo(campo);
		
		CampoAdicional campoAdicional = campoAdicionalRepository.findById(campoAdicionalId);
		
		ValorAdicionalId valorAdicionalId = new ValorAdicionalId();
		valorAdicionalId.setIdentificador(id);
		valorAdicionalId.setCampo(campoAdicionalId);
		
		ValorAdicional valorAdicional = valorAdicionalRepository.findById(valorAdicionalId);
		
		if (valorAdicional != null && valorAdicional.getValor() != null && !valorAdicional.getValor().trim().isEmpty()) {
			try {
	            if (TipoCampo.A == campoAdicional.getTipo()) {
	                return valorAdicional.getValor();
	            } else if (TipoCampo.B == campoAdicional.getTipo()) {
	                return Consts.SI.equals(valorAdicional.getValor());
	            } else if (TipoCampo.N == campoAdicional.getTipo()) {
	                return new Integer(valorAdicional.getValor());
	            } else if (TipoCampo.F == campoAdicional.getTipo()) {
	                return Consts.FORMAT_AAAAMMDD.parse(valorAdicional.getValor());
	            } else if (TipoCampo.D == campoAdicional.getTipo()) {
	                BigDecimal bd = new BigDecimal(valorAdicional.getValor());
	                if (campoAdicional.getDecimales() > 0) {
	                    bd = bd.divide(new BigDecimal(campoAdicional.getDecimales()));
	                }
	                return bd;
	            }
			} catch (Exception exception) {
            	exception.printStackTrace();
            }
        }
		return null;
	}
	
	@Transactional(rollbackFor = ServiceAccessException.class)
	public void updateCampoAdicional(String entidad, String campo, String id, Object valor) throws ServiceAccessException {
		if (null == valor) {
			logger.info("EL VALOR ES NULO, NO SE CAMBIA: " + entidad + " - " + campo);
			return;
		}
		Entidad e = new Entidad();
		e.setCodigo(entidad);
		
		CampoAdicionalId campoAdicionalId = new CampoAdicionalId();
		campoAdicionalId.setEntidad(e);
		campoAdicionalId.setCodigo(campo);
		
		ValorAdicionalId valorAdicionalId = new ValorAdicionalId();
		valorAdicionalId.setIdentificador(id);
		valorAdicionalId.setCampo(campoAdicionalId);
		
		CampoAdicional campoAdicional = campoAdicionalRepository.findById(campoAdicionalId);
		
		String valorFormateado = null;
		if (TipoCampo.A == campoAdicional.getTipo()) {
			valorFormateado = valor.toString();
		} else if (TipoCampo.B == campoAdicional.getTipo()) {
			valorFormateado = ((Boolean) valor) ? Consts.SI : Consts.NO;
		} else if (TipoCampo.N == campoAdicional.getTipo()) {
			valorFormateado = ((Number) valor).toString();
		} else if (TipoCampo.F == campoAdicional.getTipo()) {
			valorFormateado = Consts.FORMAT_AAAAMMDD.format((Date) valor);
		} else if (TipoCampo.D == campoAdicional.getTipo()) {
			Integer decimales = campoAdicional.getDecimales() > 0 ? campoAdicional.getDecimales() : 1;
			BigDecimal bd = new BigDecimal(valor.toString());
			Long l = bd.longValue() * decimales;
			valorFormateado = l.toString();
		} else {
			valorFormateado = valor.toString();
		}

		ValorAdicional valorAdicional = valorAdicionalRepository.findById(valorAdicionalId);
		if (null == valorAdicional) {
			valorAdicional = new ValorAdicional();
			valorAdicional.setSecuencia(1);
			valorAdicional.setId(valorAdicionalId);
		}
		
		if (valorFormateado != null && !valorFormateado.trim().isEmpty()) {
			valorAdicional.setValor(valorFormateado);
			try {
				valorAdicionalRepository.save(valorAdicional);
			} catch (Exception er) {
				er.printStackTrace();
				throw new ServiceAccessException(ErrorMessage.ERROR_AL_ACTUALIZAR_CAMPO_ADICIONAL);
			}
		} else {
			logger.info("CAMPO ES VACIO, NO SE CAMBIA: " + entidad + " - " + campo);
		}
	}
	
	@Transactional
	public void deleteCampoAdicional(String entidad, String campo, String id) {
		Entidad e = new Entidad();
		e.setCodigo(entidad);
		
		CampoAdicionalId campoAdicionalId = new CampoAdicionalId();
		campoAdicionalId.setEntidad(e);
		campoAdicionalId.setCodigo(campo);
		
		ValorAdicionalId valorAdicionalId = new ValorAdicionalId();
		valorAdicionalId.setIdentificador(id);
		valorAdicionalId.setCampo(campoAdicionalId);
		
		ValorAdicional valorAdicional = valorAdicionalRepository.findById(valorAdicionalId);
		if (null != valorAdicional) {
			valorAdicionalRepository.delete(valorAdicional);
		}
	}
	 
}
