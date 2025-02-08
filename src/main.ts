import { parseArgs } from "@std/cli/parse-args";
import { query, remove, save, update } from "./db.ts";
import { generateAPIkey, verifyAPIkey } from "./auth.ts";

// parsing arguments
const args = parseArgs(Deno.args);
const PORT = parseInt(args["port"]) || 5000;
const jstringify = JSON.stringify;

function getURLArgs(endpoint: string[]) {
  const args = endpoint.slice(1);
  const obj: { [x: string]: string } = {};
  for (const x of args) obj[x.split("=")[0]] = x.split("=")[1];
  return obj;
}

if (import.meta.main) {
  Deno.serve(
    { port: PORT, hostname: "localhost" },
    async (req: Request) => {
      let body: { [x: string]: string } = {};
      let opts: ResponseInit = { status: 200 };

      const url = req.url.split("/");
      const key = req.headers.get("key");
      const path = url[url.length - 1].split("?");
      const endpoint = path[0];
      const urlArgs = getURLArgs(path);

      if (endpoint === "passwords") {
        if (!key) {
          return new Response(jstringify({
            message: "Please provide key",
          }));
        }
        const { result, hash } = await verifyAPIkey(key);
        if (!result) {
          body = { message: "Invalid API key" };
          opts = { status: 401 };
        } else {
          if (req.method === "PUT") {
            // This request updates the existing passwords.
            if (urlArgs.pID && urlArgs.password) {
              await update(key, hash!, urlArgs.pID, urlArgs.password);
              body = { message: "Password updated" };
            } else {
              body = {
                message:
                  "No pID or password provided or password does not exist",
              };
              opts = { status: 400 };
            }
          } else if (req.method === "DELETE") {
            // This request deletes the passwords.
            if (urlArgs.pID) {
              await remove(key, urlArgs.pID);
              body = { message: "Password deleted" };
            } else {
              body = { message: "No pID provided or password does not exist" };
              opts = { status: 400 };
            }
          } else if (req.method === "POST") {
            // This request saves new passwords.
            if (urlArgs.pID && urlArgs.password) {
              const result = await save(
                key,
                hash!,
                urlArgs.pID,
                urlArgs.password,
              );
              body = { message: result };
            } else {
              body = {
                message:
                  "No pID or password provided or password already exists",
              };
              opts = { status: 400 };
            }
          } else if (req.method === "GET") {
            // This request retrieves the passwords.
            if (urlArgs.pID) {
              const dbRes = await query(key, hash!, urlArgs.pID);
              if (dbRes.ok) {
                body = { password: dbRes.password! };
              } else {
                body = { message: dbRes.message! };
                opts = { status: 404 };
              }
            } else {
              body = { message: "No pID provided" };
              opts = { status: 400 };
            }
          } else {
            body = { message: "Not a valid 'passwords' request" };
            opts = { status: 401 };
          }
        }
      } else if (endpoint === "newUser" && req.method === "GET") {
        try {
          const apiKey = await generateAPIkey();
          body = {
            message: "This is a one time key, keep it very safe",
            key: apiKey,
          };
        } catch (_err) {
          console.log(_err);
          body = { message: "Something went wrong" };
          opts = { status: 500 };
        }
      } else {
        body = { message: "Ready to rumble!" };
      }

      return new Response(jstringify(body), opts);
    },
  );
}
