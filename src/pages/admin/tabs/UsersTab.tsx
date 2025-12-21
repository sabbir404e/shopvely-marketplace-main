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

    // Initial Mock Data
    const [users, setUsers] = useState<UserData[]>([
        { id: 1, name: 'Admin User', email: 'sabbirhossain8721@gmail.com', role: 'Admin', joined: '2025-01-01' },
        { id: 2, name: 'Sabbir Hossain', email: 'sabbir@example.com', role: 'Customer', joined: '2025-11-15' },
        { id: 3, name: 'Rahim Ahmed', email: 'rahim@example.com', role: 'Customer', joined: '2025-11-20' },
        { id: 4, name: 'Manager User', email: 'manager@shopvely.com', role: 'Manager', joined: '2025-06-10' },
        { id: 5, name: 'Karim Ullah', email: 'karim@example.com', role: 'Customer', joined: '2025-12-01' },
    ]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(user => user.id !== id));
            toast({
                title: "User Deleted",
                description: "User account has been removed.",
                variant: "destructive"
            });
        }
    };

    const handleRoleChange = (id: number, newRole: 'Admin' | 'Customer' | 'Manager') => {
        setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
        toast({
            title: "Role Updated",
            description: `User role changed to ${newRole}.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage user access and roles</CardDescription>
                    </div>
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
                            {filteredUsers.length === 0 ? (
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
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'default' : 'secondary'}>
                                                {user.role === 'Admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                {user.role === 'Manager' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.joined}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                            Copy Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>

                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'Manager')}>
                                                            Make Manager
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'Customer')}>
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
