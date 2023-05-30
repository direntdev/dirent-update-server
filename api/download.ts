import { Octokit, App } from "octokit";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

const getDownloadUrl = async (assetId, response) => {
  const result = await octokit.request(
    "GET /repos/direntdev/dirent-app/releases/assets/{asset_id}",
    {
      owner: "OWNER",
      repo: "REPO",
      asset_id: assetId,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/octet-stream",
      },
    }
  );
  return result.url;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const url = await getDownloadUrl(92447553, response);

  response.status(200).json({
    body: url,
  });
}
