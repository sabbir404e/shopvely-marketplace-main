import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldCheck, User, Search, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Mock Data Interface
interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Customer' | 'Manager';
    joined: string;
}

const UsersTab: React.FC = () => {
    const { toast } = useToast();
    const { userRole } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load users",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        (user.full_name || 'User').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setUsers(users.filter(user => user.id !== id));
                toast({
                    title: "User Deleted",
                    description: "User profile has been removed.",
                    variant: "destructive"
                });
            } catch (error) {
                console.error("Error deleting user:", error);
                toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
            }
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole } as any)
                .eq('id', id);

            if (error) throw error;

            setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
            toast({
                title: "Role Updated",
                description: `User role changed to ${newRole}.`,
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage user access and roles</CardDescription>
                    </div>
                    <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                        Refresh List
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Name or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No users found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {user.full_name || 'No Name'}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'}>
                                                {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                {user.role === 'manager' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.role || 'customer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {userRole === 'admin' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email || '')}>
                                                            Copy Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>

                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                                            Make Admin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'manager')}>
                                                            Make Manager
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'customer')}>
                                                            Make Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default UsersTab;
