/* eslint-disable no-template-curly-in-string */

export default {
  branches: ["main"],
  analyzeCommits: async (context) => {
    const commits = context.commits
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

    return context.analyzeCommits()
  },
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular" // Nutzt das Angular-Commit-Format als Standard
      }
    ],
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
