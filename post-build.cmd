@echo off

REM Array of files to copy
set files=./uml-sprinkler* README.md

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
  
copy  "./package-bundle.json" "./dist/package.json" && echo File copied successfully || echo File not copied in windows


exit /b 0