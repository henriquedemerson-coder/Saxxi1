package com.saxxi.api.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AesGcmCryptoService {
  private static final String VERSION = "v1.";
  private static final byte[] AAD = "saxxi:bank-secret:v1".getBytes(StandardCharsets.UTF_8);
  private static final int NONCE_SIZE = 12;

  private final String encodedKey;
  private final SecureRandom secureRandom = new SecureRandom();

  public AesGcmCryptoService(
      @Value("${APP_ENCRYPTION_KEY_BASE64:}") String encodedKey) {
    this.encodedKey = encodedKey;
  }

  public String encrypt(String plaintext) {
    byte[] nonce = new byte[NONCE_SIZE];
    secureRandom.nextBytes(nonce);
    try {
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, nonce));
      cipher.updateAAD(AAD);
      byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
      byte[] payload = ByteBuffer.allocate(nonce.length + ciphertext.length)
          .put(nonce)
          .put(ciphertext)
          .array();
      return VERSION + Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
    } catch (GeneralSecurityException exception) {
      throw new IllegalStateException("Não foi possível criptografar o segredo.", exception);
    }
  }

  public String decrypt(String encryptedValue) {
    if (encryptedValue == null || !encryptedValue.startsWith(VERSION)) {
      throw new IllegalArgumentException("Formato de segredo criptografado inválido.");
    }

    try {
      byte[] payload = Base64.getUrlDecoder().decode(encryptedValue.substring(VERSION.length()));
      if (payload.length < NONCE_SIZE + 16) {
        throw new IllegalArgumentException("Formato de segredo criptografado inválido.");
      }
      ByteBuffer buffer = ByteBuffer.wrap(payload);
      byte[] nonce = new byte[NONCE_SIZE];
      buffer.get(nonce);
      byte[] ciphertext = new byte[buffer.remaining()];
      buffer.get(ciphertext);

      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, nonce));
      cipher.updateAAD(AAD);
      return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    } catch (GeneralSecurityException | IllegalArgumentException exception) {
      throw new IllegalArgumentException("Não foi possível validar o segredo criptografado.", exception);
    }
  }

  private SecretKeySpec key() {
    try {
      byte[] key = Base64.getDecoder().decode(encodedKey);
      if (key.length != 32) {
        throw new IllegalStateException("APP_ENCRYPTION_KEY_BASE64 deve conter exatamente 32 bytes.");
      }
      return new SecretKeySpec(key, "AES");
    } catch (IllegalArgumentException exception) {
      throw new IllegalStateException("APP_ENCRYPTION_KEY_BASE64 deve ser uma chave Base64 válida.", exception);
    }
  }
}
