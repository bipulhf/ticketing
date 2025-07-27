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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MapPin, UserIcon, Building, Clock, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  BusinessType,
  User,
  UserRole,
  ITDepartment,
  Location,
  UserDepartment,
  IT_DEPARTMENTS,
  USER_DEPARTMENTS,
  LOCATIONS,
} from "@/types/types";

// Form schema
const userFormSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "system_owner",
    "super_admin",
    "admin",
    "it_person",
    "user",
    "",
  ]),
  isActive: z.boolean(),
  businessType: z
    .enum(["small_business", "medium_business", "large_business"])
    .optional(),
  expiryDate: z.string().optional(),
  department: z.enum(["it_operations", "it_qcs"]).optional(),
  locations: z
    .array(z.enum(["tongi", "salna", "mirpur", "mawna", "rupganj"]))
    .optional(),
  userLocation: z
    .enum(["tongi", "salna", "mirpur", "mawna", "rupganj"])
    .optional(),
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

const getDepartmentDisplayName = (department: ITDepartment): string => {
  return department.replace(/_/g, " ").toUpperCase();
};

const getLocationDisplayName = (location: Location): string => {
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Information
          </DialogTitle>
          <DialogDescription>
            Detailed information about {user.username}
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
                  <label className="text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <p className="text-sm">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <Badge variant="secondary">{formatRole(user.role)}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department and Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-4 w-4" />
                Department & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {user.department && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Department
                    </label>
                    <p className="text-sm">
                      {getDepartmentDisplayName(user.department)}
                    </p>
                  </div>
                )}
                {user.locations && user.locations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Locations
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.locations.map((location) => (
                        <Badge key={location} variant="outline">
                          {getLocationDisplayName(location)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {user.userLocation && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Location
                    </label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getLocationDisplayName(user.userLocation)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          {(user.businessType || user.accountLimit || user.expiryDate) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {user.businessType && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Business Type
                      </label>
                      <p className="text-sm">
                        {formatBusinessType(user.businessType)}
                      </p>
                    </div>
                  )}
                  {user.accountLimit && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Limit
                      </label>
                      <p className="text-sm">{user.accountLimit} users</p>
                    </div>
                  )}
                  {user.expiryDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Expiry Date
                      </label>
                      <p className="text-sm">{formatDate(user.expiryDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </label>
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
  userType,
}: {
  userType: UserRole;
  user?: User;
  trigger?: React.ReactNode;
  onSubmit: (data: UserFormValues) => Promise<boolean>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const open = controlledOpen ?? isOpen;
  const onOpenChange = controlledOnOpenChange ?? setIsOpen;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      role:
        user?.role ||
        (userType === "system_owner"
          ? "super_admin"
          : userType === "super_admin"
          ? "admin"
          : userType === "admin"
          ? "it_person"
          : "user"),
      isActive: user?.isActive ?? true,
      businessType: user?.businessType,
      expiryDate: user?.expiryDate
        ? new Date(user.expiryDate).toISOString().slice(0, 16) // Format for datetime-local input
        : undefined,
      department: user?.department,
      locations: user?.locations || [],
      userLocation: user?.userLocation,
    },
  });

  const selectedRole = form.watch("role");

  const handleSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert expiry date to ISO format if provided
      const processedData = {
        ...data,
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate).toISOString()
          : undefined,
      };

      const success = await onSubmit(processedData);
      if (success) {
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which fields to show based on role
  const showBusinessType = selectedRole === "super_admin";
  const showExpiryDate = selectedRole === "super_admin";
  const showDepartment = ["super_admin"].includes(selectedRole);
  const showMultipleLocations = selectedRole === "super_admin";
  const showSingleLocation = ["admin", "it_person", "user"].includes(
    selectedRole
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {user ? "Edit User" : `Create ${formatRole(userType)}`}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information"
              : `Create a new ${formatRole(userType).toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
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

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!user} // Disable role change for existing users
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userType === "system_owner" && (
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      )}
                      {userType === "super_admin" && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      {userType === "admin" && (
                        <SelectItem value="it_person">IT Person</SelectItem>
                      )}
                      {userType === "it_person" && (
                        <SelectItem value="user">User</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Type (Super Admin only) */}
            {showBusinessType && (
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
                      Business type determines account limits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Expiry Date (Super Admin only) */}
            {showExpiryDate && (
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Set account expiry date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Department (IT roles only) */}
            {showDepartment && (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
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
                      Department will be inherited from creator
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Multiple Locations (Super Admin only) */}
            {showMultipleLocations && (
              <FormField
                control={form.control}
                name="locations"
                render={() => (
                  <FormItem>
                    <FormLabel>Locations</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(LOCATIONS).map(([key, value]) => (
                        <FormField
                          key={value}
                          control={form.control}
                          name="locations"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked: boolean) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            value,
                                          ])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (location) => location !== value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {getLocationDisplayName(value)}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select multiple locations for Super Admin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Single Location (Admin, IT Person, User) */}
            {userType === "super_admin" && showSingleLocation && (
              <FormField
                control={form.control}
                name="userLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
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
                            {getLocationDisplayName(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Location will be inherited from creator
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this user account
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { UserInfoModal, UserFormModal };
