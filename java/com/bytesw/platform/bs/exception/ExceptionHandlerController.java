package com.bytesw.platform.bs.exception;

import javax.persistence.NoResultException;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.bytesw.platform.bs.service.AuthorizationService;
import com.bytesw.platform.eis.dto.ErrorDTO;
import com.bytesw.platform.eis.dto.PermisoDTO;

@ControllerAdvice
@PropertySource("classpath:error-message.properties")
public final class ExceptionHandlerController {

	@Autowired
	private Environment env;
	
	@Autowired
	private AuthorizationService authorizationService;
	
	@ExceptionHandler(InvalidParameterException.class)
	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorDTO invalidParameterException(InvalidParameterException ipe) {
		ErrorDTO error = new ErrorDTO();
		error.setCode(ipe.getMessage());
		error.setMessage(env.getProperty(ipe.getMessage()));
		return error;
	}
	
	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(value = HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorDTO resourceNotFoundException(ResourceNotFoundException rnfe) {
		ErrorDTO error = new ErrorDTO();
		error.setCode(rnfe.getMessage());
		error.setMessage(env.getProperty(rnfe.getMessage()));
		return error;
	}
	
	@ExceptionHandler(NoResultException.class)
	@ResponseStatus(value = HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorDTO noResultException(NoResultException nre) {
		ErrorDTO error = new ErrorDTO();
		error.setCode("com.bytesw.platform.resourceNotFoundException");
		error.setMessage(env.getProperty("com.bytesw.platform.resourceNotFoundException"));
		return error;
	}
	
	@ExceptionHandler(ServiceAccessException.class)
	@ResponseStatus(value = HttpStatus.FORBIDDEN)
	@ResponseBody
	public ErrorDTO serviceException(ServiceAccessException se) {
		ErrorDTO error = new ErrorDTO();
		error.setOverride(se.isOverride());
		if (error.isOverride()) {
			error.setCode(se.getMessage());
			error.setMessage(env.getProperty(se.getMessage()));
		} else {
			error.setCode(se.getMessage());
			error.setMessage(se.getMessage());
		}
		return error;
	}
	
	@ExceptionHandler(AuthorizationRequiredException.class)
	@ResponseStatus(value = HttpStatus.PRECONDITION_REQUIRED)
	@ResponseBody
	public PermisoDTO authorizationRequiredException(AuthorizationRequiredException are){
		PermisoDTO permiso = new PermisoDTO();
		try {
			permiso = authorizationService.findEquivalenciaPermiso(are.getMessage());
		} catch (ServiceAccessException sae) {
			permiso.setCodigo(sae.getMessage());
			permiso.setDescripcion(env.getProperty(sae.getMessage()));
		}
		return permiso;
	}
	
	@ExceptionHandler(LockedException.class)
	@ResponseStatus(value = HttpStatus.LOCKED)
	@ResponseBody
	public ErrorDTO lockedException(LockedException le) {
		ErrorDTO error = new ErrorDTO();
		error.setCode(le.getMessage());
		int start = le.getMessage().indexOf(":");
		String message = le.getMessage().substring(0, start);
		String owner = le.getMessage().substring(start + 1, le.getMessage().length());
		error.setMessage(env.getProperty(message) + " " + owner);
		return error;
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorDTO dataIntegrityViolationException(DataIntegrityViolationException dive) {
        ErrorDTO error = new ErrorDTO();
        ConstraintViolationException constraint = (ConstraintViolationException) dive.getCause();
        if (constraint.getErrorCode() == -803) {
            error.setCode(constraint.getMessage());
            error.setMessage(env.getProperty("com.bytesw.platform.dataIntegrityViolationException.uk"));
        } else if (constraint.getErrorCode() == -532) {
            error.setCode(constraint.getMessage());
            error.setMessage(env.getProperty("com.bytesw.platform.dataIntegrityViolationException.fk"));
        }
		return error;
	}

}
