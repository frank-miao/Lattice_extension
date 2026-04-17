# Lattice Local API Documentation

English is the primary documentation language for this doc set.

Language entrypoints:

- [English](./English/README.md)
- [简体中文](./Chinese/总览.md)

## Scope

This documentation covers the Lattice Local API surface exposed on the local machine:

- citation-oriented read endpoints under `/api/v1`
- the optional `POST /api/v1/papers` write endpoint
- plugin static hosting under `/plugins/{name}/...`

It also documents important boundaries:

- `GET /api/v1/papers/{uuid}` returns a citation snapshot, not the full internal `Paper` model
- current read payloads do not expose filesystem PDF paths or a dedicated `latticeURL` field
- integrations that only need an app deep link can synthesize `lattice://paper/{id}` from the returned `id`

## Folder Layout

- `English/`
  English documentation with standard filenames
- `Chinese/`
  Simplified Chinese documentation with Chinese filenames

## What To Read

### English

- [English/README.md](./English/README.md)
  Overview, capability map, and reading guide
- [English/quickstart.md](./English/quickstart.md)
  First-time setup, capability detection, minimal read/write requests, and troubleshooting
- [English/api-reference.md](./English/api-reference.md)
  Endpoint, field-by-method matrix, parameter, response, error, and capability reference
- [English/plugin-development.md](./English/plugin-development.md)
  Plugin hosting, deployment, integration patterns, and API boundary guidance

### 简体中文

- [Chinese/总览.md](./Chinese/总览.md)
  总览、能力说明与阅读导航
- [Chinese/快速开始.md](./Chinese/快速开始.md)
  首次接入、能力检查、最小读写示例与基础排错
- [Chinese/接口参考.md](./Chinese/接口参考.md)
  端点、字段-方法矩阵、参数、响应结构、错误码与能力边界说明
- [Chinese/插件开发指南.md](./Chinese/插件开发指南.md)
  插件托管、部署、接入模式与 API 边界说明
