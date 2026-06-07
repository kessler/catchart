# Changelog

## [Unreleased]

## [3.2.12] - 2026-06-07
### Fixed
- `--showValueLabels` no longer crashes the chart page. The value-label plugin used the removed Chart.js v2 API (`Chart.plugins.register`, `Chart.helpers.fontString`); it is now a Chart.js v3 inline plugin.

## [3.2.11] - 2026-05-27
### Fixed
- rebuild the client bundle so it ships in sync with the source

## [3.2.10] - 2026-05-27
### Added
- `--datasetNames` CLI flag — pass a JSON array of names to label datasets in the legend instead of the default `dataset #1`, `dataset #2`, ... Missing slots fall back to the default; passing more names than series is an error. Custom names on the right Y-axis still get the ` (right)` suffix.
### Changed
- update `hcat` dependency

## [3.2.9] - 2026-05-27
### Added
- claude skill template (`skill.template.md`)

## [3.2.8] - 2026-05-26
### Changed
- upgrade dependencies

## [3.2.7] - 2022-10-15
### Changed
- remove own stream-slicer module in favor of dominic's split module

## [3.2.6] - 2022-10-15
### Added
- Change log was added!