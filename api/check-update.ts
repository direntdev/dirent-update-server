import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit, App } from "octokit";

type QueryParams = {
  arch: string;
  platform: string;
  current_version: string;
};

type ReleaseInfo = {
  version: string;
  description: string;
  publishedAt: string;
  assets: {
    id: number;
    name: string;
  }[];
};

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_OWNER: process.env.GITHUB_OWNER,
  GITHUB_REPO: process.env.GITHUB_REPO,
  API_KEY: process.env.API_KEY,
};

const githubApi = {
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

const getMatchingAsset = (query: QueryParams, release: ReleaseInfo) => {
  const { arch, platform } = query;
  const { assets } = release;

  const updateAssets = assets.filter(
    ({ name }) => name.endsWith(".zip") || name.endsWith(".nupkg")
  );

  const matchingPlatform = updateAssets.filter(({ name }) =>
    name.toLocaleLowerCase().includes(platform)
  );
  const matchingArch = matchingPlatform.find(({ name }) =>
    name.toLocaleLowerCase().includes(arch)
  );

  return matchingArch ? matchingArch : matchingPlatform[0];
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const apiKey = request.headers["x-api-key"];

  if (apiKey !== env.API_KEY) {
    response.status(401).end();
    return;
  }

  const query = request.query as QueryParams;
  const release = await githubApi.getLatestRelease();

  if (!release || release.version === `v${query.current_version}`) {
    response.status(204).end();
    return;
  }

  const asset = getMatchingAsset(query, release);

  if (!asset) {
    response.status(204).end();
    return;
  }

  const downloadUrl = await githubApi.getAssetDownloadUrl(asset.id);

  response.status(200).json({
    url: downloadUrl,
    name: release.version,
    notes: release.description,
    pub_date: release.publishedAt,
  });
}
