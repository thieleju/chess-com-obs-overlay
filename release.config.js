/* eslint-disable no-template-curly-in-string */

import conventionalAnalyzer from "@semantic-release/commit-analyzer/lib/analyze-commits"

export default {
  branches: ["main"],
  // Override the analyzeCommits function to only perform a release calculation if the last commit in the list contains the marker "#release".
  analyzeCommits: async (commits, context) => {
    const lastCommit = commits.at(-1)
    if (!lastCommit) {
      context.logger.log("No commits found. No release will be created.")
      return null
    }
    if (!lastCommit.message.includes("#release")) {
      context.logger.log(
        "The trigger commit does not contain '#release'. No release will be created."
      )
      return null
    }
    // Falls der letzte Commit "#release" enthält, werden alle Commits zur Analyse herangezogen.
    return conventionalAnalyzer(commits, context)
  },
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [{ path: "dist/wld.html", label: "WLD HTML File" }]
      }
    ]
  ]
}
