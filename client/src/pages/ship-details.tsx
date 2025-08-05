import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  Ship, 
  Calendar,
  FileText,
  Tag,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Anchor
} from "lucide-react";
import { Certificate, FormSubmission } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";

interface ShipDetails {
  id: string;
  name: string;
  imoNumber: string;
  shipType: string;
  isActive: boolean;
  lastSync: string | null;
  flagState: string;
  buildYear: number;
  grossTonnage: number;
  classification: string;
}

export default function ShipDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: ship, isLoading: shipLoading } = useQuery<ShipDetails>({
    queryKey: [`/api/ships/${id}`],
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: [`/api/certificates?shipId=${id}`],
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<FormSubmission[]>({
    queryKey: [`/api/form-submissions?shipId=${id}`],
  });

  const certificateColumns: ColumnDef<Certificate>[] = [
    {
      accessorKey: "name",
      header: "Certificate Name",
    },
    {
      accessorKey: "issuer",
      header: "Issuer",
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("expiryDate"));
        const now = new Date();
        const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        return (
          <div className="flex items-center space-x-2">
            <span>{date.toLocaleDateString()}</span>
            {daysUntilExpiry <= 30 && (
              <Badge variant="destructive" className="text-xs">
                {daysUntilExpiry} days
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "valid" ? "default" : "destructive"}>
            {status}
          </Badge>
        );
      },
    },
  ];

  const submissionColumns: ColumnDef<FormSubmission>[] = [
    {
      accessorKey: "formTitle",
      header: "Form",
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted",
      cell: ({ row }) => new Date(row.getValue("submittedAt")).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "approved" ? "default" : 
                      status === "rejected" ? "destructive" : "secondary";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  if (shipLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Loading..." breadcrumb={["Home", "Ships", "Loading..."]} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading ship details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!ship) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Ship Not Found" breadcrumb={["Home", "Ships", "Not Found"]} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Ship not found</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={ship.name} 
        breadcrumb={["Home", "Ships", ship.name]}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Ship Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center mt-1">
                    {ship.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium">Online</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-red-600 font-medium">Offline</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-maritime-100 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-maritime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Sync</p>
                  <p className="text-lg font-bold text-gray-900">
                    {ship.lastSync ? new Date(ship.lastSync).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">IMO Number</p>
                  <p className="text-lg font-bold text-gray-900">{ship.imoNumber}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Ship className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ship Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ship Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Ship Type</p>
                <p className="text-sm text-gray-900">{ship.shipType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Flag State</p>
                <p className="text-sm text-gray-900">{ship.flagState || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Build Year</p>
                <p className="text-sm text-gray-900">{ship.buildYear || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Gross Tonnage</p>
                <p className="text-sm text-gray-900">{ship.grossTonnage ? `${ship.grossTonnage} GT` : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {certificatesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading certificates...</div>
              </div>
            ) : (
              <DataTable 
                columns={certificateColumns} 
                data={certificates || []} 
                searchKey="name"
                searchPlaceholder="Search certificates..."
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Form Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading submissions...</div>
              </div>
            ) : (
              <DataTable 
                columns={submissionColumns} 
                data={submissions || []} 
                searchKey="formTitle"
                searchPlaceholder="Search submissions..."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}