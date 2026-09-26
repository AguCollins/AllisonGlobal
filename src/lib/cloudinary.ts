/**
 * Cloudinary configuration — server-side only.
 *
 * SECURITY: This module reads API secrets from environment variables and
 * MUST NEVER be imported in a client component. The browser receives
 * signed upload params from the API route, never the raw API secret.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME     — your Cloudinary cloud name
 *   CLOUDINARY_API_KEY        — your Cloudinary API key
 *   CLOUDINARY_API_SECRET     — your Cloudinary API secret (server-only)
 *
 * Optional (for unsigned uploads via upload preset):
 *   CLOUDINARY_UPLOAD_PRESET  — an unsigned upload preset configured in Cloudinary
 */

import { createHash } from "crypto";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  };
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

/**
 * Build a Cloudinary delivery URL with transformations.
 *
 * @param publicId - The Cloudinary public_id of the asset
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "limit";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
    gravity?: "auto" | "face" | "center";
  } = {},
): string {
  const config = getCloudinaryConfig();
  if (!config) {
    // Fallback: return as-is (manual URL mode)
    return publicId;
  }

  const {
    width,
    height,
    crop = "limit",
    quality = "auto",
    format = "auto",
    gravity = "auto",
  } = options;

  const transformations: string[] = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  if (width || height) transformations.push(`g_${gravity}`);

  const transformStr = transformations.join(",");
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformStr}/${publicId}`;
}

/**
 * Generate a Cloudinary signature for unsigned uploads.
 * The browser uploads directly to Cloudinary using this signature.
 */
export function generateUploadSignature(): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadPreset?: string;
} | null {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.floor(Date.now() / 1000);

  // For unsigned uploads, we use an upload preset (no signature needed)
  // For signed uploads, we sign the params with the API secret
  if (config.uploadPreset) {
    return {
      signature: "",
      timestamp,
      apiKey: config.apiKey,
      cloudName: config.cloudName,
      uploadPreset: config.uploadPreset,
    };
  }

  // Signed upload (more secure — requires API secret server-side)
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramsToSign + config.apiSecret)
    .digest("hex");

  return {
    signature,
    timestamp,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
  };
}

/**
 * Delete a Cloudinary asset by public_id.
 * Server-side only — uses the API secret.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  const config = getCloudinaryConfig();
  if (!config) return false;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramsToSign + config.apiSecret)
      .digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", config.apiKey);
    formData.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload`,
      {
        method: "DELETE",
        body: formData,
      },
    );

    return res.ok;
  } catch {
    return false;
  }
}
