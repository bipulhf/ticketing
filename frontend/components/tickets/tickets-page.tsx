"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  Filter,
  Plus,
  Ticket,
  Calendar as CalendarIcon,
  X,
  Loader,
} from "lucide-react";
import { TicketCard } from "./ticket-card";
import { Pagination } from "./pagination";
import { CreateTicketModal } from "./create-ticket-modal";
import type {
  PaginationInfo,
  Ticket as TicketType,
  UserRole,
  ITDepartment,
  Location,
} from "@/types/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getAvailableDepartments,
  getAvailableLocations,
} from "@/actions/users.action";

export default function TicketPage({
  data,
  pagination,
  userType,
  userDepartment,
  searchOptions,
  isLoading = false,
  error = null,
}: {
  data: TicketType[];
  pagination: PaginationInfo;
  userType: UserRole;
  userDepartment?: ITDepartment;
  searchOptions?: {
    locations: Location[];
    departments: ITDepartment[];
    canSearchByDepartment: boolean;
    canSearchByLocation: boolean;
  } | null;
  isLoading?: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<ITDepartment[]>([]);

  // Separate search input state from the actual search filter
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [activeSearch, setActiveSearch] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams.get("department") || "all"
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || "all"
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    searchParams.get("toDate")
      ? new Date(searchParams.get("toDate")!)
      : undefined
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Update search input when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchInput(urlSearch);
    setActiveSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getAvailableLocations();
      if (!locations.error) {
        setLocations(locations.data.locations);
      }
    };
    const fetchDepartments = async () => {
      const departments = await getAvailableDepartments();
      if (!departments.error) {
        setDepartments(departments.data.departments);
      }
    };
    fetchLocations();
    fetchDepartments();
  }, []);

  // Update URL with new filters
  const updateURLWithFilters = (filters: {
    search?: string;
    status?: string;
    department?: string;
    location?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
  }) => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.department && filters.department !== "all") {
      params.set("department", filters.department);
    }
    if (filters.location && filters.location !== "all") {
      params.set("location", filters.location);
    }
    if (filters.fromDate) {
      params.set("fromDate", format(filters.fromDate, "yyyy-MM-dd"));
    }
    if (filters.toDate) {
      params.set("toDate", format(filters.toDate, "yyyy-MM-dd"));
    }
    if (filters.page && filters.page > 1) {
      params.set("page", filters.page.toString());
    }

    router.push(`/dashboard/tickets?${params.toString()}`);
  };

  const handleView = (ticket: TicketType) => {
    console.log("View ticket:", ticket);
    // Implement view logic
  };

  const handleEdit = (ticket: TicketType) => {
    console.log("Edit ticket:", ticket);
    // Implement edit logic
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLWithFilters({
      search: activeSearch,
      status: statusFilter,
      department: departmentFilter,
      location: locationFilter,
      fromDate,
      toDate,
      page,
    });
  };
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
  };

  const handleDateRangeChange = (newFromDate?: Date, newToDate?: Date) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  const handleApplyFilters = () => {
    setActiveSearch(searchInput);
    setCurrentPage(1);
    updateURLWithFilters({
      search: searchInput,
      status: statusFilter,
      department: departmentFilter,
      location: locationFilter,
      fromDate,
      toDate,
      page: 1,
    });
  };

  const clearDateFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setActiveSearch("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setLocationFilter("all");
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
    router.push("/dashboard/tickets");
  };

  const handleTicketCreated = () => {
    // Refresh the page to show the new ticket
    router.refresh();
  };

  // Calculate status counts from the actual data (server-filtered)
  const statusCounts = {
    all: pagination.total,
    pending: data.filter((t) => t.status === "pending").length,
    resolved: data.filter((t) => t.status === "solved").length,
  };

  // Check if any filters are active
  const hasActiveFilters =
    activeSearch ||
    statusFilter !== "all" ||
    departmentFilter !== "all" ||
    locationFilter !== "all" ||
    fromDate ||
    toDate;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            Support Tickets
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage and track support tickets efficiently
          </p>
        </div>
        {userType === "user" && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                statusCounts.all
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">All tickets</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                statusCounts.pending
              )}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Awaiting resolution</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                statusCounts.resolved
              )}
            </div>
            <p className="text-xs text-green-600 mt-1">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter tickets</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets, users, or IDs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="min-w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            {(userType === "super_admin" || userType === "system_owner") && (
              <Select
                value={departmentFilter}
                onValueChange={handleDepartmentChange}
                disabled={!departments || departments.length === 0}
              >
                <SelectTrigger className="min-w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.replace(/_/g, " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Location Filter */}
            {(userType === "super_admin" || userType === "system_owner") && (
              <Select
                value={locationFilter}
                onValueChange={handleLocationChange}
                disabled={!locations || locations.length === 0}
              >
                <SelectTrigger className="min-w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations?.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Range Section */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* From Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto justify-start text-left font-normal min-w-[140px]",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "MMM dd, yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => handleDateRangeChange(date, toDate)}
                    disabled={(date) => (toDate ? date > toDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* To Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto justify-start text-left font-normal min-w-[140px]",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "MMM dd, yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => handleDateRangeChange(fromDate, date)}
                    disabled={(date) => (fromDate ? date < fromDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Date Button */}
              {(fromDate || toDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilter}
                  className="text-xs w-full sm:w-auto"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear Dates
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                Loading tickets...
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Please wait while we fetch your tickets from the database.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-2 border-dashed border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-3">
                Error Loading Tickets
              </h3>
              <p className="text-red-600 text-center mb-6 max-w-md">{error}</p>
              <Button
                onClick={() => router.refresh()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ticket Grid */}
        {!isLoading && !error && (
          <>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {data.length === 0 ? (
                <Card className="col-span-full border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Ticket className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-700">
                      No tickets found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-6">
                      {hasActiveFilters
                        ? "No tickets match your current search and filter criteria. Try adjusting your filters or search terms."
                        : "No tickets have been created yet. Create your first ticket to get started."}
                    </p>
                    {!hasActiveFilters && userType === "user" && (
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Ticket
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                data.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onView={handleView}
                    onEdit={handleEdit}
                    userType={userType}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {data.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          window.location.reload();
        }}
        onSuccess={handleTicketCreated}
        userRole={userType}
        userDepartment={userDepartment}
      />
    </div>
  );
}
