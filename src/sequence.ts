import { GraphNode, SequenceRequest, _graphs } from "./model";
export function sequence(request: SequenceRequest) {
  return function (originalMethod: any, _context: any) {
    let simple = "";
    console.log("sequence");

    function replacementMethod(this: any, ...args: any[]) {
      const start = new GraphNode("Caller", "", args.length ? JSON.stringify(args) : "", undefined, []);
      _graphs.graphs[request.requestId] = start;

      const result = applyGraph.call(this, originalMethod, args);

      return result;
    }
    return replacementMethod;
  };
}

function applyGraph(this: any, originalMethod: any, args: any[]) {
  // get the original method's class name
  const className = this.constructor.name;
  let oldNode = _graphs.graphs[this.className + originalMethod.name];

  if (!oldNode) {
    oldNode = new GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
  } else {
    const newNode = new GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
    _graphs.graphs[newNode.actor + newNode.name] = newNode;
    oldNode!.children.push(newNode);
  }

  const result = originalMethod.call(this, ...args);

  return result;
}
//   function to loop through the graph and construct the sequence in mermaid format
export function getSequence(request: SequenceRequest) {
  const node = _graphs.graphs[request.requestId];
  return getSequenceFromNode(node);
}

function getSequenceFromNode(node: GraphNode) {
  let sequence = "";
  if (node.parent) {
    sequence = `${sequence}\n${node.parent?.actor} ->> ${node.actor}:${node.name}`;
  }
  let children: { [key: string]: number } = {};
  for (let i = 0; i < node.children.length; i++) {
    let seq = getSequenceFromNode(node.children[i]);
    children[seq] = 1;
  }
  for (let key in children) {
    sequence = `${sequence}${key}`;
  }

  return sequence;
}
