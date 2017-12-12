package com.bytesw.platform.utilities;

public class Constants {

	/** El nombre del ResourceBundle usado en esta aplicacion */
	public static final String BUNDLE_KEY = "ApplicationResources";

	/** El nombre del ResourceBundle usado para la ayuda en esta aplicacion */
	public static final String HELP_BUNDLE_KEY = "HelpResources";

	/** La llave de algoritmo de encripcion a ser usado para los passwords */
	public static final String ENC_ALGORITHM = "algorithm";

	/** Una bandera para indicar si los passwords deberian ser encriptados */
	public static final String ENCRYPT_PASSWORD = "encryptPassword";

	/** Separador de Archivos desde propiedades del Sistema */
	public static final String FILE_SEP = System.getProperty("file.separator");

	/** Home del usuario desde propiedades del Sistema */
	public static final String USER_HOME = System.getProperty("user.home") + FILE_SEP;

	/** El nombre del hashmap de configuracion guardado en application scope. */
	public static final String CONFIG = "appConfig";

	/**
	 * Atributo en Session scope que mantiene el locale dado por el usuario. Al
	 * colocar esta llave a la misma que usa Struts, obtenemos sincronizacion en
	 * Struts sin tener que hacer trabajo extra o tener dos variables de
	 * Session.
	 */
	public static final String PREFERRED_LOCALE_KEY = "org.apache.struts.action.LOCALE";

	/**
	 * El atributo de Request scope bajo el cual una forma de usuario editable
	 * es guardada.
	 */
	public static final String USER_KEY = "userForm";

	/** El atributo de Request scope que mantiene la lista de usuario */
	public static final String USER_LIST = "userList";

	/** El atributo de Request scope para indicar un usuario recien-registrado */
	public static final String REGISTERED = "registered";

	/** El nombre del rol de Administrador, como especificado en web.xml */
	public static final String ADMIN_ROLE = "admin";

	/** El nombre del rol de Administrador, como especificado en web.xml */
	public static final String ROL_ADMIN = "admin";

	/** El nombre del rol de Usuario, como especificado en web.xml */
	public static final String USER_ROLE = "user";

	/** El nombre del rol de Usuario, como especificado en web.xml */
	public static final String ROL_USUARIO = "user";

	/**
	 * El nombre de la lista de roles de usuario, un atributo de Request scope
	 * cuando se agrega/edita un usuario.
	 */
	public static final String USER_ROLES = "userRoles";

	/**
	 * El nombre de la lista de roles de usuario, un atributo de Request scope
	 * cuando se agrega/edita un usuario.
	 */
	public static final String ROLES_USUARIO = "rolesUsuario";

	/**
	 * El nombre de la lista de roles de usuario disponibles, un atributo de
	 * Request scope cuando se agrega/edita un usuario.
	 */
	public static final String AVAILABLE_ROLES = "availableRoles";

	/**
	 * El nombre del Bundle de parametros globales para configuracion de Spring
	 */
	public static final String APPLICATION_PROPERTIES = "applicationProperties";

	/**
	 * El nombre del variable de Session scope que mantiene los campos
	 * restringidos en una copia con seguridad.
	 */
	public static final String SECURITY_FIELDS_KEY = "SECURITY_FIELDS_KEY";

	/**
	 * El nombre de variable de Session scope que mantiene el Perfil de
	 * Seguridad actual.
	 */
	public static final String PERFIL_SEGURIDAD = "PERFIL_SEGURIDAD";
	public static final String NIVEL_SEGURIDAD = "NIVEL_SEGURIDAD";
	public static final String RECURSOS_SEGURIDAD = "RECURSOS_SEGURIDAD";
	public static final String JMS_CLIENT_ID_PROPERTY = "__id";
	public static final String JMS_CLIENT_USERNAME_PROPERTY = "__username";
	public static final String JMS_CLIENT_PERFIL_PROPERTY = "__perfil";
	public static final String DUMMY_USERNAME = "byteuser";
	public static final String AUTHORIZATION_REQUIRED = "authorizationRequired";
	public static final String METHOD_INVOCATION = "methodInvocation";
	public static final String CRYPTO_MODE_DIGEST = "DIGEST";
	public static final String CRYPTO_MODE_ENCRYPT  = "ENCRYPT";
	public static final String ENCRYPTION_ALGORIGTHM = "SHA";
	public static final String ENTITY_ATTRIBUTE_LOG_VALUE = "entityAttributeLogValue";
	
	public static final int ENCRYPTION_ALGORIGTHM_SALT_BYTES_SIZE = 16;

}