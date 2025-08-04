"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveBuildingLayout } from "@/components/layout/interactive-building-layout"
import { BookingManagement } from "@/components/booking/booking-management"
import { UserManagement } from "@/components/admin/user-management"
import {
  Building2,
  Users,
  Bed,
  Calendar,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  Shield,
  FileText,
  Download,
} from "lucide-react"
import { MaintenanceManagement } from "@/components/admin/maintenance-management"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useGetDashboardStatsQuery } from "@/lib/store/api/dashboard/dashboardApi";

interface AdminDashboardProps {
  user: {
    id: string
    name: string
    role: string
    email: string
  }
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("layout")
  const { data, isLoading, isError, error } = useGetDashboardStatsQuery();
  const stats = {
    totalBeds: data?.data?.bedStats?.total ?? 0,
    occupied: data?.data?.bedStats?.occupied ?? 0,
    available: data?.data?.bedStats?.available ?? 0,
    maintenance: data?.data?.bedStats?.maintenance ?? 0,
    pendingRequests: data?.data?.bookingStats?.pending ?? 0,
    totalUsers: data?.data?.userStats?.total ?? 0,
  };

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
                  <p className="text-sm text-gray-600">Admin Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationCenter userRole="admin" />

              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
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
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isLoading && <div className="py-8 text-center text-gray-500">Loading dashboard stats...</div>}
            {isError && (
              <div className="py-8 text-center text-red-500">
                Error loading stats: {typeof error === 'object' && error && 'data' in error && (error as any).data?.message
                  ? (error as any).data.message
                  : typeof error === 'object' && error && 'message' in error
                  ? (error as any).message
                  : "Unknown error"}
              </div>
            )}
            {!isLoading && !isError && (
              <>
                {/* Debug: Show raw data if stats are all zero */}
                {stats.totalBeds === 0 && stats.occupied === 0 && stats.available === 0 && (
                  <div className="py-4 text-xs text-orange-600">
                    <b>Debug:</b> No stats data. Raw API response:<br />
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </div>
                )}
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                      <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalBeds}</div>
                      <p className="text-xs text-muted-foreground">Across 5 floors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalBeds > 0 ? ((stats.occupied / stats.totalBeds) * 100).toFixed(1) : 0}% occupancy
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available</CardTitle>
                      <Bed className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                      <p className="text-xs text-muted-foreground">Ready for booking</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>Latest booking requests and approvals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(data?.activities ?? []).map((activity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{activity.name || ""}</p>
                              <p className="text-sm text-gray-600">Bed {activity.bed || ""}</p>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={
                                  activity.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : activity.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {activity.status || ""}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{activity.time || ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Alerts</CardTitle>
                      <CardDescription>Important notifications and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(data?.notificationStats?.recent ?? []).map((alert: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                alert.priority === "high"
                                  ? "bg-red-500"
                                  : alert.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm">{alert.message || ""}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {alert.type || ""} • {alert.priority || ""} priority
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="layout">
            <InteractiveBuildingLayout userRole="admin" />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement userRole="admin" />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Export data and generate various reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Occupancy Report</span>
                      </div>
                      <p className="text-xs text-gray-600">Current bed occupancy status</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Booking History</span>
                      </div>
                      <p className="text-xs text-gray-600">All booking records</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">User Report</span>
                      </div>
                      <p className="text-xs text-gray-600">User registration and activity</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Financial Report</span>
                      </div>
                      <p className="text-xs text-gray-600">Revenue and payment tracking</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Maintenance Log</span>
                      </div>
                      <p className="text-xs text-gray-600">Maintenance history and schedules</p>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Audit Log</span>
                      </div>
                      <p className="text-xs text-gray-600">System access and changes</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    General Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Maintenance</CardTitle>
                  <CardDescription>System maintenance and data backup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    System Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Building2 className="h-4 w-4 mr-2" />
                    Building Configuration
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
