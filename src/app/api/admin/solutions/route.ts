import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "solution",
  resourceLabel: "solution",
  publicPaths: ["/solutions", "/"],
});

export { GET, POST, PATCH, DELETE };
