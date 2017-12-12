package com.bytesw.platform.conf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.encoding.ShaPasswordEncoder;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.bytesw.platform.security.authentication.dao.ByteDaoAuthenticationProvider;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    
	@Value("${security.basic.realm}")
	private String realm;
	
	@Value("${web-app.auth.prefer-encoder}")
	private boolean preferEncoder;
	
    @Autowired
    @Qualifier("securityDetailsService")
    public UserDetailsService userDetailsService;
    
    @Bean
    @ConditionalOnProperty(prefix = "web-app.auth", name = "prefer-encoder", matchIfMissing = false, havingValue = "true")
    public ShaPasswordEncoder shaPasswordEncoder() {
    	ShaPasswordEncoder encoder = new ShaPasswordEncoder(1);
    	return encoder;
    }
    
    @Bean(name = "byteDaoAuthenticationProvider")
    public DaoAuthenticationProvider daoAuthenticationProvider(){
    	DaoAuthenticationProvider provider = new ByteDaoAuthenticationProvider();
    	if (preferEncoder) {
    		provider.setPasswordEncoder(shaPasswordEncoder());
    	}
	    provider.setUserDetailsService(userDetailsService);
	    return provider;
    }
    
    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
    	auth
    		.authenticationProvider(daoAuthenticationProvider());
    }
    
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.authorizeRequests()
				.antMatchers("/", "/swagger-ui.html/**", "/swagger-resources/**", "/webjars/**", "/images/**", "/v2/api-docs/**").permitAll()
			.anyRequest()
				.authenticated()
				.and()
			.httpBasic()
				.realmName(realm)
				.and()
			.csrf()
				.disable();
	}

}
