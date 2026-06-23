# ── Sitecore Event Import (SPE) ────────────────────────────────────────
# Context Menu Script — attach to Events folder
# Receives a ZIP: event.csv + hero.jpg + thumbnail.jpg + meta.jpg

Add-Type -AssemblyName "System.IO.Compression.FileSystem"

# ── 1. Receive ZIP ─────────────────────────────────────────────────────
$zipPath = Receive-File -Title "Upload Event Package (.zip)" `
           -Description "ZIP containing event.csv + hero.jpg + thumbnail.jpg"
if (-not $zipPath) { Show-Alert "No file uploaded."; return }

# ── 2. Extract ─────────────────────────────────────────────────────────
$tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString())
[System.IO.Directory]::CreateDirectory($tempDir) | Out-Null
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $tempDir)

$csvFile = Get-ChildItem $tempDir -Filter "*.csv" | Select-Object -First 1
if (-not $csvFile) { Show-Alert "No CSV found in ZIP."; return }

$row = Import-Csv $csvFile.FullName | Select-Object -First 1
if (-not $row) { Show-Alert "CSV is empty."; return }

# ── 3. Resolve year & media folder ─────────────────────────────────────
$year = if ($row.EventStartDate -match "^(\d{4})") { $Matches[1] } else { (Get-Date).Year }
$itemName  = $row.ItemName
$mediaBase = "/sitecore/media library/Resources/Events/$year/$itemName"

function Ensure-MediaFolder($path) {
    if (Test-Path "master:$path") { return }
    $parts  = $path.TrimStart('/') -split "/"
    $parent = "/" + ($parts[0..($parts.Length - 2)] -join "/")
    Ensure-MediaFolder $parent
    New-Item -Path "master:$parent" -Name $parts[-1] -ItemType "Common/Folder" | Out-Null
}
Ensure-MediaFolder $mediaBase

# ── 4. Upload images ───────────────────────────────────────────────────
function Upload-Image($filename) {
    $file = Get-Item (Join-Path $tempDir $filename) -ErrorAction SilentlyContinue
    if (-not $file) { return $null }

    $mediaName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $destPath  = "$mediaBase/$mediaName"

    $stream  = [System.IO.File]::OpenRead($file.FullName)
    $options = New-Object Sitecore.Resources.Media.MediaCreatorOptions
    $options.FileBased       = $false
    $options.KeepExisting    = $false
    $options.Versioned       = $false
    $options.DestinationPath = $destPath
    $options.Database        = [Sitecore.Configuration.Factory]::GetDatabase("master")

    $creator = New-Object Sitecore.Resources.Media.MediaCreator
    $media   = $creator.CreateFromStream($stream, $file.Name, $options)
    $stream.Close()

    return "<image mediaid=`"$($media.ID)`" />"
}

$heroValue      = Upload-Image "hero.jpg"
$thumbnailValue = Upload-Image "thumbnail.jpg"
$metaImageValue = Upload-Image "meta.jpg"

# ── 5. Create or update event item ─────────────────────────────────────
$itemPath = "master:$($row.ItemPath)"
$existing = Get-Item "$itemPath$itemName" -ErrorAction SilentlyContinue

if ($existing) {
    $item = $existing
    $verb = "Updated"
} else {
    $parent = Get-Item $itemPath -ErrorAction SilentlyContinue
    if (-not $parent) { Show-Alert "Parent path not found: $($row.ItemPath)"; return }
    $item = New-Item -Parent $parent -Name $itemName -ItemType $row.TemplateName
    $verb = "Created"
}

# ── Field name mapping: CSV column → Sitecore field name ───────────────
$item.Editing.BeginEdit()

@{
    "Meta Title"                              = $row.MetaTitle
    "Meta Description"                        = $row.MetaDescription
    "Meta Image"                              = if ($metaImageValue) { $metaImageValue } else { $row.MetaImage }
    "Pretitle"                                = $row.Pretitle
    "Title"                                   = $row.Title
    "Subtitle"                                = $row.Subtitle
    "Thumbnail"                               = if ($thumbnailValue) { $thumbnailValue } else { $row.ThumbnailImage }
    "Image Full Size"                         = if ($heroValue)      { $heroValue }      else { $row.HeroImage }
    "Event Start Date"                        = $row.EventStartDate
    "Event End Date"                          = $row.EventEndDate
    "Event Time Zones"                        = $row.EventTimeZone
    "Display Weekday"                         = $row.DisplayWeekday
    "Display Event Time Zone"                 = $row.DisplayEventTimeZone
    "Display Generic Time Zone Abbreviation"  = $row.DisplayGenericTimeZoneAbbreviation
    "Display Event Duration"                  = $row.DisplayEventDuration
    "Event Location"                          = $row.EventLocation
    "Direction Link to Event Location"        = $row.DirectionLink
    "Registration Behavior"                   = $row.RegistrationBehavior
    "External Registration Link"              = $row.ExternalRegistrationLink
    "Registration Label"                      = $row.RegistrationLabel
    "Override Form Title"                     = $row.OverrideFormTitle
    "Event In Progress"                       = $row.EventInProgressMessage
}.GetEnumerator() | ForEach-Object {
    if ($item.Fields[$_.Key] -ne $null -and $_.Value) {
        $item[$_.Key] = $_.Value
    }
}

$item.Editing.EndEdit()

# ── 6. Cleanup & report ────────────────────────────────────────────────
[System.IO.Directory]::Delete($tempDir, $true)

Show-Alert "$verb successfully:`n`n📄 $itemName`n🖼 Images → $mediaBase`n`nPublish the item to push it live."
