import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReleaseInfo, githubApi } from "../../githubApi";
import { QueryParams } from "../../queryParams";

const env = {
  API_KEY: process.env.API_KEY,
};

const getMatchingAsset = (query: QueryParams, release: ReleaseInfo) => {
  const { arch, platform } = query;
  const { assets } = release;

  if (platform === "darwin") {
    const updateAssets = assets.filter(
      ({ name }) =>
        name.endsWith(".zip") && name.toLocaleLowerCase().includes("darwin")
    );

    return (
      updateAssets.find(({ name }) =>
        name.toLocaleLowerCase().includes(arch)
      ) ?? updateAssets[0]
    );
  }

  return null;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const query = request.query as QueryParams;
  const apiKey = request.headers["x-api-key"] ?? query.api_key;

  if (apiKey !== env.API_KEY) {
    response.status(401).end();
    return;
  }

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
