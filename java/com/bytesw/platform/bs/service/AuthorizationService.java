package com.bytesw.platform.bs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.clientes.SupervisorOperacionRepository;
import com.bytesw.platform.bs.dao.plataforma.IntentoFallidoRepository;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.bs.helper.TramaServiceHelper;
import com.bytesw.platform.bs.queue.exception.MQAccessException;
import com.bytesw.platform.bs.queue.service.BaseJmsMQService;
import com.bytesw.platform.eis.bo.clientes.EquivalenciaPermiso;
import com.bytesw.platform.eis.bo.clientes.SupervisorOperacion;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.plataforma.IntentoFallido;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.identifier.IntentoFallidoId;
import com.bytesw.platform.eis.dto.AuthorizationRequestDTO;
import com.bytesw.platform.eis.dto.AuthorizationResponseDTO;
import com.bytesw.platform.eis.dto.PermisoDTO;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.security.authentication.dao.ByteDaoAuthenticationProvider;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;
import com.bytesw.platform.utilities.ParameterPlatform;
import com.bytesw.platform.utilities.trama.exception.InvalidSizeException;
import com.bytesw.platform.utilities.trama.exception.NullException;
import com.bytesw.platform.utilities.trama.exception.UnknownException;

import java.security.Key;
import java.security.KeyStore;
import java.util.Base64;

import javax.annotation.Resource;
import javax.crypto.Cipher;
import javax.persistence.NoResultException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@Service
public class AuthorizationService {
	
	protected final Log logger = LogFactory.getLog(getClass());

	@Resource
	private IntentoFallidoRepository intentoFallidoRepository;
	
	@Resource
	private SupervisorOperacionRepository supervisorOperacionRepository;
	
	@Autowired
	private CatalogoService catalogoService;
	
	@Autowired
	private MnemonicoService mnemonicoService;
	
	@Autowired
	private TramaServiceHelper tramaServiceHelper;
	
	@Autowired
	private BaseJmsMQService baseJmsMQService;
	
	@Autowired
	@Qualifier("byteDaoAuthenticationProvider")
	private DaoAuthenticationProvider daoAuthenticationProvider;
	
	@Value("${web-app.queue.input-autorizacion-remota}")
	private String inputAutorizacionRemota;
	
	@Value("${web-app.queue.output-autorizacion-remota}")
    private String outputAutorizacionRemota;
	
	@Value("${web-app.keystore.name}")
	private String keystoreName;
	
	@Value("${web-app.keystore.password}")
    private String keystorePassword;
	
	@Value("${web-app.keystore.alias-name}")
	private String keystoreAliasName;
	
	@Value("${web-app.keystore.alias-password}")
    private String keystoreAliasPassword;
	
	private static int NIVEL = 1;
	private static String SUPERVISOR_INACTIVO = "I";
	private static String SUPERVISOR_CANCELADO = "C";
	
	@Transactional(readOnly = true)
	public PermisoDTO findEquivalenciaPermiso(String codigo) throws ServiceAccessException {
		EquivalenciaPermiso equivalenciaPermiso = null;
		try {
			equivalenciaPermiso = catalogoService.findEquivalenciaPermiso(codigo);
		} catch (NoResultException nre) {
			nre.printStackTrace();
			throw new ServiceAccessException(ErrorMessage.PERMISO_NO_DISPONIBLE);
		}
		Parametro empresa = mnemonicoService.findParametroPlataforma(ParameterPlatform.PARAM_EMPRESA);
		PermisoDTO response = new PermisoDTO(equivalenciaPermiso);
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		CajeroDTO cajero = (CajeroDTO) ((Usuario) auth.getPrincipal()).getInfoAdicional();
        response.setUsuario(cajero.getUsuario());
        response.setAgencia(cajero.getAgencia());
        response.setEmpresa(empresa.getValor());
        if (null != cajero && cajero.isFuncionario()) {
        	if (cajero.getNivelFuncionario().compareTo(NIVEL) == 0) {
        		response.setRequierePassword(true);
        		response.setSupervisor(cajero.getCodigoFuncionario());
        	} else {
        		boolean requierePassword = catalogoService.containsPermisoFuncionario(empresa.getValor(), cajero.getCodigoFuncionario(), equivalenciaPermiso.getCodigoAplicacion(), equivalenciaPermiso.getCodigoPermiso());
        		response.setRequierePassword(requierePassword);
        		if (requierePassword) {
        			response.setSupervisor(cajero.getCodigoFuncionario());
        		}
        	}
        }
		return response;
	}
	
	@Transactional
	public boolean validatePassword(PermisoDTO permiso) throws ServiceAccessException {
		SupervisorOperacion supervisor = catalogoService.findSupervisor(permiso.getEmpresa(), permiso.getSupervisor());
		IntentoFallido intento = null;
		IntentoFallidoId id = new IntentoFallidoId();
		id.setEmpresa(permiso.getEmpresa());
		id.setSupervisor(permiso.getSupervisor());
		if (supervisor.getEstado().equals(SUPERVISOR_INACTIVO) || supervisor.getEstado().equals(SUPERVISOR_CANCELADO)) {
			throw new ServiceAccessException(ErrorMessage.FUNCIONARIO_INACTIVO);
		}
		if (this.validatePassword(permiso.getUsuario().trim(), permiso.getPassword())) {
			intento = new IntentoFallido();
			intento.setId(id);
			intento.setIntentos(0);
			intentoFallidoRepository.save(intento);
			return true;
		}
		intento = intentoFallidoRepository.findById(id);
		if (null == intento) {
			intento = new IntentoFallido();
			intento.setId(id);
			intento.setIntentos(1);
		} else {
			intento.setIntentos(intento.getIntentos() + 1);
			if (intento.getIntentos().compareTo(3) == 0) {
				supervisor.setEstado(SUPERVISOR_INACTIVO);
				supervisorOperacionRepository.save(supervisor);
				logger.info("Disabled [" + supervisor.getNombre() + "]");
				intento.setIntentos(0);
			}
		}
		intentoFallidoRepository.save(intento);
		throw new ServiceAccessException(ErrorMessage.FUNCIONARIO_PASSWORD_INCORRECTO);
	}
	
	private boolean validatePassword(String username, String password) {
	    try {
	        logger.info("Validando Password: " + password);
	        KeyStore ks = KeyStore.getInstance("JKS");
	        ks.load(new ClassPathResource(keystoreName).getInputStream(), keystorePassword.toCharArray());
	        Key key = ks.getKey(keystoreAliasName, keystoreAliasPassword.toCharArray());
	        logger.info("Algoritmo: " + key.getAlgorithm());
	        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
	        cipher.init(Cipher.DECRYPT_MODE, key);
	        
	        byte[] bytes = Base64.getDecoder().decode(password.getBytes());
	        byte[] pass =  cipher.doFinal(bytes);
	        String passwordText = new String(pass);
	        logger.info(passwordText);
	        
	        return ((ByteDaoAuthenticationProvider) daoAuthenticationProvider).validatePassword(username, passwordText);
        } catch (Exception e) {
            e.printStackTrace();
        }
	    return false;
	}
	
	public AuthorizationResponseDTO solicitarAutorizacionRemota(AuthorizationRequestDTO req) throws ServiceAccessException {
		String key = System.currentTimeMillis() + "000";
		try {
			req.setKey(new Long(key)); // KEY LENGTH = 16
			String trama = tramaServiceHelper.getTramaFromDTO(req);
			logger.info("AuthorizationService.write.solicitar [" + inputAutorizacionRemota + " - "  + trama + "]");
			this.baseJmsMQService.write(inputAutorizacionRemota, trama);
			trama = this.baseJmsMQService.read(outputAutorizacionRemota, key);
			logger.info("AuthorizationService.read.solicitar [" + outputAutorizacionRemota + " - "  + trama + "]");
			if (null == trama) {
				logger.info("AuthorizationService.read.solicitar [timeout]");
				AuthorizationResponseDTO response = new AuthorizationResponseDTO();
				response.setKey(req.getKey());
				this.cancelarAutorizacionRemota(response);
				throw new ServiceAccessException(ErrorMessage.QUEUE_TIME_OUT);
			}
			return (AuthorizationResponseDTO) tramaServiceHelper.getDTOFromTrama(trama, new AuthorizationResponseDTO());
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
	
	public AuthorizationResponseDTO revisarAutorizacionRemota(AuthorizationResponseDTO req) throws ServiceAccessException {
		try {
			String key = req.getKey().toString();
			String trama = this.baseJmsMQService.read(outputAutorizacionRemota, key, 1);
			logger.info("AuthorizationService.read.revisar [" + outputAutorizacionRemota + " - "  + trama + "]");
			return (AuthorizationResponseDTO) tramaServiceHelper.getDTOFromTrama(trama, new AuthorizationResponseDTO());
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
	
	public AuthorizationResponseDTO cancelarAutorizacionRemota(AuthorizationResponseDTO req) throws ServiceAccessException {
		AuthorizationResponseDTO response = new AuthorizationResponseDTO();
		try {
			String key = req.getKey().toString();
			req.setError(9);
			req.setDescripcion(Consts.EMPTY);
			String trama = tramaServiceHelper.getTramaFromDTO(req);
			logger.info("AuthorizationService.write.cancelar [" + outputAutorizacionRemota + " - "  + trama + "]");
			this.baseJmsMQService.write(outputAutorizacionRemota, key, trama);
			response.setError(0);
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
		return response;
	}
	
}
