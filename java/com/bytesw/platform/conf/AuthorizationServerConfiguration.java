package com.bytesw.platform.conf;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.Ordered;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.bytesw.platform.WebAppProperties;
import com.bytesw.platform.security.authentication.service.CustomTokenServices;
import com.bytesw.platform.security.provider.token.store.JdbcTokenStore;

@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {

	private AuthenticationManager authenticationManager;
    private ClientDetailsService clientDetailsService;
	private DataSource dataSource;
	private WebAppProperties properties;
	private UserDetailsService userDetailsService;
	private MessageSource messageSource;

	@Autowired
	public AuthorizationServerConfiguration(AuthenticationManager authenticationManager, ClientDetailsService clientDetailsService, @Qualifier("dataSource") DataSource dataSource, WebAppProperties properties, @Qualifier("securityDetailsService") UserDetailsService userDetailsService, MessageSource messageSource){
		this.authenticationManager = authenticationManager;
		this.clientDetailsService = clientDetailsService;
		this.dataSource = dataSource;
		this.properties = properties;
		this.userDetailsService = userDetailsService;
		this.messageSource = messageSource;
	}
	
	@Bean(name = "tokenStore")
	public JdbcTokenStore tokenStore() {
		return new JdbcTokenStore(dataSource);
	}
	
	@Override
	public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
		security
			.allowFormAuthenticationForClients();
	}

	@Override
	public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
		clients
			.inMemory()
				.withClient("trusted-client")
				.authorizedGrantTypes("authorization_code", "refresh_token", "password", "implicit")
				.authorities("ROLE_CLIENT", "ROLE_TRUSTED_CLIENT")
				.resourceIds("api")
				.scopes("read", "write")
				.secret("trusted-secret")
				.accessTokenValiditySeconds(properties.getAuth().getAccessTokenValiditySeconds())
				.refreshTokenValiditySeconds(properties.getAuth().getRefreshTokenValiditySeconds())
			.and()
				.withClient("client")
				.authorizedGrantTypes("client_credentials")
				.authorities("ROLE_CLIENT")
				.resourceIds("api")
				.scopes("read")
				.secret("secret");
	}
	
	@Override
	public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
		endpoints
			.tokenServices(defaultTokenServices())
			.tokenStore(tokenStore())
			.authenticationManager(authenticationManager)
			.userDetailsService(userDetailsService);
	}
	
	@Primary
	@Bean(name = "defaultTokenServices")
    public DefaultTokenServices defaultTokenServices(){
        final CustomTokenServices defaultTokenServices = new CustomTokenServices();
        defaultTokenServices.setTokenStore(tokenStore());
        defaultTokenServices.setClientDetailsService(clientDetailsService);
        defaultTokenServices.setSupportRefreshToken(true);
        defaultTokenServices.setSupportMultipleSessions(properties.getAuth().isSupportMultipleSessions());
        defaultTokenServices.setMessageSource(messageSource);
        return defaultTokenServices;
    }
	
	@Bean
	public FilterRegistrationBean corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    CorsConfiguration config = new CorsConfiguration();
	    config.setAllowCredentials(true);
	    config.addAllowedOrigin("*");
	    config.addAllowedHeader("*");
	    config.addAllowedMethod("*");
	    source.registerCorsConfiguration("/**", config);
	    final FilterRegistrationBean bean = new FilterRegistrationBean(new CorsFilter(source));
	    bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
	    return bean;
	}

}
