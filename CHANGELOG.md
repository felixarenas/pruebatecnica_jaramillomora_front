# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- [17/07/2026 15:03:32] Fix IFC 3D viewer load: local web-ifc WASM/fragments worker, single-thread Init, MEMORY_LIMIT from env (uint32-safe), validate IFC bytes, and use storage URL (not nom_file) in show-model3d

### Added

- [17/07/2026 00:07:23] Add process-grafic-ifc page to select stored IFC files and call process-property-sets-ifc via Processifc.processGrafic
- [15/07/2026 20:37:47] Add show-model3d page with That Open IFC viewer, Property Sets JSON extraction, imput-select component, and getFileIfcAll client
- [15/07/2026 20:37:47] Add @thatopen/components, fragments, three and web-ifc dependencies for BIM visualization
- [15/07/2026 16:36:09] Add Cargue IFC page with upload-file/form/button shared components, process-ifc API client, and manual Loading overlay driven by LoadingService signal
- [14/07/2026 21:02:28] Initial Symphony Angular 21 SPA with JWT login, clients/services CRUD, and shared layout
- [14/07/2026 21:02:28] Agent/developer context (AGENTS.md, README.md) and project skills under .agents/

### Changed

- [17/07/2026 15:03:32] Serve web-ifc WASM and fragments worker from node_modules via angular.json; add COOP/COEP headers on ng serve and maxMemoryRender env
- [17/07/2026 00:07:23] Register process-grafic-ifc route/menu entry and use nom_file as select value in show-model3d
- [15/07/2026 20:37:47] Extend shared Button with label/icon/loading API and register show-model3d route/menu entry
- [15/07/2026 16:36:09] Register cargue-ifc route/menu entry and mount app-loading in layout content area only

### Removed

- [17/07/2026 00:07:23] Remove clientes, servicios and cliente-servicios pages, routes, menu items and related service unit specs
