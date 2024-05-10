"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = void 0;
function generateRequestId() {
    return ("R" + new Date().toISOString() + "" + Math.random().toString().substring(0, 3)).replace(/[-:.TZ/]/g, "");
}
exports.generateRequestId = generateRequestId;
