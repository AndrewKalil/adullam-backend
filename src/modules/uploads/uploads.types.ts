export interface SignUploadRequest {
  fileName: string;
  contentType: string;
}

export interface SignUploadResponse {
  signedUrl: string;
  path: string;
  token: string;
  publicUrl: string;
}
