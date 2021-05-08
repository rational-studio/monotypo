<p align="center">
  <img src="./assets/logo.svg">
</p>

### Introduction

Monotypo does:
- Monorepo orchestration for building and testing
- Watch server
- Shared and dynamic TypeScript configuration
- Shared prettier configuration
- Opinionated Danger / Husky rules
- Changelog solution

### Dependencies

- prettier
- manypkg
- danger
- husky

### Commands

`m dev [packageName]`

`m build [packageName]`

`m lint [--ci]`

`m test`

`m create [packageName]`

`m init`

`m doctor` (Phase 2)

`m eject [packageName]` (Phase 2)

### Config

`m.config.json`

```json
{
  "bundler": "webpack", // none | webpack | esbuild
  "extensions": ["sass"] // sass
}
```

### Build orchestration

- Build (Phase 1)
- Watch / Dev (Phase 1)
- Lint (Phase 1)
- Test (Phase 2)
