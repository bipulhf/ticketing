"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Ticket,
  CheckCircle,
  Clock,
  Shield,
  Settings,
  UserCheck,
  Wrench,
  User,
  CalendarIcon,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DashboardMetrics,
  SystemOwnerData,
  ComprehensiveDashboardData,
  AccountInfo,
  ExpiryInfo,
} from "@/types/types";
import { getDashboardData } from "@/actions/dashboard.action";

interface DateRange {
  from: Date;
  to: Date;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [comprehensiveData, setComprehensiveData] =
    useState<ComprehensiveDashboardData | null>(null);
  const [systemOwnerData, setSystemOwnerData] =
    useState<SystemOwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [quickFilter, setQuickFilter] = useState("thisMonth");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    });

    // Fetch metrics data
    const data = await getDashboardData({ params, userType: "admin" });

    if (data?.error) {
      setError(data.error);
    } else if (
      data?.systemOwner &&
      typeof data.systemOwner === "object" &&
      "userCounts" in data.systemOwner
    ) {
      // Handle comprehensive dashboard data (first structure)
      setComprehensiveData(data.systemOwner as ComprehensiveDashboardData);
      setMetrics(null);
      setSystemOwnerData(null);
    } else if (data?.metrics && data?.systemOwner) {
      // Handle simple metrics data (second structure)
      setMetrics(data.metrics);
      setSystemOwnerData(data.systemOwner);
      setComprehensiveData(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Helper functions to get current data regardless of structure
  const getCurrentMetrics = () => {
    if (comprehensiveData) {
      return {
        totalUsers: comprehensiveData.userCounts.totalUsers,
        adminCount: comprehensiveData.userCounts.adminCount,
        itPersonCount: comprehensiveData.userCounts.itPersonCount,
        userCount: comprehensiveData.userCounts.userCount,
        ticketStats: comprehensiveData.ticketStats,
      };
    }
    return metrics;
  };

  const getAccountInfo = (): AccountInfo | null => {
    return comprehensiveData?.accountInfo || null;
  };

  const getExpiryInfo = (): ExpiryInfo | null => {
    return comprehensiveData?.expiryInfo || null;
  };

  const currentMetrics = getCurrentMetrics();
  const accountInfo = getAccountInfo();
  const expiryInfo = getExpiryInfo();

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter);
    const today = new Date();

    switch (filter) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "last7days":
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case "last30days":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case "thisMonth":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="w-full space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="w-full">
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Monitor your IT support metrics and system performance
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Date Filter Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "today", label: "Today" },
                  { value: "last7days", label: "Last 7 Days" },
                  { value: "last30days", label: "Last 30 Days" },
                  { value: "thisMonth", label: "This Month" },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      quickFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleQuickFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Custom Range:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {format(dateRange.from, "MMM dd")} -{" "}
                      {format(dateRange.to, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                          setQuickFilter("custom");
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Owner Section */}
        {systemOwnerData && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Shield className="h-5 w-5" />
                System Owner Overview
              </CardTitle>
              <CardDescription className="text-blue-700">
                Comprehensive system management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Super Admins</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemOwnerData.superAdminCount || 0}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Expiring Tickets</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {systemOwnerData.expiringTickets || 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Health</p>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {systemOwnerData.systemHealth || "Healthy"}
                      </Badge>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active system users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currentMetrics?.adminCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Administrative users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                IT Personnel
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currentMetrics?.itPersonCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Technical support staff
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">End Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {currentMetrics?.userCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Regular system users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentMetrics?.ticketStats.totalTickets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All tickets in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tickets
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {currentMetrics?.ticketStats.pendingTickets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting resolution
              </p>
              {currentMetrics?.ticketStats.totalTickets && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (currentMetrics.ticketStats.pendingTickets /
                            currentMetrics.ticketStats.totalTickets) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Solved Tickets
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {currentMetrics?.ticketStats.solvedTickets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
              {currentMetrics?.ticketStats.totalTickets && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (currentMetrics.ticketStats.solvedTickets /
                            currentMetrics.ticketStats.totalTickets) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Key performance indicators for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">
                  Resolution Rate
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {currentMetrics?.ticketStats.totalTickets
                    ? Math.round(
                        (currentMetrics.ticketStats.solvedTickets /
                          currentMetrics.ticketStats.totalTickets) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Pending Rate</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {currentMetrics?.ticketStats.totalTickets
                    ? Math.round(
                        (currentMetrics.ticketStats.pendingTickets /
                          currentMetrics.ticketStats.totalTickets) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">
                  User to IT Ratio
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentMetrics?.itPersonCount
                    ? Math.round(
                        (currentMetrics.userCount || 0) /
                          currentMetrics.itPersonCount
                      )
                    : 0}
                  :1
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Admin Coverage</div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentMetrics?.totalUsers
                    ? Math.round(
                        ((currentMetrics.adminCount || 0) /
                          currentMetrics.totalUsers) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        {accountInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Business account details and utilization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Business Type</p>
                      <p className="text-lg font-bold text-blue-600 capitalize">
                        {accountInfo.businessType.replace("_", " ")}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Account Limit</p>
                      <p className="text-lg font-bold text-green-600">
                        {accountInfo.accountLimit}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Utilization</p>
                      <p className="text-lg font-bold text-orange-600">
                        {accountInfo.accountUtilization}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${accountInfo.accountUtilization}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Remaining Slots</p>
                      <p className="text-lg font-bold text-purple-600">
                        {accountInfo.remainingSlots}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiry Info */}
        {expiryInfo && (
          <Card
            className={cn(
              "border-2",
              expiryInfo.isExpired
                ? "border-red-200 bg-red-50/50"
                : expiryInfo.daysToExpiry <= 30
                ? "border-orange-200 bg-orange-50/50"
                : "border-green-200 bg-green-50/50"
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  "flex items-center gap-2",
                  expiryInfo.isExpired
                    ? "text-red-900"
                    : expiryInfo.daysToExpiry <= 30
                    ? "text-orange-900"
                    : "text-green-900"
                )}
              >
                <CalendarIcon className="h-5 w-5" />
                Account Expiry Information
              </CardTitle>
              <CardDescription
                className={cn(
                  expiryInfo.isExpired
                    ? "text-red-700"
                    : expiryInfo.daysToExpiry <= 30
                    ? "text-orange-700"
                    : "text-green-700"
                )}
              >
                {expiryInfo.isExpired
                  ? "Account has expired - immediate action required"
                  : expiryInfo.daysToExpiry <= 30
                  ? "Account expiring soon - please renew"
                  : "Account status is healthy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Expiry Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {format(
                          new Date(expiryInfo.expiryDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          expiryInfo.isExpired
                            ? "text-red-600"
                            : expiryInfo.daysToExpiry <= 30
                            ? "text-orange-600"
                            : "text-green-600"
                        )}
                      >
                        {expiryInfo.daysToExpiry}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          expiryInfo.isExpired
                            ? "bg-red-100 text-red-800 border-red-200"
                            : expiryInfo.daysToExpiry <= 30
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        )}
                      >
                        {expiryInfo.isExpired ? "Expired" : "Active"}
                      </Badge>
                    </div>
                    {expiryInfo.isExpired ? (
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    ) : expiryInfo.daysToExpiry <= 30 ? (
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
