
// Create a decorator function to apply annotations

import { _graphs, umlConfig } from "../model";
import { getFlowDiagram, getSequence, getSequenceTemplate, setTraceId, uml } from "../uml-decorator";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@uml()
export class MyClass {
  i = 0;

  constructor(s: string) {
    console.log(s.length);
  }

  public async myMethod() {
    console.log(" Hello " + this.i++);
    const ref = this.myMethod3();
    ref.then(() => {
      this.myMethod5();
    });

  }

  public static myMethod2() {
    // Method implementation
    MyClass2.myMethod4();
    console.log(" to the world 2");
  }


  public async myMethod3() {
    // Method implementation
    console.log(" end the world 3");
  }
  public async myMethod5() {
    // Method implementation
    console.log(" end the world 5");
  }
}

@uml()
class MyClass2 {

  public static myMethod4() {
    // Method implementation
    console.log(" to the world 4");
  }
}
umlConfig.remoteBaseUrl = "https://github.com/senthurai/ts2uml/blob/master/src"
setTraceId("R12");
console.log("1.Hello world");
let l1 = new MyClass("d");
console.log("2.Hello world");

l1.myMethod().then(() => {
  console.log("3.Hello world");
  l1.myMethod().then(() => {
    console.log("5.Hello world");
    let s=l1.myMethod();
    
    
    s.then(() => {
      console.log("6.Hello world");
      console.log("----" + getSequence() + "----");
      console.log("4.Hello world");
      console.log("----" + getFlowDiagram() + "----");
      console.log("----" + getSequenceTemplate() + "----");
    });

  });
});
