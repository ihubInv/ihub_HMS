"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveBuildingLayout } from "@/components/layout/interactive-building-layout"
import { BookingManagement } from "@/components/booking/booking-management"
import {
  Building2,
  Users,
  Bed,
  Calendar,
  Settings,
  Bell,
  LogOut,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import { MaintenanceManagement } from "@/components/admin/maintenance-management"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useGetBookingsQuery } from "@/lib/store/api/booking/bookingApi";
import { useGetDashboardStatsQuery } from "@/lib/store/api/dashboard/dashboardApi";

interface WardenDashboardProps {
  user: {
    id: string
    name: string
    role: string
    email: string
  }
  onLogout: () => void
}

export function WardenDashboard({ user, onLogout }: WardenDashboardProps) {
  const [activeTab, setActiveTab] = useState("layout")
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useGetDashboardStatsQuery();
  const stats = {
    todayCheckIns: statsData?.data?.todayCheckIns ?? 0,
    todayCheckOuts: statsData?.data?.todayCheckOuts ?? 0,
    occupied: statsData?.data?.bedStats?.occupied ?? 0,
    totalBeds: statsData?.data?.bedStats?.total ?? 0,
    pendingRequests: statsData?.data?.bookingStats?.pending ?? 0,
    activities: statsData?.activities ?? [],
  };

  // Fetch pending booking requests
  const { data: pendingData, isLoading: pendingLoading, isError: pendingError } = useGetBookingsQuery({ status: "pending", page: 1, limit: 10 });
  const pendingRequests = pendingData?.data?.bookings || [];

  // Remove the mock stats and pendingRequests arrays. Fetch real stats and pending requests from the backend using the appropriate API hooks. Display the real data instead of the hardcoded values.

  const handleApproveRequest = (requestId: string) => {
    console.log("Approving request:", requestId)
    // Handle approval logic
  }

  const handleRejectRequest = (requestId: string) => {
    console.log("Rejecting request:", requestId)
    // Handle rejection logic
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
                  <p className="text-sm text-gray-600">Warden Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationCenter userRole="warden" />

              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Building Layout
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {pendingLoading ? 'Loading...' : pendingRequests.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting your approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.todayCheckIns}
                  </div>
                  <p className="text-xs text-muted-foreground">Students checking in today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
                  <XCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.todayCheckOuts}
                  </div>
                  <p className="text-xs text-muted-foreground">Students checking out today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {((stats.occupied / stats.totalBeds) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.occupied} of {stats.totalBeds} beds
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common warden tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Pending Requests (
                    {stats.pendingRequests}
                    )
                  </Button>

                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Bed className="h-4 w-4 mr-2" />
                    Mark Beds for Maintenance
                  </Button>

                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manual Bed Assignment
                  </Button>

                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Override
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.activities.map((activity: any) => (
                      <div key={activity._id} className="border rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-600">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Booking Requests</CardTitle>
                <CardDescription>Review and approve or reject booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div>Loading...</div>
                ) : pendingError ? (
                  <div className="text-red-500">Error loading requests</div>
                ) : pendingRequests.length === 0 ? (
                  <div>No pending requests</div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request: any) => (
                      <div key={request._id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.student?.name || 'Unknown'}</h3>
                              <p className="text-sm text-gray-600">{request.student?.rollNo || ''}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Requested Bed:</span>
                            <p className="font-semibold">{request.bed?.bedId || request.bed || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Duration:</span>
                            <p>
                              {request.checkIn ? new Date(request.checkIn).toLocaleDateString() : ''} - {request.checkOut ? new Date(request.checkOut).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Submitted:</span>
                            <p>{request.createdAt ? new Date(request.createdAt).toLocaleString() : ''}</p>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 text-sm">Documents:</span>
                          <div className="flex gap-2 mt-1">
                            {(request.documents || []).map((doc: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => handleApproveRequest(request._id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request._id)} className="border-red-200 text-red-600 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline">
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

          <TabsContent value="layout">
            <InteractiveBuildingLayout userRole="warden" />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement userRole="warden" />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Warden Settings</CardTitle>
                  <CardDescription>Configure your warden preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Approval Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Working Hours
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Floor Management</CardTitle>
                  <CardDescription>Manage floor-specific settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Building2 className="h-4 w-4 mr-2" />
                    Floor Assignments
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Maintenance Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Room Configuration
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
