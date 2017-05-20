## The deployment

- Connect as ubuntu:

`ssh -i albine.pem  ubuntu@13.58.99.30`

- add your public key to the user **www-data**

When you have www-data ssh access to the server (`ssh www-data@13.58.99.30`), deploy:

```bash
npm run deploy
```
