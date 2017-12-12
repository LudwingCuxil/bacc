package com.bytesw.platform.bs.queue.read;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class IBQueueAdmin implements IBQueueDefinition {
    
	@Autowired
	private QueueManager queueManager;
	
	@Value("${web-app.queue.lib}")
    private String queuesLib;
	 
    private String queueInput;
    private String queueOutput;
    private String ftpQueueInput;
    private String ftpQueueOutput;
    private String ftpStatementsInput;
    private String ftpStatementsOutput;
    
    @Value("${web-app.queue.time-out}")
    private int timeout;

    public void writeInputQueue(String message) {
        queueManager.writeQueue(queuesLib, queueInput, null, message);
    }
    public void writeInputQueue(String key, String message) {
        queueManager.writeQueue(queuesLib, queueInput, key, message);
    }
    public void writeInputQueue(String queueInput, String key, String message) {
        queueManager.writeQueue(queuesLib, queueInput, key, message);
    }
    public void writeInputQueue(String queuesLib, String queueInput, String key, String message) {
        queueManager.writeQueue(queuesLib, queueInput, key, message);
    }
    public String readOutputQueue(String key) {
        return queueManager.readQueue(queuesLib, queueOutput, key, timeout);
    }
    public String readOutputQueue(String queueOutput, String key) {
        return queueManager.readQueue(queuesLib, queueOutput, key, timeout);
    }
    public String readOutputQueue(String queueOutput, String key, int timeout) {
        return queueManager.readQueue(queuesLib, queueOutput, key, timeout);
    }
    public void writeFtpQueueInput(String message) {
        queueManager.writeQueue(queuesLib, ftpQueueInput, null, message);
    }
    public String readFtpOutputQueue(String key) {
        return queueManager.readQueue(queuesLib, ftpQueueOutput, key, timeout);
    }
    public void writeStatementQueueInput(String message) {
        queueManager.writeQueue(queuesLib, ftpStatementsInput, null, message);
    }
    public String readStatementOutputQueue(String key) {
        return queueManager.readQueue(queuesLib, ftpStatementsOutput, key, timeout);
    }

    public String getQueuesLib() {
        return queuesLib;
    }
    public void setQueuesLib(String queuesLib) {
        this.queuesLib = queuesLib;
    }
    public String getQueueInput() {
        return queueInput;
    }
    public void setQueueInput(String queueInput) {
        this.queueInput = queueInput;
    }
    public String getQueueOutput() {
        return queueOutput;
    }
    public void setQueueOutput(String queueOutput) {
        this.queueOutput = queueOutput;
    }
    public String getFtpQueueInput() {
        return ftpQueueInput;
    }
    public void setFtpQueueInput(String ftpQueueInput) {
        this.ftpQueueInput = ftpQueueInput;
    }
    public String getFtpQueueOutput() {
        return ftpQueueOutput;
    }
    public void setFtpQueueOutput(String ftpQueueOutput) {
        this.ftpQueueOutput = ftpQueueOutput;
    }
    public String getFtpStatementsInput() {
        return ftpStatementsInput;
    }
    public void setFtpStatementsInput(String ftpStatementsInput) {
        this.ftpStatementsInput = ftpStatementsInput;
    }
    public String getFtpStatementsOutput() {
        return ftpStatementsOutput;
    }
    public void setFtpStatementsOutput(String ftpStatementsOutput) {
        this.ftpStatementsOutput = ftpStatementsOutput;
    }
    public void setQueueManager(QueueManager queueManager) {
        this.queueManager = queueManager;
    }
    public QueueManager getQueueManager() {
        return queueManager;
    }
    public int getTimeout() {
        return timeout;
    }
    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
    
}