// Create a decorator function to apply annotations

import { _graphs } from "./model";
import { getSequence, uml, setSequenceId } from "./uml";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 
// Example usage
class MyClass {
  i = 0;
  @uml(this)
  public   myMethod(x:{sim:string}) :number {
    // sleep for 1 second 
    console.log(" Hello " + this.i++);
  return   this.myMethod2();
  }

  constructor() {
  }
  @uml(this)
  public myMethod2() :number{
    // Method implementation
    new MyClass2().myMethod4();
    console.log(" to the world " + this.i++);
    return 2;
  }

  @uml(this)
  public   myMethod3() {
    // Method implementation
     this.myMethod({sim:"sim1"});
    console.log(" end the world " + this.i++);
  }
}

class MyClass2 {
  @uml(this)
  public myMethod4() {
    // Method implementation
  }
}

for (let i = 0; i < 2; i++) {
  setSequenceId(this, "R12" + i);
  console.log("1.Hello world");
  let l1: MyClass = new MyClass();
  console.log("2.Hello world");

  l1.myMethod({sim:"sim1"});
  console.log("3.Hello world");
  l1.myMethod({sim:"sim2"});
  l1.myMethod({sim:"sim3"});
  l1.myMethod3();
  l1.myMethod({sim:"sim4"});
  l1.myMethod3();
  console.log("----" + getSequence() + "----");

  console.log("----" + _graphs.graphs);
  console.log("4.Hello world");
}

console.log("----" + getSequence() + "----");