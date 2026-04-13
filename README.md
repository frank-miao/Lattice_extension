# Lattice Plugins

[中文版](./README.zh-CN.md)

This repository contains community-driven plugins and extensions for [Lattice](https://stringer07.github.io/Lattice_release/), built on top of the Lattice Local API.

## Available Plugins

### Word Add-in

A Microsoft Word add-in for inserting citations and generating bibliographies directly from your Lattice library.

- Search your library without leaving Word
- Insert citations as inline references
- Generate formatted bibliographies (IEEE, APA, or custom CSL styles)
- Automatic metadata sync with Lattice

See [`word-addin/`](./word-addin/) for details.

### Raycast Extension

A Raycast extension for searching your Lattice library and copying citation metadata directly from Raycast.

- Search your library without leaving Raycast
- View paper details and copy citekey, DOI, title, or BibTeX
- Configure the Local API port in Raycast preferences

Developed by [frank-miao](https://github.com/frank-miao). See [`raycast-extension/`](./raycast-extension/) for details.

## Disclaimer

Some plugins and extensions in this repository are community-contributed and are not necessarily developed, reviewed, supported, or endorsed by the Lattice team.

Please evaluate each plugin carefully before use and use third-party plugins at your own discretion. The repository maintainers are not responsible for issues caused by community-contributed plugins, including compatibility problems, data loss, or security risks.

## Local API

When Lattice is running, it exposes a local HTTP API that plugins can use to interact with the user's library:

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/status` | Check connection status and app version |
| `GET /api/v1/search?q=...&limit=...` | Search papers in the library |
| `GET /api/v1/papers/:id` | Fetch full metadata for a paper |

You can build plugins in any language or platform — desktop apps, browser extensions, editor integrations, CLI tools, or anything else that can make HTTP requests.

## Contributing

Contributions are welcome! You can:

- Build a **new plugin** on the Local API (for any editor, platform, or workflow)
- Improve the **existing Word add-in** (features, bug fixes, etc.)
- Improve **documentation** and examples

For Local API documentation, see [LocalAPI_docs/English/README.md](./LocalAPI_docs/English/README.md).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

All contributors retain copyright of their work and are equally protected under the project license 

## License

This project is **source-available** under the [PolyForm Shield 1.0.0](./LICENSE).

- You are free to use, modify, and redistribute this software for any non-competing purpose.
- Public redistributions must include **prominent attribution** to the Lattice project.

This is not OSI-approved open source software. See [LICENSING.md](./LICENSING.md) for full details.
