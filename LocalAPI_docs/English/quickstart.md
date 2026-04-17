# Local API Quick Start

Language versions:
[简体中文](../Chinese/快速开始.md)

Related documents:
[Overview](./README.md) · [API Reference](./api-reference.md) · [Plugin Development Guide](./plugin-development.md)

## 1. Enable Local API in Lattice

Open:

`Settings → Local API`

You will find the following settings:

- `Enabled`
- `Read-Only Mode`
- `Port`
- `Base URL`
- `Trusted Folders` (shown when `Read-Only Mode` is off)

The default port is `52731`, and the configurable range is `1024` to `65535`.

Typical default address:

```text
http://127.0.0.1:52731
```

API prefix:

```text
http://127.0.0.1:52731/api/v1
```

If you change the port, existing clients must reconnect to the new address.

`Read-Only Mode` is on by default. Turn it off only if your integration needs `POST /api/v1/papers`. If you want to attach PDFs via `pdfPath`, add the enclosing folder under `Trusted Folders`.

## 2. Start with a health check and capability check

```bash
curl http://127.0.0.1:52731/api/v1/status
```

Example response:

```json
{
  "ok": true,
  "apiVersion": "1",
  "appVersion": "1.0.0 (123)",
  "capabilities": [
    "search",
    "paper-detail",
    "csl-item",
    "plugin-hosting"
  ]
}
```

Meaning:

- `ok` being `true` means the service is reachable
- `apiVersion` is the active HTTP API version
- `appVersion` is the current Lattice app version
- `capabilities` lists the features supported by the current instance

If write access is enabled, `capabilities` also includes:

```json
"create-paper"
```

Recommended rule:

- treat `/status.capabilities` as the source of truth for whether paper creation is available
- do not assume `POST /api/v1/papers` is always enabled

## 3. Try a search

```bash
curl "http://127.0.0.1:52731/api/v1/search?q=graph%20neural%20network&limit=5"
```

If `q` is empty, the endpoint returns recently added papers.

## 4. Fetch one paper

After you get an `id` from search results:

```bash
curl http://127.0.0.1:52731/api/v1/papers/550E8400-E29B-41D4-A716-446655440000
```

This endpoint returns a citation-oriented paper snapshot and includes a `cslItem` that can be passed directly to a CSL processor.

## 5. Optionally create a paper

If `create-paper` is present in `/status.capabilities`:

```bash
curl -X POST http://127.0.0.1:52731/api/v1/papers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Attention Is All You Need",
    "authors": "Vaswani, Ashish; Shazeer, Noam",
    "year": 2017,
    "doi": "10.48550/arXiv.1706.03762",
    "paperType": "inproceedings",
    "enrich": true
  }'
```

Typical successful response:

```json
{
  "id": "550E8400-E29B-41D4-A716-446655440000",
  "title": "Attention Is All You Need",
  "authors": "Vaswani, Ashish; Shazeer, Noam",
  "year": 2017,
  "doi": "10.48550/arXiv.1706.03762",
  "pdfAttached": false,
  "enrichmentStatus": "pending",
  "warnings": []
}
```

## 5a. Optionally attach a PDF by path

`POST /api/v1/papers` also accepts `pdfPath` for a PDF that already exists on disk.

Before relying on it:

- turn `Read-Only Mode` off
- add the enclosing folder under `Trusted Folders`
- expect a metadata-only create with `pdfAttached: false` plus a warning when the path is outside every Trusted Folder

Example:

```bash
curl -X POST http://127.0.0.1:52731/api/v1/papers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Attention Is All You Need",
    "pdfPath": "/Users/me/Papers/attention.pdf"
  }'
```

## 6. Understand the read/write boundary

`GET /api/v1/papers/{uuid}` is a citation snapshot, not a full serialization of the internal Lattice paper record.

It currently does not return:

- `abstract`
- `collections`
- `tags`
- `pdfPath`
- `pdfURL`
- `latticeURL`

Practical implication:

- if you only need an app deep link, synthesize `lattice://paper/{id}` from the returned `id`
- if you need the actual PDF file path, the current Local API does not expose it
- `pdfPath` is accepted by `POST /api/v1/papers` as an input field, but it is not echoed back by the read endpoints

## 7. Typical integration styles

### Style A: script or local service

Call the full URL directly:

```js
const baseURL = "http://127.0.0.1:52731/api/v1";
const status = await fetch(`${baseURL}/status`).then((r) => r.json());
```

### Style B: plugin page

If your page is hosted by Lattice under `/plugins/{name}/...`, use relative paths:

```js
const response = await fetch("/api/v1/status");
```

This keeps the plugin page and the API on the same origin, so you do not need extra CORS handling.

## 8. Security and access model

The Local API is designed for local integrations, not public network exposure.

- It listens only on the loopback interface
- By default it only allows local browser origins
- It supports `GET`, `OPTIONS`, and `POST`
- `POST /api/v1/papers` still requires the user to enable write access

In practice this means:

- Remote machines cannot access the API directly
- A regular web page on a remote origin should not expect direct browser access by default
- The simplest and most reliable web integration model is to host the plugin page under `/plugins/{name}/...`

## 9. First things to check when it does not connect

1. Make sure Lattice is running
2. Make sure `Enabled` is turned on
3. Check whether the port was changed
4. Make sure your client is not still pointing to the old port
5. If your host integration uses a manifest, cached entry URL, or install script, regenerate or reinstall it after changing the port
6. If `POST /api/v1/papers` fails with `403`, check whether `Read-Only Mode` is still on
7. If paper creation succeeds but `pdfAttached` is `false`, inspect the `warnings` array for Trusted Folder, file-type, or file-existence issues

## Next steps

- If you need the full endpoint and field definitions, continue with [API Reference](./api-reference.md)
- If you are building a local plugin or external extension, continue with [Plugin Development Guide](./plugin-development.md)
