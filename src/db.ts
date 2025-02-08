import { MongoClient } from "mongodb";
import { decrypt, deriveKey, encrypt } from "./crypt.ts";
const dbName = "imppassdb";
const te = new TextEncoder();

// interface txRes {
//   ok: boolean;
//   message: string;
//   result: string | number | Array<string | number>;
//   resultObj: Document | null;
// }

function fromHex(this: string) {
  return new Uint8Array(
    this.match(/[0-9A-Fa-f]{2}/g)!.map(
      (x: string) => parseInt(x, 16),
    ),
  );
}
function toHex(this: Uint8Array) {
  return Array.from(this).map(
    (x) => x.toString(16).padStart(2, ""),
  ).join("");
}

interface passwordCipher {
  cipher: Uint8Array;
  iv: Uint8Array;
}

const client = new MongoClient(`mongodb://localhost:27017/${dbName}`);
const db = client.db();

async function query(uuid: string, hash: string, pid: string) {
  const coll = db.collection(uuid);

  // fetching result
  const resultObj = await coll.findOne({ pID: pid });
  if (!resultObj) return { ok: false, message: "pID doesn't exist"};

  // decrypting
  const pc: passwordCipher = {
    cipher: new Uint8Array(resultObj.password.cipher.value()),
    iv: new Uint8Array(resultObj.password.iv.value()),
  };
  const password = await decrypt(
    pc.cipher,
    await deriveKey(hash),
    pc.iv,
  );
  return { ok: true, password: new TextDecoder().decode(password) };
}

async function save(
  uuid: string,
  hash: string,
  pid: string,
  password: string,
) {
  const uniquepID = !(await db.collection(uuid).findOne({ pID: pid }));

  if (uniquepID) {
    const key = await deriveKey(hash);
    const encodedPassword = te.encode(password);

    const { cipher, iv } = await encrypt(encodedPassword, key);
    const cipherBytes = new Uint8Array(cipher);
    const ivBytes = new Uint8Array(iv);
    const data = {
      pID: pid,
      password: { cipher: cipherBytes, iv: ivBytes },
      createdAt: new Date(),
    };

    await db.collection(uuid).insertOne(data);

    return "Password saved successfully";
  } else return "pID already exists";
}

async function remove(uuid: string, pid: string) {
  const userCol = db.collection(uuid);
  return await userCol.deleteOne({ pID: pid });
}

async function update(
  uuid: string,
  hash: string,
  pid: string,
  newPassword: string,
) {
  const userCol = db.collection(uuid);
  const key = await deriveKey(hash);
  const encodedPassword = te.encode(newPassword);

  const { cipher, iv } = await encrypt(encodedPassword, key);
  const updated: passwordCipher = {
    cipher: new Uint8Array(cipher),
    iv: new Uint8Array(iv),
  };
  return userCol.updateOne({ pID: pid }, { $set: { password: updated } });
}

export { query, remove, save, update };
