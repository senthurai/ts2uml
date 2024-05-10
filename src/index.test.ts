// Create a decorator function to apply annotations

import { _graphs } from "./model";
import { getSequence, sequence, setSequenceId } from "./sequence";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Example usage
class MyClass {
  i = 0;
  @sequence()
  public myMethod() {
    console.log(" Hello " + this.i++);
    this.myMethod2();
  }
  @sequence()
  public myMethod2() {
    // Method implementation
    new MyClass2().myMethod4();
    console.log(" to the world " + this.i++);
  }

  @sequence()
  public myMethod3() {
    // Method implementation
    this.myMethod();
    console.log(" end the world " + this.i++);
  }
}
class MyClass2 {
  @sequence()
  public myMethod4() {
    // Method implementation
  }
}

setSequenceId("R12");

console.log("1.Hello world");
let l1: MyClass = new MyClass();
console.log("2.Hello world");

l1.myMethod();
console.log("3.Hello world");
l1.myMethod();
l1.myMethod();
l1.myMethod3();
console.log("----" + getSequence() + "----");
console.log("----" + _graphs.graphs);
console.log("4.Hello world");
