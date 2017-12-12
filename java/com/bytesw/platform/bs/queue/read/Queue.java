package com.bytesw.platform.bs.queue.read;

public abstract class Queue {

	public abstract void write(String key, String data);
	public String read(String key) {
		return read(key, 0);
	}
	public abstract String read(String key, long millis);
	public abstract String peek(String key);
	public abstract void close();
	
}