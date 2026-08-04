import communicationApi from "./communicationApi";

export interface AttachmentResponse {
  id: string;
  school_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  bucket_name: string;
  public_url: string;
  uploaded_at: string;
  content_id: string | null;
  is_inline: boolean;
  inline_position: number;
}

export const communicationService = {
  /**
   * Upload attachment for direct messages
   * @param schoolId - School ID
   * @param file - File to upload
   * @returns Promise with attachment information
   */
  uploadDirectMessageAttachment: async (
    schoolId: string | number,
    file: File
  ): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await communicationApi.post(
      `/v1/schools/${schoolId}/direct-messages/attachments/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Upload general attachment
   * @param schoolId - School ID
   * @param file - File to upload
   * @param persist - Whether to persist the attachment (default: true)
   * @returns Promise with attachment information
   */
  uploadAttachment: async (
    schoolId: string | number,
    file: File,
  ): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await communicationApi.post(
      `/v1/schools/${schoolId}/attachments?persist=false`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};