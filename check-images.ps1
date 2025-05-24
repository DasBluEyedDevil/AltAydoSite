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
Write-Output ""
Write-Output "Summary:"
Write-Output "--------"
Write-Output "Total PNG files: $($results.Count)"
Write-Output "Valid PNG files: $(($results | Where-Object { $_.IsPNG }).Count)"
Write-Output "LFS pointer files: $(($results | Where-Object { $_.IsLFSPointer }).Count)"
Write-Output "Unknown files: $(($results | Where-Object { -not $_.IsPNG -and -not $_.IsLFSPointer }).Count)"
