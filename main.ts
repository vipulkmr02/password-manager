import { parseArgs } from "@std/cli/parse-args";

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

const passwords: { [x: string]: string } = {
  "123456": "password123",
  "abcde": "abcde123",
};

if (import.meta.main) {
  Deno.serve(
    { port: PORT, hostname: "localhost" },
    (req: Request) => {
      let body: { [x: string]: string } = {};
      let opts: ResponseInit = { status: 200 };

      if (req.headers.get("token") || "") {
        const url = req.url.split("/");
        const endpoint = url[url.length - 1].split("?");
        const urlArgs = getURLArgs(endpoint);

        // CP-update-endpoint
        if (endpoint[0] === "update" && req.method === "PUT") {
          if (
            urlArgs.pID && urlArgs.password &&
            passwords[urlArgs.pID] !== undefined
          ) {
            passwords[urlArgs.pID] = urlArgs.password;
            body = { message: "Password updated" };
          } else {
            body = {
              message: "No pID or password provided or password does not exist",
            };
          }
        } // CP-delete-endpoint
        else if (endpoint[0] === "delete" && req.method === "DELETE") {
          if (urlArgs.pID && passwords[urlArgs.pID] !== undefined) {
            delete passwords[urlArgs.pID];
            body = { message: "Password deleted" };
          } else {
            body = { message: "No pID provided or password does not exist" };
          }
        } // CP-new-endpoint
        else if (endpoint[0] === "new" && req.method === "POST") {
          if (
            urlArgs.pID && urlArgs.password &&
            passwords[urlArgs.pID] === undefined
          ) {
            passwords[urlArgs.pID] = urlArgs.password;
            body = { message: "Password saved" };
          } else {
            body = {
              message: "No pID or password provided or password already exists",
            };
          }
        } // CP-query-endpoint
        else if (endpoint[0] === "query" && req.method === "GET") {
          if (urlArgs.pID) {
            body = { message: "Invalid password identifier" }; // response, if pID not found in database
            const password = passwords[urlArgs.pID];
            if (password) {
              body = { password: password }; // response, if pID found in database
            }
          } else {
            body = { message: "No pID provided" };
          }
        } else {
          body = { message: "Welcome to IMP.PASS API" };
        }
      } else {
        body = { message: "No token found" };
        opts = { status: 401 };
      }

      return new Response(jstringify(body), opts);
    },
  );
}
