# Local API Reference

Language versions:
[简体中文](../Chinese/接口参考.md)

Related documents:
[Overview](./README.md) · [Quick Start](./quickstart.md) · [Plugin Development Guide](./plugin-development.md)

## Basics

- Protocol: HTTP
- Default address: `http://127.0.0.1:52731`
- API prefix: `/api/v1`
- Data format: `application/json; charset=utf-8`
- Supported methods: `GET`, `OPTIONS`
- Write operations: not supported

## General Conventions

### Successful responses

- Normal business endpoints return `200 OK`
- Preflight requests return `204 No Content`

### Error responses

Error responses use a uniform shape:

```json
{
  "error": "Error message"
}
```

### Common status codes

| Status | Meaning | Typical reason |
| --- | --- | --- |
| `200` | Success | The request completed normally |
| `204` | No content | `OPTIONS` preflight |
| `400` | Bad request | Invalid request format or invalid UUID |
| `403` | Forbidden | Non-local request or origin not allowed |
| `404` | Not found | Unknown endpoint, missing paper, or missing plugin asset |
| `405` | Method not allowed | Unsupported method such as `POST` or `PUT` |
| `500` | Internal server error | Lattice failed to process the request |

## `GET /status`

Checks whether the service is online and reports which capabilities the current instance supports.

### Request

```http
GET /api/v1/status
```

### Response fields

| Field | Type | Description |
| --- | --- | --- |
| `ok` | `boolean` | Health flag. Normally `true` when the service is available |
| `apiVersion` | `string` | Current Local API version |
| `appVersion` | `string` | Current Lattice app version |
| `capabilities` | `string[]` | Supported capability list |

### Current capability values

| Capability | Description |
| --- | --- |
| `search` | Paper search is available |
| `paper-detail` | Per-paper detail fetch by paper ID is available |
| `csl-item` | Detail payloads include CSL-JSON usable by citation engines |
| `plugin-hosting` | Local plugin static hosting is available |

### Example

```json
{
  "ok": true,
  "apiVersion": "1",
  "appVersion": "1.2.3 (456)",
  "capabilities": [
    "search",
    "paper-detail",
    "csl-item",
    "plugin-hosting"
  ]
}
```

## `GET /search`

Searches the Lattice library and returns lightweight result cards suitable for suggestion UIs, pickers, and search result lists.

### Request

```http
GET /api/v1/search?q=<query>&limit=<n>
```

### Query parameters

| Parameter | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `q` | No | `string` | empty string | Search query. If empty, the endpoint returns recently added papers |
| `limit` | No | `integer` | `10` | Number of results. Valid range is `1` to `50` |

### Matching scope

From an external integration point of view, search matches the following kinds of fields:

- title
- author
- journal / venue / source
- `citekey`
- year

### Response shape

```json
{
  "papers": [
    {
      "id": "550E8400-E29B-41D4-A716-446655440000",
      "title": "Attention Is All You Need",
      "authorsDisplay": "Ashish Vaswani, Noam Shazeer, Niki Parmar, ...",
      "subtitle": "Ashish Vaswani, Noam Shazeer, Niki Parmar, ... • 2017 • NeurIPS",
      "year": 2017,
      "citekey": "vaswani2017attention",
      "paperType": "inproceedings"
    }
  ]
}
```

### `papers[]` field reference

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Paper UUID |
| `title` | `string` | Display title. Empty titles are returned as `Untitled` |
| `authorsDisplay` | `string` | Author text formatted for direct UI display |
| `subtitle` | `string` | Secondary summary text, typically combining author, year, and source |
| `year` | `integer \| null` | Publication year |
| `citekey` | `string` | Preferred citation key. If no persisted key exists, a usable generated key is returned |
| `paperType` | `string` | Paper type |

### Possible `paperType` values

- `article`
- `book`
- `inproceedings`
- `thesis`
- `report`
- `misc`

### Example

```bash
curl "http://127.0.0.1:52731/api/v1/search?q=transformer&limit=5"
```

## `GET /papers/{uuid}`

Fetches detailed citation metadata for a single paper.

### Request

```http
GET /api/v1/papers/{uuid}
```

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `uuid` | `string` | Paper UUID. Must be a valid UUID or the endpoint returns `400` |

### Response shape

```json
{
  "id": "550E8400-E29B-41D4-A716-446655440000",
  "citekey": "vaswani2017attention",
  "title": "Attention Is All You Need",
  "authors": [
    "Ashish Vaswani",
    "Noam Shazeer"
  ],
  "year": 2017,
  "journal": "NeurIPS",
  "doi": "10.5555/example-doi",
  "volume": "30",
  "issue": null,
  "pages": "5998-6008",
  "isbn": null,
  "paperType": "inproceedings",
  "cslItem": {
    "id": "550E8400-E29B-41D4-A716-446655440000",
    "type": "paper-conference",
    "title": "Attention Is All You Need",
    "author": [
      {
        "family": "Vaswani",
        "given": "Ashish"
      },
      {
        "family": "Shazeer",
        "given": "Noam"
      }
    ],
    "container-title": "NeurIPS",
    "publisher": null,
    "issued": {
      "date-parts": [[2017]]
    },
    "DOI": "10.5555/example-doi",
    "volume": "30",
    "issue": null,
    "page": "5998-6008",
    "ISBN": null
  }
}
```

### Top-level field reference

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Paper UUID |
| `citekey` | `string` | Preferred citation key |
| `title` | `string` | Title |
| `authors` | `string[]` | Array of author strings |
| `year` | `integer \| null` | Year |
| `journal` | `string \| null` | Journal, conference, publisher, or other source text |
| `doi` | `string \| null` | DOI |
| `volume` | `string \| null` | Volume |
| `issue` | `string \| null` | Issue |
| `pages` | `string \| null` | Page range |
| `isbn` | `string \| null` | ISBN |
| `paperType` | `string` | Paper type |
| `cslItem` | `object` | Object ready to be passed to a CSL citation processor |

### `cslItem` field reference

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Same as the paper ID |
| `type` | `string` | CSL item type |
| `title` | `string` | Title |
| `author` | `object[]` | Author array with `family` / `given` / `literal` fields |
| `container-title` | `string \| null` | Journal, proceedings, or other container title |
| `publisher` | `string \| null` | Publisher. Common for book-like items |
| `issued` | `object \| null` | Date object in the form `{"date-parts": [[YYYY]]}` |
| `DOI` | `string \| null` | DOI |
| `volume` | `string \| null` | Volume |
| `issue` | `string \| null` | Issue |
| `page` | `string \| null` | Pages |
| `ISBN` | `string \| null` | ISBN |

### `paperType` to `cslItem.type` mapping

| `paperType` | `cslItem.type` |
| --- | --- |
| `article` | `article-journal` |
| `book` | `book` |
| `inproceedings` | `paper-conference` |
| `thesis` | `thesis` |
| `report` | `report` |
| `misc` | `article` |

### Typical uses

- Fetch a full paper snapshot before inserting a citation
- Build input for citeproc / CSL engines
- Show a detailed citation card in an external tool
- Maintain a local metadata cache inside a plugin

## `OPTIONS`

The Local API also accepts `OPTIONS` to support browser preflight requests.

### Characteristics

- Returns `204 No Content`
- Returns CORS headers for allowed origins
- Does not return business payload data

If your page is hosted by Lattice under `/plugins/{name}/...`, you usually do not need to handle this explicitly.

## CORS and origin restrictions

By default, the Local API is intended for local browser origins:

- `http://localhost:*`
- `https://localhost:*`
- `http://127.0.0.1:*`
- `https://127.0.0.1:*`

This is why hosting your plugin page under `/plugins/{name}/...` is the simplest and most reliable option.

## Error examples

### Invalid UUID

```bash
curl http://127.0.0.1:52731/api/v1/papers/not-a-uuid
```

```json
{
  "error": "Invalid paper id"
}
```

### Unknown endpoint

```json
{
  "error": "Not found"
}
```

## Related documents

- If you have not yet verified that the service is reachable, start with [Quick Start](./quickstart.md)
- If you are building a local plugin or host extension, pair this with [Plugin Development Guide](./plugin-development.md)
