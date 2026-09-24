import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "industry",
  resourceLabel: "industry",
  publicPaths: ["/industries", "/"],
});

export { GET, POST, PATCH, DELETE };
