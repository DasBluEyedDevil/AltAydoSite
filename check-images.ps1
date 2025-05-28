$pngFiles = Get-ChildItem -Path 'public\images\*.png' -File
$results = @()

foreach ($file in $pngFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $isPNG = $bytes.Length -ge 8 -and $bytes[0] -eq 137 -and $bytes[1] -eq 80 -and $bytes[2] -eq 78 -and $bytes[3] -eq 71
    $isLFS = $false
    
    if (-not $isPNG -and $bytes.Length -ge 100) {
        $fileContent = [System.Text.Encoding]::UTF8.GetString($bytes, 0, [Math]::Min(100, $bytes.Length))
        $isLFS = $fileContent -like '*version https://git-lfs.github.com/spec/*'
    }
    
    $results += [PSCustomObject]@{
        File = $file.Name
        Size = $file.Length
        IsPNG = $isPNG
        IsLFSPointer = $isLFS
        Status = if ($isPNG) { 'OK' } elseif ($isLFS) { 'LFS POINTER' } else { 'UNKNOWN' }
    }
}

$results | Format-Table File, Size, IsPNG, IsLFSPointer, Status

# PART 2: Check carousel images
Write-Output ""
Write-Output "Checking carousel images..."
Write-Output "-----------------------"

$HomeContentFile = "src\components\HomeContent.tsx"
$EventCarouselFile = "src\components\dashboard\EventCarousel.tsx"

# Function to extract image paths from a file
function Get-ImagePaths {
    param (
        [string]$FilePath,
        [string]$StartPattern,
        [string]$EndPattern
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        
        # Check if the file contains the pattern
        if ($content -match "$StartPattern([\s\S]*?)$EndPattern") {
            $imageSection = $matches[1]
            
            # Extract paths between single quotes
            $regex = "['\""]([^'\""]*/images/[^'\""]*)['\""]"
            $matches = [regex]::Matches($imageSection, $regex)
            
            $imagePaths = @()
            foreach ($match in $matches) {
                $imagePath = $match.Groups[1].Value
                $imagePaths += $imagePath
            }
            
            return $imagePaths
        }
    }
    
    return @()
}

# Get image paths from HomeContent.tsx
Write-Output "Checking images in HomeContent.tsx carousel..."
$shipImages = Get-ImagePaths -FilePath $HomeContentFile -StartPattern "const shipImages = \[" -EndPattern "\];"
Write-Output "Found $($shipImages.Count) image references in HomeContent.tsx"

# Get image paths from EventCarousel.tsx
Write-Output "Checking images in EventCarousel.tsx..."
$eventImages = Get-ImagePaths -FilePath $EventCarouselFile -StartPattern "const images = \[" -EndPattern "\];"
Write-Output "Found $($eventImages.Count) image references in EventCarousel.tsx"

# Check if images exist
$missingImages = @()

Write-Output ""
Write-Output "Verifying image files exist in public directory..."

# Check HomeContent.tsx images
foreach ($imagePath in $shipImages) {
    $fullPath = Join-Path -Path (Get-Location) -ChildPath "public" -AdditionalChildPath $imagePath.TrimStart('/')
    if (-not (Test-Path $fullPath)) {
        $missingImages += $imagePath
        Write-Output "MISSING: $imagePath"
    } else {
        Write-Output "EXISTS: $imagePath"
    }
}

# Check EventCarousel.tsx images
foreach ($imagePath in $eventImages) {
    # Extract just the src part
    if ($imagePath -match "src:\s*['\""]([^'\""]*)['\""]") {
        $srcPath = $matches[1]
    } else {
        $srcPath = $imagePath
    }
    
    $fullPath = Join-Path -Path (Get-Location) -ChildPath "public" -AdditionalChildPath $srcPath.TrimStart('/')
    
    if (-not (Test-Path $fullPath)) {
        $missingImages += $srcPath
        Write-Output "MISSING: $srcPath"
    } else {
        Write-Output "EXISTS: $srcPath"
    }
}

# Combined Summary
Write-Output ""
Write-Output "Summary:"
Write-Output "--------"
Write-Output "Total PNG files checked: $($results.Count)"
Write-Output "Valid PNG files: $(($results | Where-Object { $_.IsPNG }).Count)"
Write-Output "LFS pointer files: $(($results | Where-Object { $_.IsLFSPointer }).Count)"
Write-Output "Unknown files: $(($results | Where-Object { -not $_.IsPNG -and -not $_.IsLFSPointer }).Count)"

Write-Output ""
if ($missingImages.Count -eq 0) {
    Write-Output "All carousel images exist! No missing images found."
} else {
    Write-Output "Found $($missingImages.Count) missing carousel images:"
    foreach ($img in $missingImages) {
        Write-Output "  - $img"
    }
    
    Write-Output ""
    Write-Output "To fix these issues:"
    Write-Output "1. Make sure all missing images are in the public/images directory"
    Write-Output "2. Or update the image references in the code to point to existing images"
}

# Check for missing ship images in the project
# This script compares the ship names in ShipData.ts with the image files in public/images

# Get the content of ShipData.ts
$shipDataPath = Join-Path $PSScriptRoot "src\types\ShipData.ts"
$shipDataContent = Get-Content $shipDataPath -Raw

# Extract all ship names from the manufacturer lists
$shipNameRegex = '\{\s*name:\s*"([^"]+)",\s*image:'
$shipNames = [regex]::Matches($shipDataContent, $shipNameRegex) | 
    ForEach-Object { $_.Groups[1].Value } | 
    Sort-Object -Unique

# Function to format ship name to match expected image name
function Format-ShipImageName {
    param (
        [string]$shipName
    )
    
    # Special case for San'tok.yāi
    if ($shipName -eq "San'tok.yāi") {
        return "santokyai.png"
    }
    
    $formatted = $shipName.ToLower() -replace '\s+', '_' -replace "[\.'\\]", '' -replace '/', '_'
    # Replace accented characters
    $formatted = $formatted -replace '[āáàäâã]', 'a' -replace '[ēéèëê]', 'e' -replace '[īíìïî]', 'i' -replace '[ōóòöôõ]', 'o' -replace '[ūúùüû]', 'u' -replace '[ÿý]', 'y'
    return "$formatted.png"
}

# Get all image files in the public/images directory
$imagesPath = Join-Path $PSScriptRoot "public\images"
$imageFiles = Get-ChildItem -Path $imagesPath -Filter "*.png" | Select-Object -ExpandProperty Name

# Check which ships don't have corresponding images
$missingImages = @()
$totalShips = $shipNames.Count
$existingCount = 0
$missingCount = 0

Write-Host "Checking $totalShips ships for missing images..."
foreach ($shipName in $shipNames) {
    $expectedImageName = Format-ShipImageName $shipName
    if (-not $imageFiles.Contains($expectedImageName)) {
        $missingImages += [PSCustomObject]@{
            ShipName = $shipName
            ExpectedFileName = $expectedImageName
        }
        $missingCount++
    } else {
        $existingCount++
    }
}

# Display results
Write-Host "`nResults:"
Write-Host "========"
Write-Host "Total ships: $totalShips"
Write-Host "Ships with images: $existingCount"
Write-Host "Ships missing images: $missingCount"

if ($missingImages.Count -gt 0) {
    Write-Host "`nMissing images:"
    Write-Host "==============="
    foreach ($item in $missingImages) {
        Write-Host "$($item.ShipName) => $($item.ExpectedFileName)"
    }
    
    # Export to CSV for easier tracking
    $csvPath = Join-Path $PSScriptRoot "missing-ship-images.csv"
    $missingImages | Export-Csv -Path $csvPath -NoTypeInformation
    Write-Host "`nExported missing images list to: $csvPath"
} else {
    Write-Host "`nAll ships have corresponding images!"
}
