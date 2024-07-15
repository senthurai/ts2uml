
import { _graphs, umlConfig, Modifier, StackInfo, Clazz, SourceData, Method } from './model';
import * as ts from 'typescript';
import * as fs from 'fs';
export class StackHandler {
    readonly excludeList = ["Module", "_compile", 'processTicksAndRejections', "Object.<anonymous>", "Function.Module._load", "Function.Module.runMain", "Function.Module._resolveFilename", "Function.Module._load", "Module.require", "Module.load", "Module._compile", "Object.Module"]

    findClassAndMethodName(fileName: string, lineNumber: number): { className?: string, method?: string, modifier?: Modifier } {
        let currentClassName: string | undefined;
        let currentMethodName: string | undefined;
        let modifier: Modifier = Modifier.Public
        let sourceData = _graphs.sourceData[fileName];
        if (sourceData) {
            let classAndMethod = sourceData.findClass(lineNumber);
            currentClassName = classAndMethod?.class;
            currentMethodName = classAndMethod?.method;
            modifier = classAndMethod?.modifier;
            if (currentMethodName) {
                console.log(`---------------------------------------------------------------------------- trip saved`)
                return { className: currentClassName, method: currentMethodName, modifier };
            }
        }
        const fileContent = fs.readFileSync(fileName, 'utf-8');
        const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);
        sourceData = _graphs.sourceData[fileName] || new SourceData();
        const method = new Method()
        const clazz = new Clazz()

        _graphs.sourceData[fileName] = sourceData;
        function find(node: ts.Node): void {
            const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
            if (startLine <= lineNumber && lineNumber <= endLine) {
                if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
                    // For methods and named functions, update the current method name
                    if (node.name) {
                        currentMethodName = node.name.getText(sourceFile);
                        if (ts.isMethodDeclaration(node)) {
                            modifier = node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.PrivateKeyword) ? Modifier.Private : Modifier.Public
                            clazz.methods[currentMethodName] = method;
                            method.start = startLine;
                            method.end = endLine;
                            method.modifier = modifier;
                        }
                        if (currentMethodName && currentClassName) {
                            return;
                        }
                    }
                } else if (ts.isClassDeclaration(node)) {
                    // For class declarations, update the current class name and reset method name
                    if (node.name) {
                        currentClassName = node.name.getText(sourceFile) || "Root";

                        clazz.methods = { ...clazz.methods, ...(sourceData.classes[currentClassName]?.methods || {}) };
                        clazz.start = startLine;
                        clazz.end = endLine;
                        sourceData.classes[currentClassName] = clazz;
                    }
                    if (currentMethodName && currentClassName) {
                        return;
                    }

                } else if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node)) {
                    // For arrow functions or function expressions, check if it's assigned to a variable
                    if (node.name) {
                        currentMethodName = node.name.getText(sourceFile);
                        const clazz = new Clazz()
                        clazz.start = startLine;
                        clazz.end = endLine;
                        sourceData.classes[currentClassName] = clazz;
                    }
                }
                ts.forEachChild(node, find);
            }
        }
        ts.forEachChild(sourceFile, find);
        return { className: currentClassName, method: currentMethodName, modifier };
    }



    getStackMethod(error: Error): StackInfo[] {
        let stack: StackInfo[] = [{ className: "Root", method: "", filePath: "", modifier: Modifier.Public }, { className: "Root", method: "", filePath: "" }];
        let i = 0;
        error.stack.split("\n").slice(1, 5).forEach((line) => {
            stack[i++] = this.processStackLine(line.replace(/umlAlias\./g, ""));
        })
        return stack.slice(0, 2);
    }

    private parseRemoteUrl(remote: string, local: string): string {
        let overlapString = this.findOverlap(remote, local);
        if (overlapString) {
            local = local.replace(/\\/g, '/').toLowerCase();
            local = local.substring(local.indexOf(overlapString) + overlapString.length);
            return remote + local;
        }
    }

    private findOverlap(remote: string, local: string): string {
        // Normalize path separators for the local path to forward slashes
        local = local.replace(/\\/g, '/').toLowerCase();

        // Extract the path part from the remote URL, assuming it might be from GitHub, Bitbucket, or similar
        // This regex aims to capture the path after the third slash that comes after the domain name
        // e.g., https://github.com/user/repo/path/to/file or https://bitbucket.org/user/repo/path/to/file
        const pathMatch = (remote + "").match(/^[^:]+:\/\/[^\/]+\/[^\/]+\/[^\/]+\/(.*)/);
        if (!pathMatch) return ""; // No valid path found in the URL

        const remotePath = pathMatch[1].toLowerCase(); // Convert to lower case to make the comparison case-insensitive
        let testResult = null
        // Start checking from the end of the remote path and the start of the local path
        for (let length = remotePath.length; length > 0; length--) {
            // Extract the substring from the remote path
            const substring = remotePath.substring(remotePath.length - length);
            // Check if the local path ends with this substring
            if (substring.length > 1 && local.includes(substring)) {
                return substring; // Return the overlapping part
            }
        }

        return testResult; // Return an empty string if there's no overlap
    }

    private processStackLine(line: string) {
        if (line.includes("at ")) {
            for (const exclude of this.excludeList) {
                if (line.includes(exclude)) {
                    return null;
                }
            }

            const parts = line.split("at ")[1].split(" ");
            if (parts.length > 1) {
                const classMethod = parts[0].split(".");
                let method = classMethod[classMethod.length - 1]
                let className = classMethod[classMethod.length - 2];
                let localFilePath = parts[1].replace(/\((.*?):[0-9].*\)/, "$1");
                if (line.includes("as ")) {
                    method = line.replace(/.*\[as (.*?)\].*/, "$1");
                }
                if (className?.includes("Function")) {
                    className = _graphs.methods[method];
                }
                let filePath = localFilePath;
                if (umlConfig.enableLink) {
                    filePath = this.parseRemoteUrl(umlConfig.remoteBaseUrl, localFilePath);
                }
                return { className, method, filePath };
            } else {
                let filePath = parts[0].replace(/\(?(.*?):[0-9].*\)?/gm, "$1");
                let lineNumber = parts[0].replace(/.*?:([0-9]+):.*/, "$1");
                let { method, className, modifier } = this.findClassAndMethodName(filePath, parseInt(lineNumber));
                filePath = this.parseRemoteUrl(umlConfig.remoteBaseUrl, filePath);
                className = className || "Root";
                method = method || undefined;
                return { className, method, filePath, modifier }
            }
        }
    }
}