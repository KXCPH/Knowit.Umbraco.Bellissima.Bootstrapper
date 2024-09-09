import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { existsSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';

export default function removeUmbraco(args) {
    const defaultUmbracoVersion = "14.1.1";
    const umbracoVersion = args[0] || defaultUmbracoVersion;

    // Get the current directory in ES module context
    const __filename = fileURLToPath(import.meta.url);
    const frontendDir = dirname(__filename);
    const rootDir = resolve(frontendDir, '../../../'); // Move up three levels to the correct root directory
    const solutionFilePath = join(rootDir, 'Package.Reference.Project.sln');

    // Define the project names to be removed
    const projectNames = [`Umbraco-${umbracoVersion}`, `Umbraco-${umbracoVersion}-nuget`];

    // Function to remove a project from the solution
    const removeProjectFromSolution = (solutionFile, projectFile) => {
        if (existsSync(solutionFile)) {
            console.log(`Removing ${projectFile} from solution...`);
            try {
                execSync(`dotnet sln "${solutionFile}" remove "${projectFile}"`, { stdio: 'inherit' });
                console.log(`Successfully removed project from solution.`);
            } catch (error) {
                console.error(`Failed to remove project from solution: ${error.message}`);
            }
        } else {
            console.error(`Solution file not found: ${solutionFile}`);
        }
    };

    // Function to delete the project directory
    const deleteProjectDirectory = (projectDirectory) => {
        if (existsSync(projectDirectory)) {
            console.log(`Deleting project directory: ${projectDirectory}`);
            try {
                rmSync(projectDirectory, { recursive: true, force: true });
                console.log(`Successfully deleted project directory.`);
            } catch (error) {
                console.error(`Failed to delete project directory: ${error.message}`);
            }
        } else {
            console.error(`Project directory not found: ${projectDirectory}`);
        }
    };

    // Iterate over both project types and remove them
    projectNames.forEach((projectName) => {
        const projectDir = join(rootDir, 'Umbraco', projectName); // Path to the project directory
        const projectFilePath = join(projectDir, `${projectName}.csproj`); // Path to the project file

        // Remove the project from the solution
        removeProjectFromSolution(solutionFilePath, projectFilePath);

        // Delete the project directory
        deleteProjectDirectory(projectDir);

        console.log(`Umbraco project ${projectName} removed and directory deleted.`);
    });
}
