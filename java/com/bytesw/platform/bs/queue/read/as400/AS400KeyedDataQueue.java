package com.bytesw.platform.bs.queue.read.as400;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.ibm.as400.access.AS400;
import com.ibm.as400.access.ConnectionDroppedException;
import com.ibm.as400.access.DataQueueEntry;
import com.ibm.as400.access.KeyedDataQueue;
import com.ibm.as400.access.ObjectDoesNotExistException;

public class AS400KeyedDataQueue extends AS400DataQueue {
    
	private Log logger = LogFactory.getLog(getClass());

    public AS400KeyedDataQueue(AS400 sys, String library, String name) {
      super(sys, library, name);
    }
    protected void init(AS400 sys, String path) {
      queue = new KeyedDataQueue(sys,path);
    }

    protected void write_(String key, String data) {
      try {
				//StringBuffer buffer = new StringBuffer(key);
				//for (int i=0,length=((KeyedDataQueue)queue).getKeyLength()-buffer.length(); i < length; i++)
					//buffer.append(' ');
				//System.out.println("Key to Write "+ key);
				((KeyedDataQueue)queue).write(key,data);
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
//				StringBuffer buffer = new StringBuffer(key);
				//for (int i=0,length=((KeyedDataQueue)queue).getKeyLength()-buffer.length(); i < length; i++)
					//buffer.append(' ');
				timeout = timeout == 0 ? -1 : timeout;
				//System.out.println("Va a leer con " + key);
        DataQueueEntry entry = ((KeyedDataQueue)queue).read(key,timeout,"EQ");
//				System.out.println("lee "+entry);

        if (entry == null) return null;

      	String string = entry.getString();

				//System.out.println("A.C. ["+string+"]["+key+']');
         //Hace los cambios necesarios
        //boolean trx1300 = key.substring(11,15).equals("1300");
//
        //if (trx1300) {
        	//if (string != null && string.length() > 12 && string.charAt(10) == '2')
        		//string = string.substring(0,10)+"02"+string.substring(12);
        //} else {
        	//if (string != null && string.length() > 12 && string.charAt(10) == '2')
        		//string = string.substring(0,10)+"02"+string.substring(12);
        	//else if (string != null && string.length() > 9 && string.charAt(10) == '5')
        		//string = new StringBuffer(string).insert(10,'0').toString();
        //}
//
				//if ((string.length() > 5 && string.substring(3,5).equals("01") || string.substring(3,5).equals("41")) && !trx1300) {
					//byte[] xx = entry.getData();
					//byte[] array = new byte[4];
					//try {
						//System.arraycopy(xx,12,array,0,4);
						//String temp = Compressor.deCompressToString(array);
						//if (temp.length() > 6) temp = temp.substring(0,6);
						//String t = string.substring(5,8);
						//StringBuffer b = new StringBuffer(string).delete(5,11).insert(5,temp);
						/*b.setCharAt(11,'1');*/
						//string = b.insert(0, t).toString();
						//
					//} catch (Exception e) {}
				//} else string = "000"+string;
//
				//System.out.println("D.C. ["+string+"]["+key+']');

				return string;
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
        DataQueueEntry entry = ((KeyedDataQueue)queue).peek(key);
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
