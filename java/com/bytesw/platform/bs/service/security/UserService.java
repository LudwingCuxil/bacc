package com.bytesw.platform.bs.service.security;

import com.bytesw.platform.bs.dao.core.PerfilRepository;
import com.bytesw.platform.bs.dao.core.UsuarioRepository;
import com.bytesw.platform.bs.exception.ResourceNotFoundException;
import com.bytesw.platform.bs.exception.ServiceAccessException;
import com.bytesw.platform.eis.bo.core.Perfil;
import com.bytesw.platform.eis.bo.core.Usuario;
import com.bytesw.platform.eis.dto.SearchDTO;
import com.bytesw.platform.search.SearchCriteria;
import com.bytesw.platform.search.SearchSpecificationsBuilder;
import com.bytesw.platform.utilities.ErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class UserService {

    private UsuarioRepository usuarioRepository;
    private PerfilRepository perfilRepository;

    @Autowired
    public UserService(UsuarioRepository usuarioRepository, PerfilRepository perfilRepository) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
    }

    @Transactional(readOnly = true)
    public Iterable<Usuario> findAll(Pageable page) {
        return usuarioRepository.findAll(page);
    }

    @Transactional(readOnly = true)
    public Usuario findById(Integer id) {
        return usuarioRepository.findOne(id);
    }

    @Transactional(readOnly = true)
    public Usuario findByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Iterable<Usuario> findAll(SearchDTO searchDTO, Pageable page) throws ServiceAccessException {
        if (searchDTO.getListParameter() == null || searchDTO.getListParameter().isEmpty()) {
            throw new ServiceAccessException(ErrorMessage.ARGUMENTOS_DE_BUSQUEDA_INVALIDOS);
        }
        return usuarioRepository.findAll(this.getSpecificationSeach(searchDTO), page);
    }
  
    @Transactional(rollbackFor = DataIntegrityViolationException.class)
    public Usuario create(Usuario usuario) throws DataIntegrityViolationException {
        usuario.setCreated(new Date());
        usuario.setCuentaBloqueada(false);
        usuario.setCaducaContrasenia(false);
        usuario.setSesionesMultiples(false);
        usuario.setFailedLoginAttempts(0);
        return usuarioRepository.save(usuario);
    }
  
    @Transactional(rollbackFor = {ResourceNotFoundException.class, DataIntegrityViolationException.class})
    public Usuario update(Usuario usuario) throws ResourceNotFoundException, DataIntegrityViolationException {
        Usuario userUpdated = usuarioRepository.findOne(usuario.getId());
        if (userUpdated == null) {
            throw new ResourceNotFoundException();
        }
        userUpdated.setPrimerApellido(usuario.getPrimerApellido());
        userUpdated.setSegundoApellido(usuario.getSegundoApellido());
        userUpdated.setPrimerNombre(usuario.getPrimerNombre());
        userUpdated.setSegundoNombre(usuario.getSegundoNombre());
        userUpdated.setEmail(usuario.getEmail());
        userUpdated.setDefaultProfileName(usuario.getDefaultProfileName());
        userUpdated.setHabilitado(usuario.isHabilitado());
        userUpdated.setCuentaBloqueada(usuario.isCuentaBloqueada());
        return userUpdated;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public Usuario activate(Usuario usuario) throws ResourceNotFoundException {
        Usuario updatedUser = usuarioRepository.findOne(usuario.getId());
        if (updatedUser == null) {
            throw new ResourceNotFoundException();
        }
        updatedUser.setHabilitado(usuario.isHabilitado());
        usuarioRepository.save(updatedUser);
        return updatedUser;
    }
  
    @Transactional(rollbackFor = ResourceNotFoundException.class)
    public void delete(Integer id) throws ResourceNotFoundException {
        Usuario deletedUser = usuarioRepository.findOne(id);
        if (deletedUser == null) {
            throw new ResourceNotFoundException();
        }
        usuarioRepository.delete(deletedUser.getId());
    }

    @Transactional(readOnly = true)
    public Usuario findUser() {
        Usuario user = (Usuario) this.getAuthentication().getPrincipal();
        Perfil profile = perfilRepository.findByNombre(user.getDefaultProfileName());
        if (null != profile) {
            user.setRoles(profile.getRoles());
        }
        return user;
  }
  
    private Authentication getAuthentication() {
      return SecurityContextHolder.getContext().getAuthentication();
  }

    public Specification<Usuario> getSpecificationSeach(SearchDTO searchDTO) {
        SearchSpecificationsBuilder<Usuario> builder = new SearchSpecificationsBuilder<Usuario>();
        if (searchDTO != null && searchDTO.getListParameter() != null) {
            for (SearchCriteria criteria : searchDTO.getListParameter()) {
                builder.with(criteria);
            }
        }
        Specification<Usuario> spec = builder.build();
        return spec;
    }

}
