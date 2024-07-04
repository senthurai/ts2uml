import fs, { createWriteStream } from "fs";
import { GraphNode, NodeType, _graphs, expand, fntoReadable } from "./model";
import { chunk, parseSequence } from "./sequence-util";
const rootTs2uml = "./.ts2uml/";
/**
 * This function generates a sequence diagram. 
 * The function finds the GraphNode associated with the requestId and traverses up the graph to the root node.
 * It then traverse and generates the sequence diagram .
 *
 * @returns {string} - A string representing the sequence diagram.
 */
export function _getSequence(): string {
  const sequence = Object.keys(_graphs.graphs)
    .map((key) => {
      const fileToWrite = rootTs2uml + "sd_" + key + ".md";
      let nodeArray: GraphNode[] = _graphs.graphs[key];
      const dedups: string[] = [], participants: string[] = [];
      fs.existsSync(rootTs2uml) || fs.mkdirSync(rootTs2uml, { recursive: true });
      fs.existsSync(fileToWrite) && fs.unlinkSync(fileToWrite)
      const writeStream = createWriteStream(fileToWrite);
      const beginning = "```mermaid\nsequenceDiagram\n";
      let sequence = beginning;
      const chunkSize = 1000;
      writeStream.write(beginning);
      chunk(nodeArray, chunkSize).forEach((nodes) => {
        let seq = getSequenceFromNode(nodes, dedups, participants) + "\n";
        sequence += seq;
        writeStream.write(seq);
      })
      writeStream.write("```");
      writeStream.end()
      writeStream.close();
      return sequence;
    }).join("\n");
  return sequence;
}



function getSequenceFromNode(nodes: GraphNode[], dedups: string[], participants: string[]) {
  let sequence = "";
  let isDtimeSet = false;
  nodes.forEach((node) => {
    sequence = handleNewParticipant(node.source, participants, sequence);
    sequence = handleNewParticipant(node.reciever, participants, sequence);

    sequence += parseSequence(node);
    if (!dedups.includes(node.timestamp + "")) {
      let result = getTimeStamp(node, isDtimeSet);
      result && (sequence += `\nNote left of ${node.source}:${result}`)
      isDtimeSet = true;
      dedups.push(node.timestamp + "");
    }
    node.args && (sequence += `\nNote over ${node.source},${node.reciever}:` + node.args)
  });
  return sequence;
}

export function handleNewParticipant(source: string, participants: string[], sequence: string) {
  const actorSrc = fntoReadable(expand(source));
  if (!participants.includes(source)) {
    sequence += "\nParticipant " + source + " as " + actorSrc;
    participants.push(source);
  }
  return sequence;
}
function getTimeStamp(node: GraphNode, isTimeSet: boolean) {
  let result = undefined;
  if (node.type === NodeType.Request) {
    if (isTimeSet) {
      // result is just the time
      result = new Date(node.timestamp).toString().split(" ")[4];
    } else {
      result = new Date(node.timestamp).toString();
    }
  }
  else {
    result = node.timestamp + "ms";
  }
  return result;
}




