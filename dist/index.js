"use strict";
// Create a decorator function to apply annotations
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequence_1 = require("./sequence");
const util_1 = require("./util");
const sr = { requestId: (0, util_1.generateRequestId)() };
// Example usage
let MyClass = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _myMethod_decorators;
    let _myMethod2_decorators;
    let _myMethod3_decorators;
    return _a = class MyClass {
            constructor() {
                this.i = (__runInitializers(this, _instanceExtraInitializers), 0);
            }
            myMethod() {
                console.log(" Hello " + this.i++);
                this.myMethod2();
            }
            myMethod2() {
                // Method implementation
                console.log(" to the world " + this.i++);
            }
            myMethod3() {
                // Method implementation
                console.log(" end the world " + this.i++);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _myMethod_decorators = [(0, sequence_1.sequence)(sr)];
            _myMethod2_decorators = [(0, sequence_1.sequence)(sr)];
            _myMethod3_decorators = [(0, sequence_1.sequence)(sr)];
            __esDecorate(_a, null, _myMethod_decorators, { kind: "method", name: "myMethod", static: false, private: false, access: { has: obj => "myMethod" in obj, get: obj => obj.myMethod }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _myMethod2_decorators, { kind: "method", name: "myMethod2", static: false, private: false, access: { has: obj => "myMethod2" in obj, get: obj => obj.myMethod2 }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _myMethod3_decorators, { kind: "method", name: "myMethod3", static: false, private: false, access: { has: obj => "myMethod3" in obj, get: obj => obj.myMethod3 }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
console.log("1.Hello world");
let l1 = new MyClass();
console.log("2.Hello world");
l1.myMethod();
console.log("3.Hello world");
l1.myMethod();
l1.myMethod();
l1.myMethod3();
console.log("4.Hello world");
