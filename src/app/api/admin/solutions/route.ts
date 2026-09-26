import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "solution",
  resourceLabel: "solution",
  contentType: "solution",
});

export { GET, POST, PATCH, DELETE };
