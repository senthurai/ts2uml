
import { _getSequence, _getSequenceTemplate } from './sequence-diagram';
import { GraphNode, NodeType, _graphs } from "./model";
import { _getFlowDiagram } from "./flow-diagram";
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
  return d && (d.value = overidden) || overidden;
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
  const pop = _graphs.classStack.pop() || { className: "Root", method: undefined };
  const startTime = new Date();
  if (requestId) {
    const nodesById = _graphs.graphs[requestId] || [];
    _graphs.classStack.push(pop);
    if (pop || pop.className !== className) {
      _graphs.classStack.push({ className, method: originalMethod.name });
    }
    const newNode = new GraphNode(pop.className, pop.method, className, originalMethod.name, args && Object.keys(args).length ? JSON.stringify(args) : "", startTime.getTime(), NodeType.Request);
    nodesById.push(newNode);
    _graphs.graphs[requestId] = nodesById;
  }
  try {
    const result = originalMethod.call(this, ...args);
    if (requestId) {
      handleResponse(result, pop, className, originalMethod.name, startTime);
    }
    return result;
  } catch (e) {
    if (requestId) {
      handleResponse(e, pop, className, originalMethod.name, startTime);
      _getSequence();
      setSequenceId(requestId)
    }
    throw e;
  }
}

function handleResponse(result: any, pop: { className: string, method: string }, className: string, method: string, startTime: Date) {
  const nodes = _graphs.graphs[_graphs._getRequestId()] || [];
  _graphs.classStack.pop()
  if (result instanceof Promise) {
    result.then((res: any) => {
      const newNode = new GraphNode(className, pop.method, pop.className, method, res && Object.keys(res).length ? JSON.stringify(res) : "",  new Date().getTime() - startTime.getTime(), NodeType.ResponseAsync);
      nodes.push(newNode);
      return res;
    })
  }

  const newNode = new GraphNode(className, pop.method, pop.className, method, result && Object.keys(result).length ? JSON.stringify(result) : "", new Date().getTime() - startTime.getTime(), result instanceof Promise ? NodeType.AsyncReturn : NodeType.Response);
  nodes.push(newNode);
  _graphs.graphs[_graphs._getRequestId()] = nodes;

}

export const getSequence = _getSequence
export const getFlowDiagram = _getFlowDiagram;
export const getSequenceTemplate = _getSequenceTemplate;


