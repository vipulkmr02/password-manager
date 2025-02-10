# 🦕 Deno password manager API

This is a simple password manager using AES-256 encryption created purely using Deno.

## Endpoints
- `newUser` (no Args): Generates a secure API key.
- `passwords` (**pID**: Password Identifier, **password**: Password):

### /newUser
Generates an API key.

### /passwords
- request `GET`: Gets a password, args required: pID
- request `POST`: Saves a new password, args required: pID, password
- request `PUT`: Updates a new password, args required: pID, password
- request `DELETE`: Deletes a password, args required: pID

## Usage
- run `deno run build` to generate executable.

## CURL requests:
- for quering: `curl -X GET -H "key: <api-key>" -s localhost:6000/passwords?pID=<passwordIdentifier>`
- for saving: `curl -X POST -H "key: <api-key>" -s localhost:6000/passwords?pID=<passwordIdentifier>?password=<password>`
- for updating: `curl -X PUT -H "key: <api-key>" -s localhost:6000/passwords?pID=<passwordIdentifier>?password=<password>`
- for deleting: `curl -X DELETE -H "key: <api-key>" -s localhost:6000/passwords?pID=<passwordIdentifier>`
