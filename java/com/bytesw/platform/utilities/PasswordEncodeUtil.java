package com.bytesw.platform.utilities;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Random;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.crypto.encrypt.Encryptors;

public class PasswordEncodeUtil {

	public static final int PASSWORD_MAX_LENGTH = 50;
	private final static Log log = LogFactory.getLog(PasswordEncodeUtil.class);

	public static String encodePassword(String password, String algorithm) {
		byte[] unencodedPassword = password.getBytes();

		MessageDigest md = null;

		try {
			// first create an instance, given the provider
			md = MessageDigest.getInstance(algorithm);
		} catch (Exception e) {
			log.error("Exception: " + e);

			return password;
		}

		md.reset();

		// call the update method one or more times
		// (useful when you don't know the size of your data, eg. stream)
		md.update(unencodedPassword);

		// now calculate the hash
		byte[] encodedPassword = md.digest();

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < encodedPassword.length; i++) {
			if ((encodedPassword[i] & 0xff) < 0x10) {
				buf.append("0");
			}

			buf.append(Long.toString(encodedPassword[i] & 0xff, 16));
		}

		return buf.toString();
	}

	public static String encryptPassword(String decryptedPassword) {
		// return encryptPassword( decryptedPassword, decryptedPassword.length()
		// );
		return encryptPassword(decryptedPassword, 124);
	}

	public static String encryptPassword(String decryptedPassword, int length) {
		byte[] source = new byte[length];

		byte[] decArray = decryptedPassword.getBytes();

		int decLength = decArray.length;

		System.arraycopy(decArray, 0, source, 0, decLength);

		Random random = new Random(System.currentTimeMillis());

		int padded = length - decLength;
		length--;

		while (decLength < length)
			source[decLength++] = (byte) random.nextInt(255);

		source[length] = (byte) ((padded & 0x7F) << 1 | 1);

		length++;

		byte[] encArray = new byte[length];

		int middle = length / 2;

		for (int i = 0, k = length - 1; i < length; i += 2, k--) {
			encArray[i] = (byte) ((source[k] & 0x0F) | (source[k - middle] & 0xF0));
			encArray[i + 1] = (byte) ((source[k] & 0xF0) | (source[k - middle] & 0x0F));
		}

		String encoded = encode(encArray);

		return encoded;
	}

	public static String decryptPassword(String encryptedPassword) {
		byte[] source = decode(encryptedPassword);

		int length = source.length;
		int middle = length / 2;

		byte[] decArray = new byte[length];

		for (int i = 0, k = length - 1; i < middle; i++, k -= 2) {
			decArray[i] = (byte) ((source[k] & 0x0F) | (source[k - 1] & 0xF0));
			decArray[i + middle] = (byte) ((source[k] & 0xF0) | (source[k - 1] & 0x0F));
		}

		int padded = (decArray[decArray.length - 1] & 0xFE) >> 1;

		return new String(decArray).substring(0, decArray.length - padded);
	}

	private static String encode(byte[] array) {
		Base64 encoder = new Base64();
		StringBuilder buffer = new StringBuilder(new String(encoder.encode(array)).trim());

		for (int i = buffer.length(); --i >= 0;)
			if (buffer.charAt(i) == '\n' || buffer.charAt(i) == '\r')
				buffer.deleteCharAt(i);

		return buffer.toString();
	}

	private static byte[] decode(String data) {
		Base64 decoder = new Base64();

		return decoder.decode(data.getBytes());
	}

	/**
	 * Codifica un String utilizado codificacion Base64. Utilizado cuando se
	 * guardan passwords como cookies. Esta codificacion es debil ya que
	 * cualquiera puede utilizar el metodo decodeString para reversar la
	 * codificacion.
	 * 
	 * @param str
	 *            - String a codificar
	 * @return String codificado
	 */
	public static String encodeB64String(String str) {
		Base64 encoder = new Base64();
		return new String(encoder.encode(str.getBytes())).trim();
		// sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
		// return encoder.encodeBuffer(str.getBytes()).trim();
	}

	/**
	 * Descodificacion de un String utilizado codificacion Base64.
	 * 
	 * @param str
	 *            - String a descodificar
	 * @return String descodificado
	 */
	public static String decodeB64String(String str) {
		Base64 decoder = new Base64();
		return new String(decoder.decode(str.getBytes())).trim();
		/*
		 * sun.misc.BASE64Decoder dec = new sun.misc.BASE64Decoder(); try {
		 * return new String(dec.decodeBuffer(str)); } catch (IOException io) {
		 * throw new RuntimeException(io.getMessage(), io.getCause()); }
		 */
	}

	public static void main(String[] args) {
		String key = "AmIoalOp17Hn49ol";
		String en = PasswordEncodeUtil.symEncryptWithSaltAdded(key, "admin");
		System.out.println(en);
		String de = PasswordEncodeUtil.symDecrypWithSaltAdded(key, en);
		System.out.println(de);
	}

	static final Random r = new SecureRandom();

	public static String symEncryptWithSaltAdded(String key, String password) {
		byte[] salt = new byte[Constants.ENCRYPTION_ALGORIGTHM_SALT_BYTES_SIZE];
		r.nextBytes(salt);
		String sal = org.apache.commons.codec.binary.Hex.encodeHexString(salt);
		return sal + Encryptors.text(key, sal).encrypt(password);
	}

	public static String symDecrypWithSaltAdded(String key, String password) {
		String salt = password.substring(0, (Constants.ENCRYPTION_ALGORIGTHM_SALT_BYTES_SIZE * 2));
		password = password.substring((Constants.ENCRYPTION_ALGORIGTHM_SALT_BYTES_SIZE * 2));
		return Encryptors.text(key, salt).decrypt(password);
	}

}
