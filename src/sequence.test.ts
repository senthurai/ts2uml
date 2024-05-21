import { _graphs } from './model';
import { getSequence } from './uml';


const result = getSequence();
_graphs.graphs = {
    'simple':
    //GraphNode example in json
    {
        actor: 'actor',
        type: 'type',
        method: 'method',
        response: 'response',
        timestamp: 'timestamp',
        parent: undefined,
        children: [
            {
                actor: 'actor1',
                type: 'type1',
                method: 'method1',
                response: 'response1',
                timestamp: 'timestamp1',
                parent: { actor: 'actor', type: 'type', method: 'method', response: 'response', timestamp: 'timestamp', parent: undefined, children: [] },
                children: []
            }
        ]
    }

};
const expectedResult = ``;
console.log(result);
expect(result).toEqual(expectedResult);
