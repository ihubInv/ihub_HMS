"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, CheckCircle, AlertTriangle, Calendar, Settings, Mail, MessageSquare, X, Check } from "lucide-react"
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/lib/store/api/notificationsApi";

interface NotificationCenterProps {
  userRole: "admin" | "warden" | "student"
}

export function NotificationCenter({ userRole }: NotificationCenterProps) {
  // Remove local notifications state
  // const [notifications, setNotifications] = useState([...]);

  // Fetch notifications from API
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetNotificationsQuery({ page: 1, limit: 20 });
  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;
  const actionRequiredCount = notifications.filter((n: any) => n.actionRequired && !n.read).length;

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingAlerts: true,
    maintenanceAlerts: true,
    paymentAlerts: true,
    systemAlerts: false,
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "payment":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ id });
    refetch();
  };
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };
  const handleDeleteNotification = async (id: string) => {
    await deleteNotification({ id });
    refetch();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-xs px-1.5 py-0.5">{unreadCount}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>Stay updated with important notifications and alerts</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && <Badge className="bg-red-500 text-xs px-1.5 py-0.5">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading && <div className="py-8 text-center text-gray-500">Loading notifications...</div>}
            {isError && <div className="py-8 text-center text-red-500">Error loading notifications: {error && (error as any).data?.message ? (error as any).data.message : "Unknown error"}</div>}
            {!isLoading && !isError && (
              <>
                {actionRequiredCount > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">
                          {actionRequiredCount} notification{actionRequiredCount > 1 ? "s" : ""} require{actionRequiredCount === 1 ? "s" : ""} your attention
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <Card
                        key={notification._id}
                        className={`border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? "shadow-md" : "opacity-75"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>{notification.title}</h4>
                                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                  {notification.actionRequired && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">Action Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification._id)}>
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark read
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification._id)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="email">Email Notifications</Label>
                      </div>
                      <Switch
                        id="email"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="sms">SMS Notifications</Label>
                      </div>
                      <Switch
                        id="sms"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="push">Push Notifications</Label>
                      </div>
                      <Switch
                        id="push"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="booking">Booking Alerts</Label>
                      </div>
                      <Switch
                        id="booking"
                        checked={settings.bookingAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, bookingAlerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="maintenance">Maintenance Alerts</Label>
                      </div>
                      <Switch
                        id="maintenance"
                        checked={settings.maintenanceAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceAlerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="payment">Payment Alerts</Label>
                      </div>
                      <Switch
                        id="payment"
                        checked={settings.paymentAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, paymentAlerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="system">System Alerts</Label>
                      </div>
                      <Switch
                        id="system"
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
