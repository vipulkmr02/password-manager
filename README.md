# 🦖 Deno password manager API

This is a simple password manager using AES-256 encryption created purely using Deno.

## Endpoints
- `newUser` (no Args): Generates a secure API key.
- `passwords` (**pID**: Password Identifier, **password**: Password):

### /newUser
Gives a random API key.

### /passwords
- `GET`: Gets a password, args required: pID
- `POST`: Saves a new password, args required: pID, password
- `PUT`: Updates a new password, args required: pID, password
- `DELETE`: Deletes a password, args required: pID

## Usage
- run `deno run dev` to start the the password manager API.
