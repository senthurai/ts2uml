
import { uml } from 'ts2uml';
import { getFlowDiagram, getSequence, getSequenceTemplate, setTraceId, uml } from "../uml-decorator";
 
setTraceId("S12");
@uml()
export 
@uml()
 class MyClassSimple{
    public async myMethod3() {  
        console.log("3.Hello fn World");
    }
}

const simple = new MyClassSimple();

simple.myMethod3().then(() => {
    simple.myMethod3().then(() => {
    console.log("----" + getSequence() + "----");
    console.log("4.Hello world");
    console.log("----" + getFlowDiagram() + "----");
    console.log("----" + getSequenceTemplate() + "----");
    });
});
