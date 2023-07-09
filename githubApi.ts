import { Octokit, App } from "octokit";

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_OWNER: process.env.GITHUB_OWNER,
  GITHUB_REPO: process.env.GITHUB_REPO,
  API_KEY: process.env.API_KEY,
};

export type ReleaseInfo = {
  version: string;
  description: string;
  publishedAt: string;
  assets: {
    id: number;
    name: string;
  }[];
};

export const githubApi = {
  getAssetDownloadUrl: async (assetId: number) => {
    const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
    const result = await octokit.request(
      "GET /repos/:owner/:repo/releases/assets/{asset_id}",
      {
        owner: env.GITHUB_OWNER,
        repo: env.GITHUB_REPO,
        asset_id: assetId,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/octet-stream",
        },
      }
    );
    return result.url;
  },
  getLatestRelease: async () => {
    try {
      const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
      const result = await octokit.request(
        "GET /repos/:owner/:repo/releases{?per_page,page}",
        {
          owner: env.GITHUB_OWNER,
          repo: env.GITHUB_REPO,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const release = result.data[0];
      const description = release.body;
      const publishedAt = release.published_at;
      const version = release.tag_name;
      const assets = release.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        url: asset.browser_download_url,
      }));

      return {
        assets,
        version,
        description,
        publishedAt,
      } as ReleaseInfo;
    } catch (error) {
      console.log("error", error);
    }
  },
};

