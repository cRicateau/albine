# Installation (for development or deployment)

1. Install the version 7.10 (or later) of [nodejs](https://nodejs.org/).
2. Run `npm install` from the project's directory to install the dependencies.
3. Change the server address in the file *public/client.js* to target your server (use `'localhost:3000'` for local development).
4. Run `node server.js`to start the server. The interface is available at [http://localhost:3000].

# Change mode

To change the operating mode, one must send a POST request to the server. The request's data can be:

- `mode=tweet` to switch to tweet mode
- `mode=question&id=n` to switch to the question `n`, where `n` is an integer
- `mode=answer&id=n` to switch to the answer to the question `n`, where `n` is an integer

curl can be used to send the POST from a terminal and be notified if it fails:

`curl -w "%{http_code}\n" -d 'mode=question&id=1' http://88.190.241.96:3000/mode`
