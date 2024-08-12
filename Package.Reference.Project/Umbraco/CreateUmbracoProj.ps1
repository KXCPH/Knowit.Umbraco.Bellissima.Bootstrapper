# CreateUmbracoProj.ps1

# Define the version number as a parameter
param(
    [string]$UmbracoVersion = "14.1.1" # Default version, change as needed
)

# Get the directory where this script is located
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Define the path to the solution file
$solutionFilePath = Join-Path -Path $scriptDir -ChildPath './../Package.Reference.Project.sln'

# Define the project directory name
$projectName = "Umbraco-$UmbracoVersion"

# Install the specified version of Umbraco templates
dotnet new install "Umbraco.Templates::$UmbracoVersion" --force

# Change the working directory to the script's directory
Set-Location -Path $scriptDir

# Create a new Umbraco project with specified parameters
dotnet new umbraco --force -n $projectName --friendly-name "Administrator" --email "admin@example.com" --password "1234567890" --development-database-type SQLite

# Add the newly created project to the solution file in the "Umbraco" solution folder
dotnet sln $solutionFilePath add "$projectName/$projectName.csproj" --solution-folder Umbraco

Write-Host "Umbraco project $projectName created and added to the solution in the 'Umbraco' folder."

dotnet add .\"Umbraco-$UmbracoVersion"\"Umbraco-$UmbracoVersion".csproj reference ..\Package.Reference.Project.Backend\Package.Reference.Project.Backend.csproj
