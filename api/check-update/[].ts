import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReleaseInfo, githubApi } from "../../githubApi";
import { QueryParams } from "../../queryParams";

const env = {
  API_KEY: process.env.API_KEY,
};

const getMatchingAsset = (assetName: string, release: ReleaseInfo) => {
  const { assets } = release;
  return assets.find(({ name }) => name.includes(assetName));
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const query = request.query as QueryParams;
  const assetName = request.url?.split("=").pop();
  const apiKey = request.headers["x-api-key"] ?? query.api_key;

  if (!assetName || (assetName === "RELEASES" && apiKey !== env.API_KEY)) {
    response.status(401).end();
    return;
  }

  const release = await githubApi.getLatestRelease();

  if (!release) {
    response.status(404).end();
    return;
  }

  const asset = getMatchingAsset(assetName, release);

  if (!asset) {
    response.status(404).end();
    return;
  }

  const downloadUrl = await githubApi.getAssetDownloadUrl(asset.id);
  response.redirect(downloadUrl);
}
