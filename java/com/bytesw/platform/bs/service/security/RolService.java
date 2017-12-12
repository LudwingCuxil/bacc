package com.bytesw.platform.bs.service.security;

import com.bytesw.platform.bs.dao.core.RolRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.core.Rol;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.search.SearchCriteria;
import com.bytesw.platform.search.SearchSpecificationsBuilder;
import com.bytesw.platform.utilities.ErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolService {

    private RolRepository rolRepository;

    @Autowired
    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Transactional(readOnly = true)
    public Iterable<Rol> findAll(Pageable page) {
        return rolRepository.findAll(page);
    }

    @Transactional
    public Rol findById(Integer id) {
        return rolRepository.findOne(id);
    }
  
    @Transactional(readOnly = true)
    public Iterable<Rol> findAllByIds(Iterable<Integer> ids) {
        return rolRepository.findAll(ids);
    }

    @Transactional(readOnly = true)
    public List<Rol> findParents() { return rolRepository.findParents(); }

    @Transactional(readOnly = true)
    public Iterable<Rol> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return rolRepository.findAll(this.getSpecificationSeach(searchDTO), page);
    }

    @Transactional(rollbackFor = DataIntegrityViolationException.class)
    public Rol create(Rol rol) throws DataIntegrityViolationException {
        return rolRepository.save(rol);
    }

    @Transactional(rollbackFor = {ResourceNotFoundException.class, DataIntegrityViolationException.class})
    public Rol update(Rol rol) throws ResourceNotFoundException, DataIntegrityViolationException {
        Rol updatedRol = rolRepository.findOne(rol.getId());
        if (updatedRol == null) {
            throw new ResourceNotFoundException();
        }
        updatedRol.setDescripcion(rol.getDescripcion());
        updatedRol.setTipo(rol.getTipo());
        return updatedRol;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public void delete(Integer id) throws ResourceNotFoundException {
        Rol deletedRol = rolRepository.findOne(id);
        if (deletedRol == null) {
            throw new ResourceNotFoundException();
        }
        rolRepository.delete(deletedRol.getId());
    }
  
    public Specification<Rol> getSpecificationSeach(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<Rol> builder = new SearchSpecificationsBuilder<Rol>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {
                builder.with(criteria);
            }
        }
        Specification<Rol> spec = builder.build();
        return spec;
    }

}
