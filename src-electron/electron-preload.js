/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
import { contextBridge, ipcRenderer } from "electron";
// import smartcard from "smartcard";

// const Devices = smartcard.Devices;

// const devices = new Devices();

// devices.on("device-activated", (event) => {
//   const currentDevices = event.devices;
//   let device = event.device;
//   console.log(currentDevices, device);
// });

contextBridge.exposeInMainWorld("myAPI", {
  doAThing: () => {
    console.log("do...");
  },
  insertCard: (callback) => ipcRenderer.on("insertCard", callback),
  getCard: (callback) => ipcRenderer.on("getCard", callback),
});
