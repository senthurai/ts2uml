import { uml } from "./uml";

// Define an annotation interface
export interface SequenceRequest {
  requestId: string;
}

export class GraphNode {
  constructor(public readonly actor: string, public readonly type: string, public readonly method: string, public   response: string,public readonly timestamp:string , public readonly parent: GraphNode | undefined, public children: GraphNode[] = []) { }
}

export class SequenceGraph {
   
  requestId: string = "";
  _getRequestId() {
    return this.requestId;
  }
  _setRequestId(requestId: any) {
    this.requestId = requestId;
  }
  graphs: { [key: string]: GraphNode } = {};
}

export const _graphs: SequenceGraph = new SequenceGraph();