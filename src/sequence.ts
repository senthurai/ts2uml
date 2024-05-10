import { GraphNode, SequenceRequest, _graphs } from "./model";

/**
 * This decorator function modifies the original method to apply a graph sequence.
 * It takes a SequenceRequest object as a parameter and returns a function that replaces the original method.
 * The replacement method creates a new GraphNode if one does not already exist for the requestId,
 * applies the graph sequence, and handles any errors that occur during the execution of the original method.
 *
 * @param {SequenceRequest} request - The request object containing the requestId and other necessary data.
 * @returns {Function} - A function that replaces the original method.
 */
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

/**
 * This function generates a sequence diagram.
 * It takes a SequenceRequest as a parameter, which contains the requestId.
 * The function finds the GraphNode associated with the requestId and traverses up the graph to the root node.
 * It then traverse and generates the sequence diagram .
 *
 * @param {SequenceRequest} request - The request object containing the requestId.
 * @returns {string} - A string representing the sequence diagram.
 */
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
