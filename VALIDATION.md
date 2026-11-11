# 2.0.0 validation

## Release checks

- JavaScript syntax and CSS parsing passed.
- ESLint checks for undefined identifiers and unused bindings passed.
- Runtime and manifest version agree on 2.0.0.
- The manifest passed the current official Marketplace Zod schema. Referenced local preview, README, CSS and color files exist.
- Six isolated runtime tests passed: release/assets/static checks; fresh-install defaults/default player placement; existing preferences and reset fallback; introduction migration/completion/replay/focus; full-storage introduction closing; layout editor open/cancel/save.
- Five Windows PowerShell 5.1 installer scenarios passed with an isolated fake Spicetify executable: local installation/legacy extension migration; staged update routing; rollback after failed apply; uninstall with unrelated-file retention; preserving another active theme. Downloading was mocked for the updater test.
- Windows installer/update/uninstall WhatIf checks completed without changing the real installation.

## Local client checks from stabilization

Spotify 1.3.8.620 with Spicetify 2.46.4 on Windows was used for real-client checks of the native sidebar resizing/scrolling, context menus/submenus, artist-banner movement, Marketplace tabs/toolbar scrolling, transparent window controls, Lyrics/fullscreen search suppression and repeated theme loading.

Jam creation/removal/native-footer suppression was also checked with controlled local session-state simulations. This is not an end-to-end test of a multi-participant Jam. Tests do not claim complete absence of regressions or a measured percentage performance increase.

The Spicetify wrapper and Marketplace emitted their own errors during some earlier starts. Those external projects are not patched or bundled in this release. See the upstream compatibility note in README.md.

## Publication checks that require your push

The GitHub Pages include URL was not live before publication. Enable Pages with GitHub Actions, push this folder and verify the deployed script plus an actual Marketplace install/update. These external publication checks cannot be claimed complete from an unpublished local folder.

Other operating systems, every Spotify build, native window close behavior in every OS configuration and multi-participant Jam lifecycle were not exhaustively tested. Preview images were retained from the repository.
