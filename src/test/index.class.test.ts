 

import { uml } from 'ts2uml';
// Create a decorator function to apply annotations

import { _graphs } from "../model";
import { getSequence, setSequenceId } from "../uml";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@uml()
export class MyClass {
  i = 0;

  constructor(s: string) {
    console.log(s.length);
  }

  public async myMethod() {
    console.log(" Hello " + this.i++);
    this.myMethod2();
  }

  public myMethod2() {
    // Method implementation
    new MyClass2().myMethod4();
    console.log(" to the world " + this.i++);
  }


  public myMethod3() {
    // Method implementation
    this.myMethod();
    console.log(" end the world " + this.i++);
  }
}

@uml()
class MyClass2 {

  public myMethod4() {
    // Method implementation
  }
}
setSequenceId("R12");
console.log("1.Hello world");
let l1: MyClass = new MyClass("d");
console.log("2.Hello world");

l1.myMethod();
console.log("3.Hello world");
l1.myMethod();
l1.myMethod();
l1.myMethod3();
console.log("----" + getSequence() + "----");
console.log("----" + _graphs.graphs);
console.log("4.Hello world");
