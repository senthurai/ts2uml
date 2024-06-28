import fs from 'fs';
import { _graphs, umlConfig } from './model';
export class StackHandler {
    readonly excludeList = ["Module", "_compile"]

    findClassAndMethodName(filePath: string, targetLineNumber: number): { className: string | null, method: string | null } {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        let currentClassName = null;
        let currentMethodName = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;

            // Match class declaration
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                currentClassName = classMatch[1];
            }

            // Match method declaration (simplified, assuming methods are not nested)
            const methodMatch = line.match(/(?:async\s+)?(?:static\s+)?\w+\s+(\w+)\(/);
            if (methodMatch) {
                currentMethodName = methodMatch[1];
            }

            // Check if the target line number is reached
            if (lineNumber === targetLineNumber) {
                return { className: currentClassName, method: currentMethodName };
            }
        }

        // Return null if no class or method is found at the given line number
        return { className: null, method: null };
    }
    findDeclaredType(filePath: string, objectName: string, lineNumber: number): { declaredType: string, declaredMethod: string } {
        const content = fs.readFileSync(filePath, 'utf8');
        let declaredType = objectName;
        let declaredMethod = "";
        const varMatch = content.match(new RegExp(`(let|const|var)\\s+${objectName}\\s*(:\\s*(\\w+))?\\s*=\\s*new\\s+(\\w+)\\(`));
        if (varMatch && (varMatch[4])) {
            declaredType = varMatch[4];
        } else {
            const varMatch = content.match(new RegExp(`(let|const|var)\\s+${objectName}\\s*(:\\s*(\\w+))?\\s*=\\s*(\\w+)\\.(\\w+)`));
            if (varMatch && varMatch[4]) {
                declaredType = varMatch[4];
                declaredMethod = varMatch[5];
            }
            if (declaredType === "this") {
                declaredType = this.findClassAndMethodName(filePath, lineNumber).className;
            } else {
                const stack = this.findDeclaredType(filePath, declaredType, lineNumber);
                declaredType = stack.declaredType;
                declaredMethod = stack.declaredMethod;
            }
        }

        // Add more patterns as needed, such as for interfaces, type aliases, etc.
        return { declaredType, declaredMethod };
    }

    findPromiseStartMethod(filePath: string, targetLineNumber: number): { method: string, className: string } {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        let method = null;
        let className = "";
        let thenFound = false;
        for (let i = targetLineNumber - 1; i >= 0; i--) {
            const line = lines[i];
            // Simplified regex to match a method call that might return a promise
            // This regex needs to be adjusted based on the actual coding patterns
            const methodCallMatch = line.match(/\s*(\w+)\.(\w+)\(/);
            const thenMatch = line.match(/(\w+)(\(.*\))?\.then\(/);

            if (thenMatch) {
                thenFound = true
            }
            if (methodCallMatch && thenFound) {
                // Found a potential promise starting method call
                className = methodCallMatch[1];
                method = methodCallMatch[2];
                if (className === "this") {
                    className = this.findClassAndMethodName(filePath, i).className;
                } else {
                    const stack = this.findDeclaredType(filePath, className, i);
                    className = stack.declaredType;
                    method = method === 'then' ? stack.declaredMethod : method;
                }
                break;
            }
        }

        return { method, className };
    }

    getStackMethod(error: Error): { className: string, method: string, filePath: string }[] {
        let stack: { className: string, method: string, filePath: string }[] = [{ className: "Root", method: "", filePath: "" }, { className: "Root", method: "", filePath: "" }];
        let i = 0;
        error.stack.split("\n").slice(1, 5).forEach((line) => {
            stack[i++] = this.processStackLine(line.replace(/umlAlias\./g, ""));

        })
        return stack.filter((s) => s !== null && (!this.excludeList.includes(s.className) && !this.excludeList.includes(s.method))).slice(0, 2);
    }

    parseRemoteUrl(remote: string, local: string): string {
        let overlapString = this.findOverlap(remote, local);
        if (overlapString) {
            local = local.replace(/\\/g, '/').toLowerCase();
            local = local.substring(local.indexOf(overlapString) + overlapString.length);
            return remote + local;
        }
    }

    findOverlap(remote: string, local: string): string {
        // Normalize path separators for the local path to forward slashes
        local = local.replace(/\\/g, '/').toLowerCase();

        // Extract the path part from the remote URL, assuming it might be from GitHub, Bitbucket, or similar
        // This regex aims to capture the path after the third slash that comes after the domain name
        // e.g., https://github.com/user/repo/path/to/file or https://bitbucket.org/user/repo/path/to/file
        const pathMatch = remote.match(/^[^:]+:\/\/[^\/]+\/[^\/]+\/[^\/]+\/(.*)/);
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

    processStackLine(line: string) {
        if (line.includes("at ")) {
            if (line.includes("Object.<anonymous>")) {
                return null
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
                    className = _graphs.staticMethods[method];
                }
                let filePath = localFilePath;
                if(umlConfig.enableLink){
                    filePath = this.parseRemoteUrl(umlConfig.remoteBaseUrl, localFilePath);
                }
                return { className, method, filePath };
            } else {
                let filePath = parts[0].replace(/\(?(.*?):[0-9].*\)?/gm, "$1");
                let lineNumber = parts[0].replace(/.*?:([0-9]+):.*/, "$1");
                let { method, className } = this.findPromiseStartMethod(filePath, parseInt(lineNumber));
                filePath = this.parseRemoteUrl(umlConfig.remoteBaseUrl, filePath);
                return { className, method, filePath }
            }
        }
    }
}