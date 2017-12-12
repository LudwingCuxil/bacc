package com.bytesw.platform.bs.service.plataforma;

import com.bytesw.platform.bs.dao.plataforma.ReferenciaClienteDetalleRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.plataforma.ReferenciaClienteDetalle;
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
public class ReferenciaClienteDetalleService {

	private ReferenciaClienteDetalleRepository repository;
	
	@Autowired
	public ReferenciaClienteDetalleService(ReferenciaClienteDetalleRepository repository) {
		this.repository = repository;
	}

	// service validation methods
	
	@Transactional(readOnly = true)
	public Iterable<ReferenciaClienteDetalle> findReferenciaClienteDetalleByUso(TipoPersona tipoPersona){
		return repository.findReferenciaClienteDetalleByUso(tipoPersona.name());
	}
	
	@Transactional(readOnly = true)
    public Iterable<ReferenciaClienteDetalle> findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(TipoPersona tipoPersona, String tipoReferencia){
        return repository.findReferenciaClienteDetalleByUsoAndReferenciaTipoReferencia(tipoPersona.name(), tipoReferencia);
    }
	
	@Transactional(readOnly = true)
    public ReferenciaClienteDetalle findReferenciaClienteDetalleByReferenciaTipoReferenciaAndUso(String tipoReferencia, TipoPersona tipoPersona) throws ResourceNotFoundException {
		ReferenciaClienteDetalle rcd = repository.findReferenciaClienteDetalleByReferenciaTipoReferenciaAndUso(tipoReferencia, tipoPersona.name());
		if (null == rcd) {
			throw new ResourceNotFoundException();
		}
		return rcd;
    }

    // table maintenance methods

    @Transactional(readOnly = true)
    public Iterable<ReferenciaClienteDetalle> findAll(Pageable page) {
        return repository.findAll(page);
    }

    @Transactional(readOnly = true)
    public ReferenciaClienteDetalle findById(Integer id) {
        return repository.findOne(id);
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaClienteDetalle> findAllByIds(Iterable<Integer> ids) {
        return repository.findAll(ids);
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaClienteDetalle> findByReferenciaClienteId(Integer id) {
        return repository.findReferenciaClienteDetalleByReferenciaClienteId(id);
    }

    @Transactional(readOnly = true)
    public Iterable<ReferenciaClienteDetalle> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return repository.findAll(this.getSpecificationSeach(searchDTO), page);
    }

    @Transactional(rollbackFor = DataIntegrityViolationException.class)
    public ReferenciaClienteDetalle create(ReferenciaClienteDetalle referenciaClienteDetalle) throws DataIntegrityViolationException {
        return repository.save(referenciaClienteDetalle);
    }

    @Transactional(rollbackFor = {ResourceNotFoundException.class, DataIntegrityViolationException.class})
    public ReferenciaClienteDetalle update(ReferenciaClienteDetalle referenciaClienteDetalle) throws ResourceNotFoundException, DataIntegrityViolationException {
        ReferenciaClienteDetalle updatedReferenciaClienteDetalle = repository.findOne(referenciaClienteDetalle.getId());
        if (updatedReferenciaClienteDetalle == null) {
            throw new ResourceNotFoundException();
        }
        updatedReferenciaClienteDetalle.setMaximo(referenciaClienteDetalle.getMaximo());
        updatedReferenciaClienteDetalle.setMinimo(referenciaClienteDetalle.getMinimo());
        updatedReferenciaClienteDetalle.setOrden(referenciaClienteDetalle.getOrden());
        updatedReferenciaClienteDetalle.setUso(referenciaClienteDetalle.getUso());
        return updatedReferenciaClienteDetalle;
    }

    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public void delete(Integer id) throws ResourceNotFoundException {
        ReferenciaClienteDetalle deletedReferenciaClienteDetalle = repository.findOne(id);
        if (deletedReferenciaClienteDetalle == null) {
            throw new ResourceNotFoundException();
        }
        repository.delete(deletedReferenciaClienteDetalle.getId());
    }

    public Specification<ReferenciaClienteDetalle> getSpecificationSeach(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<ReferenciaClienteDetalle> builder = new SearchSpecificationsBuilder<ReferenciaClienteDetalle>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {
                builder.with(criteria);
            }
        }
        Specification<ReferenciaClienteDetalle> spec = builder.build();
        return spec;
    }

}
