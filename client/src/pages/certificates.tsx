import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tag } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Tag as CertificateIcon, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Plus,
  Shield,
  FileText,
  Calendar
} from "lucide-react";

const certificateColumns: ColumnDef<Tag>[] = [
  {
    accessorKey: "certificateName",
    header: "Tag",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Shield className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium">{row.getValue("certificateName")}</div>
          <div className="text-sm text-gray-500">{row.original.certificateNumber}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "certificateType",
    header: "Type",
  },
  {
    accessorKey: "issuingAuthority",
    header: "Issuing Authority",
  },
  {
    accessorKey: "issueDate",
    header: "Issue Date",
    cell: ({ row }) => {
      const date = row.getValue("issueDate") as string;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const date = row.getValue("expiryDate") as string;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        valid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
        expiring_soon: { variant: "secondary" as const, icon: AlertTriangle, color: "text-amber-600" },
        expired: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
      };
      const config = variants[status as keyof typeof variants] || variants.valid;
      const Icon = config.icon;
      
      return (
        <Badge variant={config.variant} className="flex items-center space-x-1">
          <Icon className="h-3 w-3" />
          <span>{status.replace('_', ' ')}</span>
        </Badge>
      );
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
          Edit
        </Button>
      </div>
    ),
  },
];

export default function Certificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    certificateName: "",
    certificateType: "",
    certificateNumber: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    shipId: ""
  });

  const { data: certificates, isLoading } = useQuery<Tag[]>({
    queryKey: ["/api/certificates"],
  });

  const { data: ships } = useQuery({
    queryKey: ["/api/ships"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/certificates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      setIsDialogOpen(false);
      setNewCertificate({
        certificateName: "",
        certificateType: "",
        certificateNumber: "",
        issuingAuthority: "",
        issueDate: "",
        expiryDate: "",
        shipId: ""
      });
      toast({
        title: "Tag created",
        description: "The certificate has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create certificate.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCertificate);
  };

  // Calculate stats
  const stats = certificates ? {
    total: certificates.length,
    valid: certificates.filter(c => c.status === 'valid').length,
    expiring: certificates.filter(c => c.status === 'expiring_soon').length,
    expired: certificates.filter(c => c.status === 'expired').length,
  } : { total: 0, valid: 0, expiring: 0, expired: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Certificates" breadcrumb={["Home", "Certificates"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tag Management</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-maritime-600 hover:bg-maritime-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Tag</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateName">Tag Name</Label>
                    <Input
                      id="certificateName"
                      value={newCertificate.certificateName}
                      onChange={(e) => setNewCertificate({...newCertificate, certificateName: e.target.value})}
                      placeholder="Enter certificate name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateType">Tag Type</Label>
                    <Input
                      id="certificateType"
                      value={newCertificate.certificateType}
                      onChange={(e) => setNewCertificate({...newCertificate, certificateType: e.target.value})}
                      placeholder="Enter certificate type"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateNumber">Tag Number</Label>
                    <Input
                      id="certificateNumber"
                      value={newCertificate.certificateNumber}
                      onChange={(e) => setNewCertificate({...newCertificate, certificateNumber: e.target.value})}
                      placeholder="Enter certificate number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                    <Input
                      id="issuingAuthority"
                      value={newCertificate.issuingAuthority}
                      onChange={(e) => setNewCertificate({...newCertificate, issuingAuthority: e.target.value})}
                      placeholder="Enter issuing authority"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newCertificate.issueDate}
                      onChange={(e) => setNewCertificate({...newCertificate, issueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newCertificate.expiryDate}
                      onChange={(e) => setNewCertificate({...newCertificate, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipId">Ship</Label>
                  <Select value={newCertificate.shipId} onValueChange={(value) => setNewCertificate({...newCertificate, shipId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ship" />
                    </SelectTrigger>
                    <SelectContent>
                      {ships?.map((ship: any) => (
                        <SelectItem key={ship.id} value={ship.id}>
                          {ship.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-maritime-600 hover:bg-maritime-700"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Tag"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CertificateIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
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
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.expiring}</p>
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
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading certificates...</div>
              </div>
            ) : (
              <DataTable 
                columns={certificateColumns} 
                data={certificates || []} 
                searchKey="certificateName"
                searchPlaceholder="Search certificates..."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
