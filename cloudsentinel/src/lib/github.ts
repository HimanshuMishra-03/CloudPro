import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface RepoMetadata {
  owner: string;
  name: string;
  appId: string;
  defaultBranch: string;
  lastCommitSha: string;
  stack: "nodejs" | "python" | "go" | "other";
}

export async function validateAndParseRepo(repoUrl: string): Promise<RepoMetadata> {
  const isMock = process.env.MOCK_MODE === "true";
  
  // Regex to extract owner and repo name
  const match = repoUrl.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)$/);
  if (!match) {
    throw new Error("INVALID_REPO_URL");
  }

  const owner = match[1];
  const repo = match[2];

  if (isMock) {
    console.warn(`[GitHub Mock] Simulating metadata for: ${owner}/${repo}`);
    return {
      owner,
      name: repo,
      appId: `${owner}/${repo}`,
      defaultBranch: "main",
      lastCommitSha: "mock-sha-" + Math.random().toString(36).substring(7),
      stack: "nodejs", // Default for mock
    };
  }

  try {
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    if (!repository) {
      throw new Error("REPO_NOT_FOUND");
    }

    // Detect stack by looking at files
    const { data: files } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "",
    });

    let stack: "nodejs" | "python" | "go" | "other" = "other";
    if (Array.isArray(files)) {
      const filenames = files.map((f) => f.name);
      if (filenames.includes("package.json")) stack = "nodejs";
      else if (filenames.includes("go.mod")) stack = "go";
      else if (filenames.includes("requirements.txt") || filenames.includes("main.py")) stack = "python";
    }

    // Get latest commit SHA
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });

    return {
      owner,
      name: repo,
      appId: `${owner}/${repo}`,
      defaultBranch: repository.default_branch,
      lastCommitSha: commits[0]?.sha || "unknown",
      stack,
    };
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error("REPO_NOT_FOUND");
    }
    throw error;
  }
}
