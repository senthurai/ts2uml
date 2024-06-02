import { _graphs } from './model';
import { getSequence } from './uml-decorator';


const result = getSequence();
_graphs.graphs = {
    'simple':
    //GraphNode example in json
    {
        actor: 'actor',
        type: 'type',
        method: 'method',
        response: 'response',
        timestamp: 5494,
        parent: undefined,
        children: [
            {
                actor: 'actor1',
                type: 'type1',
                method: 'method1',
                response: 'response1',
                timestamp: 54943,
                parent: { actor: 'actor', type: 'type', method: 'method', response: 'response', timestamp: 5494, parent: undefined, children: [] },
                children: []
            }
        ]
    }

};
const expectedResult = ``;
console.log(result); 
