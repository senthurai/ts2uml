import { _graphs, expand, fntoReadable, GraphNode, Modifier, NodeType, umlConfig } from "./model";
import fs from "fs";
//getFlowDiagram
export function _getFlowDiagram(): string {
    const flow = Object.keys(_graphs.graphs)
        .map((key) => {
            let node: GraphNode[] = _graphs.graphs[key];
            let seq = getFlowFromNode(node);
            const root = "./.ts2uml/";
            fs.existsSync(root) || fs.mkdirSync("./.ts2uml/", { recursive: true });
            const flow = "```mermaid\nflowchart LR\n" + seq + "\n```";
            fs.writeFileSync(root + "flowchart_" + key + ".md", flow);
            return flow;
        }).join("\n");
    return flow;
}

/** generate
 * flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
 */

function getFlowFromNode(nodes: GraphNode[]) {
    let flow = "";
    const participants: {} = {};
    nodes.filter(n => n.type === NodeType.ResponseAsync || n.type === NodeType.Request).forEach((node, i) => {
        if (!participants[node.source]) {
            participants[node.source] = {};
        }
        if (!participants[node.reciever]) {
            participants[node.reciever] = {};
        }
        participants[node.source][node.srcMethod] = undefined;
        participants[node.reciever][node.recMethod] = undefined;
        let path = "";
        if (node.type === NodeType.ResponseAsync) {
            path = `${node.modifier != Modifier.Public ? ("\n%%" + node.modifier + "") : ""}\n${node.recMethod ? node.recMethod : node.reciever}-.o${node.srcMethod ? node.srcMethod : node.source}`;

        } else if (node.type === NodeType.Request) {
            path = `${node.modifier != Modifier.Public ? ("\n%%" + node.modifier + "") : ""}\n${node.srcMethod ? node.srcMethod : node.source}-->${node.recMethod ? node.recMethod : node.reciever}`;
        }
        if (participants[path]) return;
        participants[path] = true;
        flow += path.replace(/([-.=])([-.=])([o>])/g, `$1$2${Object.keys(participants).filter(p => p.includes("-")).length}$2$1$3`);
    });

    Object.keys(participants).filter(p => !(p.includes("-") || p.includes("="))).forEach((p) => {
        flow += `\nsubgraph ${p}[${fntoReadable(expand(p))}]`
        const methods = Object.keys(participants[p]);
        methods.filter(m => m && m != 'undefined' && m != 'null').forEach((m) => flow += `\n${m}` + (m && `[${fntoReadable(expand(m))}]`));
        if (methods && methods.length > 1 && umlConfig.remoteBaseUrl) {
            const links = Object.keys(participants[p]).filter(m => m && m != 'undefined' && m != 'null').join(",");
            if (links && links.length) {
                flow += `\nclick ${links} href "${_graphs.remoteUrl[p]}" "${_graphs.remoteUrl[p]}"`
            }
        }
        flow += `\nend`
    });
    return flow;
}
export function getMasterFlowDiagram() {
    const root = "./.ts2uml/";
    if (fs.existsSync(root)) {
        const files = fs.readdirSync(root);
        const flows = files.filter(f => f.startsWith("flowchart_")).map(f => root + f);
        mergeMermaidFiles(flows, root + "Master_flowchart.md");
    }
}

async function readMermaidContent(filePath: string): Promise<string> {
    const content = await fs.readFileSync(filePath, { encoding: 'utf8' });
    const start = content.indexOf('```mermaid') + '```mermaid'.length;
    const end = content.indexOf('```', start);
    return content.substring(start, end).trim();
}

async function mergeFlowcharts(contents: string[]): Promise<string> {
    // First, normalize line styles and prepare contents by removing flowchart declarations after the first content
    const preparedContents = contents.map((content, index) => {
        let modifiedContent = content.replace(/--\d+--/g, '--').replace(/-.\d+.-/g, '-.-');
        if (index > 0) {
            modifiedContent = modifiedContent.replace(/flowchart (TD|LR|RL|BT|TB).*\n/, '');
        }
        return modifiedContent;
    });

    // Assuming subgraphs are well-formed and consistently named across contents
    // Merge subgraphs by title
    const subgraphMap = new Map<string, string[]>();
    const arrowMap: string[] = ['flowchart LR'];
    preparedContents.forEach(content => {

        const arrowRegex = /^(.*?(--|-\.-).*?)$/gm;

        let match;
        while ((match = arrowRegex.exec(content)) !== null) {
            const arrow = match[1];
            if (!arrowMap.includes(arrow)) {
                arrowMap.push(arrow);
            }
        }
        const subgraphRegex = /subgraph (\w+\[.*?\])[\s\S]*?end/g;

        while ((match = subgraphRegex.exec(content)) !== null) {
            const title = match[1];
            const subgraphContent = match[0];
            if (!subgraphMap.has(title)) {
                subgraphMap.set(title, []);
            }
            subgraphMap.get(title).push(subgraphContent.replace(/subgraph \w+\[.*?\]|end/g, '').trim());
        }
    });

    // Build merged subgraphs
    const mergedSubgraphs = Array.from(subgraphMap.entries()).map(([title, contents]) => {
        return `subgraph ${title}\n${contents.join('\n')}\nend`;
    });

    arrowMap.push(...mergedSubgraphs);
    // Join all merged subgraphs with two newlines
    return arrowMap.join('\n');
}

function writeMergedContent(filePath: string, content: string) {
    const mermaidContent = '```mermaid\n' + content + '\n```';
    fs.writeFileSync(filePath, mermaidContent, { encoding: 'utf8' });
}

async function mergeMermaidFiles(filePaths: string[], outputFile: string): Promise<void> {
    try {
        const contents = await Promise.all(filePaths.map(filePath => readMermaidContent(filePath)));
        const mergedContent = await mergeFlowcharts(contents);
        writeMergedContent(outputFile, mergedContent);
        console.log('Mermaid files merged successfully.');
    } catch (error) {
        console.error('Error merging Mermaid files:', error);
    }
}
