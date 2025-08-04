"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, CalendarIcon, BarChart3, TrendingUp, Users, Bed, FileText, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"
import {
  useGetOccupancyReportQuery,
  useGetFinancialReportQuery,
  useGetMaintenanceReportQuery,
  useGetDemographicsReportQuery,
  useGetBookingsReportQuery,
} from "@/lib/store/api/reportApi";

export function ReportsDashboard() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [reportType, setReportType] = useState("occupancy")

  // Fetch live report data
  const startDate = dateRange.from ? dateRange.from.toISOString() : undefined;
  const endDate = dateRange.to ? dateRange.to.toISOString() : undefined;

  const {
    data: occupancyReport,
    isLoading: occupancyLoading,
    error: occupancyError,
  } = useGetOccupancyReportQuery({ startDate, endDate });

  const {
    data: financialReport,
    isLoading: financialLoading,
    error: financialError,
  } = useGetFinancialReportQuery({ startDate, endDate });

  const {
    data: maintenanceReport,
    isLoading: maintenanceLoading,
    error: maintenanceError,
  } = useGetMaintenanceReportQuery({ startDate, endDate });

  const {
    data: demographicsReport,
    isLoading: demographicsLoading,
    error: demographicsError,
  } = useGetDemographicsReportQuery({ startDate, endDate });

  const {
    data: bookingsReport,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useGetBookingsReportQuery({ startDate, endDate, status: 'all' });

  // Helper: Map backend data for floor occupancy
  const floorOccupancy = occupancyReport?.data?.floorOccupancy?.map((floor: any) => ({
    floor: `Floor ${floor._id}`,
    occupied: floor.occupied,
    total: floor.total,
    percentage: floor.total ? ((floor.occupied / floor.total) * 100).toFixed(1) : 0,
  })) || [];

  // Helper: Map backend data for occupancy trends
  const occupancyData = occupancyReport?.data?.monthlyTrends?.map((trend: any) => ({
    month: `${trend._id.month}/${trend._id.year}`,
    occupied: trend.bookings, // bookings = occupied for the month
    available: null, // Not directly available
    maintenance: null, // Not directly available
  })) || [];

  // Helper: Map backend data for revenue trends
  const revenueData = financialReport?.data?.monthlyRevenue?.map((item: any) => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.totalRevenue,
    expenses: (financialReport?.data?.maintenanceCosts?.find((m: any) => m._id.month === item._id.month && m._id.year === item._id.year)?.totalCost) || 0,
  })) || [];

  const topReports = [
    {
      title: "Monthly Occupancy Report",
      description: "Detailed bed occupancy statistics by floor and room",
      type: "occupancy",
      lastGenerated: "2024-01-20",
      downloads: 45,
    },
    {
      title: "Revenue Analysis",
      description: "Financial performance and payment tracking",
      type: "financial",
      lastGenerated: "2024-01-19",
      downloads: 32,
    },
    {
      title: "Student Demographics",
      description: "User registration and demographic analysis",
      type: "demographics",
      lastGenerated: "2024-01-18",
      downloads: 28,
    },
    {
      title: "Maintenance Summary",
      description: "Maintenance requests and completion rates",
      type: "maintenance",
      lastGenerated: "2024-01-17",
      downloads: 21,
    },
  ]

  const handleGenerateReport = (type: string) => {
    console.log(`Generating ${type} report for date range:`, dateRange)
    // Implement report generation logic
  }

  const handleDownloadReport = (reportTitle: string) => {
    console.log(`Downloading report: ${reportTitle}`)
    // Implement download logic
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Select date range and report type to generate custom reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupancy">Occupancy Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  <SelectItem value="demographics">Demographics Report</SelectItem>
                  <SelectItem value="booking">Booking History</SelectItem>
                  <SelectItem value="audit">Audit Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => handleGenerateReport(reportType)}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {financialLoading ? 'Loading...' : financialError ? 'Error' :
                        financialReport?.data?.summary?.totalRevenue !== undefined ?
                        `₹${financialReport.data.summary.totalRevenue.toLocaleString()}` : '--'}
                    </p>
                    {/* You can add a trend indicator if you calculate it from monthlyRevenue */}
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold">
                      {occupancyLoading ? 'Loading...' : occupancyError ? 'Error' :
                        occupancyReport?.data?.summary?.occupancyRate !== undefined ?
                        `${occupancyReport.data.summary.occupancyRate}%` : '--'}
                    </p>
                  </div>
                  <Bed className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold">
                      {occupancyLoading ? 'Loading...' : occupancyError ? 'Error' :
                        occupancyReport?.data?.summary?.occupiedBeds !== undefined ?
                        occupancyReport.data.summary.occupiedBeds : '--'}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Stay Duration</p>
                    <p className="text-2xl font-bold">
                      {financialLoading ? 'Loading...' : financialError ? 'Error' :
                        financialReport?.data?.monthlyRevenue?.length ?
                        `${(
                          financialReport.data.monthlyRevenue.reduce((acc: number, cur: any) => acc + (cur.bookingCount || 0), 0) /
                          (financialReport.data.monthlyRevenue.length || 1)
                        ).toFixed(1)} months` : '--'}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Reports</CardTitle>
              <CardDescription>Most frequently generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {report.downloads} downloads
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.title)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          {/* Floor-wise Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle>Floor-wise Occupancy</CardTitle>
              <CardDescription>Current occupancy status by floor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {floorOccupancy.map((floor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{floor.floor}</span>
                      <span className="text-sm text-gray-600">
                        {floor.occupied}/{floor.total} beds ({floor.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${floor.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
              <CardDescription>Monthly occupancy patterns over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {occupancyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{data.month} 2024</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Occupied: {data.occupied}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Available: {data.available}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm">Maintenance: {data.maintenance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and expense tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialLoading ? (
                  <div>Loading...</div>
                ) : financialError ? (
                  <div>Error loading financial data</div>
                ) : revenueData.length === 0 ? (
                  <div>No data available</div>
                ) : revenueData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{data.month}</span>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-sm text-gray-600">Revenue: </span>
                        <span className="font-semibold text-green-600">₹{data.revenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Expenses: </span>
                        <span className="font-semibold text-red-600">₹{data.expenses.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Profit: </span>
                        <span className="font-semibold text-blue-600">
                          ₹{(data.revenue - data.expenses).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Current payment collection status</CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <div>Loading...</div>
              ) : financialError ? (
                <div>Error loading payment status</div>
              ) : financialReport?.data?.paymentStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {financialReport.data.paymentStatus.map((status: any, idx: number) => (
                    <div key={idx} className={`text-center p-4 rounded-lg ${status._id === 'paid' ? 'bg-green-50 text-green-600' : status._id === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                      <div className="text-2xl font-bold">₹{status.amount.toLocaleString()}</div>
                      <div className="text-sm">{status._id.charAt(0).toUpperCase() + status._id.slice(1)} ({status.count})</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No payment status data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {/* Maintenance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {maintenanceLoading ? 'Loading...' : maintenanceError ? 'Error' : maintenanceReport?.data?.summary?.pendingRequests ?? '--'}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {maintenanceLoading ? 'Loading...' : maintenanceError ? 'Error' : maintenanceReport?.data?.maintenanceByStatus?.find((s: any) => s._id === 'in_progress')?.count ?? '--'}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {maintenanceLoading ? 'Loading...' : maintenanceError ? 'Error' : maintenanceReport?.data?.summary?.completedRequests ?? '--'}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {maintenanceLoading ? 'Loading...' : maintenanceError ? 'Error' : (maintenanceReport?.data?.maintenanceByPriority?.reduce((acc: number, cur: any) => acc + (cur.avgResolutionTime || 0), 0) / (maintenanceReport?.data?.maintenanceByPriority?.length || 1)).toFixed(1) + ' days'}
                </div>
                <div className="text-sm text-gray-600">Avg. Resolution</div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance by Type</CardTitle>
              <CardDescription>Breakdown of maintenance requests by category</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <div>Loading...</div>
              ) : maintenanceError ? (
                <div>Error loading maintenance data</div>
              ) : maintenanceReport?.data?.maintenanceByType ? (
                <div className="space-y-3">
                  {maintenanceReport.data.maintenanceByType.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item._id}</span>
                        <Badge variant="outline">{item.count} requests</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((item.count / (maintenanceReport.data.summary?.totalRequests || 1)) * 100).toFixed(1)}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{((item.count / (maintenanceReport.data.summary?.totalRequests || 1)) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No maintenance type data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Demographics Summary</CardTitle>
              <CardDescription>Active/inactive users, role distribution, and registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              {demographicsLoading ? (
                <div>Loading...</div>
              ) : demographicsError ? (
                <div>Error loading demographics data</div>
              ) : demographicsReport?.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{demographicsReport.data.summary?.totalUsers ?? '--'}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{demographicsReport.data.summary?.activeUsers ?? '--'}</div>
                      <div className="text-sm text-green-700">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{demographicsReport.data.summary?.inactiveUsers ?? '--'}</div>
                      <div className="text-sm text-red-700">Inactive</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Role Distribution</h4>
                    <div className="flex flex-wrap gap-4">
                      {demographicsReport.data.roleDistribution?.map((role: any, idx: number) => (
                        <div key={idx} className="p-2 border rounded-lg min-w-[120px] text-center">
                          <div className="font-bold">{role._id}</div>
                          <div>{role.count} users</div>
                          <div className="text-green-600 text-xs">Active: {role.active}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Registration Trends</h4>
                    <div className="space-y-1">
                      {demographicsReport.data.registrationTrends?.map((trend: any, idx: number) => (
                        <div key={idx} className="flex gap-4 text-sm">
                          <span>{trend._id.month}/{trend._id.year} ({trend._id.role}):</span>
                          <span>{trend.count} registrations</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>No demographics data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking History Report</CardTitle>
              <CardDescription>Booking stats, monthly trends, and recent bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div>Loading...</div>
              ) : bookingsError ? (
                <div>Error loading bookings data</div>
              ) : bookingsReport?.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{bookingsReport.data.summary?.totalBookings ?? '--'}</div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{bookingsReport.data.summary?.totalRevenue?.toLocaleString() ?? '--'}</div>
                      <div className="text-sm text-green-700">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{bookingsReport.data.summary?.avgBookingDuration?.toFixed(1) ?? '--'} days</div>
                      <div className="text-sm text-blue-700">Avg. Duration</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Booking Stats by Status</h4>
                    <div className="flex flex-wrap gap-4">
                      {bookingsReport.data.bookingStats?.map((stat: any, idx: number) => (
                        <div key={idx} className="p-2 border rounded-lg min-w-[120px] text-center">
                          <div className="font-bold">{stat._id}</div>
                          <div>{stat.count} bookings</div>
                          <div className="text-green-600 text-xs">Total: ₹{stat.totalAmount?.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Monthly Booking Trends</h4>
                    <div className="space-y-1">
                      {bookingsReport.data.monthlyBookings?.map((trend: any, idx: number) => (
                        <div key={idx} className="flex gap-4 text-sm">
                          <span>{trend._id.month}/{trend._id.year}:</span>
                          <span>{trend.count} bookings, ₹{trend.revenue?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recent Bookings</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border">Student</th>
                            <th className="p-2 border">Bed</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Check In</th>
                            <th className="p-2 border">Check Out</th>
                            <th className="p-2 border">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingsReport.data.recentBookings?.map((booking: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 border">{booking.student?.name ?? '--'}</td>
                              <td className="p-2 border">{booking.bed?.bedId ?? '--'}</td>
                              <td className="p-2 border">{booking.status}</td>
                              <td className="p-2 border">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '--'}</td>
                              <td className="p-2 border">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '--'}</td>
                              <td className="p-2 border">₹{booking.totalAmount?.toLocaleString() ?? '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div>No bookings data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
