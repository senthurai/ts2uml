import { expand, fntoReadable, GraphNode, NodeType } from "./model";

// write chunk implementation
export function chunk(array: any[], size: number): any[] {
  return array.reduce((acc, _, i) => (i % size ? acc : [...acc, array.slice(i, i + size)]), []);
}
export function getSequenceDirection(node: GraphNode) {
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
export function parseSequence(node: GraphNode) {
  return `\n${node.type === NodeType.Request ? node.source : node.reciever} ${getSequenceDirection(node)} ${node.type === NodeType.Request ? node.reciever : node.source}: ${fntoReadable(expand(node.recMethod))}`;
}



