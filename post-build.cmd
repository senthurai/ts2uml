@echo off

REM Array of files to copy
set files=package-bundle.json ./uml-sprinkler* README.md

REM Create the dist directory if it doesn't exist
if not exist dist mkdir dist

REM Copy the files using single copy command without using loop for copy command
for %%f in (%files%) do (
    copy %%f dist >nul 2>&1 && (
        echo File %%f copied successfully
    ) || (
        echo File %%f not copied successfully in Windows
    )
)

exit /b 0