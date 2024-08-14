# TestUmbracoProject.ps1

# Define the version number as a parameter
param(
    [string]$UmbracoVersion = "14.1.1" # Default version, change as needed
)

# Get the directory where this script is located
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Define the path to the solution file
$solutionFilePath = Join-Path -Path $scriptDir -ChildPath './../Package.Reference.Project.sln'

# Define the project directory name with '-nuget' suffix
$projectName = "Umbraco-$UmbracoVersion-nuget"

# Define the full path to the project directory
$projectPath = Join-Path -Path $scriptDir -ChildPath $projectName

# Define the backend project path
$backendProjectPath = Join-Path -Path $scriptDir -ChildPath '../Package.Reference.Project.Backend'

# Run dotnet pack on the backend project
Write-Host "Running dotnet pack on the backend project..."

Set-Location -Path $backendProjectPath
dotnet pack --configuration Release

Write-Host "dotnet pack completed for the backend project."

# Check if the project directory already exists
if (-Not (Test-Path -Path $projectPath)) {
    Write-Host "Creating new Umbraco project: $projectName"

    # Install the specified version of Umbraco templates
    dotnet new install "Umbraco.Templates::$UmbracoVersion" --force

    # Change the working directory to the script's directory
    Set-Location -Path $scriptDir

    # Create a new Umbraco project with specified parameters
    dotnet new umbraco --force -n $projectName --friendly-name "Administrator" --email "admin@example.com" --password "1234567890" --development-database-type SQLite

    # Add the newly created project to the solution file in the "Umbraco" solution folder
    dotnet sln $solutionFilePath add "$projectPath/$projectName.csproj" --solution-folder Umbraco

    Write-Host "Umbraco project $projectName created and added to the solution in the 'Umbraco' folder."
} else {
    Write-Host "Umbraco project directory already exists. Skipping creation."
}

# Define the path to the directory containing the nupkg files
$nupkgDirectoryPath = Join-Path -Path $backendProjectPath -ChildPath 'bin/Release'

# Get the latest .nupkg file from the specified directory
$latestNupkg = Get-ChildItem -Path $nupkgDirectoryPath -Filter '*.nupkg' | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestNupkg) {
    Write-Host "Latest .nupkg file found: $($latestNupkg.Name)"

    # Correctly parse the package ID (assuming version is not needed)
    $packageId = $latestNupkg.BaseName -replace '\.\d+(\.\d+)*$', ''

    # Define the source as the directory containing the .nupkg file
    $localSourcePath = $latestNupkg.DirectoryName

    # Ensure the working directory is set to the script directory before running the add package command
    Set-Location -Path $scriptDir

    # Construct the dotnet add package command without version
    
    dotnet add "$projectPath/$projectName.csproj" package uSync
    $dotnetCommand = "dotnet add `"$projectPath/$projectName.csproj`" package `"$packageId`" --source `"$localSourcePath`""

    # Output the command for troubleshooting
    Write-Host "Run the following command to refresh the NuGet package:"
    Write-Host $dotnetCommand

    # Execute the command to refresh the NuGet package
    Invoke-Expression $dotnetCommand

    Write-Host "NuGet package refreshed in $projectName."
} else {
    Write-Host "No .nupkg files found in $nupkgDirectoryPath."
}

# Return to the original script directory
Set-Location -Path $scriptDir
