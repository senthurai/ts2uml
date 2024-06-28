

export enum NodeType {
  Request = "Request",
  Response = "Response",
  ResponseAsync = "ResponseAsync",
  AsyncReturn = "AsyncReturn"
}

export class GraphNode {
  readonly source: string;
  readonly method: string;
  readonly reciever: string;
  readonly srcMethod: string;
  constructor(source: string, srcMethod: string, reciever: string, method: string, public readonly args: string, public timestamp: number, public type: NodeType) {
    this.source = abbreviate(source);
    this.method = abbreviate(method);
    this.srcMethod = abbreviate(srcMethod);
    this.reciever = abbreviate(reciever);
  }
}
function abbreviate(name: string) {
  const newName = name.replace(/[_$]/g, "");
  if (!newName || _graphs.dedups[newName]) return _graphs.dedups[newName]
  let i = 1;
  let a = newName.replace(/.*?([A-Z])[a-z_]*/g, "$1");
  while (_graphs.dedups.includes(a)) {
    a = newName.replace(/.*?([A-Z])[a-z_]*/g, "$1") + i++;
  }
  _graphs.dedups.push(a);
  _graphs.dedups[newName] = a;
  _graphs.dedups[a] = newName;
  _graphs.dedups.push(newName);
  return a
}
export function fntoReadable(params: string) {
  return params && params.replace(/([A-Z])/g, " $1").replace(/^./, function (str) { return str.toUpperCase(); }).trim();
}
export function expand(short: string): string {
  return _graphs.dedups[short] || short;
}
class UmlConfig {
  remoteBaseUrl: string = "";
  enableLink: boolean = true;

}
class SequenceGraph {
  dedups: string[] = []
  requestId: string = "";
  staticMethods: {} = {};
  remoteUrl: {} = {};
  _getRequestId() {
    return this.requestId;
  }
  _setRequestId(requestId: any) {
    this.requestId = requestId;
  }
  //reset
  _reset() {
    this.graphs = {};
    this.classStack = [];
    this.requestId = "";
    this.dedups = [];
  }

  graphs: { [key: string]: GraphNode[] } = {};
  classStack: { className: string, method: string }[] = [];
}


export const _graphs: SequenceGraph = new SequenceGraph();
export const umlConfig: UmlConfig = new UmlConfig();