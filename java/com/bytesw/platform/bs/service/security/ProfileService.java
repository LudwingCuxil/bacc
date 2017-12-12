package com.bytesw.platform.bs.service.security;

import java.util.Set;

import javax.annotation.Resource;

import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.core.PerfilRepository;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.core.Perfil;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.search.SearchCriteria;
import com.bytesw.platform.search.SearchSpecificationsBuilder;
import com.bytesw.platform.utilities.ErrorMessage;

@Service
public class ProfileService {

    private PerfilRepository perfilRepository;

    @Autowired
    public ProfileService(PerfilRepository perfilRepository){
        this.perfilRepository = perfilRepository;
    }

    @Transactional(readOnly = true)
    public Iterable<Perfil> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return perfilRepository.findAll(this.getSpecificationSeach(searchDTO), page);
    }

    @Transactional(readOnly = true)
    public Iterable<Perfil> findAll(Pageable page) {
        return perfilRepository.findAll(page);
    }

    @Transactional(readOnly = true)
    public Perfil findById(Integer id) {
        return perfilRepository.findOne(id);
    }
  
    @Transactional(rollbackFor = DataIntegrityViolationException.class)
    public Perfil create(Perfil perfil) throws DataIntegrityViolationException {
	    return perfilRepository.save(perfil);
    }
  
    @Transactional(rollbackFor = {ResourceNotFoundException.class, DataIntegrityViolationException.class})
    public Perfil update(Perfil perfil) throws ServiceAccessException {
	    Perfil updatedProfile = perfilRepository.findOne(perfil.getId());
        if (updatedProfile == null) {
            throw new ResourceNotFoundException();
        }
        perfil.setRoles(updatedProfile.getRoles());
        updatedProfile.setActivo(perfil.getActivo());
        updatedProfile.setDescripcion(perfil.getDescripcion());
        return updatedProfile;
  }	
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public Perfil addRoles(Integer id, Set<Integer> roles) throws ResourceNotFoundException{
        Perfil perfil = perfilRepository.findOne(id);
        if (perfil == null) {
            throw new ResourceNotFoundException();
        }
        for (Integer rol: roles) {
	        this.perfilRepository.saveRolPerfil(rol, perfil.getId());
        }
        return perfil;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public Perfil removeRoles(Integer id, Set<Integer> roles) throws ResourceNotFoundException{
        Perfil perfil = perfilRepository.findOne(id);
        if (perfil == null) {
            throw new ResourceNotFoundException();
        }
        for (Integer rol: roles) {
	        this.perfilRepository.deleteRolProfileBy(rol, perfil.getId());
        }
        return perfil;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public Perfil activate(Perfil perfil) throws ResourceNotFoundException {
        Perfil updatedPerfil = perfilRepository.findOne(perfil.getId());
        if (updatedPerfil == null) {
            throw new ResourceNotFoundException();
        }
        updatedPerfil.setActivo(true);
        perfilRepository.save(updatedPerfil);
        return updatedPerfil;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public void delete(Integer id) throws ResourceNotFoundException {
	    Perfil deletedProfile = perfilRepository.findOne(id);
        if (deletedProfile == null) {
            throw new ResourceNotFoundException();
        }
        perfilRepository.delete(deletedProfile.getId());
    }

    public Specification<Perfil> getSpecificationSeach(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<Perfil> builder = new SearchSpecificationsBuilder<Perfil>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {
                builder.with(criteria);
            }
        }
        Specification<Perfil> spec = builder.build();
        return spec;
    }
}
