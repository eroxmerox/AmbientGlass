#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess = $true)]
param([switch]$Update, [switch]$Uninstall)

$ErrorActionPreference = 'Stop'
if ($Update -and $Uninstall) { throw 'Choose either -Update or -Uninstall.' }
$spicetifyCommand = Get-Command spicetify -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $spicetifyCommand) { throw 'Install and configure Spicetify first: https://spicetify.app/docs/getting-started/' }
$script:SpicetifyPath = $spicetifyCommand.Source

function Invoke-Spicetify {
    param([string[]]$Arguments)
    & $script:SpicetifyPath @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Spicetify failed: $($Arguments -join ' ')" }
}

$configOutput = & $script:SpicetifyPath -c
if ($LASTEXITCODE -ne 0) { throw 'Could not locate the Spicetify configuration.' }
$configPath = [IO.Path]::GetFullPath(($configOutput -join '').Trim())
if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) { throw 'The Spicetify configuration does not exist.' }
$configDirectory = Split-Path -Parent $configPath
$themeDirectory = [IO.Path]::GetFullPath((Join-Path $configDirectory 'Themes\AmbientGlass'))
$legacyExtension = Join-Path $configDirectory 'Extensions\theme.js'
$files = @('theme.js', 'user.css', 'color.ini', 'manifest.json')

if (Test-Path -LiteralPath $themeDirectory) {
    if ((Get-Item -LiteralPath $themeDirectory).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw 'The AmbientGlass theme directory is a link. Manage that installation manually.'
    }
}
$action = 'Install AmbientGlass from this folder'
if ($Update) { $action = 'Download and install AmbientGlass from GitHub main' }
if ($Uninstall) { $action = 'Deactivate AmbientGlass and remove its installed theme files' }
if (-not $PSCmdlet.ShouldProcess($themeDirectory, $action)) { return }

$backupDirectory = Join-Path $configDirectory ('Backups\AmbientGlass\' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
Copy-Item -LiteralPath $configPath -Destination (Join-Path $backupDirectory 'config-xpui.ini')
$previousFiles = @()
foreach ($name in $files) {
    $installed = Join-Path $themeDirectory $name
    if (Test-Path -LiteralPath $installed -PathType Leaf) {
        Copy-Item -LiteralPath $installed -Destination (Join-Path $backupDirectory $name)
        $previousFiles += $name
    }
}
$stage = $null
$filesChanged = $false

try {
    if ($Uninstall) {
        $configText = Get-Content -LiteralPath $configPath -Raw
        if ($configText -match '(?m)^current_theme\s*=\s*AmbientGlass\s*$') {
            # Windows PowerShell 5.1 drops empty arguments to native programs.
            $configText = [regex]::Replace($configText, '(?m)^(current_theme|color_scheme)[^\S\r\n]*=[^\r\n]*$', '$1 = ')
            [IO.File]::WriteAllText($configPath, $configText, (New-Object Text.UTF8Encoding $false))
        }
    } else {
        $stage = Join-Path ([IO.Path]::GetTempPath()) ('AmbientGlass-' + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $stage | Out-Null
        foreach ($name in $files) {
            $destination = Join-Path $stage $name
            if ($Update) {
                Invoke-WebRequest -UseBasicParsing -Uri ('https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/' + $name) -OutFile $destination
            } else {
                $source = Join-Path $PSScriptRoot $name
                if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing $name. Download the complete repository ZIP and extract it first." }
                Copy-Item -LiteralPath $source -Destination $destination
            }
            if ((Get-Item -LiteralPath $destination).Length -eq 0) { throw "Empty file: $name" }
        }
        $manifest = Get-Content -LiteralPath (Join-Path $stage 'manifest.json') -Raw | ConvertFrom-Json
        $runtime = Get-Content -LiteralPath (Join-Path $stage 'theme.js') -Raw
        $versionMatch = [regex]::Match($runtime, "const THEME_VERSION = '([^']+)'")
        if ($manifest.name -ne 'AmbientGlass' -or -not $versionMatch.Success -or $manifest.version -ne $versionMatch.Groups[1].Value) {
            throw 'The downloaded manifest and runtime do not describe the same AmbientGlass release.'
        }
        if ((Get-Content -LiteralPath (Join-Path $stage 'user.css') -Raw) -match '^\s*<!?html') { throw 'Downloaded HTML instead of CSS.' }
        if ((Get-Content -LiteralPath (Join-Path $stage 'color.ini') -Raw) -notmatch '(?m)^\[Base\]') { throw 'Invalid color scheme file.' }
        New-Item -ItemType Directory -Path $themeDirectory -Force | Out-Null
        $filesChanged = $true
        foreach ($name in $files) { Copy-Item -LiteralPath (Join-Path $stage $name) -Destination (Join-Path $themeDirectory $name) -Force }
        Invoke-Spicetify -Arguments @('config', 'current_theme', 'AmbientGlass', 'color_scheme', 'Base', 'inject_css', '1', 'replace_colors', '1', 'inject_theme_js', '1')
    }

    # Do not disable somebody else's unrelated extension named theme.js.
    if ((Test-Path -LiteralPath $legacyExtension -PathType Leaf) -and
        ((Get-Content -LiteralPath $legacyExtension -Raw) -match 'AmbientGlass')) {
        Invoke-Spicetify -Arguments @('config', 'extensions', 'theme.js-')
    }
    Invoke-Spicetify -Arguments @('apply')

    if ($Uninstall) {
        $filesChanged = $true
        foreach ($name in $files) {
            $installed = Join-Path $themeDirectory $name
            if (Test-Path -LiteralPath $installed -PathType Leaf) { Remove-Item -LiteralPath $installed }
        }
        if ((Test-Path -LiteralPath $themeDirectory) -and -not (Get-ChildItem -LiteralPath $themeDirectory -Force)) {
            Remove-Item -LiteralPath $themeDirectory
        }
        Write-Host 'AmbientGlass deactivated. Personal preferences and unrelated files were retained.'
    } else {
        Write-Host "AmbientGlass $($manifest.version) installed. Restart Spotify if it has not refreshed."
    }
    Write-Host "Backup: $backupDirectory"
} catch {
    Copy-Item -LiteralPath (Join-Path $backupDirectory 'config-xpui.ini') -Destination $configPath -Force
    if ($filesChanged) {
        foreach ($name in $files) {
            $installed = Join-Path $themeDirectory $name
            if ($previousFiles -contains $name) {
                Copy-Item -LiteralPath (Join-Path $backupDirectory $name) -Destination $installed -Force
            } elseif (Test-Path -LiteralPath $installed -PathType Leaf) {
                Remove-Item -LiteralPath $installed
            }
        }
    }
    Write-Warning "Configuration and files restored. Backup: $backupDirectory. Run 'spicetify apply' to reapply the previous configuration."
    throw
} finally {
    if ($stage -and (Test-Path -LiteralPath $stage)) {
        foreach ($name in $files) {
            $temporaryFile = Join-Path $stage $name
            if (Test-Path -LiteralPath $temporaryFile -PathType Leaf) { Remove-Item -LiteralPath $temporaryFile }
        }
        Remove-Item -LiteralPath $stage
    }
}
