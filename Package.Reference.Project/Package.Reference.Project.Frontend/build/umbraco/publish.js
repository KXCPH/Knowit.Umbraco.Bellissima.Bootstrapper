import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

export default function publish() {
    // Get the current directory in ES module context
    const __filename = fileURLToPath(import.meta.url);
    const frontendDir = dirname(__filename);
    const rootDir = resolve(frontendDir, '../../../'); // Move up three levels to the correct root directory
    const solutionPath = join(rootDir, 'Package.Reference.Project.sln');
    const projectPath = join(rootDir, 'Package.Reference.Project.Backend');
    const csprojectPath = join(projectPath, 'Package.Reference.Project.Backend.csproj');
    const outputDirectory = join(rootDir, 'nuget');

    // Ensure the output directory exists
    if (!existsSync(outputDirectory)) {
        mkdirSync(outputDirectory, { recursive: true });
    }

    // Function to increment version
    const incrementVersion = (version) => {
        const versionParts = version.split('.');
        if (versionParts.length !== 3) {
            throw new Error("Invalid version format. Expected x.y.z");
        }

        // Increment the patch version
        versionParts[2] = parseInt(versionParts[2], 10) + 1;

        // Return the incremented version
        return `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}`;
    };

    try {
        // Load the .csproj file
        let csprojContent = readFileSync(csprojectPath, 'utf-8');

        // Extract the current version
        const versionRegex = /<Version>(.*?)<\/Version>/;
        const versionMatch = csprojContent.match(versionRegex);
        if (!versionMatch) {
            throw new Error("Version node not found in the .csproj file.");
        }

        const currentVersion = versionMatch[1];
        console.log(`Current version: ${currentVersion}`);

        // Increment the version
        const newVersion = incrementVersion(currentVersion);
        console.log(`New version: ${newVersion}`);

        // Update the version in the .csproj file
        csprojContent = csprojContent.replace(versionRegex, `<Version>${newVersion}</Version>`);
        writeFileSync(csprojectPath, csprojContent, 'utf-8');
        console.log("Version updated in the .csproj file.");

        // Rebuild the entire solution
        console.log("Rebuilding the solution...");
        execSync(`dotnet build "${solutionPath}" --configuration Release --no-incremental -v m`, { stdio: 'inherit' });

        // Pack the specified project
        console.log("Packing the project...");
        execSync(`dotnet pack "${projectPath}" --configuration Release --output "${outputDirectory}" -v m`, { stdio: 'inherit' });

        console.log(`NuGet package created successfully in the '${outputDirectory}' directory.`);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        process.exit(1);
    }
}
