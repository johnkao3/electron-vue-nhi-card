import { app, BrowserWindow, nativeTheme, ipcMain } from "electron";
import path from "path";
import os from "os";
import smartcard from "smartcard";
import iconv from "iconv-lite";
//var Buffer = require("buffer/").Buffer;

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(
      path.join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) {}

let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  ipcMain.on("getCard", (_event, value) => {
    console.log(value);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;

const devices = new Devices();

devices.on("device-activated", (event) => {
  const currentDevices = event.devices;
  let device = event.device;
  console.log(`Device ${device} activated, devices: ${currentDevices}`);
  for (let prop in currentDevices) {
    console.log(`Devices: ${currentDevices[prop]}`);
    // io.emit("hello", `Devices: ${currentDevices[prop]}`);
  }
  device.on("card-inserted", (event) => {
    let { card } = event;
    console.log(event.card);
    mainWindow.webContents.send("insertCard", true);
    const application = new Iso7816Application(card);
    const CommandApdu = smartcard.CommandApdu;
    application
      .issueCommand(
        new CommandApdu({
          bytes: [
            0x00, 0xa4, 0x04, 0x00, 0x10, 0xd1, 0x58, 0x00, 0x00, 0x01, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x00,
          ],
        })
      )
      .then((response) => {
        console.log(response.toString());
      });
    application
      .issueCommand(Buffer.from([0x00, 0xca, 0x11, 0x00, 0x02, 0x00, 0x00]))
      .then((response) => {
        console.log(response);
        console.log(response.toString());
        const s1 = response.toString().substr(0, 24);
        const s2 = response.toString().substr(24, 40);
        const name = iconv
          .decode(Buffer.from(s2, "hex"), "big5")
          .trim()
          .replace(/(^　*)|(　*$)/g, "")
          .replace(/\u0000/g, "")
          .replace(/\\u0000/g, "");
        mainWindow.webContents.send("getCard", name);
        // ipcMain.handle("devices", () => {
        //   return iconv
        //     .decode(Buffer.from(s2, "hex"), "big5")
        //     .trim()
        //     .replace(/(^　*)|(　*$)/g, "");
        // });
        // ipcMain.on("nhi-card-send", (event, arg) => {
        //   if (arg === "ok") {
        //     event.reply("nhi-card-reply", "Hi");
        //   }
        // });
      });
  });
  device.on("card-removed", (event) => {
    console.log(`Card removed from ${event.name}`);
  });
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
