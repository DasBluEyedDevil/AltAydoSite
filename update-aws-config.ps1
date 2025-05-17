$configPath = "$env:USERPROFILE\.aws\config"
$config = Get-Content $configPath

# Find the default profile and add region if it doesn't exist
$newConfig = @()
$inDefaultSection = $false
$addedRegion = $false

foreach ($line in $config) {
    if ($line -eq "[default]") {
        $inDefaultSection = $true
    }
    elseif ($line -match "^\[") {
        if ($inDefaultSection -and -not $addedRegion) {
            $newConfig += "region=us-east-1"
            $addedRegion = $true
        }
        $inDefaultSection = $false
    }
    elseif ($inDefaultSection -and $line -match "^region=") {
        $addedRegion = $true
    }
    
    $newConfig += $line
}

# If we're still in the default section at the end and haven't added region
if ($inDefaultSection -and -not $addedRegion) {
    $newConfig += "region=us-east-1"
}

# Write the updated config back
$newConfig | Set-Content $configPath

Write-Host "AWS config updated with region for default profile" 