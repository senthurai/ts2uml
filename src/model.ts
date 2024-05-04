// Define an annotation interface
export interface SequenceRequest {
  requestId: string;
}

export class GraphNode {
  constructor(public actor: string, public name: string, public value: String, public parent: GraphNode | undefined, public children: GraphNode[] = []) {}
}

export class SequenceGraph {
  graphs: { [key: string]: GraphNode } = {};
}

export const _graphs: SequenceGraph = new SequenceGraph();
