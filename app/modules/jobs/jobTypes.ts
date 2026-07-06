import type {AdminGraphqlClient} from "../shopify/adminClient.server";

export type AdminClientFactory = (shopDomain: string) => Promise<AdminGraphqlClient>;

export type RunDueRulesOptions = {
  getAdminForShop: AdminClientFactory;
  now?: Date;
};
