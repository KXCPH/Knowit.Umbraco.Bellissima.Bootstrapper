#!/bin/bash

function usage {
 echo -e "\n Usage:\n"
 echo -e "\n     init.sh -newProjectName [PROJECT_NAME] -destinationPath [DESTINATION_DIRECTORY] \n"
 echo -e "\n     Ex.: ./init.sh -newProjectName my.test.project -destinationPath 'C:\\\code' \n"
}

function check_argument {
  if [ -z "$1" ]; then
    echo -e "\nError: $2"
    usage
    exit 1
  fi
}

function check_folder {
  if [ ! -d "$1" ]; then
    echo -e "\nError: $2"
    usage
    exit 1
  fi
}

# Parse command line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    -newProjectName)
      newProjectName="$2"
      ;;
    -destinationPath)
      destinationPath="$2"
      ;;
    *)
     usage
	 exit 1
  esac
  shift
  shift
done

# Validate command line arguments
check_argument "$newProjectName" "The argument newProjectName is required"
check_argument "$destinationPath" "The argument destinationPath is required"

# Define paths
referenceFolder="Package.Reference.Project"
newProjectFolder="$destinationPath/$newProjectName"

# Check folders exists
check_folder "$referenceFolder" "The reference folder $referenceFolder does not exist."
check_folder "$destinationPath" "The destination path $destinationPath does not exist."

# Copy the reference folder contents to the new project folder, excluding bin and node_modules
if [ command -v rsync &> /dev/null ]; then
    rsync -av --exclude=node_modules --exclude=bin "$referenceFolder/" "$newProjectFolder"
else
    scp -r "$referenceFolder/." "$newProjectFolder"
fi

# Rename files and directories, excluding bin and node_modules
find "$newProjectFolder" -depth -not -path "*/bin/*" -not -path "*/node_modules/*" -name "*${referenceFolder}*" | while read file; do
    f=$(basename "$file")
    d=$(dirname "$file")
    ff="$d/${f//$referenceFolder/$newProjectName}"
    if [ "$file" != "$ff" ]; then
        mv "$file" "$ff"
    fi
done

# Replace content within files, excluding bin and node_modules
find "$newProjectFolder" -type f -not -path "*/bin/*" -not -path "*/node_modules/*" | while read file; do
    sed "s/$referenceFolder/$newProjectName/g" "$file" > "$file.tmp" 2>/dev/null && mv "$file.tmp" "$file"
done

echo "Project '$referenceFolder' has been copied and renamed to '$newProjectFolder'."

# Navigate to the frontend folder and run npm install
frontendFolderPath="$newProjectFolder/${newProjectName}.Frontend"

if [ -d "$frontendFolderPath" ]; then
    echo "Running npm install in '$frontendFolderPath'."
    cd "$frontendFolderPath"
    npm install
    cd -
    if [ $? -eq 0 ]; then
        echo "npm install completed successfully in '$frontendFolderPath'."
    else
        echo "Error: Failed to run npm install in '$frontendFolderPath'."
    fi
else
    echo "Warning: Frontend folder '$frontendFolderPath' does not exist."
fi


