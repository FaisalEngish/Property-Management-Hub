import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Shield, Eye, Building, UserPlus, Search, Filter, Settings } from "lucide-react";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const users = [
    { id: 1, name: "John Admin", email: "admin@test.com", role: "admin", status: "active", lastLogin: "2025-01-21" },
    { id: 2, name: "Jane Manager", email: "manager@test.com", role: "portfolio-manager", status: "active", lastLogin: "2025-01-20" },
    { id: 3, name: "Bob Staff", email: "staff@test.com", role: "staff", status: "active", lastLogin: "2025-01-21" },
    { id: 4, name: "Alice Owner", email: "owner@test.com", role: "owner", status: "inactive", lastLogin: "2025-01-15" },
  ];

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    "portfolio-manager": "bg-blue-100 text-blue-800", 
    staff: "bg-green-100 text-green-800",
    owner: "bg-purple-100 text-purple-800",
    guest: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage users, permissions, and access controls</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="visibility" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Property Visibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="portfolio-manager">Portfolio Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permission Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Admin Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Manage Users</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Financial Controls</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>System Settings</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Portfolio Manager Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Property Management</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Financial Reports</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Staff Management</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Staff Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Task Management</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Guest Services</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Basic Reports</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Owner Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>View Properties</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Financial Reports</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Request Payouts</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                User Access & Visibility Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Dashboard Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Admin Dashboard</span>
                        <Badge className="bg-red-100 text-red-800">Admin Only</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Financial Dashboard</span>
                        <Badge className="bg-blue-100 text-blue-800">Admin/PM</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Staff Dashboard</span>
                        <Badge className="bg-green-100 text-green-800">Staff</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Feature Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>User Management</span>
                        <Badge className="bg-red-100 text-red-800">Admin Only</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Property CRUD</span>
                        <Badge className="bg-blue-100 text-blue-800">Admin/PM</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Task Creation</span>
                        <Badge className="bg-green-100 text-green-800">All Staff</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Data Visibility</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>All Properties</span>
                        <Badge className="bg-red-100 text-red-800">Admin</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Assigned Properties</span>
                        <Badge className="bg-blue-100 text-blue-800">PM/Staff</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Own Properties</span>
                        <Badge className="bg-purple-100 text-purple-800">Owner</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Access Control Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Feature</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">PM</th>
                          <th className="text-center p-2">Staff</th>
                          <th className="text-center p-2">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">User Management</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Financial Reports</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-yellow-600">Limited</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Property Management</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-yellow-600">Limited</td>
                          <td className="text-center p-2 text-yellow-600">View Only</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Property Visibility Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Property Assignment</h4>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Villa Samui Breeze</span>
                          <Badge className="bg-blue-100 text-blue-800">PM: Jane</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Owner: Alice Owner</p>
                          <p>Staff Access: Bob Staff, Carol Manager</p>
                        </div>
                      </div>
                      
                      <div className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Villa Aruna</span>
                          <Badge className="bg-blue-100 text-blue-800">PM: Jane</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Owner: Alice Owner</p>
                          <p>Staff Access: Bob Staff</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Visibility Rules</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Admin Global Access</p>
                          <p className="text-sm text-gray-600">Can view all properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">PM Property Assignment</p>
                          <p className="text-sm text-gray-600">Only assigned properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Owner Property Restriction</p>
                          <p className="text-sm text-gray-600">Only owned properties</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Current Property Access Matrix</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Property</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">PM Jane</th>
                          <th className="text-center p-2">Staff Bob</th>
                          <th className="text-center p-2">Owner Alice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Villa Samui Breeze</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Villa Aruna</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Villa Paradise</td>
                          <td className="text-center p-2 text-green-600">✓</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                          <td className="text-center p-2 text-red-600">✗</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}