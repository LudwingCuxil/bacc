package com.bytesw.platform.security.provider.token.store;

import javax.sql.DataSource;

public class JdbcTokenStore extends org.springframework.security.oauth2.provider.token.store.JdbcTokenStore {

	private static final String ACCESS_TOKEN_INSERT = "insert into STANDARD.oauth_access_token (token_id, token, authentication_id, user_name, client_id, authentication, refresh_token) values (?, ?, ?, ?, ?, ?, ?)";

	private static final String ACCESS_TOKEN_SELECT = "select token_id, token from STANDARD.oauth_access_token where token_id = ?";

	private static final String ACCESS_TOKEN_AUTHENTICATION_SELECT = "select token_id, authentication from STANDARD.oauth_access_token where token_id = ?";

	private static final String ACCESS_TOKEN_FROM_AUTHENTICATION_SELECT = "select token_id, token from STANDARD.oauth_access_token where authentication_id = ?";

	private static final String ACCESS_TOKENS_FROM_USERNAME_AND_CLIENT_SELECT = "select token_id, token from STANDARD.oauth_access_token where user_name = ? and client_id = ?";

	private static final String ACCESS_TOKENS_FROM_USERNAME_SELECT = "select token_id, token from STANDARD.oauth_access_token where user_name = ?";

	private static final String ACCESS_TOKENS_FROM_CLIENTID_SELECT = "select token_id, token from STANDARD.oauth_access_token where client_id = ?";

	private static final String ACCESS_TOKEN_DELETE = "delete from STANDARD.oauth_access_token where token_id = ?";

	private static final String ACCESS_TOKEN_DELETE_FROM_REFRESH_TOKEN = "delete from STANDARD.oauth_access_token where refresh_token = ?";

	private static final String REFRESH_TOKEN_INSERT = "insert into STANDARD.oauth_refresh_token (token_id, token, authentication) values (?, ?, ?)";

	private static final String REFRESH_TOKEN_SELECT = "select token_id, token from STANDARD.oauth_refresh_token where token_id = ?";

	private static final String REFRESH_TOKEN_AUTHENTICATION_SELECT = "select token_id, authentication from STANDARD.oauth_refresh_token where token_id = ?";

	private static final String REFRESH_TOKEN_DELETE = "delete from STANDARD.oauth_refresh_token where token_id = ?";
	
	public JdbcTokenStore(DataSource dataSource) {
		super(dataSource);
		this.setInsertAccessTokenSql(ACCESS_TOKEN_INSERT);
		this.setSelectAccessTokenSql(ACCESS_TOKEN_SELECT);
		this.setSelectAccessTokenAuthenticationSql(ACCESS_TOKEN_AUTHENTICATION_SELECT);
		this.setSelectAccessTokenFromAuthenticationSql(ACCESS_TOKEN_FROM_AUTHENTICATION_SELECT);
		this.setSelectAccessTokensFromUserNameAndClientIdSql(ACCESS_TOKENS_FROM_USERNAME_AND_CLIENT_SELECT);
		this.setSelectAccessTokensFromUserNameSql(ACCESS_TOKENS_FROM_USERNAME_SELECT);
		this.setSelectAccessTokensFromClientIdSql(ACCESS_TOKENS_FROM_CLIENTID_SELECT);
		this.setDeleteAccessTokenSql(ACCESS_TOKEN_DELETE);
		this.setInsertRefreshTokenSql(REFRESH_TOKEN_INSERT);
		this.setSelectRefreshTokenSql(REFRESH_TOKEN_SELECT);
		this.setSelectRefreshTokenAuthenticationSql(REFRESH_TOKEN_AUTHENTICATION_SELECT);
		this.setDeleteRefreshTokenSql(REFRESH_TOKEN_DELETE);
		this.setDeleteAccessTokenFromRefreshTokenSql(ACCESS_TOKEN_DELETE_FROM_REFRESH_TOKEN);
	}

}
