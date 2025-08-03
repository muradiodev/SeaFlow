import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilder } from "@/components/forms/form-builder";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormSubmission } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { 
  FileText, 
  Plus,
  RotateCcw,
  FileCheck,
  History,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar
} from "lucide-react";

const formColumns: ColumnDef<Form>[] = [
  {
    accessorKey: "name",
    header: "Form Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          {row.original.formType === 'recurring' ? 
            <RotateCcw className="h-4 w-4 text-blue-600" /> :
            <FileCheck className="h-4 w-4 text-blue-600" />
          }
        </div>
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-gray-500">{row.original.description}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "formType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("formType") as string;
      return (
        <Badge variant={type === 'recurring' ? 'default' : 'secondary'}>
          {type === 'recurring' ? 'Recurring' : 'One-time'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "requiresApproval",
    header: "Approval",
    cell: ({ row }) => {
      const requiresApproval = row.getValue("requiresApproval") as boolean;
      return requiresApproval ? (
        <Badge variant="outline">Required</Badge>
      ) : (
        <span className="text-gray-500">None</span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
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
        <Button variant="ghost" size="sm">
          Fill
        </Button>
      </div>
    ),
  },
];

const submissionColumns: ColumnDef<FormSubmission>[] = [
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        draft: { variant: "secondary" as const, icon: Clock },
        submitted: { variant: "default" as const, icon: FileText },
        approved: { variant: "default" as const, icon: CheckCircle },
        rejected: { variant: "destructive" as const, icon: AlertTriangle }
      };
      const config = variants[status as keyof typeof variants] || variants.draft;
      const Icon = config.icon;
      
      return (
        <Badge variant={config.variant} className="flex items-center space-x-1">
          <Icon className="h-3 w-3" />
          <span>{status}</span>
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
        {row.original.status === 'draft' && (
          <Button variant="ghost" size="sm">
            Continue
          </Button>
        )}
      </div>
    ),
  },
];

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const currentTab = params.tab || 'recurring';

  const { data: forms, isLoading: formsLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<FormSubmission[]>({
    queryKey: ["/api/form-submissions"],
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/forms", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      setIsFormBuilderOpen(false);
      toast({
        title: "Form created",
        description: "The form has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form.",
        variant: "destructive",
      });
    },
  });

  const handleTabChange = (value: string) => {
    setLocation(`/documents/${value}`);
  };

  const recurringForms = forms?.filter(f => f.formType === 'recurring') || [];
  const oneTimeForms = forms?.filter(f => f.formType === 'one_time') || [];

  const canCreateForms = user?.role === 'dpa' || user?.role === 'superintendent';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Document Management" breadcrumb={["Home", "Documents"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          {canCreateForms && (
            <div className="flex space-x-3">
              <Dialog open={isFormBuilderOpen} onOpenChange={setIsFormBuilderOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-maritime-600 hover:bg-maritime-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Form
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Form</DialogTitle>
                  </DialogHeader>
                  <FormBuilder
                    onSave={(formData) => createFormMutation.mutate(formData)}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          )}
        </div>

        {/* Form Type Tabs */}
        <Card className="mb-6">
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <div className="border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="recurring" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-maritime-500 rounded-none px-6 py-4"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Recurring Forms ({recurringForms.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="onetime"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-maritime-500 rounded-none px-6 py-4"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  One-time Forms ({oneTimeForms.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-maritime-500 rounded-none px-6 py-4"
                >
                  <History className="h-4 w-4 mr-2" />
                  Form History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recurring" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recurring Forms</h3>
                  <div className="text-sm text-gray-500">
                    Forms that repeat on a schedule
                  </div>
                </div>
                
                {formsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading forms...</div>
                  </div>
                ) : (
                  <DataTable 
                    columns={formColumns} 
                    data={recurringForms} 
                    searchKey="name"
                    searchPlaceholder="Search recurring forms..."
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="onetime" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">One-time Forms</h3>
                  <div className="text-sm text-gray-500">
                    Forms filled as needed
                  </div>
                </div>
                
                {formsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading forms...</div>
                  </div>
                ) : oneTimeForms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {oneTimeForms.map((form) => (
                      <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                              <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{form.name}</h4>
                              <p className="text-sm text-gray-500">{form.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant={form.requiresApproval ? "outline" : "secondary"}>
                              {form.requiresApproval ? "Requires Approval" : "Direct Submit"}
                            </Badge>
                            <Button size="sm" className="bg-maritime-600 hover:bg-maritime-700">
                              Fill Form
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No one-time forms</h3>
                    <p className="text-gray-500 mb-4">There are no one-time forms available.</p>
                    {canCreateForms && (
                      <Button onClick={() => setIsFormBuilderOpen(true)}>
                        Create First Form
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Form Submission History</h3>
                  <div className="text-sm text-gray-500">
                    Track all form submissions
                  </div>
                </div>
                
                {submissionsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading submissions...</div>
                  </div>
                ) : (
                  <DataTable 
                    columns={submissionColumns} 
                    data={submissions || []} 
                    searchKey="status"
                    searchPlaceholder="Search submissions..."
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
