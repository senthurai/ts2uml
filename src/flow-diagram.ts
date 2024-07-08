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
    nodes.filter(n => n.type == NodeType.Request).forEach((node, i) => {
        if (!participants[node.source]) {
            participants[node.source] = {};
        }
        if (!participants[node.reciever]) {
            participants[node.reciever] = {};
        }
        participants[node.source][node.srcMethod] = undefined;
        participants[node.reciever][node.recMethod] = undefined;
        const path = `${node.modifier!=Modifier.Public?("\n%%"+node.modifier+""):""}\n${node.srcMethod ? node.srcMethod : node.source}---->${node.recMethod ? node.recMethod : node.reciever}`;
        if (participants[path]) return;
        participants[path] = true;
        flow += path.replace(/---->/g, `--${Object.keys(participants).filter(p => p.includes("--")).length}-->`);
    });

    Object.keys(participants).filter(p => !p.includes("-")).forEach((p) => {
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
