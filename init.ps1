# Define the parameters
param (
    [string]$newProjectName
)

# Define paths
$referenceFolder = "Package.Reference.Project"
$newProjectFolder = $newProjectName

# Check if the reference folder exists
if (-Not (Test-Path $referenceFolder)) {
    Write-Error "The reference folder '$referenceFolder' does not exist."
    exit 1
}

# Copy the reference folder to the new project folder, excluding bin and node_modules
function Copy-Filtered {
    param (
        [string]$sourcePath,
        [string]$destinationPath
    )
    Get-ChildItem -Path $sourcePath -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        $dest = $_.FullName -replace [Regex]::Escape($sourcePath), $destinationPath
        if ($_.PSIsContainer) {
            if (-Not (Test-Path $dest)) {
                New-Item -Path $dest -ItemType Directory | Out-Null
            }
        } else {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

Copy-Filtered -sourcePath $referenceFolder -destinationPath $newProjectFolder

# Function to rename files and directories, excluding bin and node_modules
function Rename-ItemsRecursively($path, $oldName, $newName) {
    Get-ChildItem -Path $path -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        $newNamePath = $_.FullName -replace [Regex]::Escape($oldName), $newName
        if ($_.FullName -ne $newNamePath) {
            Rename-Item -Path $_.FullName -NewName $newNamePath
        }
    }
}

# Function to replace content within files, excluding bin and node_modules
function Replace-ContentInFiles($path, $oldName, $newName) {
    Get-ChildItem -Path $path -File -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        (Get-Content -Path $_.FullName) -replace [Regex]::Escape($oldName), $newName | Set-Content -Path $_.FullName
    }
}

# Rename files and directories
Rename-ItemsRecursively -path $newProjectFolder -oldName $referenceFolder -newName $newProjectName

# Replace content in files
Replace-ContentInFiles -path $newProjectFolder -oldName $referenceFolder -newName $newProjectName

Write-Host "Project '$referenceFolder' has been copied and renamed to '$newProjectFolder'."
