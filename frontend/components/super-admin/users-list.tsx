"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  Users,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  CreditCard,
  LayoutGrid,
  List,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { BusinessType, User, UserRole, UsersResponse } from "@/types/types";
import {
  getUsersForSystemOwner,
  getAllUsersByType,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/actions/users.action";
import {
  UserInfoModal,
  UserFormModal,
  UserFormValues,
} from "@/components/users/user-modal";
import { toast } from "sonner";

interface Filters {
  search: string;
  role: string;
  isActive: string;
  page: number;
  limit: number;
}

export function SuperAdminUsersList() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    role: "all",
    isActive: "all",
    page: 1,
    limit: 10,
  });

  // Modal state management
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchMyUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.role !== "all") params.append("role", filters.role);
    if (filters.isActive !== "all") params.append("isActive", filters.isActive);
    params.append("page", filters.page.toString());
    params.append("limit", filters.limit.toString());

    const result = await getUsersForSystemOwner({ params });

    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    setData(result);
    setLoading(false);
  }, [filters]);

  const fetchUsers = useCallback(() => {
    fetchMyUsers();
  }, [fetchMyUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Form submission handlers
  const handleCreateUser = async (
    formData: UserFormValues
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const userData = {
        ...formData,
        password: "defaultPassword123!", // You might want to generate a random password or ask for it
      };

      const result = await createUser(userData);

      if (result.error) {
        toast.error(result.error);
        return false;
      } else {
        // Refresh the user list
        fetchUsers();
        setError(null);
        return true;
      }
    } catch (err) {
      toast.error("Failed to create user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (
    formData: UserFormValues
  ): Promise<boolean> => {
    if (!selectedUser) return false;

    setIsSubmitting(true);
    try {
      const result = await updateUser(selectedUser.id, formData);

      if (result.error) {
        toast.error(result.error);
        return false;
      } else {
        // Refresh the user list
        fetchUsers();
        setSelectedUser(null);
        setShowEditModal(false);
        setError(null);
        return true;
      }
    } catch (err) {
      toast.error("Failed to update user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    if (!confirm("Are you sure you want to delete this user?")) return false;

    setIsSubmitting(true);
    try {
      const result = await deleteUser(userId);

      if (result.error) {
        toast.error(result.error);
        return false;
      } else {
        // Refresh the user list
        fetchUsers();
        setError(null);
        return true;
      }
    } catch (err) {
      toast.error("Failed to delete user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "system_owner":
        return "default";
      case "super_admin":
        return "secondary";
      case "admin":
        return "outline";
      case "it_person":
        return "secondary";
      case "user":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      system_owner: "System Owner",
      super_admin: "Super Admin",
      admin: "Admin",
      it_person: "IT Person",
      user: "User",
    };
    return roleNames[role];
  };

  const getBusinessTypeBadge = (businessType?: BusinessType) => {
    if (!businessType) return { label: "Not Set", variant: "outline" as const };

    const types: Record<
      BusinessType,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      small_business: { label: "Small", variant: "outline" },
      medium_business: { label: "Medium", variant: "secondary" },
      large_business: { label: "Large", variant: "default" },
    };
    return types[businessType];
  };

  const isExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    if (!isValid(expiry)) return false;

    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    if (!isValid(expiry)) return false;
    return expiry < new Date();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid Date";
  };

  const formatAccountLimit = (limit?: number): string => {
    return limit ? limit.toLocaleString() : "Not Set";
  };

  // Get current pagination info based on view mode
  const getCurrentPagination = () => {
    if (data) {
      return data.pagination;
    }
    return null;
  };

  // Get current users based on view mode
  const getCurrentUsers = () => {
    if (data) {
      return data.users;
    }
    return [];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const currentPagination = getCurrentPagination();
  const currentUsers = getCurrentUsers();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Users Management
              </h1>
              <p className="text-gray-600">Manage users you have created</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Add User Modal */}
              <UserFormModal
                trigger={
                  <Button size="sm" disabled={isSubmitting}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                }
                onSubmit={handleCreateUser}
                userType="super_admin"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>My Users Directory</CardTitle>
            <CardDescription>
              {data ? (
                <>
                  {data.pagination.total || 0} total users • Page{" "}
                  {data.pagination.page || 1} of{" "}
                  {data.pagination.totalPages || 1}
                </>
              ) : (
                "Loading..."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters - Only show search and pagination for all users view */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or location..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.role}
                onValueChange={(value) => handleFilterChange("role", value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="it_person">IT Person</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.isActive}
                onValueChange={(value) => handleFilterChange("isActive", value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.limit.toString()}
                onValueChange={(value) =>
                  handleFilterChange("limit", Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">
                      Business Type
                    </TableHead>
                    <TableHead className="font-semibold">
                      Account Limit
                    </TableHead>
                    <TableHead className="font-semibold">Expiry Date</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || !currentPagination ? (
                    // Show skeleton rows while loading
                    Array.from({ length: filters.limit }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
                        <p className="text-gray-500 text-md my-5">
                          No users found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Show actual user data
                    currentUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* For all users view, we might not have isActive, so assume active if not provided */}
                            {user.isActive !== false ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-600 font-medium">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-600 font-medium">
                                  Inactive
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getBusinessTypeBadge(user.businessType).variant
                            }
                          >
                            {getBusinessTypeBadge(user.businessType).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.accountLimit ? (
                              <>
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-sm">
                                  {formatAccountLimit(user.accountLimit)}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Not Set
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.expiryDate ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {formatDate(user.expiryDate)}
                                </span>
                              </div>
                              {isExpired(user.expiryDate) && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Expired
                                </Badge>
                              )}
                              {isExpiringSoon(user.expiryDate) &&
                                !isExpired(user.expiryDate) && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-orange-600 border-orange-200"
                                  >
                                    Expiring Soon
                                  </Badge>
                                )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Expiry
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.location ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {user.location}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Not Set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdBy ? (
                            <span className="text-gray-400 text-sm">
                              System
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              System
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={isSubmitting}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {currentPagination && currentPagination.totalPages && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  {(currentPagination.page - 1 || 0) *
                    (currentPagination.limit || 0) +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    currentPagination.page * currentPagination.limit || 0,
                    currentPagination.total || 0
                  )}{" "}
                  of {currentPagination.total || 0} results
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPagination.page - 1)}
                    disabled={!currentPagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, currentPagination.totalPages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === currentPagination.page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPagination.page + 1)}
                    disabled={!currentPagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <UserInfoModal
          user={selectedUser}
          open={showViewModal}
          onOpenChange={(open) => {
            setShowViewModal(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
        />
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <UserFormModal
          user={selectedUser}
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
          onSubmit={handleUpdateUser}
          userType="super_admin"
        />
      )}
    </div>
  );
}
