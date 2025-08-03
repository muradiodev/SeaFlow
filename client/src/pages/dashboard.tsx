import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { KpiChart } from "@/components/charts/kpi-chart";
import { 
  Ship, 
  CheckCircle, 
  AlertTriangle, 
  Tag,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Users
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface FleetShip {
  id: string;
  name: string;
  imoNumber: string;
  shipType: string;
  isActive: boolean;
  lastSync: string | null;
}

interface DashboardStats {
  totalShips: number;
  activeShips: number;
  pendingForms: number;
  expiringCertificates: number;
}

const fleetColumns: ColumnDef<FleetShip>[] = [
  {
    accessorKey: "name",
    header: "Ship Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="bg-maritime-100 p-2 rounded-lg mr-3">
          <Ship className="h-4 w-4 text-maritime-600" />
        </div>
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-gray-500">{row.original.shipType}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "imoNumber",
    header: "IMO",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "destructive"}>
        {row.getValue("isActive") ? "Online" : "Offline"}
      </Badge>
    ),
  },
  {
    accessorKey: "lastSync",
    header: "Last Sync",
    cell: ({ row }) => {
      const lastSync = row.getValue("lastSync") as string | null;
      if (!lastSync) return "Never";
      return new Date(lastSync).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button variant="ghost" size="sm">
          Notify
        </Button>
      </div>
    ),
  },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: fleet, isLoading: fleetLoading } = useQuery<FleetShip[]>({
    queryKey: ["/api/dashboard/fleet"],
  });

  // Mock data for charts
  const trendData = [
    { name: 'Jan', incidents: 4, nearMisses: 12 },
    { name: 'Feb', incidents: 3, nearMisses: 15 },
    { name: 'Mar', incidents: 2, nearMisses: 8 },
    { name: 'Apr', incidents: 5, nearMisses: 18 },
    { name: 'May', incidents: 1, nearMisses: 6 },
    { name: 'Jun', incidents: 3, nearMisses: 11 },
  ];

  const performanceData = [
    { name: 'Excellent', value: 4 },
    { name: 'Good', value: 6 },
    { name: 'Average', value: 2 },
    { name: 'Below Average', value: 0 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" breadcrumb={["Home", "Dashboard"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Fleet</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.totalShips || 0}
                  </p>
                </div>
                <div className="bg-maritime-100 p-3 rounded-lg">
                  <Ship className="h-6 w-6 text-maritime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Ships</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statsLoading ? "..." : stats?.activeShips || 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Forms</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {statsLoading ? "..." : stats?.pendingForms || 0}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Certificates</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statsLoading ? "..." : stats?.expiringCertificates || 0}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Tag className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Status Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fleet Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {fleetLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading fleet data...</div>
              </div>
            ) : (
              <DataTable 
                columns={fleetColumns} 
                data={fleet || []} 
                searchKey="name"
                searchPlaceholder="Search ships..."
              />
            )}
          </CardContent>
        </Card>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Incident Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <KpiChart 
                data={trendData}
                type="line"
                dataKey="incidents"
                nameKey="name"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fleet Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <KpiChart 
                data={performanceData}
                type="pie"
                dataKey="value"
                nameKey="name"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Safety Drill Form Completed</p>
                    <p className="text-sm text-gray-500">MV Atlantic Star • 2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tag Expiring Soon</p>
                    <p className="text-sm text-gray-500">MV Ocean Voyager • Safety Management Tag • 30 days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Form Created</p>
                    <p className="text-sm text-gray-500">Quarterly Environmental Report • DPA Admin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">Form Completion Rate</span>
                    <span className="text-sm font-semibold text-green-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">Tag Compliance</span>
                    <span className="text-sm font-semibold text-maritime-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-maritime-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">Fleet Connectivity</span>
                    <span className="text-sm font-semibold text-amber-600">73%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
