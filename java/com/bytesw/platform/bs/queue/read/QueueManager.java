package com.bytesw.platform.bs.queue.read;

public abstract class QueueManager {
	
	public abstract void createQueue( String command );

	public abstract void deleteQueue( String command );

	public void writeQueue( String library, String name, String user, String data) {
		getQueue( library, name, user ).write( user, data );
	}

	public String readQueue( String library, String name, String user, int seconds) {
		return getQueue( library, name, user ).read( user, seconds );
	}

    public void closeQueue(String library, String name, String user) {
        Queue queue = getQueue(library, name, user);
        if(queue != null) {
            queue.close();
        }
    }
    public String peek( String library, String name, String user ) {
		return getQueue( library, name, user ).peek( user );
	}

	public abstract Queue getQueue( String library, String name, String user );

	public abstract String[] getParameterNames();

	public abstract void init();

    public abstract void destroy();
    
}