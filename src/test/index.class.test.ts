
// Create a decorator function to apply annotations

import { _graphs, umlConfig } from "../model";
import { getFlowDiagram, getSequence, getSequenceTemplate, setTraceId, uml } from "../uml-decorator";
import { myFunction } from "./util.test";

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@uml()
export class MyClass<T> {
  i = 0;

  constructor(s: string) {
    console.log(s.length);
  }

  public async myMethod(simple: MyClass<T> = new MyClass<T>("")) {

    console.log(" Hello " + this.i++);
    const ref = this.myMethod3();
    if (true) console.log(" Hello " + this.i++);
    if (true) {
      console.log(" Hello " + this.i++);
    }
    await ref.then(async () => {
      for (let i = 0; i < 2; i++) {

        await this.myMethod5();
      }
    });
  }

  public static myMethod2 = () => {

    // Method implementation
    MyClass2.myMethod4();
    console.log(" to the world 2");
  }


  public async myMethod3() {
    // Method implementation
    console.log(" end the world 3");
  }
  private async myMethod5() {
    // Method implementation
    console.log(" end the world 5");
    this.myMethod3();
    //   throw new Error("Error");
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
setTraceId("P12");
console.log("1.Hello world");
let l1 = new MyClass<MyClass<number>>("d");
console.log("2.Hello world");
MyClass.myMethod2();
myFunction(

).then(() => {
  console.log("5.Hello world");
  let s = l1.myMethod();


  s.then(() => {
    console.log("6.Hello world");
    console.log("----" + getSequence() + "----");
    console.log("4.Hello world");
    console.log("----" + getFlowDiagram() + "----");
    console.log("----" + getSequenceTemplate() + "----");
  });

});
