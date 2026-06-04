export type UploadResponse = {
  file_id: string;
  filename: string;
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  column_count: number;
};

export type CleanResponse = {
  file_id: string;
  preview: {
    columns: string[];
    rows: Record<string, unknown>[];
    row_count: number;
    column_count: number;
  };
  column_types: Record<string, string>;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Upload failed");
  }
  return response.json() as Promise<UploadResponse>;
}

export async function detectChannels(fileId: string, platform: string) {
  return request<{ channels: string[] }>("/detect-channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId, platform }),
  });
}

export async function cleanData(fileId: string, platform: string, selectedChannels: string[]) {
  return request<CleanResponse>("/clean", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_id: fileId,
      platform,
      selected_channels: selectedChannels,
    }),
  });
}

export async function listTemplates(platform: string) {
  const query = new URLSearchParams({ platform }).toString();
  return request<{ templates: Record<string, { columns: any[] }> }>(`/templates?${query}`);
}

export async function saveTemplate(name: string, columns: any[]) {
  return request<{ status: string; name: string }>("/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, columns }),
  });
}

export async function downloadReport(fileId: string, templateName: string, format: "csv" | "xlsx") {
  const response = await fetch(`${API_BASE}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_id: fileId,
      template_name: templateName,
      format,
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Download failed");
  }
  const blob = await response.blob();
  return blob;
}
