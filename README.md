# njalla-letsencrypt

> **WARNING** This is **deprecated**. You should instead use the official LEGO provider [https://go-acme.github.io/lego/dns/njalla/](https://go-acme.github.io/lego/dns/njalla/)

> Updated 25/09/2022: njal.la api was updated - and lego lib wasn't working anymore.

> A patch was provided but Traefik 2.9 is still not including the patch. (failed to unmarshal response result: json: cannot unmarshal string into Go struct field Record.id of type int when trying to renew certificates)

> Solution ? Use this tool as an http provider to correctly renew certificates. So this is temporarily undeprecated to patch this Traefik issue.

API for [njal.la](https://njal.la) automatic wildcard certification with Let's Encrypt (compatible with [lego's](https://github.com/go-acme/lego) httpreq strategy).

Disclosure: It relies on my unofficial njal.la library [node-njalla-dns](https://github.com/romualdr/node-njalla-dns) to administrate your domains.

## Run it

You need [node](https://nodejs.org/en/) and [npm](https://npmjs.com)

**Don't** forget to change variables.
- `NJALLA_API_KEY` is your njal.la API key (Go on [https://njal.la/settings/api/](https://njal.la/settings/api/) to grab one)
- `HTTPREQ_USERNAME` is a username that will be used by lego to access this API
- `HTTPREQ_PASSWORD` is a password that will be used by lego to access this API

```sh
$ npm install && NJALLA_API_KEY=your_njalla_api_key \
  HTTPREQ_USERNAME=lego \
  HTTPREQ_PASSWORD=password \
  npm run start
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
    -e "HTTPREQ_ENDPOINT=http://<your_local_ip_like_192_168_0_xx>:8080" \
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