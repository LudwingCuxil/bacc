package com.bytesw.platform.bs.queue.read.as400;

public class DataQueueThread extends Thread {
	
    private String key;
    private String data;
    private int id;
    private int timeout;
    private AS400DataQueue runner;
    
    public DataQueueThread(String key, String data, int id, AS400DataQueue runner) {
      this.data = data;
      this.key = key;
      this.id = id;
      this.runner = runner;
    }
    
    public DataQueueThread(String key, int timeout, int id, AS400DataQueue runner) {
      this.key = key;
      this.timeout = timeout;
      this.id = id;
      this.runner = runner;
    }
    
    String getData() {
      return data;
    }
    String getKey() {
      return key;
    }
    int getTimeout() {
      return timeout;
    }
    int getID() {
      return id;
    }
    public void run() {
      runner.run(this);
    }
    
    void setData(String data) {
      this.data = data;
    }
  }