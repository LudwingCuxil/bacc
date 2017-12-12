package com.bytesw.platform.security.core.userdetails.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.WebAppProperties;
import com.bytesw.platform.bs.dao.core.UsuarioRepository;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.security.core.userdetails.SecurityDetailsService;

@Service(value = "securityDetailsService")
public class SecurityDetailsServiceImpl implements SecurityDetailsService, UserDetailsService {
	
	private UsuarioRepository usuarioRepository;
	private WebAppProperties properties;
	
	@Autowired
	public SecurityDetailsServiceImpl(UsuarioRepository usuarioRepository, WebAppProperties properties) {
		this.usuarioRepository = usuarioRepository;
		this.properties = properties; 
	}
	
	@Override
	@Transactional(readOnly = true)
	public Usuario loadUserByUsername(String username) throws UsernameNotFoundException {
		Usuario user = usuarioRepository.findByUsername(username.toLowerCase());
		if (null == user) {
			throw new UsernameNotFoundException("usernameNotFoundException");
		}
		return user;
	}
	
	@Override
	@Transactional(rollbackFor = ServiceAccessException.class)
	public void updateUser(Usuario user){
		usuarioRepository.save(user);
	}
	
	@Override
	public void verifyFailedLoginAttempts(Usuario user) throws BadCredentialsException {
		int attempts = user.getFailedLoginAttempts() + 1;
		int failedLoginAttempts = properties.getAuth().getFailedLoginAttempts();
		user.setFailedLoginAttempts(attempts);
		if ((attempts + 1) == failedLoginAttempts) {
			throw new BadCredentialsException("badCredentialsAlertLocked");
		} else if (attempts >= failedLoginAttempts) {
			user.setHabilitado(false);
			user.setCuentaBloqueada(true);
			throw new BadCredentialsException("badCredentialsLocked");
		}
	}

}
