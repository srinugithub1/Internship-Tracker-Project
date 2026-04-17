import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Users,
    CheckSquare,
    History as HistoryIcon,
    LogOut,
    Megaphone,
    LayoutDashboard,
    GraduationCap,
    Link as LinkIcon,
    Library,
    BookOpen,
    CreditCard,
    UserCog,
    Save,
    X,
    FileText,
    Zap,
    ShieldCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const internNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Diary", href: "/logs", icon: BookOpen },
    { name: "Mentorship", href: "/mentorship", icon: Megaphone },
    { name: "Marks Memo", href: "/evaluation-sheet", icon: FileText },
    { name: "Resources", href: "/resources", icon: Library },
];

// ─── Edit Profile Modal (Copied from Dashboard for local scope) ───────────────
function EditProfileModal({
    user,
    onClose,
    onUpdate
}: {
    user: any;
    onClose: () => void;
    onUpdate: (updatedUser: any) => void;
}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: user.name || "",
        phone: user.phone || "",
        university: user.university || "",
        college: user.college || "",
        department: user.department || "",
        rollNumber: user.rollNumber || "",
        hodName: user.hodName || "",
        hodEmail: user.hodEmail || "",
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => apiRequest("POST", "/api/profile-v4-update", { ...data, userId: user.id }),
        onSuccess: (updatedUser) => {
            // Update localStorage so the change persists across refreshes
            localStorage.setItem("user", JSON.stringify(updatedUser));

            queryClient.setQueryData([`/api/user/${user.id}`], updatedUser);
            queryClient.invalidateQueries({ queryKey: [`/api/interns`] });
            onUpdate(updatedUser);
            toast({
                title: "✅ Profile Updated",
                description: "Your changes have been saved successfully.",
            });
            onClose();
        },
        onError: (err: any) => {
            toast({
                title: "❌ Update Failed",
                description: err.message,
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    return (
        <Dialog open={true} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                <div className="relative w-full bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass">
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                                <UserCog className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Account Settings</p>
                                <h2 className="text-white font-black text-xl leading-none">Edit Profile</h2>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 text-left max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email (Read-only)</Label>
                                <Input
                                    value={user.email}
                                    disabled
                                    className="bg-muted/50 border-white/5 rounded-xl h-11 font-medium opacity-70 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                    placeholder="Phone Number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    {user.role === 'intern' ? 'Department / Branch' : 'Department'}
                                </Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                    placeholder={user.role === 'intern' ? 'e.g. CSE / IT' : 'Department'}
                                />
                            </div>

                            {user.role === 'intern' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student Id / Roll Number</Label>
                                    <Input
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                        placeholder="Roll Number"
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">University Name</Label>
                                <Input
                                    value={formData.university}
                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                    placeholder="University Name"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">College Name</Label>
                                <Input
                                    value={formData.college}
                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                    className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                    placeholder="College Name"
                                />
                            </div>

                            {user.role === 'intern' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HOD Name</Label>
                                        <Input
                                            value={formData.hodName}
                                            onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                                            className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                            placeholder="HOD Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HOD Email</Label>
                                        <Input
                                            value={formData.hodEmail}
                                            onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                                            className="bg-muted/30 border-white/10 rounded-xl h-11 font-medium"
                                            placeholder="HOD Email"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-black text-sm px-6 h-11">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm px-8 h-11 gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                {updateProfileMutation.isPending ? "Saving..." : (
                                    <><Save className="h-4 w-4" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Interns", href: "/admin/interns", icon: Users },
    { name: "Mentorship", href: "/admin/mentorship", icon: Megaphone },
    { name: "Intern Diary", href: "/admin/logs", icon: BookOpen },
    { name: "Course Syllabus", href: "/admin/syllabus", icon: GraduationCap },
    { name: "Attendance", href: "/admin/attendance", icon: HistoryIcon },
    { name: "Session Links", href: "/admin/sessions", icon: LinkIcon },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Resources", href: "/admin/resources", icon: Library },
    { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { name: "Evaluations", href: "/admin/evaluation", icon: FileText },
    { name: "Paid Internship", href: "/admin/paid-internship", icon: CreditCard },
    { name: "Super Admin", href: "/admin/super-admin", icon: Users },
];

const hodNavItems = [
    { name: "Dashboard", href: "/hod/dashboard", icon: LayoutDashboard },
    { name: "My Students", href: "/hod/students", icon: Users },
    { name: "Student Marks", href: "/hod/evaluations", icon: GraduationCap },
    { name: "Attendance Logs", href: "/hod/attendance", icon: HistoryIcon },
];

export default function Sidebar({ className }: { className?: string }) {
    const [location, setLocation] = useLocation();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user, setUser] = useState(storedUser);
    const isAdmin = user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'sadmin';
    const isHOD = user.role === 'hod';

    const navItems = isAdmin 
        ? adminNavItems.filter(item => {
            if (user.role === 'admin') {
                return item.name !== "Paid Internship" && item.name !== "Super Admin";
            }
            return true;
        })
        : isHOD 
            ? hodNavItems 
            : internNavItems;

    const handleLogout = () => {
        localStorage.removeItem("user");
        setLocation("/");
    };

    return (
        <div className={cn("flex flex-col h-full w-64 border-r bg-card shadow-sm overflow-y-auto", className)}>
            <div className="p-5">
                <Logo className="h-8" />
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">
                    {isAdmin ? "Admin Panel" : "Intern Portal"}
                </p>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {navItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors mb-0.5 cursor-pointer",
                            location === item.href
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}>
                            <item.icon className="h-3.5 w-3.5" />
                            {item.name}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t space-y-4 mt-auto">
                <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg group relative">
                    <div className="bg-primary/20 p-2 rounded-full">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    {!isAdmin && (
                        <button
                            onClick={() => setIsEditProfileOpen(true)}
                            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Edit Profile"
                        >
                            <UserCog className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {isEditProfileOpen && (
                    <EditProfileModal
                        user={user}
                        onClose={() => setIsEditProfileOpen(false)}
                        onUpdate={(updated) => {
                            setUser(updated);
                            localStorage.setItem("user", JSON.stringify(updated));
                        }}
                    />
                )}
                <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
