import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/hooks/use-auth";
import { ColumnDef } from "@tanstack/react-table";
import { 
  ClipboardList, 
  Shield,
  User,
  Calendar,
  Activity,
  FileText,
  Settings,
  Ship
} from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          <div>{new Date(date).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(date).toLocaleTimeString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium">{row.getValue("userId")}</div>
          <div className="text-sm text-gray-500">User ID</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const variants = {
        CREATE: { variant: "default" as const, color: "text-green-600" },
        UPDATE: { variant: "secondary" as const, color: "text-blue-600" },
        DELETE: { variant: "destructive" as const, color: "text-red-600" },
        LOGIN: { variant: "outline" as const, color: "text-gray-600" },
        LOGOUT: { variant: "outline" as const, color: "text-gray-600" }
      };
      const config = variants[action as keyof typeof variants] || variants.UPDATE;
      
      return (
        <Badge variant={config.variant}>
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity Type",
    cell: ({ row }) => {
      const entityType = row.getValue("entityType") as string;
      const icons = {
        user: User,
        ship: Ship,
        certificate: Shield,
        form: FileText,
        form_submission: FileText,
        manual: ClipboardList,
        notification: Activity
      };
      const Icon = icons[entityType as keyof typeof icons] || Settings;
      
      return (
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="capitalize">{entityType.replace('_', ' ')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => {
      const ip = row.getValue("ipAddress") as string;
      return ip || "N/A";
    },
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const hasChanges = row.original.oldValues || row.original.newValues;
      return hasChanges ? (
        <button className="text-blue-600 hover:text-blue-800 text-sm">
          View Changes
        </button>
      ) : (
        <span className="text-gray-400 text-sm">No details</span>
      );
    },
  },
];

export default function Logs() {
  const { user } = useAuth();

  // Only DPA and Superintendent can access audit logs
  if (user?.role !== 'dpa' && user?.role !== 'superintendent') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Access Denied" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access audit logs.</p>
          </div>
        </main>
      </div>
    );
  }

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const stats = logs ? {
    total: logs.length,
    today: logs.filter(log => log.createdAt.split('T')[0] === today).length,
    thisWeek: logs.filter(log => log.createdAt >= thisWeek).length,
    users: new Set(logs.map(log => log.userId)).size,
  } : { total: 0, today: 0, thisWeek: 0, users: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="History of Logs" breadcrumb={["Home", "Audit Logs"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <div className="text-sm text-gray-500">
            Complete system activity tracking
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-maritime-600">{stats.today}</p>
                </div>
                <div className="bg-maritime-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-maritime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.users}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading audit logs...</div>
              </div>
            ) : logs && logs.length > 0 ? (
              <DataTable 
                columns={auditLogColumns} 
                data={logs} 
                searchKey="action"
                searchPlaceholder="Search actions..."
              />
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs</h3>
                <p className="text-gray-500">System activity will appear here once users start using the platform.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
