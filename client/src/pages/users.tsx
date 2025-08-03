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
import { User } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Users as UsersIcon, 
  UserPlus,
  Ship,
  Building,
  UserCheck,
  Shield,
  User as UserIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarFallback className="bg-maritime-100 text-maritime-600">
            {row.original.firstName?.[0]}{row.original.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.getValue("email")}</div>
          <div className="text-sm text-gray-500">
            {row.original.firstName} {row.original.lastName}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleConfig = {
        dpa: { label: "DPA", variant: "destructive" as const, icon: Shield },
        superintendent: { label: "Superintendent", variant: "default" as const, icon: Building },
        ship_captain: { label: "Ship Captain", variant: "default" as const, icon: Ship },
        ship_crew: { label: "Ship Crew", variant: "secondary" as const, icon: UserIcon },
        operator: { label: "Operator", variant: "outline" as const, icon: UserIcon }
      };
      const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operator;
      const Icon = config.icon;
      
      return (
        <Badge variant={config.variant} className="flex items-center space-x-1 w-fit">
          <Icon className="h-3 w-3" />
          <span>{config.label}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "shipId",
    header: "Ship Assignment",
    cell: ({ row }) => {
      const shipId = row.getValue("shipId") as string;
      return shipId ? "Assigned" : "All Ships";
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin") as string;
      if (!lastLogin) return "Never";
      return new Date(lastLogin).toLocaleDateString();
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
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600">
          {row.original.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    ),
  },
];

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "ship_crew" as const,
    shipId: ""
  });

  // Only DPA can access this page
  if (user?.role !== 'dpa') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Access Denied" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access user management.</p>
          </div>
        </main>
      </div>
    );
  }

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: ships } = useQuery({
    queryKey: ["/api/ships"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "ship_crew",
        shipId: ""
      });
      toast({
        title: "User created",
        description: "The user has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newUser);
  };

  // Calculate stats
  const stats = users ? {
    total: users.length,
    shipPersonnel: users.filter(u => u.role === 'ship_captain' || u.role === 'ship_crew').length,
    officePersonnel: users.filter(u => u.role === 'dpa' || u.role === 'superintendent' || u.role === 'operator').length,
    active: users.filter(u => u.isActive).length,
  } : { total: 0, shipPersonnel: 0, officePersonnel: 0, active: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="User & Role Management" breadcrumb={["Home", "Users"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User & Role Management</h2>
          <div className="flex space-x-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-maritime-600 hover:bg-maritime-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ship_captain">Ship Captain</SelectItem>
                        <SelectItem value="ship_crew">Ship Crew</SelectItem>
                        <SelectItem value="dpa">DPA</SelectItem>
                        <SelectItem value="superintendent">Superintendent</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(newUser.role === 'ship_captain' || newUser.role === 'ship_crew') && (
                    <div className="space-y-2">
                      <Label htmlFor="shipId">Ship Assignment</Label>
                      <Select value={newUser.shipId} onValueChange={(value) => setNewUser({...newUser, shipId: value})}>
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
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-maritime-600 hover:bg-maritime-700"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ship Personnel</p>
                  <p className="text-2xl font-bold text-maritime-600">{stats.shipPersonnel}</p>
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
                  <p className="text-sm font-medium text-gray-600">Office Personnel</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.officePersonnel}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : (
              <DataTable 
                columns={userColumns} 
                data={users || []} 
                searchKey="email"
                searchPlaceholder="Search users..."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
