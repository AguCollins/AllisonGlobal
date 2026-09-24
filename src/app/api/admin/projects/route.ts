import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "project",
  resourceLabel: "project",
  publicPaths: ["/projects", "/"],
});

export { GET, POST, PATCH, DELETE };
