# njalla-letsencrypt

**[WIP]**

API for [njal.la](https://njal.la) automatic wildcard certification with Let's Encrypt (compatible with [lego's](https://github.com/go-acme/lego) httpreq strategy).

It relies on an unofficial njal.la library [node-njalla-dns](https://github.com/romualdr/node-njalla-dns) to adminstrate your domains as njal.la doesn't have an API. 

## Run it

You need [node](https://nodejs.org/en/) and [npm](https://npmjs.com)

**Don't** forget to change variables.
- `NJALLA_USERNAME` is your njal.la username
- `NJALLA_PASSWORD` is your njal.la password
- `HTTPREQ_USERNAME` is a username that will be used by lego to access this API
- `HTTPREQ_PASSWORD` is a password that will be used by lego to access this API

```sh
$ NJALLA_USERNAME=your_njalla_username \
  NJALLA_PASSWORD=your_njalla_password \
  HTTPREQ_USERNAME=lego \
  HTTPREQ_PASSWORD=password \
  npm install && npm run start
```

## Test it

We advise you to use [docker](https://docker.com) to test your configuration. The next command runs a DNS validation like it will do when deployed on production.

**Don't** forget to change variables before running.
- `HTTPREQ_USERNAME` is the `HTTPREQ_USERNAME` you set when you started the API
- `HTTPREQ_PASSWORD` is the `HTTPREQ_PASSWORD` you set when you started the API
- `HTTPREQ_ENDPOINT` is the host and port of this API
- `--domains` is the domain you want LEGO to get certificates for
- `--email` is the email that will be used by Let's Encrypt

```sh
$ docker run --rm -ti \
    -e "HTTPREQ_USERNAME=lego" \
    -e "HTTPREQ_PASSWORD=password" \
    -e "HTTPREQ_ENDPOINT=http://localhost:8080" \
        goacme/lego \
            --server=https://acme-staging-v02.api.letsencrypt.org/directory \
            --dns httpreq \
            --domains domain.io \
            --email hello@romualdr.io run
```

*Note that this command uses staging LE environment to avoid hitting the request limit*

## Build it

`docker build -t njalla-letsencrypt:latest -f ./docker/Dockerfile .`

## Deploy it

`docker-compose -f ./docker/docker-compose.yml up -d lego-njalla-api`