const keyLen = 32;
const digest = "sha-256";
const algorithm = "aes-gcm";

export async function deriveKey(hash: string) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(hash),
    { name: "HKDF", hash: digest },
    false,
    ["deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: digest,
      info: new Uint8Array(0),
      salt: new Uint8Array(0),
    },
    baseKey,
    { name: algorithm, length: keyLen * 8 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function getIv() {
  return crypto.getRandomValues(new Uint8Array(12));
}

export async function encrypt(
  data: BufferSource,
  key: CryptoKey,
) {
  const iv = getIv();

  const encrypted = await crypto.subtle.encrypt(
    { name: algorithm, iv: iv },
    key,
    data,
  );

  // encode before saving
  const encryptedE = encrypted;
  const ivE = iv;
  return { cipher: encryptedE, iv: ivE };
}

export async function decrypt(
  cipher: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
) {
  const decrypted = await crypto.subtle.decrypt(
    { name: algorithm, iv: iv },
    key,
    cipher,
  );
  return decrypted;
}

if (import.meta.main) {
  const key = await deriveKey("passwd");
  const encrypted = await encrypt(
    new TextEncoder().encode("I love you!"),
    key,
  );

  console.log("\n<----- Encrypted ----->");
  const hexRep = Array.from(
    new Uint8Array(encrypted.cipher),
  ).map(
    x => x.toString(16).padStart(2, "0"),
  ).join("");
  console.log(hexRep);
  const decrypted = await decrypt(
    encrypted.cipher, key, encrypted.iv);

  console.log("\n<----- Decrypted ----->");
  console.log(new TextDecoder().decode(
    decrypted,
  ));
}
