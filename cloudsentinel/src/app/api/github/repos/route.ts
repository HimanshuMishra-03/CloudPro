import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(req: NextRequest) {
  const isMock = process.env.MOCK_MODE === "true";
  
  if (isMock) {
    // Return high-fidelity mock repositories
    const mockRepos = [
      {
        name: "next-app-template",
        full_name: "user/next-app-template",
        html_url: "https://github.com/user/next-app-template",
        description: "A premium Next.js starter kit with zero-trust defaults.",
        language: "TypeScript",
        private: false,
      },
      {
        name: "go-microservice",
        full_name: "org/go-microservice",
        html_url: "https://github.com/org/go-microservice",
        description: "High-performance microservice with SPIFFE integration.",
        language: "Go",
        private: true,
      },
      {
        name: "python-data-api",
        full_name: "user/python-data-api",
        html_url: "https://github.com/user/python-data-api",
        description: "Data processing API secured with Vault KEKs.",
        language: "Python",
        private: false,
      }
    ];
    return NextResponse.json(mockRepos);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token missing. Enable MOCK_MODE=true in .env to skip." },
      { status: 401 }
    );
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
    });

    const mappedRepos = repos.map((r: any) => ({
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description,
      language: r.language,
      private: r.private,
    }));

    return NextResponse.json(mappedRepos);
  } catch (error: any) {
    console.error("[GitHub API] Failed to fetch repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories", detail: error.message },
      { status: 500 }
    );
  }
}
