package com.bytesw.platform.bs.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.core.PartialPersistRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.eis.bo.core.PartialWebForm;
import com.bytesw.platform.eis.bo.core.Usuario;

@Service
public class PartialPersistService {

	private PartialPersistRepository repository;
	
	@Autowired
	public PartialPersistService(PartialPersistRepository repository){
		this.repository = repository;
	}
	
	@Transactional(readOnly = true)
	public PartialWebForm findByWebformName(String webformName) throws ResourceNotFoundException {
		PartialWebForm toFound = repository.findByUsernameAndWebformName(this.getUsernameAuthentication(), webformName);
		if (null == toFound) {
			throw new ResourceNotFoundException();
		}
		return toFound;
	}
	
	@Transactional
	public PartialWebForm saveOrUpdate(PartialWebForm bo) {
		bo.setUsername(this.getUsernameAuthentication());
		if (repository.countByUsernameAndWebformName(bo.getUsername(), bo.getWebformName()) == 0) {
			bo.setCreateDate(new Date());
		} else {
		    String content = bo.getContent();
			bo = repository.findByUsernameAndWebformName(bo.getUsername(), bo.getWebformName());
			bo.setLastUpdateDate(new Date());
			bo.setContent(content);
		}
		return repository.save(bo);
	}
	
	@Transactional
	public void delete(String webformName) throws ResourceNotFoundException {
		PartialWebForm toRemove = this.findByWebformName(webformName);
		if (null == toRemove) {
			throw new ResourceNotFoundException();
		}
		repository.delete(toRemove);
	}
	
	private String getUsernameAuthentication(){
		if (null == SecurityContextHolder.getContext().getAuthentication()) {
			return null;
		}
		return ((Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
	}
	
}
