package com.bytesw.platform.bs.service;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.plataforma.ListaValorAdicionalRepository;
import com.bytesw.platform.bs.dao.plataforma.ParametroRepository;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.clientes.ParametroGeneral;
import com.bytesw.platform.eis.bo.clientes.ParametroHuellaFoto;
import com.bytesw.platform.eis.bo.clientes.ParametroPais;
import com.bytesw.platform.eis.bo.clientes.dominio.TipoPersona;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.bo.depositos.ParametroGenerico;
import com.bytesw.platform.eis.bo.plataforma.Entidad;
import com.bytesw.platform.eis.bo.plataforma.ListaValorAdicional;
import com.bytesw.platform.eis.bo.plataforma.Parametro;
import com.bytesw.platform.eis.bo.plataforma.ParametroDetalle;
import com.bytesw.platform.eis.bo.plataforma.identifier.CampoAdicionalId;
import com.bytesw.platform.eis.dto.depositos.CajeroDTO;
import com.bytesw.platform.utilities.Consts;
import com.bytesw.platform.utilities.ErrorMessage;

@Service
public class MnemonicoService {
	
	private EntityManager manager;
    private ParametroRepository parametroRepository;
	private ListaValorAdicionalRepository listaValorAdicionalRepository;
	
	@Autowired
	public MnemonicoService(EntityManager manager, ParametroRepository parametroRepository, ListaValorAdicionalRepository listaValorAdicionalRepository){
		this.manager = manager;
		this.parametroRepository = parametroRepository;
		this.listaValorAdicionalRepository = listaValorAdicionalRepository;
	}
	
	@Transactional(readOnly = true)
	public Parametro findParametroPlataforma(String codigo) throws ServiceAccessException {
		Parametro parametro = parametroRepository.findParametroByCodigo(codigo);
		if (null == parametro) {
			throw new ServiceAccessException(ErrorMessage.PARAM_PLATAFORMA_NO_DISPONIBLE);
		}
		return parametro;
	}
	
	@Transactional(readOnly = true)
	public Iterable<ParametroDetalle> findParametroPlataformaDetalles(String codigo) throws ServiceAccessException {
		Parametro parametro = this.findParametroPlataforma(codigo);
		if (parametro.getValores().isEmpty()) {
			throw new ServiceAccessException(ErrorMessage.PARAM_PLATAFORMA_VALORES_NO_DISPONIBLE);
		}
		return parametro.getValores();
	}
	
	@Transactional(readOnly = true)
	public ParametroGeneral findParametroGeneral() throws NoResultException {
		Query query = manager.createNamedQuery("parametro-general");
		query.setMaxResults(Consts.ONE_RESULT);
		return (ParametroGeneral) query.getSingleResult();
	}
	
	@Transactional(readOnly = true)
	public ParametroPais findParametroPais(String empresa) throws NoResultException {
		Query query = manager.createNamedQuery("parametro-pais");
		query.setParameter("CODIGO_EMPRESA", empresa);
		query.setMaxResults(Consts.ONE_RESULT);
		return (ParametroPais) query.getSingleResult();
	}
	
	@Transactional(readOnly = true)
	public ParametroGenerico findParametroGenerico(String codigo) throws NoResultException {
		Query query = manager.createNamedQuery("parametro-generico");
		query.setParameter("CODIGO", codigo);
		query.setMaxResults(Consts.ONE_RESULT);
		return (ParametroGenerico) query.getSingleResult();
	}
	
	@Transactional(readOnly = true)
	public ParametroHuellaFoto findParametroHuellaFoto(String empresa, TipoPersona tipoPersona) throws NoResultException {
		Authentication authentication = this.getAuthentication();
		if (null == authentication) {
			throw new NoResultException();
		}
		CajeroDTO cajero = (CajeroDTO) ((Usuario) this.getAuthentication().getPrincipal()).getInfoAdicional();
		Query query = manager.createNamedQuery("parametro-huella-foto-por-agencia");
		query.setParameter("CODIGO_EMPRESA", empresa);
		query.setParameter("TIPO_PERSONA", tipoPersona);
		query.setParameter("CODIGO_AGENCIA", cajero.getAgencia());
		query.setMaxResults(Consts.ONE_RESULT);
		return (ParametroHuellaFoto) query.getSingleResult();
	}
	
	@Transactional(readOnly = true)
	public Iterable<ListaValorAdicional> findListaValorAdicional(String entidad, String lista){
	    Entidad e = new Entidad();
	    e.setCodigo(entidad);
	    CampoAdicionalId campoId = new CampoAdicionalId();
	    campoId.setCodigo(lista);
	    campoId.setEntidad(e);
	    return listaValorAdicionalRepository.findListaValorAdicionalByCampoAdicionalId(campoId);
	}
	
	private Authentication getAuthentication() {
		return SecurityContextHolder.getContext().getAuthentication();
	}

}
