import process from "node:process";

export async function activeWindow(options) {
  if (process.platform === "darwin") {
    const { activeWindow } = await import("./lib/macos.js");
    return activeWindow(options);
  }

  if (process.platform === "linux") {
    const { activeWindow } = await import("./lib/linux.js");
    return activeWindow(options);
  }

  if (process.platform === "win32") {
    const { activeWindow } = await import("./lib/windows.js");
    return activeWindow(options);
  }

  throw new Error("macOS, Linux, and Windows only");
}

console.log(await activeWindow());
