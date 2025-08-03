import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Anchor, Ship, Shield } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "ship_crew" as const,
    shipId: ""
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-maritime-600 p-3 rounded-lg">
                <Anchor className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RAYYAM Maritime SMS</h1>
            <p className="text-gray-600">Maritime Safety Management System</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    {/* Demo Users Info */}
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <div className="text-sm">
                          <p className="font-medium mb-2">Demo Users (Password: 123456789)</p>
                          <div className="space-y-1 text-xs">
                            <div><strong>DPA:</strong> admin@msms.com</div>
                            <div><strong>Superintendent:</strong> super@msms.com</div>
                            <div><strong>Ship Captain:</strong> captain@ship1.com</div>
                            <div><strong>Operator:</strong> operator@msms.com</div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-maritime-600 hover:bg-maritime-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Register a new user account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={registerForm.role} onValueChange={(value: any) => setRegisterForm({ ...registerForm, role: value })}>
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-maritime-600 hover:bg-maritime-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-maritime-800 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-lg">
          <Ship className="h-24 w-24 mx-auto mb-6 text-maritime-200" />
          <h2 className="text-3xl font-bold mb-4">Maritime Safety Management</h2>
          <p className="text-maritime-200 text-lg mb-6">
            Streamline your fleet operations with comprehensive safety management tools
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-maritime-600 p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Certificate Management</div>
                <div className="text-sm text-maritime-200">Track and manage all vessel certificates</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-maritime-600 p-2 rounded-lg">
                <Ship className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Fleet Overview</div>
                <div className="text-sm text-maritime-200">Monitor your entire fleet from one dashboard</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-maritime-600 p-2 rounded-lg">
                <Anchor className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Form Management</div>
                <div className="text-sm text-maritime-200">Digital forms with approval workflows</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
