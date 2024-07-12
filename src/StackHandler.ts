import fs from 'fs';
import { _graphs, umlConfig } from './model';
export class StackHandler {
    readonly excludeList = ["Module", "_compile", 'processTicksAndRejections', "Object.<anonymous>", "Function.Module._load", "Function.Module.runMain", "Function.Module._resolveFilename", "Function.Module._load", "Module.require", "Module.load", "Module._compile", "Object.Module"]

    findClassAndMethodName(filePath: string, targetLineNumber: number): { className: string | null, method: string | null } {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        let currentClassName = "Root";
        let currentMethodName = null;
        let blockDepth = 0; // Track the depth of nested blocks
        let gothrough = true;
        // Ensure targetLineNumber is within bounds
        if (targetLineNumber < 0 || targetLineNumber > lines.length) {
            throw new Error("targetLineNumber is out of bounds");
        }

        for (let i = targetLineNumber - 1; i >= 0; i--) {
            const line = lines[i];

            // Increase or decrease block depth based on opening and closing braces
            blockDepth += (line.match(/{/g) || []).length;
            blockDepth -= (line.match(/}/g) || []).length;



            // Match class declaration, considering possible keywords like 'export'
            const classMatch = line.match(/(?<=(?:export\s+)?(?:abstract\s+)?class\s+)(\w+)/);
            if ( currentMethodName && classMatch) {
                currentClassName = classMatch[1];
                break; // Stop searching once a class is found
            }



            // Skip processing if we're inside a nested block
            if (blockDepth !== 1) {
                gothrough = false;
                continue;
            };

            // Match method or function declaration
            const regex = /(\w+(?=\((?:[^()]*|\([^()]*\))*\)(:\s*\{(?:[^{}]*|\{[^{}]*\})*\})?\s*{)|(?<=(let|const)\s+)\w+(?=\s*=\s*[^()]*|\([^()]*\)*\)\s*=>\s*{))/g;

            const methodOrFunctionMatch = line.match(regex);
            if (!currentMethodName && methodOrFunctionMatch && methodOrFunctionMatch[0]&& !["if", "for"].includes(methodOrFunctionMatch[0])) {
                currentMethodName = methodOrFunctionMatch[0];
            }
        }

        // Adjust for cases where blockDepth might not return to 0 due to unbalanced braces
        if (blockDepth < 0) {
            console.warn("Warning: Unbalanced braces detected. The results might not be accurate.");
        }
        console.log(currentClassName, " --> ", currentMethodName)
        return { className: currentClassName, method: currentMethodName };
    }


    findPromiseStartMethod(filePath: string, targetLineNumber: number): { method: string, className: string } {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        let method = undefined;
        let className = "Root";
        let thenFound = false;
        for (let i = targetLineNumber - 1; i >= 0; i--) {
            const line = lines[i];
            // Simplified regex to match a method call that might return a promise
            // This regex needs to be adjusted based on the actual coding patterns
            const methodCallMatch = line.match(/\s*(\w+|(\w+)\.(\w+))\(/);
            const thenMatch = line.match(/(\w+)?(\(.*\))?\.then\(/);

            if (thenMatch) {
                thenFound = true
            }

            if (methodCallMatch && methodCallMatch[1] !== 'then' && thenFound) {
                // Found a potential promise starting method call
                className = methodCallMatch[2] || methodCallMatch[1];
                method = methodCallMatch[3];
                const CM = this.findClassAndMethodName(filePath, i);
                className = CM.className || 'Root';
                method = CM.method;

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
        return stack.slice(0, 2);
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

    processStackLine(line: string) {
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
                let { method, className } = this.findPromiseStartMethod(filePath, parseInt(lineNumber));
                filePath = this.parseRemoteUrl(umlConfig.remoteBaseUrl, filePath);
                return { className, method, filePath }
            }
        }
    }
}