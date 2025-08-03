import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { 
  Bell, 
  BellRing,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  Calendar
} from "lucide-react";

const getNotificationIcon = (type: string) => {
  const icons = {
    form_deadline: Clock,
    certificate_expiry: AlertTriangle,
    system_update: Info,
    approval_request: CheckCircle,
    general: MessageSquare
  };
  return icons[type as keyof typeof icons] || Bell;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: "text-blue-600 bg-blue-100",
    medium: "text-yellow-600 bg-yellow-100", 
    high: "text-orange-600 bg-orange-100",
    critical: "text-red-600 bg-red-100"
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const readCount = notifications?.filter(n => n.isRead).length || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Notifications" breadcrumb={["Home", "Notifications"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BellRing className="h-4 w-4" />
              <span>{unreadCount} unread</span>
            </div>
            <Button variant="outline" size="sm">
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <BellRing className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-green-600">{readCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading notifications...</div>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.notificationType);
                  const priorityClass = getPriorityColor(notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${priorityClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.notificationType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${priorityClass.split(' ')[0]}`}>
                              {notification.priority}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            {notification.readAt && (
                              <span className="text-green-600">
                                Read on {new Date(notification.readAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              Mark Read
                            </Button>
                          )}
                          
                          {notification.relatedEntityType && (
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up! No new notifications at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
