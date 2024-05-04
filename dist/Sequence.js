"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequence = exports.sequence = void 0;
const model_1 = require("./model");
function sequence(request) {
    return function (originalMethod, _context) {
        let simple = "";
        console.log("sequence");
        function replacementMethod(...args) {
            const start = new model_1.GraphNode("Caller", "", args.length ? JSON.stringify(args) : "", undefined, []);
            model_1._graphs.graphs[request.requestId] = start;
            const result = applyGraph.call(this, originalMethod, args);
            return result;
        }
        return replacementMethod;
    };
}
exports.sequence = sequence;
function applyGraph(originalMethod, args) {
    // get the original method's class name
    const className = this.constructor.name;
    let oldNode = model_1._graphs.graphs[this.className + originalMethod.name];
    if (!oldNode) {
        oldNode = new model_1.GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
    }
    else {
        const newNode = new model_1.GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
        model_1._graphs.graphs[newNode.actor + newNode.name] = newNode;
        oldNode.children.push(newNode);
    }
    const result = originalMethod.call(this, ...args);
    return result;
}
//   function to loop through the graph and construct the sequence in mermaid format
function getSequence(request) {
    const node = model_1._graphs.graphs[request.requestId];
    return getSequenceFromNode(node);
}
exports.getSequence = getSequence;
function getSequenceFromNode(node) {
    var _a;
    let sequence = "";
    if (node.parent) {
        sequence = `${sequence}\n${(_a = node.parent) === null || _a === void 0 ? void 0 : _a.actor} ->> ${node.actor}:${node.name}`;
    }
    let children = {};
    for (let i = 0; i < node.children.length; i++) {
        let seq = getSequenceFromNode(node.children[i]);
        children[seq] = 1;
    }
    for (let key in children) {
        sequence = `${sequence}${key}`;
    }
    return sequence;
}
