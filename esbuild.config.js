const path = require("path");

const define = {}

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k])
};


require("esbuild")
  .build({
    entryPoints: ["application-esbuild.js"],
    bundle: true,
    outdir: path.join(process.cwd(), "app/assets/builds"),
    absWorkingDir: path.join(process.cwd(), "app/javascript"),
    loader: { ".js": "jsx", ".png": "dataurl", ".svg": "dataurl"},
    watch: true,
    // custom plugins will be inserted is this array
    plugins: [],
    define
  })
  .catch(() => process.exit(1));
