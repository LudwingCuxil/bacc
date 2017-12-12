package com.bytesw.platform.bs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bytesw.platform.bs.dao.clientes.ResourceRepository;
import com.bytesw.platform.eis.bo.clientes.Foto;
import com.bytesw.platform.eis.bo.clientes.identifier.ClienteId;

import java.io.File;
import java.io.FileInputStream;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@Service
public class ResourceService {
	
	protected final Log logger = LogFactory.getLog(getClass());

	private ResourceRepository repository;
	private Resource resource;
	private byte[] image;
	
	@Autowired
	public ResourceService(ResourceRepository repository, @Value(value = "classpath:/static/images/icon-user.png") Resource resource) {
		this.repository = repository;
		this.resource = resource;
	}
	
	@PostConstruct
	public void init() throws Exception {
		FileInputStream inputStream = new FileInputStream(resource.getFile()); 
		byte[] bytes = new byte[(int) resource.getFile().length()];
		inputStream.read(bytes);
	    inputStream.close();
	    logger.info("default-image-name : " + resource.getFilename());
	    this.image = bytes;
	}
	
	public static byte[] readBytesFromFile(File file) throws Exception {
        FileInputStream inputStream = new FileInputStream(file); 
        byte[] fileBytes = new byte[(int) file.length()];
        inputStream.read(fileBytes);
        inputStream.close();
        return fileBytes;
    }
	
	public byte[] getBytesDefaultImage() {
		return image;
	}
	
	public Foto findResourceById(ClienteId id) {
		logger.info("find-avatar-by-id : " + id.getIdentificacion());
		return repository.findById(id);
	}
	
	@Transactional
	public Foto saveResource(Foto foto) {
		return repository.save(foto);
	}
	
	@Transactional
	public Foto updateResource(Foto foto) {
		return repository.save(foto);
	}
	
}
