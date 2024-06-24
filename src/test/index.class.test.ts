
// Create a decorator function to apply annotations

import { _graphs } from "../model";
import { getFlowDiagram, getSequence, getSequenceTemplate, setTraceId, uml } from "../uml-decorator";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@uml()
export class MyClass {
   i = 0;

  constructor(s: string) {
    console.log(s.length);
  }

  public  async myMethod() {
    console.log(" Hello " + this.i++);
    
  }

  public static  myMethod2() {
    // Method implementation
    MyClass2.myMethod4();
    console.log(" to the world 2"  );
  }


  public static  myMethod3() {
    // Method implementation
     console.log(" end the world 3" );
  }
}

@uml()
class MyClass2 {

  public static myMethod4() {
    // Method implementation
  }
}
setTraceId("R12");
console.log("1.Hello world");
let l1: MyClass = new MyClass("d");
console.log("2.Hello world");

l1.myMethod();
console.log("3.Hello world");
l1.myMethod();
l1.myMethod();
MyClass.myMethod3();
console.log("----" + getSequence() + "----"); 
console.log("4.Hello world");
console.log("----" + getFlowDiagram() + "----"); 
console.log("----" + getSequenceTemplate() + "----");
