import "@shopify/shopify-app-react-router/adapters/node";
import {
  AppDistribution,
  ApiVersion,
  LogSeverity,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import {PrismaSessionStorage} from "@shopify/shopify-app-session-storage-prisma";

import prisma from "./db.server";

const apiVersion = ApiVersion.October25;

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  apiVersion,
  appUrl: process.env.SHOPIFY_APP_URL ?? "",
  scopes: (process.env.SCOPES ?? "read_products,write_products,read_orders").split(","),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  logger: {
    level:
      process.env.NODE_ENV === "development"
        ? LogSeverity.Debug
        : LogSeverity.Info,
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? {customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN]}
    : {}),
});

export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export {apiVersion};
