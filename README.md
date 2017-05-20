## How to develop
all the logic is in three files:

Frontend: client/src/container/AppContainer.js

Backend:
- server/models/sms.js
- server/models/sms.json
- DB migrations in migrations/

## The deployment

- Connect as ubuntu:

`ssh -i albine.pem  ubuntu@13.58.99.30`

- add your public key to the user **www-data**

When you have www-data ssh access to the server (`ssh www-data@13.58.99.30`), deploy:

```bash
npm run deploy
```

## Local installation

Install node 6.xxx , virtualbox, ansible

- Launch VM: `vagrant up`

- Connect to the vagrant: `vagrant ssh`

- Compile the frontend code:
```
sudo su - www-data
cd /var/www/albine/current/client && npm rebuild node-sass
cd ../ && npm run build:client
```

- Run migrations:
```
cd /var/www/albine/current && npm run migrate:up
```

- Start the server:
```
cd /var/www/albine/current && node server/server.js
```

Now, you are set up !

You can browse a static page served by Loopback at the following url : `http://10.0.0.10`

### Migrations to change the db structure:

- Create: `npm run migrate:create`
- Down: `npm run migrate:down`
- Up: `npm run migrate:up`

### How to develop in local using webpack

 Webpack can watch your frontend files and recompiles the code automatically as soon as you change your code (live-reloading).

 :bangbang: The webpack live-reloading is really slow in a vagrant. To avoid that, run the webpack-dev-server on your local environment:
 - `cd client && npm run dev`.


 Think of the loopback server in the vagrant as an external API that you will query from your reactjs app.

 In your local environment, all your HTTP requests should be redirected to the vagrant IP address.

 For example, if you want to fetch the url `/api/users`, you can do it like this:

 ```javascript

 let baseApiPath = '';
 let options = {};

 if (process.env.NODE_ENV === 'development') {
   baseApiPath = 'https://10.0.0.10';
   options.credentials = 'include'; // needed for CORS requests
 }

 fetch(`${baseApiPath}/api/users`, options)
 ```
