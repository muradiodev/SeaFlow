import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  Anchor, 
  BarChart3, 
  Bell, 
  Book, 
  Tag, 
  FileText, 
  Home, 
  LogOut, 
  Ship, 
  Users,
  ClipboardList,
  RotateCcw,
  FileCheck,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  roles?: string[];
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: Home
  },
  {
    path: "/certificates",
    label: "Certificates",
    icon: Tag
  },
  {
    path: "/documents",
    label: "Document Management",
    icon: FileText,
    children: [
      {
        path: "/documents/recurring",
        label: "Recurring Forms",
        icon: RotateCcw
      },
      {
        path: "/documents/onetime",
        label: "One-time Forms",
        icon: FileCheck
      },
      {
        path: "/documents/history",
        label: "Form History",
        icon: History
      }
    ]
  },
  {
    path: "/users",
    label: "User & Role Management",
    icon: Users,
    roles: ['dpa']
  },
  {
    path: "/notifications",
    label: "Notifications",
    icon: Bell,
    badge: 3
  },
  {
    path: "/manuals",
    label: "Manuals",
    icon: Book
  },
  {
    path: "/logs",
    label: "History of Logs",
    icon: ClipboardList,
    roles: ['dpa', 'superintendent']
  },
  {
    path: "/kpi",
    label: "KPI & Statistics",
    icon: BarChart3
  }
];

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const canAccessItem = (item: NavItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'dpa': 'DPA Officer',
      'superintendent': 'Superintendent',  
      'ship_captain': 'Ship Captain',
      'ship_crew': 'Ship Crew',
      'operator': 'Operator'
    };
    return roleMap[role] || role;
  };

  return (
    <div className={cn("bg-maritime-800 text-white w-64 flex-shrink-0 overflow-y-auto", className)}>
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-maritime-600 p-2 rounded-lg">
            <Anchor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RAYYAM</h1>
            <p className="text-xs text-maritime-100">Maritime SMS</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-maritime-700 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-maritime-500 text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-maritime-200 truncate">
                  {getRoleDisplayName(user.role)}
                </p>
                {user.shipId && (
                  <p className="text-xs text-maritime-300 truncate">
                    Ship Assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!canAccessItem(item)) return null;

            const isActive = location === item.path;
            
            return (
              <div key={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3",
                    isActive 
                      ? "bg-maritime-600 text-white hover:bg-maritime-600" 
                      : "text-maritime-100 hover:bg-maritime-700 hover:text-white"
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Button>

                {/* Sub-navigation */}
                {item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = location === child.path;
                      return (
                        <Button
                          key={child.path}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left h-auto p-2",
                            isChildActive
                              ? "bg-maritime-600 text-white hover:bg-maritime-600"
                              : "text-maritime-200 hover:bg-maritime-700 hover:text-white"
                          )}
                          onClick={() => handleNavigation(child.path)}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          <span className="text-sm">{child.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-8 pt-4 border-t border-maritime-600">
          <Button
            variant="ghost"
            className="w-full justify-start text-maritime-100 hover:bg-maritime-700 hover:text-white"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
