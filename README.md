Umbraco Bellissima Package Bootstrap
This project help you bootstrap package development for Umbracos Bellissima Backoffice (version 14 and newer)

It's opinionated, but gets you up an running fast.

How to use
The project contains a reference project - you should not touch it.

Use the init.ps1 powershell to create your project.

Example:

.\init.ps1 -newProjectName "my.test.project" -destinationPath "C:\code"
The script will copy the reference project, rename everything to your project name and place it at your destination destinationPath

It will then initialize the frontend project.

Bellissima development is very frontend based, and this project takes this into account.

You should have the Backend and Frontend projects open simultaneously. This readme assumes you do so in Visual Studio for the backend and VS Code for the frontend, but you do you.

The Frontend project:
"build": "tsc && vite build",
"watch": "node ./build/watch.js ./../../umbraco wwwroot/app_plugins/Package.Reference.Project.Frontend",
"init-umbraco": "powershell -File ./../umbraco/CreateUmbracoProj.ps1 --",
"test-umbraco": "powershell -File ./../umbraco/TestUmbracoProj.ps1 --",
"remove-umbraco": "powershell -File ./../umbraco/RemoveUmbracoProj.ps1 --",
"generate": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 openapi-ts --file openapi-ts.config.ts",
"publish": "powershell -File ./../pack.ps1"
The frontend project contains script commands to help you for development. Use "init-umbraco" to attach a new umbraco project to your Solution.

Example

npm run init-umbraco 14.1.1
This will create an umbraco project in /umbraco/umbraco-14.1.1, add it to your solution file and add the backend project as a project-reference to it.

Then run "npm run watch" to have your frontend files be magicked into it.

If you have multiple umbraco versions installed, the watcher will provide a dialog in your terminal where you pick which version you are developing against.

The Backend project
You should do all your package-development in the created backend project, as that is the project that will be put in a nuget file for release. If you rebuild your solution in Visual Studio, the frontend project will also be compiled and added to your backend project in the /ui folder

Nuget
Nugets are awful to setup. This bootstrap project has done it for you. To test your code in nuget format, simply use

npm run test-umbraco 14.1.1
This will create a umbraco project in /umbraco/umbraco-14.1.1-nuget, add it to your solution file and pack your backend project in a nuget file and install it in the project.

When your project is ready for a public release, run the command

npm run publish
This will increment the z in the x.y.z version number of your package with 1 as well as put the packed nuget in /nuget

You are responsible for incrementing y and x depending on your preferences.