"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TicketStatusBadge } from "./ticket-status-badge";
import { closeTicket } from "@/actions/tickets.action";
import { toast } from "sonner";
import {
  Calendar,
  Mail,
  MapPin,
  Building,
  MessageSquare,
  Paperclip,
  Loader2,
} from "lucide-react";
import type { Ticket } from "@/types/types";

interface CloseTicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CloseTicketModal({
  ticket,
  isOpen,
  onClose,
  onSuccess,
}: CloseTicketModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast.error("Please provide notes before closing the ticket");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await closeTicket(ticket.id, notes.trim());

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket closed successfully");
        setNotes("");
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to close ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Close Ticket #{ticket.id}</DialogTitle>
          <DialogDescription>
            Review the ticket details and provide resolution notes before
            closing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <p className="text-base font-medium leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Created By Section */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium">Created By</h4>
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
                      {ticket.createdBy.userLocation.charAt(0).toUpperCase() +
                        ticket.createdBy.userLocation.slice(1).toLowerCase()}
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

            {/* Existing Notes */}
            {ticket.notes && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Existing Notes</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {ticket.notes}
                </p>
              </div>
            )}

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div className="space-y-2 border-t pt-4">
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
                          {attachment.fileType} •{" "}
                          {formatDate(attachment.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        asChild
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
          </div>

          {/* Close Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Describe how the issue was resolved..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                required
              />
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
              <Button type="submit" disabled={isSubmitting || !notes.trim()}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Close Ticket
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
