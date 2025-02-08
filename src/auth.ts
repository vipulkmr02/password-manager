/// <reference types="npm:@types/node" />
import * as crypto from "node:crypto";
import { MongoClient } from "mongodb";
const HashAlgo = "sha256";

export async function generateAPIkey() {
  const client = new MongoClient("mongodb://localhost");
  let uuid: string = crypto.randomUUID();
  let hash = crypto.createHash(HashAlgo).update(uuid).digest("hex");
  while (
    await client.db("imppassdb")
      .collection("keys")
      .findOne({ key: hash })
  ) {
    uuid = crypto.randomUUID();
    hash = crypto.createHash(HashAlgo).update(uuid).digest("hex");
  }
  const result = await client.db("imppassdb")
    .collection("keys")
    .insertOne({
      key: hash,
    });
  client.close();
  if (result.acknowledged) return uuid;
  else throw "Could not insert the generated API key";
}

export async function verifyAPIkey(key: string) {
  const client = new MongoClient("mongodb://localhost");
  const hash = crypto.createHash(HashAlgo).update(key).digest("hex");
  const result = await client.db("imppassdb")
    .collection("keys")
    .findOne({
      key: hash,
    });
  client.close();
  return { result: !!result, hash: result ? hash : null };
}
