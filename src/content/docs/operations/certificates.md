---
title: Certificates
description: The two TLS layers, the hairpin, and the only correct way to regenerate the internal certificate.
sidebar:
  order: 8
---

There are two layers of TLS, and only one is ours.

| Layer | Who | Cert |
|---|---|---|
| Public (browser → `nginx.ufv.ca`) | UFV IT | UFV's cert. Renewals go to IT |
| Internal (proxy → Traefik, **and container → Traefik**) | us | mkcert cert in `certs/` |

## The hairpin: why a bad internal cert breaks things invisibly

Inside the Docker network, `sacda.ufv.ca` resolves to the Traefik container. Cantaloupe, fcrepo, Alpaca, Blazegraph and Solr fetch `https://sacda.ufv.ca/...` and validate **our mkcert cert** against `certs/rootCA.pem`, which is imported into each JVM truststore at container start.

`nginx.ufv.ca` doesn't verify upstream certs. So with a broken internal cert **the site looks fine in a browser, but every IIIF image 500s and derivatives fail**. Log signs: `PKIX path building failed` or cURL error 60.

## Files

| Compose secret | File |
|---|---|
| `CERT_PUBLIC_KEY` | `certs/cert.pem` |
| `CERT_PRIVATE_KEY` | `certs/privkey.pem` |
| `CERT_AUTHORITY` | `certs/rootCA.pem` |

`certs/` is gitignored. The current cert is mkcert, an `OU` naming the PROD host, and **expires 2028-12-03**. SANs cover sacda, sacda-test, islandora, islandora-test, the DEV domain and traefik.me, plus wildcards.

## Regenerate: the only correct way

```
make traefik-certs
docker compose up -d --force-recreate
```

- **Never run `mkcert` by hand.** On 2026-08-27 someone did. The key landed in `key.pem` instead of `privkey.pem`, so Traefik fell back to `TRAEFIK DEFAULT CERT`, and `rootCA.pem` was left stale. IIIF was broken for about a week.
- `--force-recreate` is required, because the JVMs import the CA only at start.

## Verify

```
openssl verify -CAfile certs/rootCA.pem certs/cert.pem
openssl x509 -in certs/cert.pem -noout -pubkey | openssl md5
openssl pkey -in certs/privkey.pem -pubout | openssl md5
echo | openssl s_client -connect 127.0.0.1:443 -servername sacda.ufv.ca 2>/dev/null | openssl x509 -noout -subject -enddate
docker compose exec drupal curl -s -o /dev/null -w '%{http_code} %{ssl_verify_result}\n' https://sacda.ufv.ca/
docker compose logs --since 10m cantaloupe | grep -c "PKIX path building failed"
```

What to expect:
- `verify` prints `OK`.
- The two md5s match.
- The subject shows an `OU` naming the PROD host, not `TRAEFIK DEFAULT CERT`.
- The curl prints `200 0`.
- The PKIX count is `0`.

Full incident writeup: `docs/tls-cert-drift-runbook.md` in the repo.
