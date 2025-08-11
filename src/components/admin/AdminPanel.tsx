import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Search,
  MoreHorizontal,
  Edit,
  Ban
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  apiCalls: number;
  revenue: number;
  status: string;
  joinDate: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  apiCallsToday: number;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // Fetch all profiles along with their associated auth.users data (for email)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_users:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform profiles to admin user format
      const adminUsers: AdminUser[] = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.auth_users?.email || 'N/A', // Get email from joined auth.users
        plan: profile.plan,
        apiCalls: profile.api_calls_used,
        revenue: profile.plan === 'free' ? 0 : profile.plan === 'basic' ? 5 : 10, // Assuming fixed prices
        status: 'active', // Assuming all fetched users are active for now
        joinDate: profile.created_at
      }));

      setUsers(adminUsers);

      // Calculate stats
      const totalUsers = profiles.length;
      const activeSubscriptions = profiles.filter(p => p.plan !== 'free').length;
      const monthlyRevenue = profiles.reduce((sum, p) => {
        return sum + (p.plan === 'free' ? 0 : p.plan === 'basic' ? 5 : 10);
      }, 0);
      const apiCallsToday = profiles.reduce((sum, p) => sum + p.api_calls_used, 0);

      setStats({
        totalUsers,
        activeSubscriptions,
        monthlyRevenue,
        apiCallsToday
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <section id="admin" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground text-base sm:text-lg">You don't have permission to view this page.</p>
        </div>
      </section>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="admin" className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Admin Dashboard
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            Monitor platform metrics, manage users, and track revenue.
          </p>
        </div>

        {/* Stats Overview - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats?.totalUsers.toLocaleString() || '0'}</p>
                </div>
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-accent-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats?.activeSubscriptions || '0'}</p>
                </div>
                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold">${stats?.monthlyRevenue.toLocaleString() || '0'}</p>
                </div>
                <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-accent-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">API Calls Today</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats?.apiCallsToday.toLocaleString() || '0'}</p>
                </div>
                <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-accent-pink" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">User Management</span>
              </CardTitle>
              {/* Search Input - Hidden on small screens, visible on medium and up */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]"> {/* Added min-w for horizontal scroll */}
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">User</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">Plan</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">API Calls</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">Revenue</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">Status</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">Join Date</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center p-4 text-muted-foreground">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 sm:p-3">
                          <div>
                            <div className="font-medium text-sm sm:text-base">{user.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-2 sm:p-3">
                          <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                            {user.plan.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base">{user.apiCalls.toLocaleString()}</td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base">${user.revenue}</td>
                        <td className="p-2 sm:p-3">
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-3 text-muted-foreground text-sm sm:text-base">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 sm:p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive text-sm">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-4 text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};