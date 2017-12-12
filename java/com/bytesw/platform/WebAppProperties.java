package com.bytesw.platform;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "web-app")
public class WebAppProperties {

	private Auth auth;
	private Jndi jndi;
	private Queue queue;
	private KeyStore keystore;
	
	public Auth getAuth() {
		return auth;
	}
	public void setAuth(Auth auth) {
		this.auth = auth;
	}
	public boolean isAuthEnabled() {
		return (null != auth && auth.isEnabled());
	}
	public Jndi getJndi() {
		return jndi;
	}
	public void setJndi(Jndi jndi) {
		this.jndi = jndi;
	}
	public Queue getQueue() {
		return queue;
	}
	public void setQueue(Queue queue) {
		this.queue = queue;
	}
	public KeyStore getKeystore() {
		return keystore;
	}
	public void setKeystore(KeyStore keystore) {
		this.keystore = keystore;
	}
	
	public static class Auth {
		
		private Integer accessTokenValiditySeconds = 1800;
		private Integer refreshTokenValiditySeconds = 3600;
		private Integer failedLoginAttempts = 3;
		private Integer daysValidityPassword = 10;
		private Integer userInactivityDays = 30;
		private boolean preferEncoder = false;
		private boolean enabled = true;
		private String resourceAccess = "fullyAuthenticated";
		private boolean supportMultipleSessions = true;
		
		public Integer getAccessTokenValiditySeconds() {
			return accessTokenValiditySeconds;
		}
		public void setAccessTokenValiditySeconds(Integer accessTokenValiditySeconds) {
			this.accessTokenValiditySeconds = accessTokenValiditySeconds;
		}
		public Integer getRefreshTokenValiditySeconds() {
			return refreshTokenValiditySeconds;
		}
		public void setRefreshTokenValiditySeconds(Integer refreshTokenValiditySeconds) {
			this.refreshTokenValiditySeconds = refreshTokenValiditySeconds;
		}
		public Integer getFailedLoginAttempts() {
			return failedLoginAttempts;
		}
		public void setFailedLoginAttempts(Integer failedLoginAttempts) {
			this.failedLoginAttempts = failedLoginAttempts;
		}
		public Integer getDaysValidityPassword() {
			return daysValidityPassword;
		}
		public void setDaysValidityPassword(Integer daysValidityPassword) {
			this.daysValidityPassword = daysValidityPassword;
		}
		public Integer getUserInactivityDays() {
			return userInactivityDays;
		}
		public void setUserInactivityDays(Integer userInactivityDays) {
			this.userInactivityDays = userInactivityDays;
		}
		public boolean isPreferEncoder() {
			return preferEncoder;
		}
		public void setPreferEncoder(boolean preferEncoder) {
			this.preferEncoder = preferEncoder;
		}
		public boolean isEnabled() {
			return enabled;
		}
		public void setEnabled(boolean enabled) {
			this.enabled = enabled;
		}
		public String getResourceAccess() {
			return resourceAccess;
		}
		public void setResourceAccess(String resourceAccess) {
			this.resourceAccess = resourceAccess;
		}
		public boolean isSupportMultipleSessions() {
			return supportMultipleSessions;
		}
		public void setSupportMultipleSessions(boolean supportMultipleSessions) {
			this.supportMultipleSessions = supportMultipleSessions;
		}
		
	}
	
	public static class Jndi {
		
		private String as400Auth;
		private String as400Host;
		private String as400User;
		private String as400Pass;
		
		public String getAs400Auth() {
			return as400Auth;
		}
		public void setAs400Auth(String as400Auth) {
			this.as400Auth = as400Auth;
		}
		public String getAs400Host() {
			return as400Host;
		}
		public void setAs400Host(String as400Host) {
			this.as400Host = as400Host;
		}
		public String getAs400User() {
			return as400User;
		}
		public void setAs400User(String as400User) {
			this.as400User = as400User;
		}
		public String getAs400Pass() {
			return as400Pass;
		}
		public void setAs400Pass(String as400Pass) {
			this.as400Pass = as400Pass;
		}
		
	}
	
	public static class Queue {
		
		private String lib;
		private String libHuellaFoto;
		private Integer timeOut;
		private String inputFormaEnBlanco;
	    private String inputHuella;
	    private String inputDebitoPorApertura;
	    private String inputAutorizacionRemota;
	    private String inputGeneraIndice;
	    private String outputFormaEnBlanco;
	    private String outputHuella;
	    private String outputDebitoPorApertura;
	    private String outputAutorizacionRemota;
	    
		public String getLib() {
			return lib;
		}
		public void setLib(String lib) {
			this.lib = lib;
		}
		public String getLibHuellaFoto() {
			return libHuellaFoto;
		}
		public void setLibHuellaFoto(String libHuellaFoto) {
			this.libHuellaFoto = libHuellaFoto;
		}
		public Integer getTimeOut() {
			return timeOut;
		}
		public void setTimeOut(Integer timeOut) {
			this.timeOut = timeOut;
		}
		public String getInputFormaEnBlanco() {
			return inputFormaEnBlanco;
		}
		public void setInputFormaEnBlanco(String inputFormaEnBlanco) {
			this.inputFormaEnBlanco = inputFormaEnBlanco;
		}
		public String getInputHuella() {
			return inputHuella;
		}
		public void setInputHuella(String inputHuella) {
			this.inputHuella = inputHuella;
		}
		public String getInputDebitoPorApertura() {
			return inputDebitoPorApertura;
		}
		public void setInputDebitoPorApertura(String inputDebitoPorApertura) {
			this.inputDebitoPorApertura = inputDebitoPorApertura;
		}
		public String getInputAutorizacionRemota() {
			return inputAutorizacionRemota;
		}
		public void setInputAutorizacionRemota(String inputAutorizacionRemota) {
			this.inputAutorizacionRemota = inputAutorizacionRemota;
		}
		public String getInputGeneraIndice() {
			return inputGeneraIndice;
		}
		public void setInputGeneraIndice(String inputGeneraIndice) {
			this.inputGeneraIndice = inputGeneraIndice;
		}
		public String getOutputFormaEnBlanco() {
			return outputFormaEnBlanco;
		}
		public void setOutputFormaEnBlanco(String outputFormaEnBlanco) {
			this.outputFormaEnBlanco = outputFormaEnBlanco;
		}
		public String getOutputHuella() {
			return outputHuella;
		}
		public void setOutputHuella(String outputHuella) {
			this.outputHuella = outputHuella;
		}
		public String getOutputDebitoPorApertura() {
			return outputDebitoPorApertura;
		}
		public void setOutputDebitoPorApertura(String outputDebitoPorApertura) {
			this.outputDebitoPorApertura = outputDebitoPorApertura;
		}
		public String getOutputAutorizacionRemota() {
			return outputAutorizacionRemota;
		}
		public void setOutputAutorizacionRemota(String outputAutorizacionRemota) {
			this.outputAutorizacionRemota = outputAutorizacionRemota;
		}
	    
	}
	
	public static class KeyStore {
		
		private String name;
		private String password;
		private String aliasName;
		private String aliasPassword;
		
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
		public String getAliasName() {
			return aliasName;
		}
		public void setAliasName(String aliasName) {
			this.aliasName = aliasName;
		}
		public String getAliasPassword() {
			return aliasPassword;
		}
		public void setAliasPassword(String aliasPassword) {
			this.aliasPassword = aliasPassword;
		}
	    
	}
	
}
