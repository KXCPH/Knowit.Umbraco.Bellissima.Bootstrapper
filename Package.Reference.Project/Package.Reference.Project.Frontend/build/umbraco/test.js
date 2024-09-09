import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';

export default function testUmbraco(args) {
    const defaultUmbracoVersion = "14.1.1";
    const umbracoVersion = args[0] || defaultUmbracoVersion;
    const projectName = `Umbraco-${umbracoVersion}-nuget`;

    // Get the current directory in ES module context
    const __filename = fileURLToPath(import.meta.url);
    const frontendDir = dirname(__filename);
    const rootDir = resolve(frontendDir, '../../../'); // Move up three levels to the correct root directory
    const solutionFilePath = join(rootDir, 'Package.Reference.Project.sln');
    const umbracoDir = join(rootDir, 'Umbraco');
    const projectPath = join(umbracoDir, projectName);
    const backendProjectPath = join(rootDir, 'Package.Reference.Project.Backend');

    // Check if the solution file exists
    if (!existsSync(solutionFilePath)) {
        console.error(`Solution file not found at "${solutionFilePath}"`);
        process.exit(1);
    }

    try {
        console.log("Running dotnet pack on the backend project...");

        // Run dotnet pack on the backend project
        execSync(`dotnet pack --configuration Release`, { cwd: backendProjectPath, stdio: 'inherit' });

        console.log("dotnet pack completed for the backend project.");

        // Check if the project directory already exists
        if (!existsSync(projectPath)) {
            console.log(`Creating new Umbraco project: ${projectName}`);

            // Install the specified version of Umbraco templates
            execSync(`dotnet new install "Umbraco.Templates::${umbracoVersion}" --force`, { stdio: 'inherit' });

            // Create a new Umbraco project with specified parameters
            execSync(`dotnet new umbraco --force -n "${projectName}" --output "${projectPath}" --friendly-name "Administrator" --email "admin@example.com" --password "1234567890" --development-database-type SQLite`, { stdio: 'inherit' });

            // Add the newly created project to the solution file in the "Umbraco" solution folder
            execSync(`dotnet sln "${solutionFilePath}" add "${join(projectPath, projectName + '.csproj')}" --solution-folder Umbraco`, { stdio: 'inherit' });

            console.log(`Umbraco project ${projectName} created and added to the solution in the 'Umbraco' folder.`);
        } else {
            console.log("Umbraco project directory already exists. Skipping creation.");
        }

        // Define the path to the directory containing the nupkg files
        const nupkgDirectoryPath = join(backendProjectPath, 'bin', 'Release');

        // Get the latest .nupkg file from the specified directory
        const nupkgFiles = readdirSync(nupkgDirectoryPath).filter(file => file.endsWith('.nupkg'));
        const latestNupkg = nupkgFiles.sort((a, b) => {
            const aTime = new Date(statSync(join(nupkgDirectoryPath, a)).mtime).getTime();
            const bTime = new Date(statSync(join(nupkgDirectoryPath, b)).mtime).getTime();
            return bTime - aTime;
        })[0];

        if (latestNupkg) {
            console.log(`Latest .nupkg file found: ${latestNupkg}`);

            // Extract the package ID using a regular expression
            const packageId = latestNupkg.match(/^(.+?)(?=\.\d)/)?.[1]; // Match everything before the first version number

            if (!packageId) {
                console.error("Failed to parse the package ID from the .nupkg filename.");
                process.exit(1);
            }

            // Define the source as the directory containing the .nupkg file
            const localSourcePath = nupkgDirectoryPath;

            // Add the uSync package and the generated package to the Umbraco project
            execSync(`dotnet add "${join(projectPath, projectName + '.csproj')}" package uSync`, { stdio: 'inherit' });
            execSync(`dotnet add "${join(projectPath, projectName + '.csproj')}" package "${packageId}" --source "${localSourcePath}"`, { stdio: 'inherit' });

            console.log(`NuGet package refreshed in ${projectName}.`);
        } else {
            console.log(`No .nupkg files found in ${nupkgDirectoryPath}.`);
        }

        console.log(`Returning to the original script directory.`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}
