import type {DetailedHTMLProps, HTMLAttributes} from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: `s-${string}`]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        [key: string]: unknown;
      };
    }
  }

  interface Window {
    shopify?: {
      toast?: {
        show(message: string, options?: {isError?: boolean; duration?: number}): void;
      };
    };
  }
}

export {};
