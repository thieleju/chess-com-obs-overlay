import fs from "node:fs"
import path from "node:path"
import esbuild from "esbuild"
import { minify } from "html-minifier-terser"

/**
 * Build the JS bundle using esbuild.
 * @returns {Promise<string>} The bundled JS code.
 */
async function buildBundle() {
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

/**
 * Build the final HTML file with the bundled JS code.
 */
async function buildHTML() {
  const templatePath = path.resolve("src/index.html")
  let htmlContent = fs.readFileSync(templatePath, "utf8")

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
  fs.writeFileSync(path.join(distDir, "wld.html"), htmlContent, "utf8")

  console.log("✅ Built dist/wld.html")
}

buildHTML().catch((error) => {
  console.error("Build error:", error)
  process.exit(1)
})
