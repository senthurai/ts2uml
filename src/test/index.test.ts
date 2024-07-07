// Create a decorator function to apply annotations  
import { getFlowDiagram, getSequence, getSequenceTemplate, setTraceId, uml } from "../uml-decorator";
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//

@uml()
class MyClass {
  i = 0;
  public async myMethod(x: { sim: string }) {
    // sleep for 1 second 
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(" Hello " + this.i++);
  }
  constructor() {
  }
  public myMethod2(): number {
    // Method implementation
    new MyClass2(this).myMethod4();
    console.log(" to the world " + this.i++);
    return 2;
  }
  public myMethod3() {
    // Method implementation
    this.myMethod({ sim: "sim1" });
    this.myMethod({ sim: "sim1" });
    this.myMethod({ sim: "sim1" });
    console.log(" end the world " + this.i++);
  }
}

@uml()
class MyClass2 {
  constructor(private c1: MyClass) {
  }
  public myMethod4() {
    this.c1.myMethod({ sim: "sim1" });
    this.c1.myMethod({ sim: "sim1" });
    this.c1.myMethod({ sim: "sim1" });
  }
}
const l: Promise<any>[] = []
setTraceId("R12");
[1].forEach(async (x) => {
  console.log("1.Hello world");
  let l1: MyClass = new MyClass();
  console.log("2.Hello world");
  l1.myMethod({ sim: "sim1" });
  console.log("3.Hello world");
  l1.myMethod2();
  l1.myMethod({ sim: "sim3" });
  l1.myMethod2();
  l.push(l1.myMethod({ sim: "sim4" }));
  l1.myMethod2();
  console.log("4.Hello world");
});
Promise.all(l).then(() => {
  console.log("----" + getFlowDiagram() + "----");
  console.log("----" + getSequence() + "----");
  console.log("----" + getSequenceTemplate() + "----");
});
