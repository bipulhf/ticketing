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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track support tickets
          </p>
        </div>
        {userType === "user" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter tickets</CardDescription>
        </CardHeader>
        <CardContent className="">
          {/* Single Row: All Filters */}
          <div className="flex flex-col xl:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets, users, or IDs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full xl:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter - Only for super_admin and system_owner */}
            {searchOptions?.canSearchByDepartment && (
              <Select
                value={departmentFilter}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className="w-full xl:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {searchOptions.departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.replace(/_/g, " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Location Filter - Only for super_admin and system_owner */}
            {searchOptions?.canSearchByLocation && (
              <Select
                value={locationFilter}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="w-full xl:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {searchOptions.locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* From Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full xl:w-40 justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "MMM dd") : "From Date"}
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
                    "w-full xl:w-40 justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "MMM dd") : "To Date"}
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
                size="icon"
                onClick={clearDateFilter}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Apply Filters Button */}
            <Button onClick={handleApplyFilters} className="xl:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Apply
            </Button>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="xl:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading tickets...</h3>
              <p className="text-muted-foreground text-center">
                Please wait while we fetch your tickets.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => router.refresh()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Ticket Grid */}
        {!isLoading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {data.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No tickets found
                    </h3>
                    <p className="text-muted-foreground text-center">
                      {hasActiveFilters
                        ? "Try adjusting your search or filter criteria"
                        : "No tickets have been created yet"}
                    </p>
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
