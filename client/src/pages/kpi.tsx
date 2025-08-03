import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiChart } from "@/components/charts/kpi-chart";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/hooks/use-auth";
import { type Kpi } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Download,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Ship,
  Calendar
} from "lucide-react";

const kpiColumns: ColumnDef<Kpi>[] = [
  {
    accessorKey: "name",
    header: "KPI",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-sm text-gray-500">{row.original.description}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return category ? (
        <Badge variant="outline">{category}</Badge>
      ) : (
        <span className="text-gray-400">Uncategorized</span>
      );
    },
  },
  {
    accessorKey: "targetValue",
    header: "Target",
    cell: ({ row }) => {
      const target = row.getValue("targetValue") as number;
      const unit = row.original.unit;
      return target ? `${target}${unit ? ` ${unit}` : ''}` : "N/A";
    },
  },
  {
    id: "currentValue",
    header: "Current Value",
    cell: ({ row }) => {
      // This would come from kpi_values table - mock for now
      const mockValue = Math.random() * 100;
      const unit = row.original.unit;
      return `${mockValue.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    },
  },
  {
    id: "trend",
    header: "Trend",
    cell: ({ row }) => {
      // Mock trend data
      const isPositive = Math.random() > 0.5;
      const percentage = (Math.random() * 20).toFixed(1);
      
      return (
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-medium">{isPositive ? '+' : '-'}{percentage}%</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      // Mock status based on target vs current
      const isOnTarget = Math.random() > 0.3;
      
      return (
        <Badge variant={isOnTarget ? 'default' : 'destructive'} className="flex items-center space-x-1 w-fit">
          {isOnTarget ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          <span>{isOnTarget ? 'On Target' : 'Above Target'}</span>
        </Badge>
      );
    },
  },
];

export default function Kpi() {
  const { user } = useAuth();

  const { data: kpis, isLoading } = useQuery<Kpi[]>({
    queryKey: ["/api/kpis"],
  });

  // Mock data for charts
  const incidentTrendData = [
    { name: 'Jan', incidents: 4, nearMisses: 12, deficiencies: 8 },
    { name: 'Feb', incidents: 3, nearMisses: 15, deficiencies: 6 },
    { name: 'Mar', incidents: 2, nearMisses: 8, deficiencies: 12 },
    { name: 'Apr', incidents: 5, nearMisses: 18, deficiencies: 4 },
    { name: 'May', incidents: 1, nearMisses: 6, deficiencies: 9 },
    { name: 'Jun', incidents: 3, nearMisses: 11, deficiencies: 7 },
  ];

  const performanceData = [
    { name: 'Excellent', value: 4 },
    { name: 'Good', value: 6 },
    { name: 'Average', value: 2 },
    { name: 'Needs Improvement', value: 0 },
  ];

  const complianceData = [
    { name: 'Jan', value: 87 },
    { name: 'Feb', value: 92 },
    { name: 'Mar', value: 89 },
    { name: 'Apr', value: 94 },
    { name: 'May', value: 91 },
    { name: 'Jun', value: 95 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="KPI & Statistics" breadcrumb={["Home", "KPI"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">KPI & Statistics</h2>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maritime-500">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Safety Incidents</h3>
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Incidents</span>
                  <span className="text-sm font-semibold">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Vessel Average</span>
                  <span className="text-sm font-semibold">1.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">vs Last Month</span>
                  <span className="text-sm font-semibold text-green-600">-12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Near Misses</h3>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Near Misses</span>
                  <span className="text-sm font-semibold">70</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Vessel Average</span>
                  <span className="text-sm font-semibold">5.8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">vs Last Month</span>
                  <span className="text-sm font-semibold text-red-600">+8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Deficiencies</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Deficiencies</span>
                  <span className="text-sm font-semibold">46</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Inspection</span>
                  <span className="text-sm font-semibold">3.8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className="text-sm font-semibold text-red-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Safety Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <KpiChart 
                data={incidentTrendData}
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

        {/* Compliance Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compliance Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <KpiChart 
              data={complianceData}
              type="bar"
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>

        {/* Detailed KPI Table */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading KPIs...</div>
              </div>
            ) : kpis && kpis.length > 0 ? (
              <DataTable 
                columns={kpiColumns} 
                data={kpis} 
                searchKey="name"
                searchPlaceholder="Search KPIs..."
              />
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPIs configured</h3>
                <p className="text-gray-500">KPIs will be automatically calculated based on form submissions and system data.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
