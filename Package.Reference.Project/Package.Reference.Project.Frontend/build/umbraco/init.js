import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

export default function initUmbraco(args) {
    const defaultUmbracoVersion = "14.1.1";
    const umbracoVersion = args[0] || defaultUmbracoVersion;
    const projectName = `Umbraco-${umbracoVersion}`;

    // Get the current directory in ES module context
    const __filename = fileURLToPath(import.meta.url);
    const frontendDir = dirname(__filename);
    const rootDir = resolve(frontendDir, '../../../'); // Move up three levels to the correct root directory
    const solutionFilePath = join(rootDir, 'Package.Reference.Project.sln');
    const umbracoDir = join(rootDir, 'Umbraco');
    const projectDir = join(umbracoDir, projectName); // Path for the version-specific Umbraco project

    // Check if the solution file exists
    if (!existsSync(solutionFilePath)) {
        console.error(`Solution file not found at "${solutionFilePath}"`);
        process.exit(1);
    }

    try {
        // Install the specified version of Umbraco templates
        console.log(`Installing Umbraco.Templates version ${umbracoVersion}...`);
        execSync(`dotnet new install "Umbraco.Templates::${umbracoVersion}" --force`, { stdio: 'inherit' });

        // Create the Umbraco directory if it doesn't exist
        if (!existsSync(umbracoDir)) {
            execSync(`mkdir "${umbracoDir}"`);
        }

        // Create the version-specific project directory if it doesn't exist
        if (!existsSync(projectDir)) {
            execSync(`mkdir "${projectDir}"`);
        }

        // Create a new Umbraco project with specified parameters in the version-specific folder
        console.log(`Creating Umbraco project ${projectName} in ${projectDir}...`);
        execSync(`dotnet new umbraco --force -n "${projectName}" --output "${projectDir}" --friendly-name "Administrator" --email "admin@example.com" --password "1234567890" --development-database-type SQLite`, { stdio: 'inherit' });

        // Add the newly created project to the solution file in the "Umbraco" solution folder
        console.log(`Adding project ${projectName} to the solution...`);
        execSync(`dotnet sln "${solutionFilePath}" add "${join(projectDir, projectName + '.csproj')}" --solution-folder Umbraco`, { stdio: 'inherit' });

        // Add the necessary packages and references
        console.log(`Adding uSync package to project ${projectName}...`);
        execSync(`dotnet add "${join(projectDir, projectName + '.csproj')}" package uSync`, { stdio: 'inherit' });

        console.log(`Adding reference to backend project...`);
        execSync(`dotnet add "${join(projectDir, projectName + '.csproj')}" reference "${join(rootDir, 'Package.Reference.Project.Backend', 'Package.Reference.Project.Backend.csproj')}"`, { stdio: 'inherit' });

        console.log(`Umbraco project ${projectName} created and added to the solution in the 'Umbraco' folder.`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}
