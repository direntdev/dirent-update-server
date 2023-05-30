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
        name: asset.name,
        url: asset.browser_download_url,
      }));
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
  const redirect = "manual";
  const headers = { Accept: "application/octet-stream" };
  const options = { headers, redirect };
  // const rawUrl = `https://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@github.com/direntdev/dirent-app/releases/download/v0.0.3/dirent-0.0.3-full.nupkg`;
  // const finalUrl = rawUrl.replace(
  //   "https://api.github.com/",
  //   `https://${env.GITHUB_TOKEN}@api.github.com/`
  // );

  // console.log("finalUrl", rawUrl);

  // fetch(rawUrl, options as any).then((assetRes: any) => {
  //   response.setHeader("Location", assetRes.headers.get("Location"));
  //   response.send(302);
  // });

  response.status(200).json({
    body: tag,
  });
}
