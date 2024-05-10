export function generateRequestId() {
  return ("R" + new Date().toISOString() + "" + Math.random().toString().substring(0, 3)).replace(/[-:.TZ/]/g, "");
}
