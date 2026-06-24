/// <reference types="astro/client" />

type PortalNotifyOptions = {
  variant?: "info" | "success" | "warning" | "error";
  timeout?: number;
  title?: string;
};

type PortalNotifyFn = (
  message: string,
  options?: PortalNotifyOptions,
) => () => void;

declare global {
  interface Window {
    portalNotify: PortalNotifyFn;
  }
}

export {};