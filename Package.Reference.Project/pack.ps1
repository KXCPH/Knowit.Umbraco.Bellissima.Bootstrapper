# Set the variables using relative paths
$solutionPath = Join-Path -Path $PSScriptRoot -ChildPath "Package.Reference.Project.sln"
$projectPath = Join-Path -Path $PSScriptRoot -ChildPath "Package.Reference.Project.Backend"
$csprojectPath = Join-Path -Path $projectPath -ChildPath "Package.Reference.Project.Backend.csproj"
$outputDirectory = Join-Path -Path $PSScriptRoot -ChildPath "nuget"

# Ensure the output directory exists
if (!(Test-Path -Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory
}

function Increment-Version {
    param (
        [string]$version
    )

    # Split the version into parts
    $versionParts = $version.Split('.')
    if ($versionParts.Count -ne 3) {
        throw "Invalid version format. Expected x.y.z"
    }

    # Increment the patch version
    $versionParts[2] = [int]$versionParts[2] + 1

    # Return the incremented version
    return "$($versionParts[0]).$($versionParts[1]).$($versionParts[2])"
}

try {
    # Load the .csproj file
    [xml]$csproj = Get-Content $csprojectPath

    # Retrieve the current version
    $versionNode = $csproj.Project.PropertyGroup | Where-Object { $_.Version }
    if (-not $versionNode) {
        throw "Version node not found in the .csproj file."
    }
    $currentVersion = $versionNode.Version
    Write-Host "Current version: $currentVersion"

    # Increment the version
    $newVersion = Increment-Version -version $currentVersion
    Write-Host "New version: $newVersion"

    # Update the version in the .csproj file
    $versionNode.Version = $newVersion
    $csproj.Save($csprojectPath)

    Write-Host "Version updated in the .csproj file."

    # Rebuild the entire solution
    Write-Host "Rebuilding the solution..."
    dotnet build $solutionPath --configuration Release --no-incremental -v m
    if ($LASTEXITCODE -ne 0) {
        throw "Solution build failed."
    }

    # Pack the specified project
    Write-Host "Packing the project..."
    dotnet pack $projectPath --configuration Release --output $outputDirectory -v m
    if ($LASTEXITCODE -ne 0) {
        throw "Project pack failed."
    }

    Write-Host "NuGet package created successfully in the '$outputDirectory' directory."

} catch {
    Write-Host "An error occurred: $_"
    exit 1
}
