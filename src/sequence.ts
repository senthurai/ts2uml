import { GraphNode, SequenceRequest, _graphs } from "./model";
export function sequence(request: SequenceRequest) {
  return function (originalMethod: any, _context: any) {
    console.log("sequence");
    function replacementMethod(this: any, ...args: any[]) {
      let node = _graphs.graphs[request.requestId];
      if (!node) {
        node = new GraphNode(request.requestId, "", args.length ? JSON.stringify(args) : "", undefined, []);
        _graphs.graphs[request.requestId] = node;
      }
      try {
        const result = applyGraph.call(this, originalMethod, args, node, request.requestId);
        return result;
      } catch (e) {
        console.log("Error in method " + originalMethod.name);
        throw e;
      }
    }
    return replacementMethod;
  };
}

function applyGraph(this: any, originalMethod: any, args: any[], oldNode: GraphNode, requestId: string) {
  // get the original method's class name
  const className = this.constructor.name;

  const newNode = new GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);

  oldNode!.children.push(newNode);
  _graphs.graphs[requestId] = newNode;
  const result = originalMethod.call(this, ...args);
  _graphs.graphs[requestId] = oldNode;
  return result;
}
//   function to loop through the graph and construct the sequence in mermaid format
export function getSequence(request: SequenceRequest) {
  let node: GraphNode = _graphs.graphs[request.requestId];
  while (node.parent) {
    _graphs.graphs[request.requestId] = node.parent;
    node = node.parent;
  }
  let seq = "sequenceDiagram\n" + getSequenceFromNode(node);
  return seq;
}

function getSequenceFromNode(node: GraphNode) {
  let sequence = "";
  if (node.parent) {
    sequence = `${node.parent?.actor} ->> ${node.actor}:${node.name}`;
  }
  for (let i = 0; i < node.children.length; i++) {
    let seq = getSequenceFromNode(node.children[i]);
    sequence = `${sequence}\n${seq}`;
  }

  return sequence;
}

// Function to write a generate sequence diagram
