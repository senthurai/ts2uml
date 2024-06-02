import { _graphs, expand, fntoReadable, GraphNode, NodeType } from "./model";

//getFlowDiagram
export function getFlowDiagram(): string {
    const flow = Object.keys(_graphs.graphs)
        .map((key) => {
            let node: GraphNode[] = _graphs.graphs[key];
            let seq = getFlowFromNode(node);
            return "flowchart\n" + seq;
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

    nodes.filter(n => n.type == NodeType.Request).forEach((node) => {
      
        if (!participants[node.source]) {
            participants[node.source] = {};
        } 
        if (!participants[node.reciever]) {
            participants[node.reciever] = {};
        }
        participants[node.source][node.srcMethod] = undefined;
        participants[node.reciever][node.method] = undefined;
        if (participants[node.srcMethod + "-" + node.method]) return;
        flow += `\n${node.srcMethod ? node.srcMethod : node.source}-->${node.method ? node.method : node.reciever}`;
        participants[node.srcMethod + "-" + node.method] = true;
    });
    Object.keys(participants).filter(p => !p.includes("-")).forEach((p) => {
        flow += `\nsubgraph ${p}[${fntoReadable(expand(p))}]`
        Object.keys(participants[p]).forEach((m) => {
            if (m == 'undefined') return;
            flow += `\n${m}` + (m && `[${fntoReadable(expand(m))}]`);
        });
        flow += `\nend`
    });
    return flow;
}


