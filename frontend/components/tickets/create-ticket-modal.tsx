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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building,
  MapPin,
} from "lucide-react";
import { useUploadThing } from "@/lib/utils";
import {
  ITDepartment,
  Location,
  UserDepartment,
  IT_DEPARTMENTS,
  USER_DEPARTMENTS,
  LOCATIONS,
} from "@/types/types";

// Form validation schema
const createTicketSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  ip_address: z
    .string()
    .min(1, "IP address is required")
    .refine((val) => {
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(val);
    }, "Please enter a valid IPv4 address"),
  device_name: z
    .string()
    .min(1, "Device name is required")
    .max(100, "Device name must not exceed 100 characters"),
  ip_number: z
    .string()
    .min(1, "IP number is required")
    .refine((val) => {
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(val);
    }, "Please enter a valid IPv4 address"),
  department: z.enum(["it_operations", "it_qcs"], {
    required_error: "Department is required",
  }),
  location: z.enum(["tongi", "salna", "mirpur", "mawna", "rupganj"], {
    required_error: "Location is required",
  }),
  user_department: z
    .enum([
      "qa",
      "qc",
      "production",
      "microbiology",
      "hse",
      "engineering",
      "marketing",
      "accounts",
      "validation",
      "ppic",
      "warehouse",
      "development",
    ])
    .optional(),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: string;
  userDepartment?: ITDepartment;
  userLocation?: Location;
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
  userRole,
  userDepartment,
  userLocation,
}: CreateTicketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("ticketAttachment", {
    onClientUploadComplete: (res) => {
      if (res) {
        const newFiles = res.map((file) => ({
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setIsUploading(false);
        toast.success("Files uploaded successfully!");
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const form = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      description: "",
      ip_address: "",
      device_name: "",
      ip_number: "",
      department: userDepartment || "it_operations",
      location: userLocation || "tongi",
      user_department: undefined,
    },
  });

  const handleFileSelect = async (files: File[]) => {
    setIsUploading(true);
    await startUpload(files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
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
        ip_address: data.ip_address,
        device_name: data.device_name,
        ip_number: data.ip_number,
        department: data.department,
        location: data.location,
        user_department: data.user_department,
        uploadedFiles,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket created successfully!");
        form.reset();
        setUploadedFiles([]);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create ticket");
      console.error("Error creating ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setUploadedFiles([]);
      onClose();
    }
  };

  // Determine which fields to show based on user role
  const showUserDepartment = userRole === "user";
  const isITPerson = userRole === "it_person";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new support ticket
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="device_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Device Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PC-001, Laptop-Admin"
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
                      <Wifi className="h-4 w-4" />
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

            {/* IP Number */}
            <FormField
              control={form.control}
              name="ip_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    IP Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 192.168.1.100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="it_operations">
                          IT Operations
                        </SelectItem>
                        <SelectItem value="it_qcs">IT QCS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isITPerson
                        ? "Your assigned department"
                        : "Select the appropriate department"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LOCATIONS).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {value.charAt(0).toUpperCase() +
                              value.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {userLocation
                        ? "Your assigned location"
                        : "Select the location"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* User Department (for normal users only) */}
            {showUserDepartment && (
              <FormField
                control={form.control}
                name="user_department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Your Department
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(USER_DEPARTMENTS).map(
                          ([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {key.charAt(0).toUpperCase() +
                                key.slice(1).toLowerCase()}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your department for display and filtering purposes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* File Upload */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Attachments</label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleFileSelect(files);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload Files"}
                  </label>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Uploaded Files</label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm font-medium">
                            {file.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
