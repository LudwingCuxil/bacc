package com.bytesw.platform.bs.queue.read.as400;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bytesw.platform.bs.queue.read.Queue;
import com.ibm.as400.access.AS400;
import com.ibm.as400.access.BaseDataQueue;
import com.ibm.as400.access.ConnectionDroppedException;
import com.ibm.as400.access.DataQueue;
import com.ibm.as400.access.DataQueueEntry;
import com.ibm.as400.access.ObjectDoesNotExistException;

public class AS400DataQueue extends Queue {

    private static final int READ  = 11;
    private static final int WRITE = 22;
    private static final int PEEK  = 33;
    private Log logger = LogFactory.getLog(getClass());

    BaseDataQueue queue;

    public AS400DataQueue(AS400 sys, String library, String name) {
      init(sys, getPath(library, name));
    }

    protected void init(AS400 sys, String path) {
      queue = new DataQueue(sys, path);
    }

    public void write(String key, String data) {
      new DataQueueThread(key, data, WRITE, this).start();
    }
    public String read(String key, long timeout) {
      DataQueueThread thread = new DataQueueThread(key, (int)timeout, READ, this);
      thread.start();
      try {
				timeout = timeout == -1 ? 0 : timeout;
        thread.join(timeout*1000);
      } catch (Exception ignore) {}
      return thread.getData();
    }
    public String peek(String key) {
      DataQueueThread thread = new DataQueueThread(key, 0, PEEK, this);
      thread.start();
      try {
        thread.join(2500);
      } catch (Exception ignore) {}
      return thread.getData();
    }

    public void close() {}

    protected String getPath(String library, String name) {
      return "/QSYS.LIB/"+library+".LIB/"+name+".DTAQ";
    }

    public void run(DataQueueThread thread) {
      switch (thread.getID()) {
        case READ:
          thread.setData(read_(thread.getKey(), thread.getTimeout()));
          break;
        case WRITE:
          write_(thread.getKey(), thread.getData());
          break;
        case PEEK:
          thread.setData(peek_(thread.getKey()));
      }
    }

    protected void write_(String key, String data) {
      try {
        ((DataQueue)queue).write(data);
      } catch (ObjectDoesNotExistException e) {
        logger.error("Objeto ["+queue.getPath()+"] no existe.");
      } catch (ConnectionDroppedException e) {
        logger.error("La conexion con ["+queue.getSystem()+"] no existe.");
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    protected String read_(String key, int timeout) {
      try {
        DataQueueEntry entry = ((DataQueue)queue).read(timeout);
        if (entry == null) return null;
        else return new String(entry.getData(), "Cp1047");
      } catch (ObjectDoesNotExistException e) {
        logger.error("Objeto ["+queue.getPath()+"] no existe.");
      } catch (ConnectionDroppedException e) {
        logger.error("La conexion con ["+queue.getSystem()+"] no existe.");
      } catch (Exception e) {
        e.printStackTrace();
      }
      return null;
    }
    protected String peek_(String key) {
      try {
        DataQueueEntry entry = ((DataQueue)queue).peek();
        if (entry == null) return null;
        else return entry.getString();
      } catch (ObjectDoesNotExistException e) {
        logger.error("Objeto ["+queue.getPath()+"] no existe.");
      } catch (ConnectionDroppedException e) {
        logger.error("La conexion con ["+queue.getSystem()+"] no existe.");
      } catch (Exception e) {
        e.printStackTrace();
      }
      return null;
    }
  }