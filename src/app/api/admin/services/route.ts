import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "service",
  resourceLabel: "service",
  publicPaths: ["/services", "/"],
});

export { GET, POST, PATCH, DELETE };
