import { Octokit, App } from "octokit";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

const streamAsset = async (assetId, res) => {
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
  const downloadUrl = result.url;

  https
    .get(downloadUrl, (response) => {
      response.pipe(res);
    })
    .on("error", (err) => {
      console.error("Error downloading file:", err);
    });
};

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  streamAsset(92447553, response);
}
