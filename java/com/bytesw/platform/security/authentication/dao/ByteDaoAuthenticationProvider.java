package com.bytesw.platform.security.authentication.dao;

import java.security.Key;
import java.security.KeyStore;
import java.util.Base64;
import java.util.Date;

import javax.crypto.Cipher;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;

import com.bytesw.platform.WebAppProperties;
import com.bytesw.platform.bs.dao.depositos.CuentaDao;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.security.core.userdetails.SecurityDetailsService;
import com.bytesw.platform.utilities.Constants;
import com.bytesw.platform.utilities.PasswordEncodeUtil;
import com.ibm.as400.access.AS400;
import com.ibm.as400.access.AS400Message;
import com.ibm.as400.access.AS400SecurityException;

public class ByteDaoAuthenticationProvider extends DaoAuthenticationProvider {

	protected final Log logger = LogFactory.getLog(getClass());
	
	private static final String PASSWORD_INVALIDO = "110400000";
	private static final String PASSWORD_EXPIRED = "CPF22E4";
	private static final String ALGORITHM = "RSA/ECB/PKCS1Padding";
	private static final String CHARSET_NAME = "UTF-8";
	
	private static final String NUEVO_PASSWORD_ES_INVALIDO = "New password is not valid";
	private static final String NUEVO_PASSWORD_ES_INVALIDO_CODIGO = "[110400001]";
	
	@Autowired
	@Qualifier("cuentaIntegrationDao")
	private CuentaDao dao;
	
	@Autowired
	private WebAppProperties properties;
	
	@Override
	protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		SecurityDetailsService service = (SecurityDetailsService) super.getUserDetailsService();
		Usuario user = null;
		try {
			user = (Usuario) userDetails;
			if (!properties.getAuth().isPreferEncoder()) {
				this.additionalAuthenticationChecksAS400(user, userDetails, authentication);
			} else {
				super.additionalAuthenticationChecks(userDetails, authentication);
			}
			CajeroDTO cashier = dao.getCajeroInformacion(authentication.getPrincipal().toString());
			if (null == cashier) {
				throw new AuthenticationServiceException(this.getUserNotRegisteredAsCashierMessage());
			}
			user.setInfoAdicional(cashier);
			user.setLastLogin(new Date());
			user.setFailedLoginAttempts(0);
		} catch (BadCredentialsException bce1) {
			try {
				service.verifyFailedLoginAttempts(user);
			} catch (BadCredentialsException bce2) {
				throw new BadCredentialsException(this.getFailedAttemptMessage(bce2.getMessage()));
			}
			throw new BadCredentialsException(this.getBadCredentialsMessage());
		} finally {
			if (null != user) {
				service.updateUser(user);
			}
		}
	}
	
	public void additionalAuthenticationChecksAS400(Usuario user, UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		Object salt = null;
		if (super.getSaltSource() != null) {
			salt = super.getSaltSource().getSalt(userDetails);
		}
		if (authentication.getCredentials() == null) {
			logger.debug("Authentication failed: no credentials provided");
			throw new BadCredentialsException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
		}
		String presentedPassword = authentication.getCredentials().toString();
		String password = null;
		try {
			password = this.decode(presentedPassword);
		} catch (Exception e) {
			e.printStackTrace();
			throw new BadCredentialsException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
		}
		String passwordSHA = PasswordEncodeUtil.encodePassword(password, Constants.ENCRYPTION_ALGORIGTHM);
		logger.info(presentedPassword + ":" + password + ":" + passwordSHA + ":" + salt);
		AS400 as400 = null;
		String message = PASSWORD_INVALIDO;
		try {
			as400 = new AS400();
			as400.setSystemName(properties.getJndi().getAs400Auth());
			boolean ok = as400.validateSignon(userDetails.getUsername(), password);
			if (ok) {
				user.setPassword(passwordSHA);
			} else {
				throw new BadCredentialsException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
			}
		} catch (AS400SecurityException exc) {
			logger.error(exc.getReturnCode() + " " + exc.getMessage());
			message = getErrorCode(exc);
			if (message.contains(PASSWORD_EXPIRED)) {
				user.setPassword(passwordSHA);
				user.setPasswordReset(true);
			} else {
				throw new BadCredentialsException(message + exc.getMessage());
			}
		} catch (Exception exc) {
			logger.error(exc.getMessage());
			throw new BadCredentialsException(message + exc.getMessage());
		} finally {
			try {
				if (as400 != null) {
					as400.disconnectAllServices();
				}
			} catch (Exception e) {
				logger.error("Error al desconectar servicios de AS400: " + e.getMessage());
			}
		}
	}
	
	public boolean validatePassword(String username, String password){
		AS400 as400 = null;
		try {
			as400 = new AS400();
			as400.setSystemName(properties.getJndi().getAs400Auth());
			return as400.validateSignon(username, password);
		} catch (AS400SecurityException exc) {
			logger.error(exc.getReturnCode() + " " + exc.getMessage(), exc);
		} catch (Exception exc) {
			logger.error(exc.getMessage(), exc);
		} finally {
			try {
				if (as400 != null) {
					as400.disconnectAllServices();
				}
			} catch (Exception e) {
				logger.error("Error al desconectar servicios de DB2/AS400: " + e.getMessage(), e);
			}
		}
		return false;
	}
	
	public String encode(String password) throws Exception {
		KeyStore ks = KeyStore.getInstance("JKS");
	    ks.load(new ClassPathResource(properties.getKeystore().getName()).getInputStream(), properties.getKeystore().getPassword().toCharArray());
	    Key key = ks.getCertificate(properties.getKeystore().getAliasName()).getPublicKey();
	    
	    Cipher cipher = Cipher.getInstance(ALGORITHM);
	    cipher.init(Cipher.ENCRYPT_MODE, key);
	    
	    byte[] bytes = cipher.doFinal(password.getBytes(CHARSET_NAME));
	    byte[] encode = Base64.getEncoder().encode(bytes);
	    return new String(encode);
	}
	
	public String decode(String password) throws Exception {
		KeyStore ks = KeyStore.getInstance("JKS");
	    ks.load(new ClassPathResource(properties.getKeystore().getName()).getInputStream(), properties.getKeystore().getPassword().toCharArray());
	    Key key = ks.getKey(properties.getKeystore().getAliasName(), properties.getKeystore().getAliasPassword().toCharArray());
	   
	    Cipher cipher = Cipher.getInstance(ALGORITHM);
	    cipher.init(Cipher.DECRYPT_MODE, key);
	        
	    byte[] bytes = Base64.getDecoder().decode(password.getBytes());
	    byte[] decode = cipher.doFinal(bytes);
	    return new String(decode, CHARSET_NAME);
	}
	
	private String getErrorCode(AS400SecurityException exc) {
		if (exc.getMessageList() != null) {
			for (AS400Message m : exc.getMessageList()) {
				return "[" + m.getID() + "]" + m.getText();
			}
		} else if (exc.getMessage() != null && exc.getMessage().contains(NUEVO_PASSWORD_ES_INVALIDO)) {
			return NUEVO_PASSWORD_ES_INVALIDO_CODIGO + exc.getMessage();
		}
		return PASSWORD_INVALIDO; // default
	}
	
	private String getBadCredentialsMessage(){
		return super.messages.getMessage("ByteDaoAuthenticationProvider.badCredentials", "invalid password");
	}
	
	private String getUserNotRegisteredAsCashierMessage(){
		return super.messages.getMessage("ByteDaoAuthenticationProvider.userNotRegisteredAsCashier", "user not registered as cashier");
	}
	
	private String getFailedAttemptMessage(String message){
		return super.messages.getMessage("ByteDaoAuthenticationProvider.".concat(message), "invalid password, (locked | alert) user by failed attempt");
	}
	
}
