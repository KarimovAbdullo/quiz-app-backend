/**
 * Quick check: list admin routes from the router stack.
 * Run: node scripts/checkAdminRoutes.js
 */
const adminRouter = require("../src/routes/admin");

const routes = [];
adminRouter.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).filter((m) => layer.route.methods[m]);
    const path = layer.route.path;
    routes.push({ method: methods.join(",").toUpperCase(), path });
  }
});

console.log("Admin routes:");
routes.forEach((r) => console.log(`  ${r.method} /admin${r.path}`));

const hasCashConfig = routes.some((r) => r.path === "/cash-config");
console.log(hasCashConfig ? "\n✅ /admin/cash-config is defined." : "\n❌ /admin/cash-config NOT found.");
