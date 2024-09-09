#!/bin/bash

# Define parameters
newProjectName=$1
destinationPath=$2

# Define paths
referenceFolder="Package.Reference.Project"
newProjectFolder="$destinationPath/$newProjectName"

# Store the original location
originalLocation=$(pwd)

# Check if the reference folder exists
if [ ! -d "$referenceFolder" ]; then
    echo "Error: The reference folder '$referenceFolder' does not exist." >&2
    exit 1
fi

# Check if the destination path exists
if [ ! -d "$destinationPath" ]; then
    echo "Error: The destination path '$destinationPath' does not exist." >&2
    exit 1
fi

# If the destination project folder already exists, run update.sh
if [ -d "$newProjectFolder" ]; then
    echo "Destination project folder '$newProjectFolder' already exists. Running update.sh..."
    ./update.sh "$newProjectName" "$destinationPath"
    exit 0
fi

# Create the new project folder if it doesn't exist
mkdir -p "$newProjectFolder" || { echo "Failed to create the new project folder at '$newProjectFolder'."; exit 1; }

# Function to copy files while excluding certain folders
copy_filtered() {
    src="$1"
    dest="$2"

    find "$src" -type f ! -path "*/bin/*" ! -path "*/node_modules/*" | while read -r file; do
        relativePath="${file#$src/}"
        destFile="$dest/$relativePath"
        destDir=$(dirname "$destFile")

        mkdir -p "$destDir" || { echo "Failed to create directory: $destDir"; continue; }
        cp -f "$file" "$destFile" || echo "Failed to copy file: $file to $destFile"
    done
}

# Start copying from within the reference folder to avoid nesting the entire structure
copy_filtered "$referenceFolder" "$newProjectFolder"

# Function to rename files and directories
rename_items_recursively() {
    find "$1" -depth -name "*$2*" ! -path "*/bin/*" ! -path "*/node_modules/*" | while read -r file; do
        newNamePath=$(echo "$file" | sed "s/$2/$3/")
        if [ "$file" != "$newNamePath" ]; then
            mv "$file" "$newNamePath" || echo "Failed to rename: $file to $newNamePath"
        fi
    done
}

# Function to replace content within files
replace_content_in_files() {
    find "$1" -type f ! -path "*/bin/*" ! -path "*/node_modules/*" | while read -r file; do
        sed -i "s/$2/$3/g" "$file" || echo "Failed to replace content in: $file"
    done
}

# Rename files and directories
rename_items_recursively "$newProjectFolder" "$referenceFolder" "$newProjectName"

# Replace content in files
replace_content_in_files "$newProjectFolder" "$referenceFolder" "$newProjectName"

echo "Project '$referenceFolder' has been copied and renamed to '$newProjectFolder'."

# Navigate to the frontend folder and run npm install
frontendFolderPath="$newProjectFolder/$newProjectName.Frontend"

if [ -d "$frontendFolderPath" ]; then
    echo "Running npm install in '$frontendFolderPath'."
    cd "$frontendFolderPath" || { echo "Failed to navigate to '$frontendFolderPath'."; exit 1; }
    npm install || echo "Failed to run npm install in '$frontendFolderPath'."
    echo "npm install completed successfully in '$frontendFolderPath'."
    cd "$originalLocation" || { echo "Failed to return to the original location: $originalLocation."; exit 1; }
    echo "Returned to the original location: $originalLocation."
else
    echo "Warning: Frontend folder '$frontendFolderPath' does not exist."
    cd "$originalLocation" || { echo "Failed to return to the original location: $originalLocation."; exit 1; }
    echo "Returned to the original location: $originalLocation."
fi
