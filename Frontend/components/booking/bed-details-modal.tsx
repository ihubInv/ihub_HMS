"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Bed, User, Calendar, Mail, MapPin, Clock, AlertTriangle } from "lucide-react"
import { useGetBedQuery } from "@/lib/store/api/bed/bedApi";
import { useState } from "react";

interface BedDetailsModalProps {
  bedId: string;
  isOpen: boolean;
  onClose: () => void;
  userRole: "admin" | "warden" | "student";
}

export function BedDetailsModal({ bedId, isOpen, onClose, userRole }: BedDetailsModalProps) {
  const { data, isLoading, isError, error, refetch } = useGetBedQuery(bedId);
  const bed = data?.data?.bed;
  const bookingHistory = data?.data?.bookingHistory || [];
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-red-100 text-red-800 border-red-200";
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "maintenance":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Bed className="h-4 w-4" />;
      case "booked":
        return <Calendar className="h-4 w-4" />;
      case "occupied":
        return <User className="h-4 w-4" />;
      case "reserved":
        return <Clock className="h-4 w-4" />;
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bed className="h-4 w-4" />;
    }
  };

  const canManageBed = userRole === "admin" || userRole === "warden";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Bed Details - {bedId}
          </DialogTitle>
          <DialogDescription>Detailed information about this bed</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading && <div className="py-8 text-center text-gray-500">Loading bed details...</div>}
          {isError && (
            <div className="py-8 text-center text-red-500">
              Error loading bed: {typeof error === 'object' && error && 'data' in error && (error as any).data?.message
                ? (error as any).data.message
                : typeof error === 'object' && error && 'status' in error
                ? `Status: ${(error as any).status}`
                : error?.message || "Unknown error"}
              <div className="mt-4">
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          )}
          {bed && (
            <>
              {/* Bed Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Floor:</span>
                      <p className="font-semibold">{bed.floor}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Room:</span>
                      <p className="font-semibold">{bed.room}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Bed Number:</span>
                      <p className="font-semibold">{bed.bedNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Bed ID:</span>
                      <p className="font-semibold">{bed.bedId}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Status:</span>
                    <Badge className={`${getStatusColor(bed.status)} flex items-center gap-1`}>
                      {getStatusIcon(bed.status)}
                      {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Occupant Information */}
              {bed.currentOccupant && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Occupant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{bed.currentOccupant.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {bed.currentOccupant.rollNo}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">{bed.currentOccupant.checkIn ? new Date(bed.currentOccupant.checkIn).toLocaleDateString() : "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{bed.currentOccupant.checkOut ? new Date(bed.currentOccupant.checkOut).toLocaleDateString() : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Management Actions (Admin/Warden) */}
              {canManageBed && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Management Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" onClick={() => setShowEdit(true)}>
                        Edit Bed
                      </Button>
                      <Button variant="outline" onClick={() => setShowAssign(true)}>
                        Assign Bed
                      </Button>
                      <Button variant="outline" onClick={() => setShowMaintenance(true)}>
                        Mark as Maintenance
                      </Button>
                      <Button variant="outline" onClick={() => {/* Release bed handler */}}>
                        Release Bed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Booking History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bookingHistory.length === 0 ? (
                    <div className="text-gray-500 text-sm">No booking history for this bed.</div>
                  ) : (
                    <div className="space-y-2">
                      {bookingHistory.map((booking: any) => (
                        <div key={booking._id} className="border rounded p-2 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <span className="font-medium">{booking.student?.name || 'Unknown'}</span> ({booking.student?.rollNo || 'N/A'})
                          </div>
                          <div>
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                          <div>
                            Status: <Badge className="ml-1 text-xs">{booking.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Close Button */}
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
