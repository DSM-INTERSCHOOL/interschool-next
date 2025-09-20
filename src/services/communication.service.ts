import communicationApi from "./communicationApi";

interface AttachmentResponse {
  school_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  bucket_name: string;
  public_url: string;
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
   * @returns Promise with attachment information
   */
  uploadAttachment: async (
    schoolId: string | number,
    file: File
  ): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await communicationApi.post(
      `/v1/schools/${schoolId}/attachments`,
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