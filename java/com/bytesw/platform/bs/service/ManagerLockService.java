package com.bytesw.platform.bs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.core.PessimisticLockRepository;
import com.bytesw.platform.bs.exception.LockedException;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.plataforma.PessimisticLock;

@Service
public class ManagerLockService {

	private PessimisticLockRepository repository;
	
	@Autowired
	public ManagerLockService(PessimisticLockRepository repository){
		this.repository = repository;
	}
	
	@Transactional
	public PessimisticLock acquireLock(ClienteId id) throws LockedException {
		PessimisticLock pessimisticLock = repository.findOne(id);
		if (null != pessimisticLock && !pessimisticLock.getOwner().equals(this.getUsernameAuthentication())) {
			throw new LockedException("com.bytesw.platform.resourceLocked:" + pessimisticLock.getOwner());
		} else {
			pessimisticLock = new PessimisticLock(id);
			pessimisticLock.setOwner(this.getUsernameAuthentication());
			pessimisticLock = repository.save(pessimisticLock);
		}
		return pessimisticLock;
	}
	
	@Transactional
	public void cancelLock(ClienteId id) {
		repository.cancelLock(id, this.getUsernameAuthentication());
	}
	
	@Transactional
	public void deleteAllLock() {
		repository.deleteAllLock(this.getUsernameAuthentication());
	}
	
	private String getUsernameAuthentication(){
		if (null == SecurityContextHolder.getContext().getAuthentication()) {
			return null;
		}
		return ((Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
	}
	
}
