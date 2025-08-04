"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveBuildingLayout } from "@/components/layout/interactive-building-layout"
import {
  Building2,
  User,
  Bed,
  Calendar,
  FileText,
  LogOut,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useGetBookingsQuery } from "@/lib/store/api/booking/bookingApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { useGetUserQuery, useUpdateUserMutation } from "@/lib/store/api/user/userApi";

interface StudentDashboardProps {
  user: {
    id: string
    name: string
    role: string
    email: string
  }
  onLogout: () => void
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: userProfileData, isLoading: userProfileLoading } = useGetUserQuery(currentUser?.id, { skip: !currentUser?.id });
  const [editMode, setEditMode] = useState(false);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [formState, setFormState] = useState({ name: "", email: "", phone: "" });

  // When userProfileData changes, update formState
  useEffect(() => {
    if (userProfileData?.data?.user) {
      setFormState({
        name: userProfileData.data.user.name || "",
        email: userProfileData.data.user.email || "",
        phone: userProfileData.data.user.phone || "",
      });
    }
  }, [userProfileData]);

  const handleProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    await updateUser({ id: currentUser.id, data: formState });
    setEditMode(false);
  };

  const { data, isLoading, isError, error } = useGetBookingsQuery({ status: "all", page: 1, limit: 20 });
  const userBookings = data?.data?.bookings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hummingbird Tower</h1>
                  <p className="text-sm text-gray-600">Student Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationCenter userRole="student" />

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role.toUpperCase()}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Browse Beds
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Beds</CardTitle>
                  <CardDescription>Click on any available (green) bed to make a booking request</CardDescription>
                </CardHeader>
              </Card>
              <InteractiveBuildingLayout userRole="student" />
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Booking Requests</CardTitle>
                <CardDescription>Track the status of your bed booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <div className="py-8 text-center text-gray-500">Loading bookings...</div>}
                {isError && <div className="py-8 text-center text-red-500">Error loading bookings: {typeof error === 'object' && error && 'data' in error && (error as any).data?.message ? (error as any).data.message : "Unknown error"}</div>}
                {!isLoading && !isError && (
                  <div className="space-y-4">
                    {userBookings.length === 0 && <div className="text-center text-gray-500">No bookings found.</div>}
                    {userBookings.map((booking: any) => (
                      <div key={booking._id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bed className="h-5 w-5 text-gray-500" />
                            <div>
                              <h3 className="font-semibold">Bed {booking.bed?.bedId}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Submitted:</span>
                            <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                          {booking.approvedAt && (
                            <div>
                              <span className="font-medium text-gray-600">Approved:</span>
                              <p>{new Date(booking.approvedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                          {booking.rejectedAt && (
                            <div>
                              <span className="font-medium text-gray-600">Rejected:</span>
                              <p>{new Date(booking.rejectedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {booking.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {booking.rejectionReason}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {booking.status === "approved" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                          )}
                          {booking.status === "pending" && (
                            <Button size="sm" variant="outline">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Request
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>Manage your uploaded documents and download receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500">Document management coming soon.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfileLoading ? (
                    <div>Loading profile...</div>
                  ) : userProfileData?.data?.user ? (
                    <>
                      {editMode ? (
                        <form onSubmit={handleProfileEdit} className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <input className="w-full border rounded p-2" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <input className="w-full border rounded p-2" value={formState.email} onChange={e => setFormState({ ...formState, email: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <input className="w-full border rounded p-2" value={formState.phone} onChange={e => setFormState({ ...formState, phone: e.target.value })} />
                          </div>
                          <button type="submit" className="w-full bg-blue-600 text-white rounded p-2" disabled={isUpdating}>Save</button>
                          <button type="button" className="w-full mt-2 bg-gray-200 rounded p-2" onClick={() => setEditMode(false)}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <p className="font-semibold">{userProfileData.data.user.name}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="font-semibold">{userProfileData.data.user.email}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Roll Number</label>
                            <p className="font-semibold">{userProfileData.data.user.rollNo || "-"}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="font-semibold">{userProfileData.data.user.phone || "-"}</p>
                          </div>
                          <Button className="w-full" onClick={() => setEditMode(true)}>Edit Profile</Button>
                        </>
                      )}
                    </>
                  ) : (
                    <div>Profile not found.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Change Password
                  </Button>

                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Notification Preferences
                  </Button>

                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Privacy Settings
                  </Button>

                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Download My Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
