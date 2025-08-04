"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertTriangle, Wrench, CalendarIcon, Plus, Search, CheckCircle, Clock, XCircle, User, Bed } from "lucide-react"
import { format } from "date-fns"
import { useGetMaintenanceRequestsQuery } from "@/lib/store/api/maintenance/maintenanceApi";

export function MaintenanceManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const { data, isLoading, isError, error } = useGetMaintenanceRequestsQuery({
    status: statusFilter,
    priority: priorityFilter,
    search: searchTerm,
    page: 1,
    limit: 50,
  });
  const maintenanceRequests = data?.data?.maintenanceRequests || [];

  const [newRequest, setNewRequest] = useState({
    bedId: "",
    type: "",
    priority: "",
    description: "",
    assignedTo: "",
    estimatedCompletion: undefined as Date | undefined,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />
      case "in-progress":
        return <Wrench className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "scheduled":
        return <CalendarIcon className="h-3 w-3" />
      case "cancelled":
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  const filteredRequests = maintenanceRequests; // Filtering is now done by backend

  const stats = {
    total: maintenanceRequests.length,
    pending: maintenanceRequests.filter((r: any) => r.status === "pending").length,
    inProgress: maintenanceRequests.filter((r: any) => r.status === "in-progress").length,
    completed: maintenanceRequests.filter((r: any) => r.status === "completed").length,
    scheduled: maintenanceRequests.filter((r: any) => r.status === "scheduled").length,
  }

  const handleAddRequest = () => {
    console.log("Adding maintenance request:", newRequest)
    setShowAddModal(false)
    setNewRequest({
      bedId: "",
      type: "",
      priority: "",
      description: "",
      assignedTo: "",
      estimatedCompletion: undefined,
    })
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
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
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
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
                  placeholder="Search by bed ID, type, or description..."
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
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Maintenance Request</DialogTitle>
                  <DialogDescription>Create a new maintenance request for a bed</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bedId">Bed ID</Label>
                    <Input
                      id="bedId"
                      placeholder="e.g., F1R3B2"
                      value={newRequest.bedId}
                      onChange={(e) => setNewRequest({ ...newRequest, bedId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Maintenance Type</Label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the maintenance issue..."
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Team or person name"
                      value={newRequest.assignedTo}
                      onChange={(e) => setNewRequest({ ...newRequest, assignedTo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Estimated Completion</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newRequest.estimatedCompletion
                            ? format(newRequest.estimatedCompletion, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newRequest.estimatedCompletion}
                          onSelect={(date) => setNewRequest({ ...newRequest, estimatedCompletion: date })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddRequest} className="flex-1">
                      Create Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Track and manage all maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="py-8 text-center text-gray-500">Loading maintenance requests...</div>}
          {isError && <div className="py-8 text-center text-red-500">Error loading maintenance requests: {typeof error === 'object' && error && 'data' in error && (error as any).data?.message ? (error as any).data.message : JSON.stringify(error)}</div>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bed</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reported At</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Estimated Completion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request: any) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.bed?.bedId || request.bedId}</TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(request.priority)} w-fit`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(request.status)} w-fit`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.description}</TableCell>
                      <TableCell>{request.reportedBy?.name || request.reportedBy}</TableCell>
                      <TableCell>{request.reportedAt ? new Date(request.reportedAt).toLocaleString() : "-"}</TableCell>
                      <TableCell>{request.assignedTo?.name || request.assignedTo || "-"}</TableCell>
                      <TableCell>{request.estimatedCompletion ? new Date(request.estimatedCompletion).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        {/* Add action buttons here */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">No maintenance requests found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
