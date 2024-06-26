
import { _getSequence, _getSequenceTemplate } from './sequence-diagram';
import { GraphNode, NodeType, _graphs } from "./model";
import { _getFlowDiagram } from "./flow-diagram";
import { readdirSync } from 'fs';
import fs from 'fs';
import { StackHandler } from './StackHandler';
const defaultFn = ["constructor", "length", "name", "prototype", "__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "toLocaleString"]
/**
 * This decorator function modifies the original method to apply a graph sequence.
 * The replacement method creates a new GraphNode if one does not already exist for the requestId,
 * applies the graph sequence, and handles any errors that occur during the execution of the original method.
 *
 * @returns {Function} - A function that replaces the original method.
 */

const stackHandler = new StackHandler();

export function uml(): Function {

  return function (classMethod: any, caller: any, d: PropertyDescriptor) {
    if ((caller && caller?.kind === "class") || (classMethod?.prototype && classMethod?.prototype?.constructor?.name === classMethod?.name)) {
      return handleClass(d, classMethod);
    } else {
      return handleFn(d, classMethod);
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
function isStaticMethod(_class: any, methodName: string | Symbol) {
  return typeof methodName === 'string' && typeof _class[methodName] === 'function';
}

function handleClass(d: PropertyDescriptor, _class: any) {
  const classes = new Set();
  let keys = Reflect.ownKeys(_class).filter(f => typeof f === 'string')
  keys.filter(f => !defaultFn.includes(f.toString() + "") && isStaticMethod(_class, f)).forEach((k) => classes[k] = _class[k]);


  const simpeTest = createClass(_class);
  Object.keys(classes).forEach((key: PropertyKey) => {
    simpeTest[key.toString()] = handleFn(undefined, simpeTest[key.toString()]);
    _graphs.staticMethods[key.toString()] = _class.name;
  });
  return simpeTest;
}
function createClass(_class) {
  const umlAlias = {}
  eval(` umlAlias.${_class.name} = class extends _class {
    constructor(...args) {
      super(...args);
      this.name = _class.name;
      const orgImpl = this;
      const methods = getAllMethodNames(this);
      methods.forEach((key) => {
        orgImpl[key.toString()] = handleFn(undefined, orgImpl[key.toString()]);
      });
    }
  }`)
  return umlAlias[_class.name];
}


function handleFn(d: PropertyDescriptor, method: any) {
  const originalMethod: any = (d && d.value) || method;
  d = d || { value: method }
  d.value = overrideFn(originalMethod);

  return d.value;
}

function overrideFn(originalMethod: any) {
  return function (this, ...args) {
    let error = new Error();
    const result = _applyGraph.call(this, originalMethod, args, error);
    return result;
  }
}
export function setTraceId(requestId: string) {
  _graphs._setRequestId(requestId);
}

function _applyGraph(this: any, originalMethod: any, args: any[], error: Error) {

  const requestId = _graphs._getRequestId();
  let startTime, previous = { className: "Root", method: "" }, current = { className: "Root", method: "" };
  if (requestId) {
    let stack = stackHandler.getStackMethod(error);
    const current = stack[0];
    const previous = stack[1] || { className: "Root", method: "", filePath: "" };
    startTime = new Date();
    const nodesById = _graphs.graphs[requestId] || [];
    const newNode = new GraphNode(previous.className, previous.method, current.className, current.method, args && Object.keys(args).length ? JSON.stringify(args) : "", startTime.getTime(), NodeType.Request);
    _graphs.remoteUrl[newNode.source] = previous.filePath;
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





