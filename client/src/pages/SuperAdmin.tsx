import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, RotateCcw, ShieldCheck, Mail, User as UserIcon, Lock, Pencil, Trash2, KeyRound, ShieldAlert, Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast-internal";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <AppLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & Access Control</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Administrative Registry</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Manage root administrative credentials and protocol authorization.</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingUser(null);
                            setIsAddModalOpen(true);
                        }}
                        size="sm"
                        className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Grant Access
                    </Button>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-xs group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                placeholder="Search administrators..."
                                className="pl-9 h-9 bg-white/5 border-white/10 rounded-lg text-[10px] font-medium uppercase tracking-tight focus:bg-white/10 transition-all"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })}
                            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Profile Identity", "Credential Route", "Access Protocol", "Chronology", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <div className="h-2 w-32 bg-indigo-500/20 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Querying root database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">
                                            No authorized entities matched the search parameters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 first:pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs shadow-inner">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[11px] text-foreground uppercase tracking-tight leading-none mb-1">{user.name}</span>
                                                        <span className="text-[10px] text-indigo-400 font-bold lowercase opacity-80 leading-none">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <code className="px-2 py-0.5 rounded border border-white/10 bg-black/40 text-[9px] font-mono text-muted-foreground">
                                                    HASHED::{user.passwordHash.substring(0, 12)}...
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${user.role === 'sadmin'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/10 shadow-[0_0_15px_-5px_purple]'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-foreground/60 uppercase leading-none mb-1">Created At</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
                                                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "BOOTSTRAP"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 last:pr-6 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(user)}
                                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(user.id)}
                                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                if (!open) setEditingUser(null);
                setIsAddModalOpen(open);
            }}>
                <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none w-[95vw]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    {editingUser ? <KeyRound className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">
                                        {editingUser ? "Modify Identity" : "Issue Credentials"}
                                    </DialogTitle>
                                    <DialogDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                                        Root Authentication Protocol
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="grid gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                        <Input
                                            name="name"
                                            defaultValue={editingUser?.name || ""}
                                            placeholder="John Doe"
                                            required
                                            className="h-11 pl-10 bg-white/5 border-white/10 rounded-xl text-xs font-bold uppercase tracking-tight focus:bg-white/10 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Routing Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                        <Input
                                            name="email"
                                            type="email"
                                            defaultValue={editingUser?.email || ""}
                                            placeholder="admin@interntrack.com"
                                            required
                                            className="h-11 pl-10 bg-white/5 border-white/10 rounded-xl text-xs font-bold lowercase tracking-tight focus:bg-white/10 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Tier</Label>
                                        <select
                                            name="role"
                                            defaultValue={editingUser?.role || "admin"}
                                            required
                                            className="w-full h-11 bg-white/5 border-white/10 rounded-xl text-xs font-black uppercase tracking-widest px-4 focus:ring-1 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="admin" className="bg-[#0c0c0e]">ADMIN</option>
                                            <option value="sadmin" className="bg-[#0c0c0e]">SUPER_ADMIN</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Key</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                            <Input
                                                name="password"
                                                type="text"
                                                defaultValue={editingUser?.passwordHash || ""}
                                                placeholder="S3CUR3_P4SS"
                                                required
                                                className="h-11 pl-10 bg-white/5 border-white/10 rounded-xl text-xs font-black tracking-widest focus:bg-white/10 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-white/5"
                                >
                                    Abort
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createAdminMutation.isPending || updateAdminMutation.isPending}
                                    className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 flex-1"
                                >
                                    {createAdminMutation.isPending || updateAdminMutation.isPending ? "Syncing..." : "Commit Protocol"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
