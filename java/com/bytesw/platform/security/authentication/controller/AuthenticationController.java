package com.bytesw.platform.security.authentication.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.bytesw.platform.bs.service.ManagerLockService;

@RestController
@CrossOrigin
@RequestMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthenticationController {
	
    private TokenStore tokenStore;
    private ManagerLockService managerLockService;
    
    @Autowired
	public AuthenticationController(@Qualifier("tokenStore") TokenStore tokenStore, ManagerLockService managerLockService) {
		this.tokenStore = tokenStore;
		this.managerLockService = managerLockService; 
	}
  
	@RequestMapping(value = "/oauth/token/revoke", method = RequestMethod.POST)
	public ResponseEntity<Void> revokeToken(HttpServletRequest request, HttpServletResponse response) {
		String header = request.getHeader("Authorization"); 
		if (null != header) {
			String tokenValue = header.replace(OAuth2AccessToken.BEARER_TYPE, "").trim();
			OAuth2AccessToken accessToken = tokenStore.readAccessToken(tokenValue);
			if (accessToken != null) {
				managerLockService.deleteAllLock();
				tokenStore.removeAccessToken(accessToken);
			}
		}
		return new ResponseEntity<Void>(HttpStatus.OK);
	}
	
}
