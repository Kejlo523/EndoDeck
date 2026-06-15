const { app, BrowserWindow } = require("electron");
const { writeFile } = require("node:fs/promises");
const { join } = require("node:path");

app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 940, height: 680, show: false, backgroundColor: "#0a0d0b" });
  await window.loadFile(join(__dirname, "..", "desktop", "wizard.html"));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const image = await window.webContents.capturePage();
  await writeFile(join(__dirname, "..", "dist", "EndoDeck-wizard-preview.png"), image.toPNG());
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
