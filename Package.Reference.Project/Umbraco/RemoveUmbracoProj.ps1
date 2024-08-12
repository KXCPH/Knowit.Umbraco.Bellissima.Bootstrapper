# RemoveUmbracoProj.ps1

# Define the version number as a parameter
param(
    [string]$UmbracoVersion = "14.1.1" # Default version, change as needed
)

# Get the directory where this script is located
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Define the path to the solution file
$solutionFilePath = Join-Path -Path $scriptDir -ChildPath './../Package.Reference.Project.sln'

# Define the project directory and name
$projectName = "Umbraco-$UmbracoVersion"
$projectDir = Join-Path -Path $scriptDir -ChildPath $projectName
$projectFilePath = Join-Path -Path $projectDir -ChildPath "$projectName.csproj"

# Function to remove project from the solution
function Remove-ProjectFromSolution {
    param(
        [string]$solutionFile,
        [string]$projectFile
    )

    if (Test-Path $solutionFile -PathType Leaf) {
        Write-Host "Removing $projectFile from solution..."
        try {
            dotnet sln $solutionFile remove $projectFile
            Write-Host "Successfully removed project from solution."
        } catch {
            Write-Error "Failed to remove project from solution: $_"
        }
    } else {
        Write-Error "Solution file not found: $solutionFile"
    }
}

# Function to delete the project directory
function Delete-ProjectDirectory {
    param(
        [string]$projectDirectory
    )

    if (Test-Path $projectDirectory -PathType Container) {
        Write-Host "Deleting project directory: $projectDirectory"
        try {
            Remove-Item -Recurse -Force -Path $projectDirectory
            Write-Host "Successfully deleted project directory."
        } catch {
            Write-Error "Failed to delete project directory: $_"
        }
    } else {
        Write-Error "Project directory not found: $projectDirectory"
    }
}

# Remove the project from the solution
Remove-ProjectFromSolution -solutionFile $solutionFilePath -projectFile $projectFilePath

# Delete the project directory
Delete-ProjectDirectory -projectDirectory $projectDir

Write-Host "Umbraco project $projectName removed and directory deleted."
