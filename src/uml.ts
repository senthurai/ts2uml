
import { _getSequence } from "./graph-node-parser";
import { GraphNode, _graphs } from "./model";
const defaultFn = ["constructor", "__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "toLocaleString"]
/**
 * This decorator function modifies the original method to apply a graph sequence.
 * The replacement method creates a new GraphNode if one does not already exist for the requestId,
 * applies the graph sequence, and handles any errors that occur during the execution of the original method.
 *
 * @returns {Function} - A function that replaces the original method.
 */
export function uml(): Function {

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


    const result = _applyGraph.call(this, originalMethod, args);
    return result;

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
      oldNode = new GraphNode(requestId, "", args.length ? JSON.stringify(args) : "", undefined, new Date().toISOString(), undefined);
      _graphs.graphs[requestId] = oldNode;
    }
    const newNode = new GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", "", new Date().toISOString(), oldNode);
    oldNode!.children.push(newNode);
    _graphs.graphs[requestId] = newNode;
  }
  try {
    const result = originalMethod.call(this, ...args);
    requestId && (_graphs.graphs[requestId] = oldNode) && result && (oldNode.response = JSON.stringify(result));

    return result;
  } catch (e) {
    if (requestId) {
      _graphs.graphs[requestId] = oldNode;
      oldNode.response = JSON.stringify(e.message);
      _getSequence();
      setSequenceId(requestId)
    }
    throw e;
  }
}

export const getSequence = _getSequence