// copy the uml-sprinkler files to the node_modules/.bin or ./../../
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';


const files = ['uml-sprinkler', 'uml-sprinkler.bat'];
const destDir = join(__dirname, './../../');
const localDir = join(__dirname, './../../node_modules/.bin');

files.forEach(file => {
    const src = join(__dirname, file);
    if (existsSync(src)) {
        const destPath = existsSync(localDir) ? join(localDir, file) : join(destDir, file);
        console.log(`Copying ${src} to ${destPath}`);
        copyFileSync(src, destPath);
    } else {
        console.log(`File ${src} does not exist`);
    }
});
handlePackageJson();

function handlePackageJson() {
    // Step 2: Define the path to the package.json file
    const packageJsonPath = join(destDir, 'package.json');

    // Step 3: Read the package.json file into a variable
    if (existsSync(packageJsonPath)) {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf8');

        // Step 4: Parse the JSON content of the file
        const packageJson = JSON.parse(packageJsonContent);

        // Step 5: Check if the `scripts` section exists, if not, create it
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        // Step 6: Check if the `uml-sprinkler` script exists
        if (!packageJson.scripts['uml-sprinkler']) {
            // If it does not exist, add it
            packageJson.scripts['uml-sprinkler'] = 'uml-sprinkler src';

            // Step 7: Convert the modified JSON object back to a string
            const updatedPackageJsonContent = JSON.stringify(packageJson, null, 2);

            // Step 8: Write the modified JSON string back to the package.json file
            writeFileSync(packageJsonPath, updatedPackageJsonContent, 'utf8');

            // Step 9: Log a success message
            console.log('Added "uml-sprinkler" script to package.json');
        } else {
            console.log('"uml-sprinkler" script already exists in package.json');
        }
    } else {
        console.log('package.json does not exist in the specified path');
    }
}