// read the first command-line argument

const input = process.argv[2];
readTheFiles(input);
function readTheFiles(input: string) {
    const fs = require('fs');
    const path = require('path');
    const dir = input;
    const files = fs.readdirSync(dir);
    files.forEach((file:string) => {
        const filePath = path.join(dir, file);
        // is folder
        if (fs.statSync(filePath).isDirectory()) {
            readTheFiles(filePath);
        } else if (filePath.endsWith('.ts')) {
            let fileContent: string = readTheContent(filePath);
            // add "@uml()" to the all class in the fileContent if it is not already there
            let classPattern = /(public|export)? ?(public|export)*class\s+(\w+)\s*\{/g;
            let classMatch, modified;
            while (classMatch = classPattern.exec(fileContent)) {
                let className = classMatch[3];
                let umlPattern = new RegExp(`@uml\\(\\)\\s*(public|export)? ?(public|export)?class\\s+${className}\\s*\\{`, 'gim');
                if (!umlPattern.test(fileContent)) {
                    console.log(umlPattern);
                    fileContent = fileContent.replace(classMatch[0], `\n@uml()\n${classMatch[0]}`);
                    const import_stmt = "import { uml } from 'ts2uml';";
                    if (!fileContent.includes(import_stmt)) {
                        fileContent = `\nimport { uml } from 'ts2uml';\n${fileContent}`;
                    }
                    modified = true;
                }
            }
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