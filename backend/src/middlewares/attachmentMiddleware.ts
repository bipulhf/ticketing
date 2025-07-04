import { Request, Response, NextFunction } from "express";
import {
  ATTACHMENT_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../utils/constants";

export interface AttachmentData {
  name: string;
  url: string;
  fileType?: string;
}

export const validateAttachments = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const attachments = req.body.attachments;

  if (!attachments) {
    return next();
  }

  // Ensure attachments is an array
  const attachmentArray = Array.isArray(attachments)
    ? attachments
    : [attachments];

  // Check maximum number of attachments
  if (attachmentArray.length > ATTACHMENT_CONFIG.MAX_ATTACHMENTS_PER_TICKET) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: `Maximum ${ATTACHMENT_CONFIG.MAX_ATTACHMENTS_PER_TICKET} attachments allowed per ticket`,
      },
    });
  }

  // Validate each attachment
  for (const attachment of attachmentArray) {
    if (!attachment.name || !attachment.url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: "Each attachment must have a name and URL",
        },
      });
    }

    // Validate attachment name length
    if (attachment.name.length > ATTACHMENT_CONFIG.MAX_NAME_LENGTH) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: `Attachment name must be less than ${ATTACHMENT_CONFIG.MAX_NAME_LENGTH} characters`,
        },
      });
    }

    // Validate URL length
    if (attachment.url.length > ATTACHMENT_CONFIG.MAX_URL_LENGTH) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: `Attachment URL must be less than ${ATTACHMENT_CONFIG.MAX_URL_LENGTH} characters`,
        },
      });
    }

    // Validate URL format
    if (!isValidUrl(attachment.url)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.INVALID_URL,
        },
      });
    }

    // Validate file type if provided
    if (
      attachment.fileType &&
      !ATTACHMENT_CONFIG.ALLOWED_FILE_TYPES.includes(
        attachment.fileType.toLowerCase()
      )
    ) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.INVALID_ATTACHMENT_TYPE,
        },
      });
    }
  }

  next();
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const extractFileTypeFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const extension = pathname.split(".").pop()?.toLowerCase();

    if (
      extension &&
      ATTACHMENT_CONFIG.ALLOWED_FILE_TYPES.includes(extension as any)
    ) {
      return extension;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const sanitizeAttachmentData = (
  attachments: any[]
): AttachmentData[] => {
  return attachments.map((attachment) => ({
    name: attachment.name?.trim() || "Untitled",
    url: attachment.url?.trim() || "",
    fileType:
      attachment.fileType?.toLowerCase() ||
      extractFileTypeFromUrl(attachment.url),
  }));
};
