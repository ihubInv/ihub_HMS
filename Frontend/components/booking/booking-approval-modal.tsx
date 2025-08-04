"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, User, Calendar, FileText, Phone, Mail, AlertTriangle } from "lucide-react"
import { useApproveBookingMutation, useRejectBookingMutation } from "@/lib/store/api/booking/bookingApi"

interface BookingApprovalModalProps {
  booking: {
    id: string
    studentName: string
    rollNo: string
    email: string
    phone: string
    bedId: string
    checkIn: string
    checkOut: string
    submittedAt: string
    specialRequests?: string
    medicalConditions?: string
    emergencyContact: string
    emergencyPhone: string
    documents: string[]
  }
  isOpen: boolean
  onClose: () => void
  onApprove: (bookingId: string, remarks?: string) => void
  onReject: (bookingId: string, reason: string) => void
}

export function BookingApprovalModal({ booking, isOpen, onClose }: BookingApprovalModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [remarks, setRemarks] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const [approveBooking, { isLoading: isApproving, isError: isApproveError, error: approveError }] = useApproveBookingMutation()
  const [rejectBooking, { isLoading: isRejecting, isError: isRejectError, error: rejectError }] = useRejectBookingMutation()

  const handleApprove = async () => {
    try {
      await approveBooking({ id: booking.id, remarks }).unwrap()
      onClose()
    } catch (err) {
      // Optionally show a toast or error message
      console.error(err)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    try {
      await rejectBooking({ id: booking.id, reason: rejectionReason }).unwrap()
      onClose()
    } catch (err) {
      // Optionally show a toast or error message
      console.error(err)
    }
  }

  const handleSubmit = () => {
    if (action === "approve") {
      handleApprove()
    } else if (action === "reject" && rejectionReason.trim()) {
      handleReject()
    }

    // Reset form
    setAction(null)
    setRemarks("")
    setRejectionReason("")
  }

  const duration = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Booking Approval - {booking.bedId}
          </DialogTitle>
          <DialogDescription>Review and approve or reject this booking request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="font-semibold">{booking.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Roll Number</Label>
                  <p className="font-semibold">{booking.rollNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{booking.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{booking.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Requested Bed</Label>
                  <p className="font-semibold text-lg">{booking.bedId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-in Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-out Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="font-semibold">{duration} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                  <p>{new Date(booking.submittedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact Name</Label>
                  <p className="font-semibold">{booking.emergencyContact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p>{booking.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {booking.documents.map((doc, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {doc}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(booking.medicalConditions || booking.specialRequests) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.medicalConditions && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Medical Conditions</Label>
                    <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{booking.medicalConditions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {booking.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Special Requests</Label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">{booking.specialRequests}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Selection */}
          {!action && (
            <div className="flex gap-4">
              <Button onClick={() => setAction("approve")} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Request
              </Button>
              <Button
                onClick={() => setAction("reject")}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Request
              </Button>
            </div>
          )}

          {/* Approval Form */}
          {action === "approve" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Approve Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="remarks">Approval Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any remarks or instructions for the student..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={isApproving}>
                    {isApproving ? "Approving..." : "Confirm Approval"}
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Form */}
          {action === "reject" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Reject Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Please provide a clear reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700" disabled={isRejecting}>
                    {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(isApproveError || isRejectError) && (
            <div className="text-red-500 text-center py-2">
              {typeof approveError === 'object' && approveError && 'data' in approveError && (approveError as any).data?.message
                ? (approveError as any).data.message
                : typeof rejectError === 'object' && rejectError && 'data' in rejectError && (rejectError as any).data?.message
                ? (rejectError as any).data.message
                : "Failed to process booking action."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
