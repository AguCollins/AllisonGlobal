import { db } from "@/lib/db";

/**
 * Audit log helper — records admin actions for security and compliance.
 *
 * NEVER log: passwords, session tokens, API secrets, or full sensitive lead data.
 * Only log: action type, resource type, resource ID, admin user ID, IP, and
 * non-sensitive metadata (e.g. which field changed).
 */

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "ARCHIVE"
  | "ROLE_CHANGE"
  | "STATUS_CHANGE";

export async function recordAudit(params: {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ? (JSON.parse(JSON.stringify(params.metadata)) as unknown as string) : undefined,
        ip: params.ip ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record:", params.action, err instanceof Error ? err.message : "unknown");
  }
}
