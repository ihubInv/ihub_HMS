"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingModal } from "@/components/booking/booking-modal"
import { BedDetailsModal } from "@/components/booking/bed-details-modal"
import { Search, Users, Home, Bed } from "lucide-react"
import { useGetBuildingLayoutQuery } from "@/lib/store/api/base/baseApi"

interface BedType {
  _id: string // MongoDB ObjectId
  id: string
  floorId: string
  roomId: string
  bedNumber: number
  status: "available" | "booked" | "occupied" | "reserved" | "maintenance" | "pending"
  occupant?: {
    name: string
    rollNo: string
    checkIn: string
    checkOut: string
  }
}

interface Room {
  id: string
  floorId: string
  roomNumber: number
  beds: BedType[]
  capacity: number
}

interface Floor {
  id: string
  floorNumber: number
  rooms: Room[]
}

interface InteractiveBuildingLayoutProps {
  userRole: "admin" | "warden" | "student"
  onBookingRequest?: (bedId: string) => void
}

export function InteractiveBuildingLayout({ userRole, onBookingRequest }: InteractiveBuildingLayoutProps) {
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [floorFilter, setFloorFilter] = useState("all")

  // Fetch building layout from backend
  const { data: floors = [], isLoading, error } = useGetBuildingLayoutQuery();

  useEffect(() => {
    if (!selectedBed) {
      setShowBookingModal(false);
      setShowDetailsModal(false);
    }
  }, [selectedBed]);

  if (isLoading) return <div>Loading building layout...</div>;
  if (error) return <div>Error loading building layout.</div>;

  const getBedStatusColor = (status: BedType["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600"
      case "booked":
        return "bg-red-500 hover:bg-red-600"
      case "occupied":
        return "bg-blue-500 hover:bg-blue-600"
      case "reserved":
        return "bg-purple-500 hover:bg-purple-600"
      case "maintenance":
        return "bg-gray-500 hover:bg-gray-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-300"
    }
  }

  const getBedStatusText = (status: BedType["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "booked":
        return "Booked"
      case "occupied":
        return "Occupied"
      case "reserved":
        return "Reserved"
      case "maintenance":
        return "Maintenance"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  const handleBedClick = (bed: BedType) => {
    setSelectedBed(bed)

    if (bed.status === "available" && userRole === "student") {
      setShowBookingModal(true)
    } else {
      setShowDetailsModal(true)
    }
  }

  const filteredFloors = floors.map((floor) => ({
    ...floor,
    rooms: floor.rooms.filter((room) => {
      if (floorFilter !== "all" && floor.floorNumber.toString() !== floorFilter) {
        return false
      }

      return room.beds.some((bed) => {
        if (statusFilter !== "all" && bed.status !== statusFilter) {
          return false
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            bed.id.toLowerCase().includes(searchLower) ||
            bed.occupant?.name.toLowerCase().includes(searchLower) ||
            bed.occupant?.rollNo.toLowerCase().includes(searchLower)
          )
        }

        return true
      })
    }),
  }))

  const getStats = () => {
    let available = 0,
      booked = 0,
      occupied = 0,
      reserved = 0,
      maintenance = 0,
      pending = 0

    floors.forEach((floor) => {
      floor.rooms.forEach((room) => {
        room.beds.forEach((bed) => {
          switch (bed.status) {
            case "available":
              available++
              break
            case "booked":
              booked++
              break
            case "occupied":
              occupied++
              break
            case "reserved":
              reserved++
              break
            case "maintenance":
              maintenance++
              break
            case "pending":
              pending++
              break
          }
        })
      })
    })

    return {
      available,
      booked,
      occupied,
      reserved,
      maintenance,
      pending,
      total: available + booked + occupied + reserved + maintenance + pending,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.booked}</div>
            <div className="text-sm text-gray-600">Booked</div>
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
            <div className="text-2xl font-bold text-purple-600">{stats.reserved}</div>
            <div className="text-sm text-gray-600">Reserved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.maintenance}</div>
            <div className="text-sm text-gray-600">Maintenance</div>
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
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by bed ID, name, or roll number..."
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {filteredFloors.map((floor) => (
          <Card key={floor.id} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Home className="h-5 w-5" />
                Floor {floor.floorNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {floor.rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Room {room.roomNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {room.capacity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {room.beds.map((bed) => (
                        <button
                          key={bed._id || bed.id}
                          onClick={() => handleBedClick(bed)}
                          className={`
                            relative p-2 rounded text-white text-xs font-medium transition-all duration-200
                            ${getBedStatusColor(bed.status)}
                            transform hover:scale-105 active:scale-95
                            ${bed.status === "available" ? "cursor-pointer" : "cursor-default"}
                          `}
                          title={`${bed.id} - ${getBedStatusText(bed.status)}`}
                        >
                          <Bed className="h-3 w-3 mx-auto mb-1" />
                          <div className="text-xs">{bed.bedNumber}</div>
                          {bed.occupant && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      {showBookingModal && selectedBed && (
        <BookingModal
          bed={selectedBed}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedBed(null)
          }}
          onSubmit={(bookingData) => {
            console.log("Booking submitted:", bookingData)
            setShowBookingModal(false)
            setSelectedBed(null)
            onBookingRequest?.(selectedBed.id)
          }}
        />
      )}

      {showDetailsModal && selectedBed && (
        <>
          {!selectedBed._id && (
            <div className="text-red-500 text-xs mb-2">Warning: Bed is missing _id. Bed details may not load correctly.</div>
          )}
          <BedDetailsModal
            bedId={selectedBed._id}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedBed(null)
            }}
            userRole={userRole}
          />
        </>
      )}
    </div>
  )
}
