// Create a decorator function to apply annotations

import { SequenceRequest, _graphs } from "./model";
import { getSequence, sequence } from "./sequence";
import { generateRequestId } from "./util";
const sr: SequenceRequest = { requestId: generateRequestId() };
// Example usage
class MyClass {
  i = 0;
  @sequence(sr)
  public myMethod() {
    console.log(" Hello " + this.i++);
    this.myMethod2();
  }
  @sequence(sr)
  public myMethod2() {
    // Method implementation
    new MyClass2().myMethod4();
    console.log(" to the world " + this.i++);
  }

  @sequence(sr)
  public myMethod3() {
    // Method implementation
    this.myMethod();
    console.log(" end the world " + this.i++);
  }
}
class MyClass2 {
  @sequence(sr)
  public myMethod4() {
    // Method implementation
 
  }
}
console.log("1.Hello world");
let l1: MyClass = new MyClass();
console.log("2.Hello world");

l1.myMethod();
console.log("3.Hello world");
l1.myMethod();
l1.myMethod();
l1.myMethod3();
console.log("----" + getSequence(sr) + "----");
console.log("----" + _graphs.graphs);
console.log("4.Hello world");
