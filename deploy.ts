import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import * as process from "node:process";

async function uploadDir(
  client: ftp.Client,
  localDir: fs.PathLike,
  remoteDir: string,
) {
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const localPath = path.join(localDir.toString(), file);
    const remotePath = path.posix.join(remoteDir, file);
    const stats = fs.statSync(localPath);

    if (stats.isDirectory()) {
      await client.ensureDir(remotePath);
      await uploadDir(client, localPath, remotePath);
    } else {
      if (file.endsWith(".map")) {
        console.log(`Skipping source map: ${remotePath}`);
        continue;
      }
      console.log(`Uploading: ${remotePath}`);

      await client.uploadFrom(localPath, remotePath);
    }
  }
}

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // optional logs

  const config = {
    host: process.env.FTP_SERVER,
    user: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    secure: false, // set true for FTPS
  };

  const localDir = "./dist"; // your built folder
  const remoteDir = "/public_html"; // 🔁 remote path (varies by host)

  console.log("Connecting to FTP...");
  await client.access(config);
  console.log("Connected.");

  // Optional: clean the remote directory first
  // await client.clearWorkingDir()

  console.log(`Uploading ${localDir} → ${remoteDir}`);
  await client.ensureDir(remoteDir);
  // await client.clearWorkingDir(); // optional: wipe old files
  await uploadDir(client, localDir, remoteDir);

  console.log("✅ Deploy complete!");
}

deploy()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
