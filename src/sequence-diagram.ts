import fs from "fs";
import { GraphNode, NodeType, _graphs, expand, fntoReadable } from "./model";
/**
 * This function generates a sequence diagram. 
 * The function finds the GraphNode associated with the requestId and traverses up the graph to the root node.
 * It then traverse and generates the sequence diagram .
 *
 * @returns {string} - A string representing the sequence diagram.
 */

export function _getSequence(): string {
  const newLocal = Object.keys(_graphs.graphs)
    .map((key) => {
      let node: GraphNode[] = _graphs.graphs[key];
      let seq = getSequenceFromNode(node);
      const root = "./.ts2uml/";
      fs.existsSync(root) || fs.mkdirSync("./.ts2uml/", { recursive: true });
      const sequence = "```mermaid\nsequenceDiagram\n" + seq + "\n```";
      fs.writeFileSync(root + "sd_" + key + ".md", sequence);
      return sequence;
    }).join("\n");
  return newLocal;
}

export function _getSequenceTemplate(): string {
  const newLocal = Object.keys(_graphs.graphs)
    .map((key) => {
      let node: GraphNode[] = _graphs.graphs[key];
      let seq = getSequenceTemplateFromNode(node);
      const root = "./.ts2uml/";
      fs.existsSync(root) || fs.mkdirSync("./.ts2uml/", { recursive: true });
      const sequence = "```mermaid\nsequenceDiagram\n" + seq + "\n```";
      fs.writeFileSync(root + "sdt_" + key + ".md", sequence);
      return sequence;
    }).join("\n");
  return newLocal;
}


function getSequenceFromNode(nodes: GraphNode[]) {
  let sequence = "";
  const participants: string[] = [];
  nodes.sort((a, b) => a.timestamp == b.timestamp ? 0 : a.timestamp > b.timestamp ? 1 : -1).forEach((node) => {
    const actorSrc = fntoReadable(expand(node.source));
    const actorDest = fntoReadable(expand(node.reciever));
    if (!participants.includes(node.source)) {
      sequence += "\nParticipant " + node.source + " as " + actorSrc
      participants.push(node.source);
    }
    if (!participants.includes(node.reciever)) {
      sequence += "\nParticipant " + node.reciever + " as " + actorDest
      participants.push(node.reciever);
    }
    sequence += `\n${node.source} ${getSequenceDirection(node)} ${node.reciever}: ${fntoReadable(expand(node.method))}`;
    _graphs.dedups.includes(node.timestamp + "") || (sequence += `\nNote left of ${node.source}:${node.timestamp}`) && _graphs.dedups.push(node.timestamp + "");
    node.args && (sequence += `\nNote over ${node.source},${node.reciever}:` + node.args)
  });
  return sequence;
}

// getSequenceFromNode with no duplicate sequence
function getSequenceTemplateFromNode(nodes: GraphNode[]) {
  let sequence = "";
  const participants: string[] = [];
  const sequenceArray: string[] = [];
  nodes.forEach((node) => {
    const actorSrc = fntoReadable(expand(node.source));
    const actorDest = fntoReadable(expand(node.reciever));
    if (!participants.includes(node.source)) {
      sequence += "\nParticipant " + node.source + " as " + actorSrc
      participants.push(node.source);
    }
    if (!participants.includes(node.reciever)) {
      sequence += "\nParticipant " + node.reciever + " as " + actorDest
      participants.push(node.reciever);
    }
    let seq = `\n${node.source} ${getSequenceDirection(node)} ${node.reciever}: ${fntoReadable(expand(node.method))}`;
    sequenceArray.includes(seq) || sequenceArray.push(seq);
  });

  sequence += sequenceArray.join("");

  return sequence;
}



function getSequenceDirection(node: GraphNode) {
  switch (node.type) {
    case NodeType.Request:
      return "->>+";
    case NodeType.Response:
      return "-x-";
    case NodeType.ResponseAsync:
      return "-x-";
    case NodeType.AsyncReturn:
      return "--x";
  }
}



