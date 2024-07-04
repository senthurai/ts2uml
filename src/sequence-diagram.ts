import fs, { createWriteStream } from "fs";
import { GraphNode, NodeType, _graphs, expand, fntoReadable } from "./model";
import { createHash } from "crypto";
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
    sequence += `\n${node.type == NodeType.Request ? node.source : node.reciever} ${getSequenceDirection(node)} ${node.type == NodeType.Request ? node.reciever : node.source}: ${fntoReadable(expand(node.type == NodeType.Request ? node.recMethod : node.srcMethod||node.recMethod))}`;
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

export function _getSequenceTemplate(): string {
  fs.existsSync(rootTs2uml) || fs.mkdirSync(rootTs2uml, { recursive: true });
  const sequences = Object.keys(_graphs.graphs).map((key) => {
    let nodeArray: GraphNode[] = _graphs.graphs[key];
    const participants: string[] = [];
    const sequenceArray: string[] = [];
    const begining = "```mermaid\nsequenceDiagram\n";
    let sequence = begining;
    const fileToWrite = rootTs2uml + "sdt_" + key + ".md";
    //delete the file if it exists
    fs.existsSync(fileToWrite) && fs.unlinkSync(fileToWrite)
    const writeStream = createWriteStream(fileToWrite);
    writeStream.write(begining);
    chunk(nodeArray, 20).forEach((nodes) => {
      let seq = getSequenceTemplateFromNode(nodes, sequenceArray, participants) + "\n";
      sequence += seq;
    })
    chunk(sequenceArray, 20).forEach((seqArray) => {
      const write = seqArray.join("");
      writeStream.write(write);
      sequence += write;
    })
    writeStream.write("\n```");
    writeStream.end();
    return sequence;
  }).join("\n");
  return sequences;
}

// write chunk implementation
function chunk(array: any[], size: number): any[] {
  return array.reduce((acc, _, i) => (i % size ? acc : [...acc, array.slice(i, i + size)]), []);
}

// getSequenceFromNode with no duplicate sequence
function getSequenceTemplateFromNode(nodes: GraphNode[], sequenceArray: string[], participants: string[]) {
  let sequence = "";
  nodes.forEach((node) => {
    const actorSrc = fntoReadable(expand(node.source));
    const actorDest = fntoReadable(expand(node.reciever));
    if (!participants.includes(node.source)) {
      sequence = handleParticipant(node.source, actorSrc, sequence, sequenceArray, participants);
    }
    if (!participants.includes(node.reciever)) {
      sequence = handleParticipant(node.reciever, actorDest, sequence, sequenceArray, participants);
    }
    let seq = parseSequence(node);
    calculateMean(participants, sequenceArray, seq, node);
  });

  return sequence;
}

function handleParticipant(actorAbbr: string, actor: string, sequence: string, sequenceArray: string[], participants: string[]) {
  const participant = addParticipant(actorAbbr, actor);
  sequenceArray.push(participant);
  participants.push(actorAbbr);
  return sequence;
}

function addParticipant(actorAbbr: string, actor: string) {
  return "\nParticipant " + actorAbbr + " as " + actor;
}

function calculateMean(participants: string[], sequenceArray: string[], seq: string, node: GraphNode) {
  //get hash the of seq

  let isOld: boolean = true;
  if (!sequenceArray.includes(seq)) {
    sequenceArray.push(seq);
    isOld = false;
  }
  if (node.type !== NodeType.Request) {
    let hash = createHash('sha256').update(seq).digest('hex');
    const meanValue = participants[hash] || (participants[hash] = {});
    const indexToDelete = sequenceArray.indexOf(seq) + 1;
    let min = meanValue.min || 0;
    let max = meanValue.max || 0;
    let count = meanValue.count || 0;
    let total = meanValue.total || 0;
    if (min == 0 || node.timestamp < min) {
      min = node.timestamp;
    }
    if (max == 0 || node.timestamp > max) {
      max = node.timestamp;
    }
    total += node.timestamp;
    count++;
    meanValue.min = min;
    meanValue.max = max;
    meanValue.total = total;
    meanValue.count = count;
    meanValue.mean = total / count;
    participants[hash] = meanValue;
    const index = isOld && indexToDelete || sequenceArray.length;
    sequenceArray[index] = (`\nNote left of ${node.source}:c:${count}|m:${min}/M:${max}/~${meanValue.mean.toPrecision(3)}/ms`);
  }
}

function parseSequence(node: GraphNode) {
  return `\n${node.type===NodeType.Request?node.source:node.reciever} ${getSequenceDirection(node)} ${node.type===NodeType.Request?node.reciever:node.source}: ${fntoReadable(expand(node.recMethod))}`;
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



