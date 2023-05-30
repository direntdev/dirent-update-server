import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";
import axios from "axios";
import fs from "fs";
const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

//method to download github release asset

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  axios({
    method: "get",
    url: "https://github.com/direntdev/dirent-app/releases/download/v0.0.5/RELEASES",
    // responseType: "stream",
    headers: {
      Authorization: `bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/octet-stream",
    },
  }).then(function (res) {
    res.data.pipe(response, { end: true });
    // res.data.pipe(fs.createWriteStream("ada_lovelace.jpg"));
  });

  // const connector = https.get(
  //   "https://github.com/direntdev/dirent-app/releases/download/v0.0.5/RELEASES",
  //   {
  //     headers: {
  //       Authorization: `bearer ${env.GITHUB_TOKEN}`,
  //       Accept: "application/octet-stream",
  //     },
  //   },
  //   (res) => {
  //     console.log("downloaded2", res.headers["content-type"], res.statusCode);
  //     response.setHeader("content-type", res.headers["content-type"]!);
  //     response.statusCode = res.statusCode ?? 200;
  //     return res.pipe(response, { end: true });
  //   }
  // );

  // request.pipe(connector, { end: true });
}
