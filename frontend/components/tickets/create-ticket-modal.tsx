"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createTicketWithFiles } from "@/actions/tickets.action";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  X,
  File,
  Image,
  FileText,
  HardDrive,
  Wifi,
  Monitor,
} from "lucide-react";
import { useUploadThing } from "@/lib/utils";

// Form validation schema
const createTicketSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  ip_address: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(val);
    }, "Please enter a valid IP address"),
  device_name: z
    .string()
    .max(100, "Device name must not exceed 100 characters")
    .optional(),
  ip_number: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(val);
    }, "Please enter a valid IP address"),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("ticketAttachment", {
    onClientUploadComplete: (res) => {
      if (res) {
        const newFiles = res.map((file) => ({
          name: file.name,
          url: file.ufsUrl,
          size: file.size,
          type: file.type,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        toast.success(`${res.length} file(s) uploaded successfully`);
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const form = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      description: "",
      ip_address: "",
      device_name: "",
      ip_number: "",
    },
  });

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      await startUpload(files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onSubmit = async (data: CreateTicketForm) => {
    setIsSubmitting(true);

    try {
      const result = await createTicketWithFiles({
        description: data.description,
        ip_address: data.ip_address || undefined,
        device_name: data.device_name || undefined,
        ip_number: data.ip_number || undefined,
        uploadedFiles,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket created successfully");
        form.reset();
        setUploadedFiles([]);
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setUploadedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Create Support Ticket
          </DialogTitle>
          <DialogDescription>
            Describe your issue in detail and include any relevant device
            information. You can also attach files to help us understand the
            problem better.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Problem Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail. Include what you were trying to do, what happened, and any error messages you received..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much detail as possible to help us resolve your
                    issue quickly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-medium">
                <Monitor className="h-4 w-4" />
                Device Information (Optional)
              </div>
              <p className="text-sm text-muted-foreground">
                This information helps our IT team provide better support.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="device_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Monitor className="h-3 w-3" />
                        Device Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., LAPTOP-ABC123, John-Desktop"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wifi className="h-3 w-3" />
                        IP Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ip_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Wifi className="h-3 w-3" />
                      Alternative IP Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 10.0.0.15 (if different from above)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-medium">
                <Upload className="h-4 w-4" />
                Attachments (Optional)
              </div>
              <p className="text-sm text-muted-foreground">
                Upload screenshots, error logs, or other relevant files. Max
                16MB per file, up to 10 files.
              </p>

              {/* File Upload Area */}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload files</p>
                    <p className="text-xs text-muted-foreground">
                      Click to select files or drag and drop
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleFileSelect(files);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />

                {isUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading files...</span>
                  </div>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
