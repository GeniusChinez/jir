import { z } from "zod";

export const mimeTypeSchema = z
  .string()
  .regex(/^[a-zA-Z0-9!#$&'*+.^_`|~-]+\/[a-zA-Z0-9!#$&'*+.^_`|~-]+$/, {
    message: "Invalid MIME type format",
  });

export const textMimeTypeSchema = z
  .string()
  .regex(/^text\/[a-zA-Z0-9!#$&'*+.^_`|~-]+$/, {
    message: "Invalid text MIME type",
  });

export const imageMimeTypeSchema = z
  .string()
  .regex(/^image\/(jpeg|png|gif|bmp|svg\+xml|webp|avif|tiff)$/, {
    message: "Invalid image MIME type",
  });

export const audioMimeTypeSchema = z
  .string()
  .regex(/^audio\/(mpeg|ogg|wav|webm|flac|aac|midi)$/, {
    message: "Invalid audio MIME type",
  });

export const videoMimeTypeSchema = z
  .string()
  .regex(/^video\/(mp4|webm|ogg|x-matroska|quicktime)$/, {
    message: "Invalid video MIME type",
  });

export const fontMimeTypeSchema = z
  .string()
  .regex(/^font\/(woff|woff2|otf|ttf)$/, {
    message: "Invalid font MIME type",
  });

export const applicationMimeTypeSchema = z
  .string()
  .regex(
    /^application\/(json|xml|pdf|zip|javascript|octet-stream|msword|vnd.ms-excel|vnd.ms-powerpoint)$/,
    {
      message: "Invalid application MIME type",
    },
  );

export const multipartMimeTypeSchema = z
  .string()
  .regex(/^multipart\/(form-data|mixed|alternative|related)$/, {
    message: "Invalid multipart MIME type",
  });

export const documentMimeTypeSchema = z
  .string()
  .regex(/^application\/(rtf|msword|vnd.ms-excel|vnd.ms-powerpoint)$/, {
    message: "Invalid document MIME type",
  });

export const webMimeTypeSchema = z
  .string()
  .regex(
    /^application\/(xhtml\+xml|javascript|json|xml|vnd.ms-excel|pdf|zip)$/,
    {
      message: "Invalid web MIME type",
    },
  );

// Human-readable enum for full MIME types
export enum MimeType {
  TextPlain = "text/plain",
  TextHtml = "text/html",
  TextCss = "text/css",
  TextCsv = "text/csv",
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageGif = "image/gif",
  ImageSvgXml = "image/svg+xml",
  AudioMpeg = "audio/mpeg",
  AudioOgg = "audio/ogg",
  AudioWav = "audio/wav",
  VideoMp4 = "video/mp4",
  VideoWebm = "video/webm",
  VideoOgg = "video/ogg",
  FontWoff = "font/woff",
  FontWoff2 = "font/woff2",
  FontOtf = "font/otf",
  ApplicationJson = "application/json",
  ApplicationXml = "application/xml",
  ApplicationPdf = "application/pdf",
  ApplicationZip = "application/zip",
  ApplicationJavascript = "application/javascript",
  MultipartFormData = "multipart/form-data",
  MultipartMixed = "multipart/mixed",
  MultipartAlternative = "multipart/alternative",
  ApplicationRtf = "application/rtf",
  ApplicationMsWord = "application/msword",
  ApplicationXhtmlXml = "application/xhtml+xml",
  ApplicationVndMsExcel = "application/vnd.ms-excel",
  ApplicationVndMsPowerpoint = "application/vnd.ms-powerpoint",
  General = "general", // A fallback for general MIME types
}

// Mapping MIME type enums to their schemas
export const mimeTypeSchemas = {
  [MimeType.TextPlain]: textMimeTypeSchema,
  [MimeType.TextHtml]: textMimeTypeSchema,
  [MimeType.TextCss]: textMimeTypeSchema,
  [MimeType.TextCsv]: textMimeTypeSchema,
  [MimeType.ImageJpeg]: imageMimeTypeSchema,
  [MimeType.ImagePng]: imageMimeTypeSchema,
  [MimeType.ImageGif]: imageMimeTypeSchema,
  [MimeType.ImageSvgXml]: imageMimeTypeSchema,
  [MimeType.AudioMpeg]: audioMimeTypeSchema,
  [MimeType.AudioOgg]: audioMimeTypeSchema,
  [MimeType.AudioWav]: audioMimeTypeSchema,
  [MimeType.VideoMp4]: videoMimeTypeSchema,
  [MimeType.VideoWebm]: videoMimeTypeSchema,
  [MimeType.VideoOgg]: videoMimeTypeSchema,
  [MimeType.FontWoff]: fontMimeTypeSchema,
  [MimeType.FontWoff2]: fontMimeTypeSchema,
  [MimeType.FontOtf]: fontMimeTypeSchema,
  [MimeType.ApplicationJson]: applicationMimeTypeSchema,
  [MimeType.ApplicationXml]: applicationMimeTypeSchema,
  [MimeType.ApplicationPdf]: applicationMimeTypeSchema,
  [MimeType.ApplicationZip]: applicationMimeTypeSchema,
  [MimeType.ApplicationJavascript]: applicationMimeTypeSchema,
  [MimeType.MultipartFormData]: multipartMimeTypeSchema,
  [MimeType.MultipartMixed]: multipartMimeTypeSchema,
  [MimeType.MultipartAlternative]: multipartMimeTypeSchema,
  [MimeType.ApplicationRtf]: documentMimeTypeSchema,
  [MimeType.ApplicationMsWord]: documentMimeTypeSchema,
  [MimeType.ApplicationXhtmlXml]: webMimeTypeSchema,
  [MimeType.ApplicationVndMsExcel]: applicationMimeTypeSchema,
  [MimeType.ApplicationVndMsPowerpoint]: applicationMimeTypeSchema,
  [MimeType.General]: mimeTypeSchema,
};
