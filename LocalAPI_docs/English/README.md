# Lattice Local API

Language versions:
[简体中文](../Chinese/总览.md)

Lattice provides a localhost-only, read-only HTTP API so external tools can access library search results and citation metadata without depending on Lattice's internal data model or app bundle.

Related documents:
[Quick Start](./quickstart.md) · [API Reference](./api-reference.md) · [Plugin Development Guide](./plugin-development.md)

This documentation is written for external developers and focuses on the practical questions:

- What the Local API can do
- Which endpoints it provides
- What the response shapes look like
- How to build your own local plugin or integration

This English version is the primary documentation set.

## Capability Overview

| Capability | Description |
| --- | --- |
| Local health check | Check whether the Local API is available, which API version is active, the current Lattice version, and the capability list |
| Paper search | Search papers by title, author, venue/source, citekey, or year |
| Single-paper detail | Fetch detailed citation metadata for one paper |
| CSL-JSON output | The paper detail response includes a `cslItem` ready for citeproc-style processors |
| Plugin static hosting | Serve local plugin front-end assets through `/plugins/{name}/...` |

## Scope and Boundaries

- This is a read-only API. It does not provide create, update, or delete endpoints.
- This is a local API. It only listens on `127.0.0.1`.
- It is intended for local scripts, automations, desktop companion tools, and plugin-style integrations such as Office or Obsidian.
- All business endpoints live under `/api/v1`.

## Documentation Index

Recommended reading order:

1. Start with [Quick Start](./quickstart.md)
2. Use [API Reference](./api-reference.md) when you need endpoint or field-level details
3. Use [Plugin Development Guide](./plugin-development.md) when you are building a local plugin or external extension

What each document is for:

| Document | When to read it | What it covers |
| --- | --- | --- |
| [quickstart.md](./quickstart.md) | First-time integration | How to enable Local API, default addresses, minimal requests, and basic troubleshooting |
| [api-reference.md](./api-reference.md) | Client implementation, SDK wrappers, endpoint integration | Public endpoints, request parameters, response shapes, error codes, and field definitions |
| [plugin-development.md](./plugin-development.md) | Local plugin or host extension development | `/plugins/{name}/...` hosting, directory layout, integration patterns, deployment, and debugging advice |

## One-Minute Start

Assuming your Local API is running on the default port `52731`:

```bash
curl http://127.0.0.1:52731/api/v1/status
curl "http://127.0.0.1:52731/api/v1/search?q=transformer&limit=5"
curl http://127.0.0.1:52731/api/v1/papers/550E8400-E29B-41D4-A716-446655440000
```

## Good Fits for the API

- Shell / Python / Node scripts: call `http://127.0.0.1:<port>/api/v1/...` directly
- Local web UIs: deploy static assets under `/plugins/{name}/...` and call `/api/v1/...` with relative paths
- Office / desktop plugins: let the host load a page from `/plugins/{name}/...`, then let that page call the Local API

## Existing External Extension References

The repository's `Lattice_plugins/` directory contains external extension assets built on top of the Local API, which can serve as references for packaging, static asset layout, and local hosting integration patterns.
