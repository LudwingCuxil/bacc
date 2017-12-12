package com.bytesw.platform.conf;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.GrantType;
import springfox.documentation.service.OAuth;
import springfox.documentation.service.ResourceOwnerPasswordCredentialsGrant;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.ApiKeyVehicle;
import springfox.documentation.swagger.web.SecurityConfiguration;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
@PropertySource("classpath:swagger.properties")
@Profile({"test-swagger", "bantrab-test-swagger"})
public class SwaggerConfiguration {
	
	@Autowired
	private Environment env;

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
        	.securitySchemes(Arrays.asList(securitySchemes()))
        	.securityContexts(Arrays.asList(securityContext()))
        	.apiInfo(apiInfo())
            .select()
            .apis(RequestHandlerSelectors.any())
            .paths(PathSelectors.regex(env.getProperty("swagger.path.regex")))
            .build();
    }
    
    @Bean
    public SecurityConfiguration securityInfo() {
        return new SecurityConfiguration("client", "secret", "realm", "api", "api_key", ApiKeyVehicle.HEADER, "api-key", ",");
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
        	.title(env.getProperty("swagger.api.title"))
            .description(env.getProperty("swagger.api.description"))
            .termsOfServiceUrl(env.getProperty("swagger.api.termsOfServiceUrl"))
            .license(env.getProperty("swagger.api.licence"))
            .licenseUrl(env.getProperty("swagger.api.licence.url"))
            .version(env.getProperty("swagger.api.version"))
            .build();
    }
    
    private OAuth securitySchemes(){
    	AuthorizationScope scope = new AuthorizationScope("read", "read only");
        GrantType grantType = new ResourceOwnerPasswordCredentialsGrant("http://localhost:8080/services/oauth/token");
        return new OAuth("oauth2", Arrays.asList(scope), Arrays.asList(grantType));
    }
    
    private SecurityContext securityContext() {
        return SecurityContext.builder().securityReferences(defaultAuth()).forPaths(PathSelectors.regex(env.getProperty("swagger.path.regex"))).build();
    }

    private List<SecurityReference> defaultAuth() {
    	AuthorizationScope scope = new AuthorizationScope("read", "read only");
        AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
        authorizationScopes[0] = scope;
        return Arrays.asList(new SecurityReference("oauth2", authorizationScopes));
    }
    
}
