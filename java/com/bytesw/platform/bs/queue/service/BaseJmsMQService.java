package com.bytesw.platform.bs.queue.service;

import com.bytesw.platform.bs.queue.exception.MQAccessException;

public interface BaseJmsMQService {

	public String read(String queueName, String key) throws MQAccessException;
	
	public String read(String queueName, String key, int timeout) throws MQAccessException;
	
	public void write(String queueName, String data) throws MQAccessException;
	
	public void write(String queueName, String key, String data) throws MQAccessException;
	
	public void write(String queuesLib, String queueName, String key, String data) throws MQAccessException;

}