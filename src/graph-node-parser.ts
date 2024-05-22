import { GraphNode, _graphs } from "./model";

/**
 * This function generates a sequence diagram.
 * It takes a SequenceRequest as a parameter, which contains the requestId.
 * The function finds the GraphNode associated with the requestId and traverses up the graph to the root node.
 * It then traverse and generates the sequence diagram .
 *
 * @returns {string} - A string representing the sequence diagram.
 */
export function _getSequence(): string {
  let node: GraphNode | undefined;
  let dedups = []
  return (

    Object.keys(_graphs.graphs)
      .map((key) => {
        node = _graphs.graphs[key];
        while (node.parent) {
          _graphs.graphs[key] = node.parent;
          node = node.parent;
        }
        let seq = getSequenceFromNode(node, dedups);
        delete _graphs.graphs[key]
        return "sequenceDiagram\n" + seq;

      })
      .join("\n")
  );
}
function abbreviate(actor: string, dedups: string[]) {
  if (dedups[actor]) return dedups[actor]
  let i = 1;
  let a = actor.replace(/([A-Z])[a-z]*/g, "$1");
  while (dedups.includes(a)) {
    a = actor.replace(/([A-Z])[a-z]*/g, "$1") + i++;
  }
  dedups.push(a);
  dedups[actor] = a;
  dedups.push(actor);
  return a
}
function fntoReadable(params:string) {
  return params.replace(/([A-Z])/g, " $1").replace(/^./, function (str) { return str.toUpperCase(); })
  
}

function getSequenceFromNode(node: GraphNode, dedups = []) {
  let sequence = "";
  if (node.parent) {
    !dedups.includes(node.parent.actor) && (sequence += `participant ${abbreviate(node.parent.actor, dedups)} as ${fntoReadable(node.parent.actor)} \n`)
    !dedups.includes(node.actor) && (sequence += `participant ${abbreviate(node.actor, dedups)} as ${fntoReadable(node.actor)} \n`)
    const actorSrc = abbreviate(node.parent.actor, dedups);
    const actorDest = abbreviate(node.actor, dedups);
    sequence += `${actorSrc} ->>+ ${actorDest}: ${fntoReadable(node.type)}`;
    dedups.includes(node.timestamp) || (sequence += `\nNote left of ${actorSrc}:${node.timestamp}`) && dedups.push(node.timestamp);
    node.method && (sequence += `\nNote over ${actorSrc},${actorDest}:`+ node.method)

  }
  for (let i = 0; i < node.children.length; i++) {
    let seq = getSequenceFromNode(node.children[i], dedups);
    sequence = `${sequence}\n${seq}`;
  }
  if (node.parent) {
    const actorSrc = dedups[node.parent.actor] || abbreviate(node.parent.actor, dedups);
    const actorDest = dedups[node.actor] || abbreviate(node.actor, dedups);
    sequence += `\n${actorDest} -->>- ${actorSrc}:${node.response || 'return'}`;
  }
  return sequence;
}

