export {};

declare global {
  interface Window {
    bridge: {
      platform: NodeJS.Platform;
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
    };
  }
}
