const shell = require("shelljs");
const fs = require("fs");
const axios = require("axios");

// setup api & constants
require("dotenv").config();

const API_CONFIG = {
  key: process.env.HEROKU_API_KEY,
  app: process.env.HEROKU_APP_ID,
};

const heroku = axios.create({
  baseURL: "https://api.heroku.com",
  headers: {
    Accept: "application/vnd.heroku+json; version=3",
    Authorization: `Bearer ${API_CONFIG.key}`,
  },
});

const TAR_FILENAME = "botb.tgz";

// tar build output
function createTar() {
  shell.echo("Creating Tar ...");
  return new Promise((resolve) => {
    shell.exec(`tar czfv ${TAR_FILENAME} ./lib`, () => {
      resolve();
    });
  });
}

// create slug
async function createBuild() {
  return new Promise(async (resolve, reject) => {
    // create the source
    shell.echo("Creating Source ...");
    const sourceResponse = await heroku.post(`/apps/${API_CONFIG.app}/sources`);

    const { get_url, put_url } = sourceResponse.data.source_blob;

    // upload the file to the slug
    shell.echo("Uploading Tar File ...");
    const file = fs.readFileSync(TAR_FILENAME);
    const fileResponse = await axios.put(put_url, file, {
      headers: {
        "Content-Type": "",
      },
    });

    // build from source
    shell.echo("Build ...");
    const buildResponse = await heroku.post(
      `/apps/${API_CONFIG.app}/builds`,
      {
        buildpacks: [
          {
            url: "https://github.com/heroku/heroku-buildpack-nodejs#latest",
            name: "heroku/nodejs",
          },
        ],
        source_blob: {
          url: get_url,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // we are done :)
    resolve();
  });
}

async function cleanUp() {
  await shell.rm(TAR_FILENAME);
}

// main loop
async function main() {
  await createTar();
  await createBuild();
  await cleanUp();
}

main();
