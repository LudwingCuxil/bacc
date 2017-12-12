package org.hibernate.dialect;

/**
 * An SQL dialect for DB2/400.  This class provides support for DB2 Universal Database for iSeries,
 * also known as DB2/400.
 *
 * @author olopez
 */
public class DB2AS400Dialect extends DB2400Dialect {

	@Override
	public boolean supportsSequences() {
		return true;
	}
	
}
