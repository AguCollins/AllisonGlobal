import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "blogPost",
  resourceLabel: "blog",
  publicPaths: ["/blog", "/"],
});

export { GET, POST, PATCH, DELETE };
