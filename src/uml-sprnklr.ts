// read the first command-line argument

const input = process.argv[2];
readTheFiles(input);
function readTheFiles(input: string) {
    const fs = require('fs');
    const path = require('path');
    const dir = input;
    const files = fs.readdirSync(dir);
    files.forEach((file: string) => {
        const filePath = path.join(dir, file);
        // is folder
        if (fs.statSync(filePath).isDirectory()) {
            readTheFiles(filePath);
        } else if (filePath.endsWith('.ts')) {
            let fileContent: string = readTheContent(filePath);
            let modified = false;

            // Add "@uml()" decorator to all classes if not already present
            let classPattern = /(public|export)? ?(public|export)*class\s+(\w+)\s*\{/g;
            let classMatch;
            while (classMatch = classPattern.exec(fileContent)) {
                let className = classMatch[3];
                let umlPattern = new RegExp(`@uml\\(\\)\\s*(public|export)? ?(public|export)?class\\s+${className}\\s*\\{`, 'gim');
                if (!umlPattern.test(fileContent)) {
                    console.log(`Adding @uml() decorator to class ${className}`)
                    fileContent = (modified = true) && fileContent.replace(classMatch[0], `\n@uml()\n${classMatch[0]}`);
                    // Add import statement if not already present
                    const import_stmt = "import { uml } from 'ts2uml';";
                    if (!fileContent.includes(import_stmt)) {
                        console.log(`Adding uml import statement to file ${filePath}`)
                        fileContent = (modified = true) && `\n${import_stmt}\n${fileContent}`;
                    }
                }
            }
            // Write modified content back to file if any modifications were made
            if (modified) {
                fs.writeFileSync(filePath, fileContent);
            }

        }
    });
}
function readTheContent(filePath) {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
}