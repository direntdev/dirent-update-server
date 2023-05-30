import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit, App } from "octokit";
const fetch = require("node-fetch");

const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

const githubApi = {
  getLatestReleaseTag: async () => {
    try {
      const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
      const result = await octokit.request(
        "GET /repos/direntdev/dirent-app/releases{?per_page,page}",
        {
          owner: "OWNER",
          repo: "REPO",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      const links = result.data[0].assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        url: asset.browser_download_url,
      }));
      console.log("links", links);

      return result.data[0].tag_name;
    } catch (error) {
      console.log("error", error);
    }
  },
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const tag = await githubApi.getLatestReleaseTag();
  response.status(200).json({
    body: tag,
  });
}
