import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast-internal";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowLeft, User, UserPlus, LogIn } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, Info } from "lucide-react";

// ─── Schemas ────────────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    collegeName: z.string().min(2, "University name is required"),
    rollNumber: z.string().min(1, "Student ID / Roll Number is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

// ─── Redirect helper ────────────────────────────────────────────────────
function redirectForRole(role: string, setLocation: (path: string) => void) {
    if (role === "admin" || role === "sadmin") {
        setLocation("/admin/interns");
    } else {
        setLocation("/dashboard");
    }
}

// ─── Forgot Password Modal ──────────────────────────────────────────────
function ForgotPasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [verifyData, setVerifyData] = useState({ email: "", rollNumber: "" });
    const [internInfo, setInternInfo] = useState<{ name: string; email: string; phone: string } | null>(null);
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const { toast } = useToast();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyData.email || !verifyData.rollNumber) {
            return toast({ title: "Error", description: "Email and Roll Number are required", variant: "destructive" });
        }

        setLoading(true);
        try {
            const data = await apiRequest("POST", "/api/verify-intern", verifyData);
            setInternInfo(data);
            setStep(2);
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Details not found. Please check your information or contact Administration.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword.length < 6) {
            return toast({ title: "Invalid Password", description: "Password must be at least 6 characters", variant: "destructive" });
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        }

        setLoading(true);
        try {
            await apiRequest("POST", "/api/reset-password", {
                ...verifyData,
                newPassword: passwords.newPassword
            });
            toast({ title: "Success! 🎉", description: "Password updated successfully. You can now login." });
            onOpenChange(false);
            // Reset state for next time
            setStep(1);
            setVerifyData({ email: "", rollNumber: "" });
            setPasswords({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong. Please contact Administration.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
            <DialogContent className="glass border-white/20 shadow-2xl max-w-md rounded-2xl p-0 overflow-hidden">
                <div className="bg-primary/10 p-6 flex flex-col items-center gap-3 border-b border-white/10">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg ring-4 ring-primary/10">
                        {step === 1 ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                        <DialogTitle className="text-xl font-black tracking-tight uppercase">
                            {step === 1 ? "Verify Identity" : "Reset Password"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1">
                            {step === 1 ? "Intern Portal Password Recovery" : "Identity Confirmed. Choose a new password."}
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-primary" /> Email Address
                                </Label>
                                <Input
                                    value={verifyData.email}
                                    onChange={(e) => setVerifyData({ ...verifyData, email: e.target.value })}
                                    placeholder="Enter your registered email"
                                    type="email"
                                    required
                                    className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <span className="h-3 w-3 bg-primary/20 flex items-center justify-center text-[8px] rounded-sm">#</span> Roll Number / ID
                                </Label>
                                <Input
                                    value={verifyData.rollNumber}
                                    onChange={(e) => setVerifyData({ ...verifyData, rollNumber: e.target.value })}
                                    placeholder="Enter your Student Roll Number"
                                    required
                                    className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 font-bold rounded-xl gap-2 mt-2" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-secondary/40 p-4 rounded-xl border border-white/10 space-y-2">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                                    <Info className="h-3 w-3 text-primary" /> Confirmed Intern Records:
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2">
                                    <div className="text-xs text-muted-foreground font-medium">Name:</div>
                                    <div className="text-xs font-bold">{internInfo?.name}</div>
                                    <div className="text-xs text-muted-foreground font-medium">Email:</div>
                                    <div className="text-xs font-bold">{internInfo?.email}</div>
                                    <div className="text-xs text-muted-foreground font-medium">Mobile:</div>
                                    <div className="text-xs font-bold">{internInfo?.phone}</div>
                                </div>
                            </div>

                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <Lock className="h-3 w-3 text-primary" /> New Password
                                    </Label>
                                    <Input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        placeholder="Min 6 characters"
                                        required
                                        className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <Lock className="h-3 w-3 text-primary" /> Confirm Password
                                    </Label>
                                    <Input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="Repeat new password"
                                        required
                                        className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 font-bold rounded-xl gap-2 mt-2" disabled={loading}>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 bg-secondary/20 flex flex-row justify-center sm:justify-center border-t border-white/10">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                        Cancel & Return to Login
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Login Form ─────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(data: LoginData) {
        try {
            const user = await apiRequest("POST", "/api/login", data);
            localStorage.setItem("user", JSON.stringify(user));
            toast({
                title: "Welcome back!",
                description: `Logged in as ${user.name}`,
            });
            redirectForRole(user.role, setLocation);
        } catch (e: any) {
            toast({
                title: "Login Failed",
                description: e.message || "Invalid email or password.",
                variant: "destructive",
            });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-primary" /> Email
                </Label>
                <Input
                    {...form.register("email")}
                    placeholder="you@interntrack.com"
                    type="email"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.email && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-primary" /> Password
                    </Label>
                    <button
                        type="button"
                        onClick={onForgot}
                        className="text-[10px] font-black uppercase text-primary hover:underline tracking-tighter"
                    >
                        Forgot Password?
                    </button>
                </div>
                <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.password && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.password.message}</p>
                )}
            </div>

            <Button
                className="w-full h-12 text-base font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] gap-2"
                type="submit"
                disabled={form.formState.isSubmitting}
            >
                {form.formState.isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</>
                ) : (
                    <><LogIn className="h-5 w-5" /> Login</>
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                New intern?{" "}
                <button type="button" onClick={onSwitch} className="text-primary font-bold hover:underline">
                    Create an account
                </button>
            </p>
        </form>
    );
}

// ─── Signup Form ─────────────────────────────────────────────────────────
function SignupForm({ onSwitch }: { onSwitch: () => void }) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const form = useForm<SignupData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            collegeName: "",
            rollNumber: "",
            address: "",
            password: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(data: SignupData) {
        try {
            // Register the intern account
            await apiRequest("POST", "/api/register", {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                collegeName: data.collegeName,
                rollNumber: data.rollNumber,
                address: data.address,
                passwordHash: data.password,
                role: "intern",
            });
            // Auto-login after signup
            const user = await apiRequest("POST", "/api/login", {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem("user", JSON.stringify(user));
            toast({
                title: "Account Created! 🎉",
                description: `Welcome, ${user.firstName}! You've been logged in.`,
            });
            setLocation("/dashboard");
        } catch (e: any) {
            toast({
                title: "Sign Up Failed",
                description: e.message || "Could not create account. Please check your details.",
                variant: "destructive",
            });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3 text-primary" /> First Name
                    </Label>
                    <Input
                        {...form.register("firstName")}
                        placeholder="John"
                        className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                    />
                    {form.formState.errors.firstName && (
                        <p className="text-xs font-bold text-destructive">{form.formState.errors.firstName.message}</p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3 text-primary" /> Last Name
                    </Label>
                    <Input
                        {...form.register("lastName")}
                        placeholder="Doe"
                        className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                    />
                    {form.formState.errors.lastName && (
                        <p className="text-xs font-bold text-destructive">{form.formState.errors.lastName.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-primary" /> Email
                    </Label>
                    <Input
                        {...form.register("email")}
                        placeholder="student@college.edu"
                        type="email"
                        className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs font-bold text-destructive">{form.formState.errors.email.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <div className="h-3 w-3 border-2 border-primary rounded-sm" /> Phone
                    </Label>
                    <Input
                        {...form.register("phone")}
                        placeholder="+1 234 567 8900"
                        className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                    />
                    {form.formState.errors.phone && (
                        <p className="text-xs font-bold text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                </div>
            </div>

            {/* University */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <div className="h-3 w-3 border-2 border-primary rounded-full" /> University
                </Label>
                <Input
                    {...form.register("collegeName")}
                    placeholder="Your University"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.collegeName && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.collegeName.message}</p>
                )}
            </div>

            {/* Student ID */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-primary/20 flex items-center justify-center text-[8px]">#</div> Student ID / Roll Number
                </Label>
                <Input
                    {...form.register("rollNumber")}
                    placeholder="Student ID / Roll Number"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.rollNumber && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.rollNumber.message}</p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-primary/20 rounded-full" /> Your Address
                </Label>
                <Input
                    {...form.register("address")}
                    placeholder="Your Address"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.address && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.address.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-primary" /> Password
                </Label>
                <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="Create a strong password"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.password && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.password.message}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-primary" /> Confirm Password
                </Label>
                <Input
                    {...form.register("confirmPassword")}
                    type="password"
                    placeholder="Repeat password"
                    className="h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-base"
                />
                {form.formState.errors.confirmPassword && (
                    <p className="text-xs font-bold text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
            </div>

            <Button
                className="w-full h-12 text-base font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] gap-2"
                type="submit"
                disabled={form.formState.isSubmitting}
            >
                {form.formState.isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Creating Account...</>
                ) : (
                    <><UserPlus className="h-5 w-5" /> Create Account</>
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={onSwitch} className="text-primary font-bold hover:underline">
                    Login instead
                </button>
            </p>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function LoginPage({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
    const [tab, setTab] = useState<"login" | "signup">(initialTab as "login" | "signup");
    const [forgotOpen, setForgotOpen] = useState(false);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[15%] right-[8%] w-[45%] h-[45%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[15%] left-[8%] w-[40%] h-[40%] bg-blue-500/8 blur-[120px] rounded-full" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-purple-500/5 blur-[80px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {/* Back + Logo */}
                <div className="flex flex-col items-center mb-6 gap-2">
                    <Link href="/" className="group flex items-center gap-2 mb-2 hover:bg-secondary/50 px-3 py-1 rounded-full transition-colors self-start">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <Logo className="h-16 mb-2" />
                </div>

                <Card className="shadow-2xl shadow-primary/10 glass border-white/20">
                    <CardHeader className="pb-0 pt-6 px-6">
                        {/* Tab Switcher */}
                        <div className="flex rounded-xl bg-secondary/50 border border-white/10 p-1 gap-1 mb-4">
                            <button
                                type="button"
                                onClick={() => setTab("login")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "login"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <LogIn className="h-4 w-4" /> Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab("signup")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "signup"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <UserPlus className="h-4 w-4" /> Sign Up
                            </button>
                        </div>

                        <CardTitle className="text-2xl font-black tracking-tight">
                            {tab === "login" ? "Welcome Back" : "Join InternTrack"}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium mt-1">
                            {tab === "login"
                                ? "Sign in with your admin or intern credentials"
                                : "Create your intern account to get started"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 px-6 pb-6">
                        <AnimatePresence mode="wait">
                            {tab === "login" ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <LoginForm onSwitch={() => setTab("signup")} onForgot={() => setForgotOpen(true)} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <SignupForm onSwitch={() => setTab("login")} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                    Admin accounts are created by system administrators only.
                </p>
            </motion.div>

            <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
        </div>
    );
}
