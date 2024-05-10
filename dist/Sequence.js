"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequence = exports.sequence = void 0;
const model_1 = require("./model");
function sequence(request) {
    return function (originalMethod, _context) {
        console.log("sequence");
        function replacementMethod(...args) {
            let node = model_1._graphs.graphs[request.requestId];
            if (!node) {
                node = new model_1.GraphNode(request.requestId, "", args.length ? JSON.stringify(args) : "", undefined, []);
                model_1._graphs.graphs[request.requestId] = node;
            }
            try {
                const result = applyGraph.call(this, originalMethod, args, node, request.requestId);
                return result;
            }
            catch (e) {
                console.log("Error in method " + originalMethod.name);
                throw e;
            }
        }
        return replacementMethod;
    };
}
exports.sequence = sequence;
function applyGraph(originalMethod, args, oldNode, requestId) {
    // get the original method's class name
    const className = this.constructor.name;
    const newNode = new model_1.GraphNode(className, originalMethod.name, args.length ? JSON.stringify(args) : "", oldNode);
    oldNode.children.push(newNode);
    model_1._graphs.graphs[requestId] = newNode;
    const result = originalMethod.call(this, ...args);
    model_1._graphs.graphs[requestId] = oldNode;
    return result;
}
//   function to loop through the graph and construct the sequence in mermaid format
function getSequence(request) {
    let node = model_1._graphs.graphs[request.requestId];
    while (node.parent) {
        model_1._graphs.graphs[request.requestId] = node.parent;
        node = node.parent;
    }
    let seq = "sequenceDiagram\n" + getSequenceFromNode(node);
    return seq;
}
exports.getSequence = getSequence;
function getSequenceFromNode(node) {
    var _a;
    let sequence = "";
    if (node.parent) {
        sequence = `${(_a = node.parent) === null || _a === void 0 ? void 0 : _a.actor} ->> ${node.actor}:${node.name}`;
    }
    for (let i = 0; i < node.children.length; i++) {
        let seq = getSequenceFromNode(node.children[i]);
        sequence = `${sequence}\n${seq}`;
    }
    return sequence;
}
// Function to write a generate sequence diagram
