package com.bytesw.platform.bs.queue.exception;

public class MQAccessException extends Exception {

	private static final long serialVersionUID = 4263456071465932391L;

	public MQAccessException(String msg) {
		super(msg);
	}

	public MQAccessException(String msg, Throwable causa) {
		super(msg, causa);
	}
	
}
