import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, RotateCcw, ShieldCheck, Mail, User as UserIcon, Lock, Pencil, Trash2, KeyRound, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { type User } from "@shared/schema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast-internal";

export default function SuperAdmin() {
    const [filterText, setFilterText] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const createAdminMutation = useMutation({
        mutationFn: (newUser: any) => apiRequest("POST", "/api/admin/users", newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            setIsAddModalOpen(false);
            toast({
                title: "Success",
                description: "Admin user created successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateAdminMutation = useMutation({
        mutationFn: (data: { id: string; user: any }) => apiRequest("PUT", `/api/admin/users/${data.id}`, data.user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            setIsAddModalOpen(false);
            setEditingUser(null);
            toast({
                title: "Success",
                description: "Admin user updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({
                title: "Removed",
                description: "Admin user access revoked",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const filteredUsers = (users || []).filter((user: User) =>
        user.name.toLowerCase().includes(filterText.toLowerCase()) ||
        user.email.toLowerCase().includes(filterText.toLowerCase())
    );

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (editingUser) {
            updateAdminMutation.mutate({ id: editingUser.id, user: data });
        } else {
            createAdminMutation.mutate(data);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsAddModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to revoke access for this administrator?")) {
            deleteAdminMutation.mutate(id);
        }
    };

    return (
        <div className="flex h-screen bg-[#09090b] text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pl-64">
                <div className="max-w-7xl mx-auto p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                </div>
                                <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">Management Console</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Super Admin</h1>
                            <p className="text-white/50 font-medium">Manage administrative access and system credentials</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingUser(null);
                                setIsAddModalOpen(true);
                            }}
                            className="relative h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/20 gap-3 group/btn"
                        >
                            <UserPlus className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                            Add Admin
                        </Button>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl">
                        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })}
                                className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center p-0"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02]">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Administrator</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Email Address</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Password</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Access Role</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Joined Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="p-20 text-center text-white/20 animate-pulse font-black uppercase tracking-widest text-xs">Syncing Registry...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan={6} className="p-32 text-center text-white/20 font-medium">No administrators found matching your criteria</td></tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-500/20">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-white/60 font-medium">{user.email}</td>
                                                <td className="px-8 py-6">
                                                    <code className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-xs font-mono">
                                                        {user.passwordHash}
                                                    </code>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'sadmin'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-white/40 text-sm font-medium">
                                                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "Initial Setup"}
                                                </td>
                                                <td className="px-8 py-6 text-right space-x-3">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 text-white/40 hover:text-indigo-400 transition-all inline-flex items-center justify-center"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-all inline-flex items-center justify-center"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Admin Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                    setIsAddModalOpen(open);
                }}>
                    <DialogContent className="max-w-md bg-[#0c0c0e] border-white/10 text-white rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 pb-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-4">
                                {editingUser ? <KeyRound className="h-6 w-6 text-indigo-400" /> : <UserPlus className="h-6 w-6 text-indigo-400" />}
                            </div>
                            <DialogTitle className="text-3xl font-black text-white">
                                {editingUser ? "Update Credentials" : "Issue Admin Credentials"}
                            </DialogTitle>
                            <DialogDescription className="text-white/40 font-medium mt-2">
                                {editingUser ? `Modifying authorization for ${editingUser.name}` : "Create a new administrative account with standard access permissions."}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit} className="p-8 pt-4 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1 mb-1">
                                        <UserIcon className="h-3 w-3 text-white/30" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Full Identity Name</label>
                                    </div>
                                    <Input
                                        name="name"
                                        defaultValue={editingUser?.name || ""}
                                        placeholder="Enter legal name"
                                        required
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/10 px-6 focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1 mb-1">
                                        <Mail className="h-3 w-3 text-white/30" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Official Email Vector</label>
                                    </div>
                                    <Input
                                        name="email"
                                        type="email"
                                        defaultValue={editingUser?.email || ""}
                                        placeholder="admin@example.com"
                                        required
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/10 px-6 focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1 mb-1">
                                        <ShieldAlert className="h-3 w-3 text-white/30" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Authorization Level (Role)</label>
                                    </div>
                                    <select
                                        name="role"
                                        defaultValue={editingUser?.role || "admin"}
                                        required
                                        className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-white px-6 focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest text-xs"
                                    >
                                        <option value="admin" className="bg-[#0c0c0e]">ADMINISTRATOR</option>
                                        <option value="sadmin" className="bg-[#0c0c0e]">SUPER ADMIN</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1 mb-1">
                                        <Lock className="h-3 w-3 text-white/30" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Secure Access Key (Password)</label>
                                    </div>
                                    <Input
                                        name="password"
                                        type="text"
                                        defaultValue={editingUser?.passwordHash || ""}
                                        placeholder="••••••••"
                                        required
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/10 px-6 focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-4 flex !justify-between gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="h-14 px-8 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Abort
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createAdminMutation.isPending || updateAdminMutation.isPending}
                                    className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 flex-1"
                                >
                                    {createAdminMutation.isPending || updateAdminMutation.isPending ? "Syncing..." : (editingUser ? "Update Identity" : "Confirm & Issue")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
