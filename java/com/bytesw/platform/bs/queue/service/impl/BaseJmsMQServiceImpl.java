package com.bytesw.platform.bs.queue.service.impl;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bytesw.platform.bs.queue.exception.MQAccessException;
import com.bytesw.platform.bs.queue.read.IBQueueDefinition;
import com.bytesw.platform.bs.queue.service.BaseJmsMQService;

@Service
public class BaseJmsMQServiceImpl implements BaseJmsMQService {
	
	protected final Log logger = LogFactory.getLog(getClass());
	
	@Autowired
	private IBQueueDefinition queueAdmin;

	@Override
	public String read(String queueName, String key) throws MQAccessException {
		logger.info("BaseJmsMQServiceImpl.read => queue: " + queueName + " key: " + key);
		return this.queueAdmin.readOutputQueue(queueName, key);
	}
	
	@Override
	public String read(String queueName, String key, int timeout) throws MQAccessException {
		logger.info("BaseJmsMQServiceImpl.read => queue: " + queueName + " key: " + key + " timeout: " + timeout);
		return this.queueAdmin.readOutputQueue(queueName, key, timeout);
	}

	@Override
	public void write(String queueName, String data) throws MQAccessException {
		logger.info("BaseJmsMQServiceImpl.write => queue: " + queueName + " data: " + data);
		this.queueAdmin.writeInputQueue(queueName, null, data);
	}
	
	@Override
	public void write(String queueName, String key, String data) throws MQAccessException {
		logger.info("BaseJmsMQServiceImpl.write => queue: " + queueName + " key: " + key + " data: " + data);
		this.queueAdmin.writeInputQueue(queueName, key, data);
	}
	
	@Override
	public void write(String queuesLib, String queueName, String key, String data) throws MQAccessException {
		logger.info("BaseJmsMQServiceImpl.write => lib: " + queuesLib + " queue: " + queueName + " key: " + key + " data: " + data);
		this.queueAdmin.writeInputQueue(queuesLib, queueName, key, data);
	}

	public IBQueueDefinition getQueueAdmin() {
		return queueAdmin;
	}
	public void setQueueAdmin(IBQueueDefinition queueAdmin) {
		this.queueAdmin = queueAdmin;
	}

}