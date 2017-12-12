package com.bytesw.platform.bs.queue.read;

public interface IBQueueDefinition {

    public void setQueueManager(QueueManager queueManager);
    public QueueManager getQueueManager();

    public void writeInputQueue(String message);
    public void writeInputQueue(String key, String message);
    public void writeInputQueue(String queueInput, String key, String message);
    public void writeInputQueue(String queuesLib, String queueInput, String key, String message);
    public String readOutputQueue(String key);
    public String readOutputQueue(String queueOutput, String key);
    public String readOutputQueue(String queueOutput, String key, int timeout);
    public void writeFtpQueueInput(String message);
    public String readFtpOutputQueue(String key);
    public void writeStatementQueueInput(String message);
    public String readStatementOutputQueue(String key);
    
}
