import { GraphNode, _graphs } from "./model"; 

 

/**
 * This decorator function modifies the original method to apply a graph sequence.
 * The replacement method creates a new GraphNode if one does not already exist for the requestId,
 * applies the graph sequence, and handles any errors that occur during the execution of the original method.
 *
 * @returns {Function} - A function that replaces the original method.
 */
export function sequence(): Function {
  return function (originalMethod: any, _context: any) {
    console.log("sequence");
    function replacementMethod(this: any, ...args: any[]) {
      try {
        const result = _applyGraph.call(this, originalMethod, args);
        return result;
      } catch (e) {
        console.log("Error in method " + originalMethod.name);
        throw e;
      }
    }
    return replacementMethod;
  };
}

export function setSequenceId(requestId: string) {
  _graphs._setRequestId(requestId);
}

function _applyGraph(this: any, originalMethod: any, args: any[]) {
  // get the original method's class name
  const className = this.constructor.name;
  const requestId = _graphs._getRequestId();
  let oldNode = _graphs.graphs[requestId];
  if (!oldNode) {
    oldNode = new GraphNode(requestId, "", args.length ? JSON.stringify(args) : "", undefined, []);
    _graphs.graphs[requestId] = oldNode;
  }

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
 * @returns {string} - A string representing the sequence diagram.
 */
export function getSequence(): string {
  let node: GraphNode | undefined;
  return (
    "sequenceDiagram\n" +
    Object.keys(_graphs.graphs)
      .map((key) => {
        node = _graphs.graphs[key];
        while (node.parent) {
          _graphs.graphs[key] = node.parent;
          node = node.parent;
        }
        let seq = getSequenceFromNode(node);
        return seq;
      })
      .join("\n")
  );
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
