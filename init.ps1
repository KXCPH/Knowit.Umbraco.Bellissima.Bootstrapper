# Define the parameters
param (
    [string]$newProjectName,
    [string]$destinationPath
)

# Define paths
$referenceFolder = "Package.Reference.Project"
$newProjectFolder = Join-Path -Path $destinationPath -ChildPath $newProjectName

# Store the original location
$originalLocation = Get-Location

# Check if the reference folder exists
if (-Not (Test-Path $referenceFolder)) {
    Write-Error "The reference folder '$referenceFolder' does not exist."
    exit 1
}

# Check if the destination path exists
if (-Not (Test-Path $destinationPath)) {
    Write-Error "The destination path '$destinationPath' does not exist."
    exit 1
}

# If the destination project folder already exists, run update.ps1
if (Test-Path $newProjectFolder) {
    Write-Host "Destination project folder '$newProjectFolder' already exists. Running update.ps1..."
    & ".\update.ps1" -newProjectName $newProjectName -destinationPath $destinationPath
    exit 0
}

# Create the new project folder if it doesn't exist
try {
    New-Item -Path $newProjectFolder -ItemType Directory -Force | Out-Null
} catch {
    Write-Error "Failed to create the new project folder at '$newProjectFolder'."
    exit 1
}

# Copy the reference folder contents to the new project folder, excluding bin and node_modules
function Copy-Filtered {
    param (
        [string]$sourcePath,
        [string]$destinationPath
    )
    # Remove the root from the source path to start copying from the folder contents
    Get-ChildItem -Path $sourcePath -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        # Calculate the relative path from the reference folder to ensure correct path construction
        $relativePath = $_.FullName.Substring($sourcePath.Length).TrimStart('\')
        $dest = Join-Path -Path $destinationPath -ChildPath $relativePath

        # Check for path length and format issues
        if ($dest.Length -ge 260) {
            Write-Warning "Path length exceeds limit: $dest"
            return
        }

        if ($_.PSIsContainer) {
            if (-Not (Test-Path $dest)) {
                try {
                    New-Item -Path $dest -ItemType Directory -Force | Out-Null
                } catch {
                    Write-Warning "Failed to create directory: $dest"
                }
            }
        } else {
            try {
                Copy-Item -Path $_.FullName -Destination $dest -Force
            } catch {
                Write-Warning "Failed to copy file: $_.FullName to $dest"
            }
        }
    }
}

# Start copying from within the reference folder to avoid nesting the entire structure
Copy-Filtered -sourcePath (Join-Path -Path $PWD -ChildPath $referenceFolder) -destinationPath $newProjectFolder

# Function to rename files and directories, excluding bin and node_modules
function Rename-ItemsRecursively($path, $oldName, $newName) {
    Get-ChildItem -Path $path -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        $newNamePath = $_.FullName -replace [Regex]::Escape($oldName), $newName
        if ($_.FullName -ne $newNamePath) {
            try {
                Rename-Item -Path $_.FullName -NewName $newNamePath
            } catch {
                Write-Warning "Failed to rename: $_.FullName to $newNamePath"
            }
        }
    }
}

# Function to replace content within files, excluding bin and node_modules
function Replace-ContentInFiles($path, $oldName, $newName) {
    Get-ChildItem -Path $path -File -Recurse -Force | Where-Object {
        $_.FullName -notmatch '\\bin($|\\)' -and
        $_.FullName -notmatch '\\node_modules($|\\)'
    } | ForEach-Object {
        try {
            (Get-Content -Path $_.FullName) -replace [Regex]::Escape($oldName), $newName | Set-Content -Path $_.FullName
        } catch {
            Write-Warning "Failed to replace content in: $_.FullName"
        }
    }
}

# Rename files and directories
Rename-ItemsRecursively -path $newProjectFolder -oldName $referenceFolder -newName $newProjectName

# Replace content in files
Replace-ContentInFiles -path $newProjectFolder -oldName $referenceFolder -newName $newProjectName

Write-Host "Project '$referenceFolder' has been copied and renamed to '$newProjectFolder'."

# Navigate to the frontend folder and run npm install
$frontendFolderPath = Join-Path -Path $newProjectFolder -ChildPath "$newProjectName.Frontend"

if (Test-Path $frontendFolderPath) {
    try {
        Write-Host "Running npm install in '$frontendFolderPath'."
        Set-Location -Path $frontendFolderPath
        npm install
        Write-Host "npm install completed successfully in '$frontendFolderPath'."
    } catch {
        Write-Error "Failed to run npm install in '$frontendFolderPath'."
    } finally {
        # Return to the original location
        Set-Location -Path $originalLocation
        Write-Host "Returned to the original location: $originalLocation"
    }
} else {
    Write-Warning "Frontend folder '$frontendFolderPath' does not exist."
    # Return to the original location if the frontend folder doesn't exist
    Set-Location -Path $originalLocation
    Write-Host "Returned to the original location: $originalLocation"
}
