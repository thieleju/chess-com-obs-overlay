import fs from "fs"
import path from "path"
import esbuild from "esbuild"
import { minify } from "html-minifier-terser"

async function buildBundle() {
  // Bundle JS, but exclude external dependencies like Luxon
  const result = await esbuild.build({
    entryPoints: ["src/js/app.js"],
    bundle: true,
    format: "iife", // Immediately Invoked Function Expression (for browser)
    target: "es2015",
    minify: false, // Set to true for minified JS if desired
    write: false, // Do not write to disk automatically
    external: ["luxon"] // Exclude luxon from the bundle
  })
  return result.outputFiles[0].text
}

async function buildHTML() {
  const templatePath = path.resolve("src/index.html")
  let htmlContent = fs.readFileSync(templatePath, "utf-8")

  // Build the bundled JS code
  const bundledJS = await buildBundle()
  // Replace the placeholder in the HTML with the bundled code, inline.
  const scriptTag = `<script>\n${bundledJS}\n</script>`
  htmlContent = htmlContent.replace("<!-- SCRIPT_PLACEHOLDER -->", scriptTag)

  // If the --minify flag is passed, minify the final HTML
  if (process.argv.includes("--minify")) {
    htmlContent = await minify(htmlContent, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true
    })
    console.log("HTML minification applied.")
  }

  // Output to the dist folder
  const distDir = path.resolve("dist")
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir)
  fs.writeFileSync(path.join(distDir, "wld.html"), htmlContent, "utf-8")
  console.log("✅ Built dist/wld.html")
}

buildHTML().catch((err) => {
  console.error("Build error:", err)
  process.exit(1)
})
