import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "faq",
  resourceLabel: "faq",
  contentType: "faq",
});

export { GET, POST, PATCH, DELETE };
