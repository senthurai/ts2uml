
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
  let classes: any = {};
  return class extends _class {
    constructor(...args: any[]) {
      super(...args);
      this.name = _class.name;
      const orgImpl = this;
      const methods = getAllMethodNames(this);
      methods.forEach((key: PropertyKey) => {
        orgImpl[key.toString()] = handleFn(undefined, orgImpl[key.toString()]);
      });
    }
  };
}

function handleFn(d: PropertyDescriptor, method: any) {
  const originalMethod: any = (d && d.value) || method;
  d = d || { value: method }
  return d.value = function (this: any, ...args: any[]) {
    this.name = method.name;
    let error: Error = new Error();
    const result = _applyGraph.call(this, originalMethod, args, error);
    return result;
  };
}

export function setTraceId(requestId: string) {
  _graphs._setRequestId(requestId);
}

function _applyGraph(this: any, originalMethod: any, args: any[], error: Error) {
  let stack = getStackMethod(error);
  const current = stack[0];
  const previous = stack[1];
  const requestId = _graphs._getRequestId();
  const startTime = new Date();
  if (requestId) {
    const nodesById = _graphs.graphs[requestId] || [];
    const newNode = new GraphNode(previous.className, previous.method, current.className, current.method, args && Object.keys(args).length ? JSON.stringify(args) : "", startTime.getTime(), NodeType.Request);
    nodesById.push(newNode);
    _graphs.graphs[requestId] = nodesById;
  }
  try {
    const result = originalMethod.call(this, ...args);
    if (requestId) {
      handleResponse(result, previous.className, previous.method, current.className, current.method, startTime);
    }
    return result;
  } catch (e) {
    if (requestId) {
      handleResponse(e, previous.className, previous.method, current.className, current.method, startTime);
      _getSequence();

    }
    throw e;
  }
}

function handleResponse(result: any, prevClassName: string, prevMethod: string, className: string, method: string, startTime: Date) {
  const nodes = _graphs.graphs[_graphs._getRequestId()] || [];

  if (result instanceof Promise) {
    result.then((res: any) => {
      const newNode = new GraphNode(className, prevMethod, prevClassName, method, res && Object.keys(res).length ? JSON.stringify(res) : "", new Date().getTime() - startTime.getTime(), NodeType.ResponseAsync);
      nodes.push(newNode);
      return res;
    })
  }
  const newNode = new GraphNode(className, prevMethod, prevClassName, method, result && Object.keys(result).length ? JSON.stringify(result) : "", new Date().getTime() - startTime.getTime(), result instanceof Promise ? NodeType.AsyncReturn : NodeType.Response);
  nodes.push(newNode);
  _graphs.graphs[_graphs._getRequestId()] = nodes;
}

function _clear() {
  _graphs._reset();
}

export const getSequence = _getSequence
export const getFlowDiagram = _getFlowDiagram;
export const getSequenceTemplate = _getSequenceTemplate;
export const clear = _clear;


function getStackMethod(error: Error): { className: string, method: string }[] {
  let stack: { className: string, method: string }[] = [{ className: "Root", method: "" }, { className: "Root", method: "" }];
  let i = 0;
  error.stack.split("\n").slice(1, 3).forEach((line) => {
    stack[i++] = processStackLine(line);
  })
  return stack;
}

function processStackLine(line: string) {
  if (line.includes("at ")) {
    if (line.includes("Object.<anonymous>")) {
      return { className: "Root", method: "" }
    }
    const parts = line.split("at ")[1].split(" ");
    if (parts.length > 1) {
      const classMethod = parts[0].split(".");
      let method = classMethod[1]
      if (line.includes("as ")) {
        method = line.replace(/.*\[as (.*?)\].*/, "$1");
      }
      return { className: classMethod[0], method: method }
    }
  }
}

