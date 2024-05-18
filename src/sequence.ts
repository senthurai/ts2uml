import { GraphNode, _graphs } from "./model";
const defaultFn = ["constructor", "__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "toLocaleString"]
/**
 * This decorator function modifies the original method to apply a graph sequence.
 * The replacement method creates a new GraphNode if one does not already exist for the requestId,
 * applies the graph sequence, and handles any errors that occur during the execution of the original method.
 *
 * @returns {Function} - A function that replaces the original method.
 */

export function sequence(): Function {
  return function (method: any, caller: any, d: PropertyDescriptor) {
    if ((caller && caller?.kind === "class") || (method?.prototype && method?.prototype?.constructor?.name === method?.name)) {
      return handleClass(d, method);
    } else {
      return handleFn(d, method);
    }
  };
}
function getAllMethodNames(obj: any) {
  let methods = new Set();
  while (obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj)
    keys.filter(f => !defaultFn.includes(f.toString() + "")).forEach((k) => methods.add(k));
  }
  return methods;
}


function handleClass(d: PropertyDescriptor, _class: any) {

  return class _sequenceTempImpl extends _class {
    constructor(...args: any[]) {
      super(...args);
      this.name = _class.name;
      const orgImpl = this;
      getAllMethodNames(this).forEach((key: PropertyKey) => {
        orgImpl[key.toString()] = handleFn(undefined, orgImpl[key.toString()]);
      });
    }
  };

}

function handleFn(d: PropertyDescriptor, method: any) {
  const originalMethod: any = (d && d.value) || method;
  const overidden = function (this: any, ...args: any[]) {
    try {
      
      const result = _applyGraph.call(this, originalMethod, args);
      return result;
    } catch (e) {
      console.log("Error in method " + originalMethod.name);
      throw e;
    }
  };
  if (d) {
    d.value = overidden;
  } else {
    return overidden;
  }
}

export function setSequenceId(requestId: string) {
  _graphs._setRequestId(requestId);
}

function _applyGraph(this: any, originalMethod: any, args: any[]) {
  // get the original method's class name
  let className = this.constructor.name;
  if (className === "_sequenceTempImpl") {
    className = Object.getPrototypeOf(this.constructor).name;
  }
  const requestId = _graphs._getRequestId();
  let oldNode = _graphs.graphs[requestId];
  if (requestId) {
    if (!oldNode) {
      oldNode = new GraphNode(requestId, "", args.length ? JSON.stringify(args) : "", undefined, []);
      _graphs.graphs[requestId] = oldNode;
    }
    const newNode = new GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
    oldNode!.children.push(newNode);
    _graphs.graphs[requestId] = newNode;
  }
  const result = originalMethod.call(this, ...args);
  requestId && (_graphs.graphs[requestId] = oldNode);
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
        delete _graphs.graphs[key]
        return "sequenceDiagram\n" +seq;
 
      })
      .join("\n")
  ) ;
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
