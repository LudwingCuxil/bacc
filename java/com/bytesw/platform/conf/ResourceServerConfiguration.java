package com.bytesw.platform.conf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.TokenStore;

import com.bytesw.platform.WebAppProperties;

@Configuration
@EnableResourceServer
public class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {
	
	@Autowired
	private WebAppProperties properties;
	
	@Autowired
	@Qualifier("tokenStore")
	public TokenStore tokenStore;
	
	@Autowired
	@Qualifier("defaultTokenServices")
	public DefaultTokenServices defaultTokenServices;
	
    @Override
    public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
         resources
         	.tokenServices(defaultTokenServices)
         	.tokenStore(tokenStore)
         	.resourceId("api");
    }
	
	@Override
	public void configure(HttpSecurity http) throws Exception {
         http
         	.authorizeRequests()
         		.antMatchers("/api/**").access(properties.getAuth().getResourceAccess())
         		.antMatchers("/oauth/token/revoke").fullyAuthenticated()
         		.and()
            .requestMatchers()
                .antMatchers("/api/**")
                .antMatchers("/oauth/token/revoke");
	}
    
}
