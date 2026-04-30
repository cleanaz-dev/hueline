import { uploadToS3 } from "@/lib/aws/s3";

type AttachmentResult = {
  s3Key: string;
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
};

export function extractEmail(address: string): string {
  const match = address.match(/<([^>]+)>/);
  return match ? match[1] : address.trim();
}

export async function getZohoAccessToken(): Promise<string> {
  const tokenRes = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    }),
  });

  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("Failed to get Zoho access token");
  return access_token;
}

export async function fetchZohoAttachments(accountId: string, messageId: string, accessToken: string) {
  const res = await fetch(
    `https://mail.zoho.com/api/accounts/${accountId}/messages/${messageId}/attachments`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
  );

  const data = await res.json();
  if (!data.data) throw new Error("Failed to fetch attachments");
  return data.data; // [{ attachmentId, name, mimeType, size }, ...]
}

export async function downloadZohoAttachment(
  accountId: string,
  messageId: string,
  attachmentId: string,
  accessToken: string
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const res = await fetch(
    `https://mail.zoho.com/api/accounts/${accountId}/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Failed to download attachment: ${res.statusText}`);

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = res.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") 
    ?? `attachment-${attachmentId}`;
  const mimeType = res.headers.get("content-type") ?? "application/octet-stream";

  return { buffer, filename, mimeType };
}

export async function handleZohoAttachmentDownloadS3Upload(
  accountId: string,
  messageId: string
): Promise<AttachmentResult[]> {
  const accessToken = await getZohoAccessToken();
  const attachments = await fetchZohoAttachments(accountId, messageId, accessToken);

  const results: AttachmentResult[] = [];

  for (const attachment of attachments) {
    const { buffer, filename, mimeType } = await downloadZohoAttachment(
      accountId,
      messageId,
      attachment.attachmentId,
      accessToken
    );

    const s3Key = `attachments/${accountId}/${messageId}/${filename}`;
    await uploadToS3(buffer, s3Key, mimeType);

    results.push({
      s3Key,
      filename,
      mimeType,
      size: attachment.size,
      attachmentId: attachment.attachmentId,
    });
  }

  return results;
}