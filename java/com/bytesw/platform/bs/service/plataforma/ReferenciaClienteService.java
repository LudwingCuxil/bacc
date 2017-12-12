package com.bytesw.platform.bs.service.plataforma;

import com.bytesw.platform.bs.dao.plataforma.ReferenciaClienteRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaCliente;
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

@Service
public class ReferenciaClienteService{

    private ReferenciaClienteRepository repository;

    @Autowired
    public ReferenciaClienteService(ReferenciaClienteRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaCliente> findAll(Pageable page) {
        return repository.findAll(page);
    }

    @Transactional
    public ReferenciaCliente findById(Integer id) {
        return repository.findOne(id);
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaCliente> findAllByIds(Iterable<Integer> ids) {
        return repository.findAll(ids);
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaCliente> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return repository.findAll(this.getSpecificationSeach(searchDTO), page);
    }

    @Transactional(rollbackFor = DataIntegrityViolationException.class)
    public ReferenciaCliente create(ReferenciaCliente referenciaCliente) throws DataIntegrityViolationException {
        return repository.save(referenciaCliente);
    }

    @Transactional(rollbackFor = {ResourceNotFoundException.class, DataIntegrityViolationException.class})
    public ReferenciaCliente update(ReferenciaCliente referenciaCliente) throws ResourceNotFoundException, DataIntegrityViolationException {
        ReferenciaCliente updatedReferenciaCliente = repository.findOne(referenciaCliente.getId());
        if (updatedReferenciaCliente == null) {
            throw new ResourceNotFoundException();
        }
        updatedReferenciaCliente.setDescription(referenciaCliente.getDescription());
        return updatedReferenciaCliente;
    }

    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public void delete(Integer id) throws ResourceNotFoundException {
        ReferenciaCliente deletedReferenciaCliente = repository.findOne(id);
        if (deletedReferenciaCliente == null) {
            throw new ResourceNotFoundException();
        }
        repository.delete(deletedReferenciaCliente.getId());
    }

    public Specification<ReferenciaCliente> getSpecificationSeach(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<ReferenciaCliente> builder = new SearchSpecificationsBuilder<ReferenciaCliente>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {
                builder.with(criteria);
            }
        }
        Specification<ReferenciaCliente> spec = builder.build();
        return spec;
    }

}
