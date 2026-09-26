/**
 * Cloudinary upload API — provides signed upload parameters to the browser.
 *
 * GET  /api/admin/cloudinary/sign  → { cloudName, apiKey, timestamp, signature, uploadPreset? }
 *
 * The browser uses these params to upload directly to Cloudinary's API,
 * so the image never passes through our server. The API secret stays
 * server-side.
 *
 * SECURITY:
 * - requireAdmin() — only authenticated admins can get upload signatures
 * - The signature is time-limited (1 hour) and tied to the timestamp
 * - The API secret is NEVER sent to the browser
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCloudinaryConfig, generateUploadSignature } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      {
        error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
        configured: false,
      },
      { status: 501 },
    );
  }

  const signData = generateUploadSignature();
  if (!signData) {
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    configured: true,
    cloudName: signData.cloudName,
    apiKey: signData.apiKey,
    timestamp: signData.timestamp,
    signature: signData.signature,
    uploadPreset: signData.uploadPreset,
    uploadUrl: `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
  });
}
