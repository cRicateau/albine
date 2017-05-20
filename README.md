## How to develop

Go to

all the logic is in three files:

Frontend: client/src/container/AppContainer.js

Backend:
- server/models/sms.js

Models:
- server/models/xxxxx.json
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

### How to develop in local

Run the webpack-dev-server on your local environment:
 - `cd client && npm run dev`.

In an other terminal, start your vagrant and launch the node server:

- `vagrant up`
- `vagrant ssh`
- `cd /var/www/albine/current && node server/server.js`

### Create data for your app

The whole db is editable using the CRUD interface: http://10.0.0.10/explorer

For example, to add a tweet: http://10.0.0.10/explorer/#!/Tweet/Tweet_create
