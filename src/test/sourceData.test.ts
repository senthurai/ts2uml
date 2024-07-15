import { Clazz, Method, SourceData } from "../model"

const sourceData: { [key: string]: SourceData } = {};
const s1 = new SourceData();
const clazz1 = new Clazz();
const m1 = new Method();
m1.start = 5;
m1.end = 20;
const m2 = new Method();
m2.start = 21;
m2.end = 40;
clazz1.methods["m1"] = m1;
clazz1.methods["m2"] = m2;
clazz1.start = 1;
clazz1.end = 50;
sourceData["file1"] = s1;
s1.classes["c1"] = clazz1;
s1.start = 1;
s1.end = 50;
const clazz2 = new Clazz();
const m3 = new Method();
m3.start = 51;
m3.end = 70;
const m4 = new Method();
m4.start = 71;
m4.end = 80;
clazz2.methods["m3"] = m3;
clazz2.methods["m4"] = m4;
clazz2.start = 51;
clazz2.end = 85;
s1.classes["c2"] = clazz2;
const s2 = new SourceData();
const clazz3 = new Clazz();
const m5 = new Method();
m5.start = 5;
m5.end = 20;
const m6 = new Method();
m6.start = 21;
m6.end = 40;
clazz3.methods["m5"] = m5;
clazz3.methods["m6"] = m6;
clazz3.start = 1;
clazz3.end = 50;
s2.classes["c3"] = clazz3;
s2.start = 1;
s2.end = 50;
sourceData["file2"] = s2;

let data=sourceData["file1"].findClass(2);
console.log(data);





