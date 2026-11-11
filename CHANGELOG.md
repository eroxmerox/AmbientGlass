# AmbientGlass changelog

## 2.0.0

Complete changes in the rework and its follow-up fixes. Preserved features are identified as such; undocumented older release history is not reconstructed.

### Design and defaults

- Preserved the original glass style, floating search ring, expanding Home cluster, ambient glows and animations.
- Simplified theme-created Settings, library and introduction windows to quieter dark surfaces.
- Adopted the author's saved colors, effect strengths, player settings and layout as the 2.0.0 defaults.
- Default player: 840 × 70 px, 36 px radius, normal transparent glass; exact values are documented in DEFAULTS.md.
- Applied the default floating player layout even when no personal layout has been saved. Existing personal settings are retained; Reset uses the new defaults.
- Accepted zero as a real sidebar background strength rather than replacing it with a fallback.
- Replaced V16.5/beta labels with the consistent release version 2.0.0 in runtime, startup screen and manifest.

### Runtime and performance

- Added a duplicate-initialization guard and stopped withholding all theme controls until Player.origin is ready.
- Replaced repeated maintenance bursts with categorized tasks coalesced into animation frames.
- Restricted mutation processing to relevant elements and state changes instead of continuously repairing unrelated DOM.
- Skipped redundant inline style writes and cached dock discovery, layout and visibility signatures.
- Suspended expensive visual/background work when Spotify is hidden and synchronized state on return.
- Added caching and stale-request protection for library/up-next loading; removed obsolete runtime implementations.
- Isolated optional startup, Jam-subscription and window-control failures from unrelated runtime jobs.

### Scrolling and resizing

- Scoped theme scrolling to the main viewport so menus and library dialogs do not drive page animations.
- Kept search fading and Home pinning while translating detached artist banners upward with the scrolled content.
- Clamped search/player placement to the viewport and aligned Home and search to the same available width in compact layouts with an open sidebar.
- Adapted entity-header covers and title sizes to the actual content width to reduce overlaps during resizing.
- Removed three stale sidebar calls that could abort opening/closing the layout editor, plus unused sidebar preview geometry.
- Resynchronized the real Jam pill after leaving layout edit mode instead of leaving a preview or missing indicator behind.

### Native sidebar

- Removed the simulated sidebar and custom resize controller. Spotify owns panel content, resizing and scrolling again.
- Used ResizeObserver to read native sidebar width for theme positioning without rewriting internal panel geometry.
- Fully hid collapsed sidebar content, including leaked cover art and related/next content at the right edge.
- Added a 32 px right-edge hover zone that reveals a small restore arrow and delegates reopening to the native control.
- Removed artificial bottom spacing behind the sidebar and kept glass decoration inside its panel.

### Dock, menus and indicators

- Identified profile, What's New and listening activity using native elements rather than accidental screen positions.
- Removed duplicate profile/dock remnants. Addon proxies delegate to original actions and hide the original button while in use.
- Reduced the titlebar drag region and marked Home controls as non-draggable, keeping the center clickable.
- Restored legible context-menu/submenu backgrounds and removed submenu clipping, wrapping, scroll interception and premature removal logic.
- Constrained track-list equalizers to 14 px and Home equalizers to 16 px, and corrected hover/pause presentation.
- Corrected circular avatar sizing in the Sidebar/Jam area and excluded avatars from cover-spin styling.
- Improved library loading/error handling, lazy images, artist presentation and keyboard/dialog behavior; live player previews use a clone of the real player with duplicate IDs stripped.

### Jam, lyrics and fullscreen

- Replaced Jam text heuristics with SocialConnect session state and update/end events.
- Positioned the Jam pill above the rendered player with a gap instead of covering its controls.
- Removed stale pills when sessions end or become inactive, including the End Jam remnant.
- Hid the native connection footer during active Jams so only the floating pill represents the Jam; ordinary device connection displays remain available without an active Jam.
- Hid ambient search in Lyrics, Spotify fullscreen views, browser fullscreen and fullscreen display mode, with matching visibility updates.

### Marketplace and Windows controls

- Removed obsolete Marketplace tab replacements, forced positions, hidden search controls and broad last-child dock rules that also matched Marketplace content.
- Restored Marketplace's own responsive tabs, native More menu, sorting, search and grid.
- Restricted the half-window-height content offset to Home; Marketplace no longer inherits it.
- Coordinated sticky toolbar backgrounds and stacking so scrolling cards do not show through or overlap the tab and sort/search rows.
- Placed Home in the upper navigation area on addon pages to avoid overlapping their tabs.
- Added transparent Windows minimize/maximize/restore/close buttons using Spotify's native window service, state synchronization and fallback to native controls.

### Introduction and distribution

- Added a 2.0.0 introduction revision so both first-time and returning users see the tour once, after the startup splash. The legacy completion flag does not suppress it.
- Kept manual replay from Settings and added focus containment/restoration, duplicate-dialog protection, and closing behavior that still works if storing completion fails.
- Aligned the root manifest with the official Marketplace theme format; CSS, color scheme, README and preview remain repository-relative assets, with explicit main publication branch.
- Replaced the GitHub Raw include with a GitHub Pages script URL and included a Pages deployment workflow based on the official static workflow.
- Unified Windows installation/update/uninstall logic, installed the runtime inside the theme folder, and disabled a legacy extension only if its file identifies itself as AmbientGlass.
- Added staged download validation, configuration/theme backups, error reporting and restoration after failed installs. Uninstall retains preferences, backups and unrelated files.
- Updated install documentation and included complete German/English changelogs, exact defaults, Marketplace publication steps and validation notes.

### Validation limits

No measured percentage performance claims or guarantee of absence of all bugs. Checks cover static analysis, isolated state tests and the local Windows client. Multi-participant Jams, all Spotify versions and other operating systems were not exhaustively tested. Preview assets remain unchanged. See [VALIDATION.md](VALIDATION.md).
