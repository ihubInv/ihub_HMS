"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, User, Phone, CreditCard, FileText } from "lucide-react"
import { format } from "date-fns"
import { useCreateBookingMutation, useUpdateBookingMutation } from "@/lib/store/api/booking/bookingApi"
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  bed: {
    id: string
    floorId: string
    roomId: string
    bedNumber: number
    status: string
  }
  isOpen: boolean
  onClose: () => void
  onSubmit?: (bookingData: any) => void
  mode?: "create" | "edit"
  initialData?: any
}

export function BookingModal({ bed, isOpen, onClose, onSubmit, mode = "create", initialData }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    rollNo: initialData?.rollNo || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    checkIn: initialData?.checkIn ? new Date(initialData.checkIn) : undefined,
    checkOut: initialData?.checkOut ? new Date(initialData.checkOut) : undefined,
    specialRequests: initialData?.specialRequests || "",
    medicalConditions: initialData?.medicalConditions || "",
    emergencyContact: initialData?.emergencyContact || "",
    emergencyPhone: initialData?.emergencyPhone || "",
  })
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [medicalFile, setMedicalFile] = useState<File | null>(null)
  const [createBooking, { isLoading: isCreating, isError: isCreateError, error: createError }] = useCreateBookingMutation()
  const [updateBooking, { isLoading: isUpdating, isError: isUpdateError, error: updateError }] = useUpdateBookingMutation()
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null);
    if (!formData.checkIn || !formData.checkOut) {
      alert("Please select check-in and check-out dates")
      return
    }
    const fd = new FormData()
    fd.append("bedId", bed.id)
    fd.append("checkIn", formData.checkIn.toISOString())
    fd.append("checkOut", formData.checkOut.toISOString())
    // Send emergencyContact as an object with name and phone
    fd.append("emergencyContact.name", formData.emergencyContact)
    fd.append("emergencyContact.phone", formData.emergencyPhone)
    fd.append("specialRequests", formData.specialRequests)
    fd.append("medicalConditions", formData.medicalConditions)
    if (idProofFile) fd.append("documents", idProofFile)
    if (medicalFile) fd.append("documents", medicalFile)
    for (let [key, value] of fd.entries()) {
      console.log("Booking payload:", key, value);
    }
    try {
      if (mode === "edit" && initialData?._id) {
        await updateBooking({ id: initialData._id, formData: fd }).unwrap()
      } else {
        await createBooking(fd).unwrap()
      }
      onClose()
    } catch (err: any) {
      // Log all error properties for debugging
      console.error("Booking error (raw):", err);
      if (err && typeof err === "object") {
        for (const key in err) {
          if (Object.prototype.hasOwnProperty.call(err, key)) {
            console.error(`Booking error property [${key}]:`, err[key]);
          }
        }
      }
      let msg = "Unknown error occurred. Check network and backend logs.";
      if (err && typeof err === "object") {
        if (err.data && err.data.message) msg = err.data.message;
        else if (err.error) msg = err.error;
        else if (err.status) msg = `Error status: ${err.status}`;
        else if (err.message) msg = err.message;
        else if (typeof err === 'string') msg = err;
      }
      setSubmitError(msg);
      toast({ title: "Booking Error", description: msg, variant: "destructive" });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "id" | "medical") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "id") {
        setIdProofFile(file)
      } else {
        setMedicalFile(file)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Book Bed {bed.id}
          </DialogTitle>
          <DialogDescription>Fill in the details below to request booking for this bed</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll No. / ID *</Label>
                  <Input
                    id="rollNo"
                    placeholder="Enter your roll number or ID"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkIn ? format(formData.checkIn, "PPP") : "Select check-in date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkIn}
                        onSelect={(date) => setFormData({ ...formData, checkIn: date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkOut ? format(formData.checkOut, "PPP") : "Select check-out date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkOut}
                        onSelect={(date) => setFormData({ ...formData, checkOut: date })}
                        disabled={(date) => date < (formData.checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Enter emergency contact name"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="emergencyPhone"
                      placeholder="Enter emergency contact phone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idProof">ID Proof * (PDF, JPG, PNG)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="idProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "id")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {idProofFile && <p className="text-sm text-green-600">✓ {idProofFile.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalCert">Medical Certificate (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="medicalCert"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "medical")}
                      className="pl-10"
                    />
                  </div>
                  {medicalFile && <p className="text-sm text-green-600">✓ {medicalFile.name}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="Please mention any medical conditions, allergies, or special medical needs..."
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Any special requests or preferences..."
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating)
                ? (mode === "edit" ? "Saving..." : "Submitting...")
                : (mode === "edit" ? "Save Changes" : "Submit Booking Request")}
            </Button>
          </div>
          {submitError && (
            <div className="text-red-500 text-sm text-center">{submitError}</div>
          )}
          {(isCreateError || isUpdateError) && (
            <div className="text-red-500 text-center py-2">
              {typeof createError === 'object' && createError && 'data' in createError && (createError as any).data?.message
                ? (createError as any).data.message
                : typeof updateError === 'object' && updateError && 'data' in updateError && (updateError as any).data?.message
                ? (updateError as any).data.message
                : "Failed to submit booking."}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
