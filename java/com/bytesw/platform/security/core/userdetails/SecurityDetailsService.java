package com.bytesw.platform.security.core.userdetails;

import org.springframework.security.authentication.BadCredentialsException;

import com.bytesw.platform.eis.bo.core.Usuario;

public interface SecurityDetailsService {
	
	public void updateUser(Usuario usuario);
	
	public void verifyFailedLoginAttempts(Usuario user) throws BadCredentialsException;
	
}
