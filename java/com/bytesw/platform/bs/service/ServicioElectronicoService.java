package com.bytesw.platform.bs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.plataforma.ServicioElectronicoRepository;
import com.bytesw.platform.eis.bo.plataforma.ServicioElectronico;
import com.bytesw.platform.eis.bo.plataforma.dominio.Tipo;

@Service
public class ServicioElectronicoService {

	private ServicioElectronicoRepository repository;
	
	@Autowired
	public ServicioElectronicoService(ServicioElectronicoRepository repository) {
		this.repository = repository;
	}
	
	@Transactional(readOnly = true)
	public List<ServicioElectronico> findByTipoPersona(Tipo tipoPersona){
		return repository.findByTipoPersona(tipoPersona);
	}
	
}
