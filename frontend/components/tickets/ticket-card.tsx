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
} from "lucide-react";
import { TicketStatusBadge } from "./ticket-status-badge";
import { CloseTicketModal } from "./close-ticket-modal";
import { reopenTicket } from "@/actions/tickets.action";
import { toast } from "sonner";
import type { Ticket, UserRole } from "@/types/types";

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onTicketUpdate?: () => void;
  userType?: UserRole;
}

export function TicketCard({
  ticket,
  onView,
  onEdit,
  onTicketUpdate,
  userType,
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

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatBusinessType = (type?: string) => {
    if (!type) return "";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
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
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to reopen ticket");
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow max-w-3xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 my-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Ticket #{ticket.id.toUpperCase()}
              </h3>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-base font-medium leading-relaxed">
              {ticket.description}
            </p>
          </div>
          {userType === "user" && ticket.status === "solved" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopenTicket}
                disabled={isReopening}
              >
                {isReopening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}{" "}
                Reopen
              </Button>
            </div>
          )}
          {userType === "it_person" && ticket.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCloseModalOpen(true)}
              >
                <Check className="h-4 w-4" /> Solve
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Created By Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(ticket.createdBy.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {ticket.createdBy.username}
                </p>
                <Badge variant="outline" className="text-xs">
                  {formatRole(ticket.createdBy.role)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{ticket.createdBy.email}</span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {ticket.createdBy.userLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {ticket.createdBy.userLocation}
                </span>
              </div>
            )}
            {ticket.createdBy.businessType && (
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                <span className="truncate">
                  {formatBusinessType(ticket.createdBy.businessType)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Ticket Information */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {ticket.ip_address && (
              <div className="flex items-center gap-1">
                <span className="font-medium">IP Address:</span>
                <span className="text-muted-foreground">
                  {ticket.ip_address}
                </span>
              </div>
            )}
            {ticket.device_name && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Device:</span>
                <span className="text-muted-foreground">
                  {ticket.device_name}
                </span>
              </div>
            )}
            {ticket.ip_number && (
              <div className="flex items-center gap-1">
                <span className="font-medium">IP Number:</span>
                <span className="text-muted-foreground">
                  {ticket.ip_number}
                </span>
              </div>
            )}
            {ticket.department && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Department:</span>
                <span className="text-muted-foreground">
                  {ticket.department.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
            )}
            {ticket.location && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Location:</span>
                <span className="text-muted-foreground">
                  {ticket.location.charAt(0).toUpperCase() +
                    ticket.location.slice(1).toLowerCase()}
                </span>
              </div>
            )}
            {ticket.user_department && (
              <div className="flex items-center gap-1">
                <span className="font-medium">User Dept:</span>
                <span className="text-muted-foreground">
                  {ticket.user_department.charAt(0).toUpperCase() +
                    ticket.user_department.slice(1).toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        {ticket.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notes</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
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
            <div className="space-y-1">
              {ticket.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-muted/30 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.fileType} • {formatDate(attachment.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
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
