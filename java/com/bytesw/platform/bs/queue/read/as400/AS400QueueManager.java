package com.bytesw.platform.bs.queue.read.as400;

import java.util.HashMap;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.bytesw.platform.bs.queue.read.Queue;
import com.bytesw.platform.bs.queue.read.QueueManager;
import com.ibm.as400.access.AS400;

@SuppressWarnings("rawtypes")
@Component
public class AS400QueueManager extends QueueManager implements Runnable {
   
	private static Log logger = LogFactory.getLog(AS400QueueManager.class);
	
	private HashMap queues;
    private AS400 sys;
    
    @Value("${web-app.jndi.as400-host}")
    private String host;
    
    @Value("${web-app.jndi.as400-user}")
    private String user;
    
    @Value("${web-app.jndi.as400-pass}")
    private String pass;
    
    private Thread reconnect;
    
    public String getHost() {
    	return host;
    }
    public void setHost(String host) {
         this.host = host;
    }
    public String getUser() {
    	return user;
    }
    public void setUser(String user) {
    	this.user = user;
    }
    public String getPass() {
    	return pass;
    }
    public void setPass(String pass) {
    	this.pass = pass;
    }

    @PostConstruct
    public void init () {
    	this.sys = new AS400(host, user, pass);
    	this.queues = new HashMap();
    	this.reconnect = new Thread(this);
    	this.reconnect.start();
    }

    public void run() {
    	while (reconnect.isInterrupted()) {
    		try {
    			Thread.sleep(900000);
    			if (sys != null) sys.disconnectAllServices();
    			this.queues.clear();
    			this.sys = new AS400(host, user, pass);
    		} catch (InterruptedException ignored) {}
    	}
    }

    public void destroy() {
        if (reconnect != null)
            reconnect.interrupt();
        if (sys != null) {
            sys.disconnectAllServices();
            queues.clear();
        }
    }

    @SuppressWarnings("unchecked")
	public Queue getQueue(String library, String name, String user) {
    	//reconnect.interrupt();
    	String key = library+'.'+name;
    	Object queue = queues.get(key);
    	if (queue == null) {
    		if (user == null || user.length() == 0)
    			queue = new AS400DataQueue(sys, library, name);
    		else queue = new AS400KeyedDataQueue(sys, library, name);
    		queues.put(key, queue);
    	}
    	return (Queue)queue;
    }

    public String[] getParameterNames() {
      String[] parm = new String[3];
      parm[0] = "queue_server";
      parm[1] = "queue_user";
      parm[2] = "queue_pass";
      return parm;
    }
    
    public void createQueue(String command) {}
    public void deleteQueue(String command) {}

    public static void main(String[] args) {
        AS400QueueManager qm = new AS400QueueManager();
        qm.setHost("10.1.202.11");
        qm.setPass("BANCANEW");
        qm.setUser("APPBANCA");
        qm.init();

        String key = "IBDGMAILCONT120520110910490000000001999999999APPBANCA  RLOPEZ2                  ";

//                                ddmmAAAAHHmmss            AgeCaje          userweb                  detalle
        //Alta de contrato Y
        /*String msg = "IBDALTACONT 120520110910490000000001989999999APPBANCA  RLOPEZ2                  08019002000913      00131-11-10500-14   S";*/

        //getRazonSocial Y
        /*String msg = "IBDRAZONSOC 120520110910490000000001889999999APPBANCA  RLOPEZ2                  08019009065729      ";*/

        //getEstadoContrato Y
        /*String msg = "IBDGESTACONT120520110910490000000001629999999APPBANCA  RLOPEZ2                  08019009065729      ";*/

        //getEmailPrincipal Y                                                                                             00131-9-10901-72    a
        String msg = "IBDGMAILCONT120520110910490000000001999999999APPBANCA  RLOPEZ2                  08019002000913      00131-11-10500-14   ";

        //getDatosContrato Y
        /*String msg = "IBDDATOSCONT120520110910490000000001739999999APPBANCA  RLOPEZ2                  08019009065729      00131-9-10901-72    ";*/

        //consultarNroContrato Y
        /*String msg = "IBDCNSNOCONT120520110910490000000001969999999APPBANCA  RLOPEZ2                  08019002000913      ";*/

        //guiaPagoLista Y
        /*String msg = "PTDGUIASLIST120520110910490000000001939999999APPBANCA  RLOPEZ2                  08019009065729      00131-9-10901-72    ";*/

        //guiaPagoListaValores Y
        /*String msg = "IBDGUIADETA 120520110910490000000001919999999APPBANCA  RLOPEZ2                  08019009065729      00131-9-10901-72    00000000000000000012";*/

        //getListaConceptos Y
        /*String msg = "IBDLISTAIMP 120520110910490000000001759999999APPBANCA  RLOPEZ2                  ";*/

        logger.info("Enviando [" + msg + "]");

        //Alta contrato
        qm.writeQueue("DEIBTDAT","DBINPCAN",null, msg);

        String answer = qm.readQueue("DEIBTDAT","DBOUTCAN", key, 10);

        logger.info("Respuesta [" + answer + "]");

          /*AS400QueueManager manager = new AS400QueueManager();*/
//          manager.setHost("10.1.202.11");
//          manager.setUser("APPBANCA");
//          manager.setPass("BANCANEW");
/*          manager.setHost(args[0]);
          manager.setUser(args[1]);
          manager.setPass(args[2]);*/

          //createUser
/*          String deleteMessage =   "0000000000000012deleteUser          ERAMIREZ8                .";
          String createMessage =   "0000000000000012createUser          ...............ERAMIREZ8                ESTUARDO                 RAMIREZ                  .";
          String asignarToken =    "0000000000000012assignDevice        ERAMIREZ8                0815285870               .";
          String deasignarToken =  "0000000000000012unassignDevice      ERAMIREZ8                0815285870               .";*/
          //String message = "ERAMIREZ2                HOLA           con-sal   10.1.124.8     "+
          //        "20100618111158000000012990501365437";
          /*String key = args[7];*/
          //listDevices
          //String message = "0000000000000012listDevices         ";
          //message += "                         ";
          //message += "                         ";
          //message += ".";
          /*manager.init();*/
          //manager.writeQueue("IB054DAT", "IBTOKENI", "", asignarToken);
/*          manager.writeQueue(args[4], args[5], "", args[8]);
          String answer = manager.readQueue(args[4], args[6], key, 10);
          System.out.println("Answer: ["+answer+"]");*/
          //while (answer.startsWith("2")) {
              //answer = manager.readQueue("IB054DAT", "IBTOKENO", "0000000000000012", 10);
              //System.out.println("Answer: ["+answer+"]");
          //}


/*
          */
/* limpiemos la prueba *//*

          answer = manager.readQueue("IB054DAT", "IBTOKENO", "0000000000000012", 1);
          System.out.println("FC1: " + answer);
          answer = manager.readQueue("IB054DAT", "IBTOKENO", "0000000000000012", 1);
          System.out.println("FC2: " + answer);
*/

          /*manager.destroy();*/
      }

  }