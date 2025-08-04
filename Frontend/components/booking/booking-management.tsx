"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Calendar, User, Bed, CheckCircle, XCircle, Clock, MoreHorizontal, Download, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  useGetBookingsQuery,
  useCancelBookingMutation,
  useApproveBookingMutation,
  useRejectBookingMutation,
  useUpdateBookingMutation,
} from "@/lib/store/api/booking/bookingApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BookingManagementProps {
  userRole: "admin" | "warden"
}

export function BookingManagement({ userRole }: BookingManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [cancelBooking, { isLoading: isCancelling, isError: isCancelError, error: cancelError }] = useCancelBookingMutation()
  const [approveBooking, { isLoading: isApproving }] = useApproveBookingMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { toast } = useToast();

  const { data, isLoading, isError, error, refetch } = useGetBookingsQuery({
    page,
    limit,
    status: statusFilter,
    floor: floorFilter,
    search: searchTerm,
  })

  const bookings = data?.data?.bookings || []
  const total = data?.data?.pagination?.total || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "reserved":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "rejected":
        return <XCircle className="h-3 w-3" />
      case "occupied":
        return <User className="h-3 w-3" />
      case "reserved":
        return <Calendar className="h-3 w-3" />
      default:
        return <Bed className="h-3 w-3" />
    }
  }

  const stats = {
    total: total,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    approved: bookings.filter((b: any) => b.status === "approved").length,
    occupied: bookings.filter((b: any) => b.status === "occupied").length,
    rejected: bookings.filter((b: any) => b.status === "rejected").length,
  }

  const handleCancel = async (id: string) => {
    setCancelId(id)
    try {
      await cancelBooking({ id }).unwrap()
      setCancelId(null)
      refetch();
      toast({ title: "Booking cancelled", description: "The booking was cancelled." });
    } catch (err: any) {
      setCancelId(null)
      const msg = err?.data?.message || err?.error || "Failed to cancel booking.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      console.error("Cancel booking error:", err)
    }
  }

  const handleApprove = async () => {
    if (!selectedBooking) return;
    try {
      await approveBooking({ id: selectedBooking._id, remarks }).unwrap();
      setShowApproveModal(false);
      setSelectedBooking(null);
      setRemarks("");
      refetch();
      toast({ title: "Booking approved", description: "The booking was approved successfully." });
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Failed to approve booking.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      console.error("Approve booking error:", err);
    }
  };
  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    try {
      await rejectBooking({ id: selectedBooking._id, reason: rejectionReason }).unwrap();
      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectionReason("");
      refetch();
      toast({ title: "Booking rejected", description: "The booking was rejected." });
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Failed to reject booking.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      console.error("Reject booking error:", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading bookings...</div>
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading bookings: {typeof error === 'object' && error && 'data' in error && (error as any).data?.message
          ? (error as any).data.message
          : typeof error === 'object' && error && 'status' in error
          ? `Status: ${(error as any).status}`
          : JSON.stringify(error)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, roll number, bed ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
                <SelectItem value="4">Floor 4</SelectItem>
                <SelectItem value="5">Floor 5</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Manage and track all bed booking requests and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Bed ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking: any) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.student?.name}</div>
                        <div className="text-sm text-gray-600">{booking.student?.rollNo}</div>
                        <div className="text-xs text-gray-500">{booking.student?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-gray-500" />
                        <span className="font-mono font-medium">{booking.bed?.bedId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(booking.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {/* View Details handler */}}>
                            <User className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === "pending" && userRole !== "student" && (
                            <>
                              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setShowApproveModal(true); }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setShowRejectModal(true); }}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {(booking.status === "approved" || booking.status === "occupied") && userRole !== "student" && (
                            <DropdownMenuItem onClick={() => {/* Modify Booking handler */}}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modify Booking
                            </DropdownMenuItem>
                          )}
                          {(booking.status === "pending" || booking.status === "approved") && userRole === "student" && (
                            <DropdownMenuItem onClick={() => handleCancel(booking._id)} disabled={isCancelling && cancelId === booking._id}>
                              <XCircle className="h-4 w-4 mr-2" />
                              {isCancelling && cancelId === booking._id ? "Cancelling..." : "Cancel Booking"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Approve Modal */}
          <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Booking</DialogTitle>
                <DialogDescription>Add remarks (optional) before approving this booking.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks (optional)"
                rows={3}
              />
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApprove} disabled={isApproving}>
                  {isApproving ? "Approving..." : "Approve"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* Reject Modal */}
          <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Booking</DialogTitle>
                <DialogDescription>Provide a reason for rejection.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection"
                rows={3}
              />
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReject} disabled={isRejecting || !rejectionReason.trim()}>
                  {isRejecting ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {isCancelError && (
            <div className="text-red-500 text-center py-2">
              {typeof cancelError === 'object' && cancelError && 'data' in cancelError && (cancelError as any).data?.message
                ? (cancelError as any).data.message
                : "Failed to cancel booking."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
