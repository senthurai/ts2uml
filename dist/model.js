"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._graphs = exports.SequenceGraph = exports.GraphNode = void 0;
class GraphNode {
    constructor(actor, name, value, parent, children = []) {
        this.actor = actor;
        this.name = name;
        this.value = value;
        this.parent = parent;
        this.children = children;
    }
}
exports.GraphNode = GraphNode;
class SequenceGraph {
    constructor() {
        this.graphs = {};
    }
}
exports.SequenceGraph = SequenceGraph;
exports._graphs = new SequenceGraph();
