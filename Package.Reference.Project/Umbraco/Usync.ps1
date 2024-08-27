# Initialize an empty array to hold the results
$umbracoResults = @()

# Get all top-level subfolders that start with "umbraco" in the current directory
$umbracoFolders = Get-ChildItem -Path "$PSScriptRoot" -Directory | Where-Object { $_.Name -like "umbraco*" }

# Loop through each umbraco folder
foreach ($folder in $umbracoFolders) {
    # Define the path to the usync/v14 folder
    $usyncPath = Join-Path -Path $folder.FullName -ChildPath "usync\v14"

    # Check if the usync/v14 folder exists
    if (Test-Path -Path $usyncPath) {
        # Get the newest file in the usync/v14 folder and its subfolders
        $newestFile = Get-ChildItem -Path $usyncPath -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        # If a file is found, add its details to the results array
        if ($newestFile) {
            $umbracoResults += [PSCustomObject]@{
                UmbracoFolder = $folder.FullName
                UsyncPath     = $usyncPath
                LastModified  = $newestFile.LastWriteTime
            }
        }
    }
}

# Find the Umbraco folder with the most recently updated usync folder
$mostRecent = $umbracoResults | Sort-Object LastModified -Descending | Select-Object -First 1

# Copy the usync folder from the most recent Umbraco folder
if ($mostRecent) {
    $destinationPath = Join-Path -Path "$PSScriptRoot" -ChildPath "usync"
    
    # Check if the usync folder already exists in the executing directory
    if (Test-Path -Path $destinationPath) {
        # Delete the existing usync folder
        Remove-Item -Path $destinationPath -Recurse -Force
        Write-Output "Deleted existing usync folder in the executing directory"
    }
    
    # Copy the fresh usync folder to the executing directory
    Copy-Item -Path (Split-Path -Path $mostRecent.UsyncPath -Parent) -Destination $destinationPath -Recurse -Force
    Write-Output "Copied the usync folder from $($mostRecent.UmbracoFolder) to $destinationPath"
    
    # Delete all usync folders in top-level umbraco directories
    foreach ($folder in $umbracoFolders) {
        $usyncPathToDelete = Join-Path -Path $folder.FullName -ChildPath "usync"
        if (Test-Path -Path $usyncPathToDelete) {
            Remove-Item -Path $usyncPathToDelete -Recurse -Force
            Write-Output "Deleted usync folder in $($folder.FullName)"
        }
    }
    
    # Copy the saved usync folder to all top-level umbraco directories
    foreach ($folder in $umbracoFolders) {
        $destinationUsyncPath = Join-Path -Path $folder.FullName -ChildPath "usync"
        Copy-Item -Path $destinationPath -Destination $destinationUsyncPath -Recurse -Force
        Write-Output "Copied usync folder to $($folder.FullName)"
    }
} else {
    Write-Output "No usync/v14 folders were found in any umbraco folders."
}
