import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "blogPost",
  resourceLabel: "blog",
  contentType: "blog-post",
});

export { GET, POST, PATCH, DELETE };
