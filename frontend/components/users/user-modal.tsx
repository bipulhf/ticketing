"use client";

import type React from "react";
import { useEffect } from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, UserIcon, Building, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BusinessType, User, UserRole } from "@/types/types";

// Form schema
const userFormSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["system_owner", "super_admin", "admin", "it_person", "user"]),
  isActive: z.boolean(),
  businessType: z
    .enum(["small_business", "medium_business", "large_business"])
    .optional(),
  accountLimit: z.number().min(0).optional(),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// Helper functions
const formatRole = (role: UserRole): string => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatBusinessType = (type: BusinessType): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// User Info Modal Component
function UserInfoModal({
  user,
  trigger,
  open,
  onOpenChange,
}: {
  user: User;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="min-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Information
          </DialogTitle>
          <DialogDescription>
            Detailed information about the user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Username
                  </p>
                  <p className="text-sm">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Role:
                </span>
                <Badge variant="secondary">{formatRole(user.role)}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          {(user.businessType || user.accountLimit || user.location) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.businessType && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Business Type
                    </p>
                    <p className="text-sm">
                      {formatBusinessType(user.businessType)}
                    </p>
                  </div>
                )}

                {user.accountLimit && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Account Limit
                    </p>
                    <p className="text-sm">
                      {user.accountLimit.toLocaleString()}
                    </p>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.expiryDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </p>
                  <p className="text-sm">{formatDate(user.expiryDate)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </p>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Form Modal Component
function UserFormModal({
  user,
  trigger,
  onSubmit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  user?: User;
  trigger?: React.ReactNode;
  onSubmit: (data: UserFormValues) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled props if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "user",
      isActive: user?.isActive ?? true,
      businessType: user?.businessType,
      accountLimit: user?.accountLimit,
      expiryDate: user?.expiryDate ? user.expiryDate.split("T")[0] : "",
      location: user?.location || "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "user",
      isActive: user?.isActive ?? true,
      businessType: user?.businessType,
      accountLimit: user?.accountLimit,
      expiryDate: user?.expiryDate ? user.expiryDate.split("T")[0] : "",
      location: user?.location || "",
    });
  }, [user, form]);

  const handleSubmit = (data: UserFormValues) => {
    onSubmit(data);
    setOpen(false);
    if (!user) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information"
              : "Fill in the details to create a new user"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="system_owner">
                            System Owner
                          </SelectItem>
                          <SelectItem value="super_admin">
                            Super Admin
                          </SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="it_person">IT Person</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable user account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="small_business">
                            Small Business
                          </SelectItem>
                          <SelectItem value="medium_business">
                            Medium Business
                          </SelectItem>
                          <SelectItem value="large_business">
                            Large Business
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional business classification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter account limit"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional account usage limit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormDescription>Optional user location</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional account expiry date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {user ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Export the modal components for use in other files
export { UserInfoModal, UserFormModal };

// Export types for the modal components
export type { UserFormValues };

// Main Component
export default function Component({ user }: { user?: User }) {
  const handleFormSubmit = (data: UserFormValues) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user information with view and edit modals
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {user && (
          <UserInfoModal
            user={user}
            trigger={
              <Button variant="outline">
                <UserIcon className="mr-2 h-4 w-4" />
                View User Info
              </Button>
            }
          />
        )}

        <UserFormModal
          trigger={<Button>Create New User</Button>}
          onSubmit={handleFormSubmit}
        />

        <UserFormModal
          user={user}
          trigger={<Button variant="secondary">Edit User</Button>}
          onSubmit={handleFormSubmit}
        />
      </div>

      {user && (
        <Card className="min-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {formatRole(user.role)}
              </p>
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
