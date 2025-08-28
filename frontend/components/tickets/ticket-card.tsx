"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Paperclip,
  MapPin,
  Building,
  Mail,
  MessageSquare,
  Check,
  RotateCcw,
  Loader2,
  Copy,
  HardDrive,
  MonitorSmartphone,
  Globe,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  FileAudio,
  FileWarning,
  ChevronRight,
} from "lucide-react";
import { TicketStatusBadge } from "./ticket-status-badge";
import { CloseTicketModal } from "./close-ticket-modal";
import { reopenTicket } from "@/actions/tickets.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Ticket, UserRole } from "@/types/types";

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onTicketUpdate?: () => void;
  userType?: UserRole;
  className?: string;
}

export function TicketCard({
  ticket,
  onView,
  onEdit,
  onTicketUpdate,
  userType,
  className,
}: TicketCardProps) {
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRole = (role: string) =>
    role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const formatBusinessType = (type?: string) =>
    !type
      ? ""
      : type
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const getInitials = (username: string) =>
    username
      .split("_")
      .map((p) => p.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);

  const getResolutionTime = () => {
    if (!ticket.solvedAt) return null;
    const created = new Date(ticket.createdAt);
    const solved = new Date(ticket.solvedAt);
    const diff = solved.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const copy = async (label: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };

  const handleReopenTicket = async () => {
    setIsReopening(true);
    try {
      const result = await reopenTicket(ticket.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket reopened successfully");
        onTicketUpdate?.();
        // Keep the reload for now to ensure fresh data across lists
        window.location.reload();
      }
    } catch {
      toast.error("Failed to reopen ticket");
    } finally {
      setIsReopening(false);
    }
  };

  const fileIconFor = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    const ft = fileType.toLowerCase();
    if (ft.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (ft.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (ft.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
    if (ft.includes("zip") || ft.includes("rar"))
      return <FileArchive className="h-4 w-4" />;
    if (ft.includes("json") || ft.includes("csv") || ft.includes("txt"))
      return <FileText className="h-4 w-4" />;
    return <FileWarning className="h-4 w-4" />;
  };

  const isSolved = ticket.status === "solved" && !!ticket.solvedBy;

  return (
    <Card
      role="group"
      tabIndex={0}
      onClick={() => onView?.(ticket)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onView?.(ticket);
      }}
      className={cn(
        "hover:shadow-md transition-all max-w-3xl outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer",
        isSolved && "border-l-4 border-l-green-500",
        className
      )}
      aria-label={`Ticket ${ticket.id}: ${ticket.description}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 my-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm text-muted-foreground shrink-0">
                Ticket #{ticket.id}
              </h3>
              <TicketStatusBadge status={ticket.status} />
              {getResolutionTime() && isSolved && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-300 text-green-700"
                >
                  Resolved in {getResolutionTime()}
                </Badge>
              )}
            </div>
            <p className="text-base font-medium leading-relaxed line-clamp-3">
              {ticket.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {userType === "user" && isSolved && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReopenTicket();
                }}
                disabled={isReopening}
                aria-label="Reopen ticket"
              >
                {isReopening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Reopen</span>
              </Button>
            )}

            {userType !== "user" && ticket.status === "pending" && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCloseModalOpen(true);
                }}
                aria-label="Mark ticket as solved"
              >
                <Check className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Solve</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reporter */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(ticket.createdBy.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-medium truncate">
                  {ticket.createdBy.username}
                </p>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {formatRole(ticket.createdBy.role)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{ticket.createdBy.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy("Email", ticket.createdBy.email);
                  }}
                  aria-label="Copy email"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            {ticket.createdBy.userLocation && (
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {ticket.createdBy.userLocation}
                </span>
              </div>
            )}
            {ticket.createdBy.businessType && (
              <div className="flex items-center gap-1 min-w-0">
                <Building className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {formatBusinessType(ticket.createdBy.businessType)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Ticket meta */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {ticket.ip_address && (
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-3 w-3" />
                <span className="font-medium">IP Address:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.ip_address}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy("IP Address", ticket.ip_address);
                  }}
                  aria-label="Copy IP address"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            {ticket.device_name && (
              <div className="flex items-center gap-2 min-w-0">
                <MonitorSmartphone className="h-3 w-3" />
                <span className="font-medium">Device:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.device_name}
                </span>
              </div>
            )}
            {ticket.ip_number && (
              <div className="flex items-center gap-2 min-w-0">
                <HardDrive className="h-3 w-3" />
                <span className="font-medium">IP Number:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.ip_number}
                </span>
              </div>
            )}
            {ticket.department && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium">Department:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.department.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
            )}
            {ticket.location && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium">Location:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.location.charAt(0).toUpperCase() +
                    ticket.location.slice(1).toLowerCase()}
                </span>
              </div>
            )}
            {ticket.user_department && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium">User Dept:</span>
                <span className="text-muted-foreground truncate">
                  {ticket.user_department.charAt(0).toUpperCase() +
                    ticket.user_department.slice(1).toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Solved info */}
        {isSolved && (
          <div className="space-y-3 bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Solved By
                </span>
              </div>
              {getResolutionTime() && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700 border-green-300"
                >
                  Resolved in {getResolutionTime()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-green-200 text-green-800">
                  {getInitials(ticket.solvedBy!.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {ticket.solvedBy!.username}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-300 text-green-700 bg-white"
                  >
                    {formatRole(ticket.solvedBy!.role)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{ticket.solvedBy!.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      copy("Email", ticket.solvedBy!.email);
                    }}
                    aria-label="Copy solver email"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {ticket.solvedAt && (
                  <div className="flex items-center gap-1 text-xs text-green-700 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Solved on: {formatDate(ticket.solvedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSolved && <Separator />}

        {/* Notes */}
        {ticket.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notes</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap">
              {ticket.notes}
            </p>
          </div>
        )}

        {/* Attachments */}
        {ticket.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Attachments ({ticket.attachments.length})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ticket.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0">{fileIconFor(a.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={a.name}>
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.fileType || "file"} • {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created: {formatDate(ticket.createdAt)}</span>
          </div>
          <span>Updated: {formatDate(ticket.updatedAt)}</span>
        </div>
      </CardContent>

      <CloseTicketModal
        ticket={ticket}
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onSuccess={() => {
          onTicketUpdate?.();
          window.location.reload();
        }}
      />
    </Card>
  );
}
