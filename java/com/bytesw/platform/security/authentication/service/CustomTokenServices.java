package com.bytesw.platform.security.authentication.service;

import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.SpringSecurityMessageSource;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

public class CustomTokenServices extends org.springframework.security.oauth2.provider.token.DefaultTokenServices{
	
	protected MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor();
	private boolean supportMultipleSessions = false;
	
	@Override
	public OAuth2AccessToken createAccessToken(OAuth2Authentication authentication) throws AuthenticationException {
		if (!supportMultipleSessions) {
			OAuth2AccessToken existingAccessToken = super.getAccessToken(authentication);
			if (existingAccessToken != null && !existingAccessToken.isExpired()) {
				super.revokeToken(existingAccessToken.getValue());
			}
		}
		return super.createAccessToken(authentication);
	}
	
	public String getMessage(){
		return messages.getMessage("CustomTokenServices.userActiveAnotherSession", "existing access token");
	}
	
	public void setSupportMultipleSessions(boolean supportMultipleSessions) {
		this.supportMultipleSessions = supportMultipleSessions;
	}
	public void setMessageSource(MessageSource messageSource) {
		this.messages = new MessageSourceAccessor(messageSource);
	}

}
