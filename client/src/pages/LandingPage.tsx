import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    CheckCircle2,
    LayoutDashboard,
    Database,
    Rocket,
    Users,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    BarChart3,
    Clock
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
            {/* Navigation */}
            <header className="px-6 lg:px-12 h-20 flex items-center glass sticky top-0 z-50 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        InternTrack
                    </span>
                </Link>
                <nav className="ml-auto flex items-center gap-8">
                    <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">
                        Login
                    </Link>
                    <Link href="/login">
                        <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full py-20 lg:py-32 xl:py-48 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    <div className="container mx-auto px-6 relative">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold"
                            >
                                <Sparkles className="h-4 w-4" /> Now in Local Environment
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="space-y-6 max-w-4xl"
                            >
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                                    Track Internships <br />
                                    <span className="text-primary italic">Better than Ever.</span>
                                </h1>
                                <p className="mx-auto max-w-[800px] text-muted-foreground md:text-2xl font-medium leading-relaxed">
                                    Migrate your workflow from Salesforce to a blazingly fast local system.
                                    Manage interns, tasks, and attendance with a premium experience.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                            >
                                <Link href="/login">
                                    <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                                        Launch Dashboard
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full glass border-white/20 hover:bg-white/5 active:scale-95 transition-all">
                                        View Demo
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Grid Features */}
                <section className="w-full py-24 relative bg-secondary/30">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center">
                                Powerful Features for Modern Management
                            </h2>
                            <p className="text-muted-foreground text-center max-w-2xl text-lg">
                                Everything you used to do in Salesforce, now local, faster, and more beautiful.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Smart Attendance",
                                    desc: "Frictionless clock-in/out with automated working hour logs.",
                                    icon: Clock,
                                    color: "text-blue-500",
                                    bg: "bg-blue-500/10"
                                },
                                {
                                    title: "Task Orchard",
                                    desc: "Assign and oversee tasks with beautiful progress tracking.",
                                    icon: LayoutDashboard,
                                    color: "text-primary",
                                    bg: "bg-primary/10"
                                },
                                {
                                    title: "Data Sovereignty",
                                    desc: "Harness the power of Local PostgreSQL. Your data, your rules.",
                                    icon: Database,
                                    color: "text-emerald-500",
                                    bg: "bg-emerald-500/10"
                                },
                                {
                                    title: "Role Security",
                                    desc: "Granular access control between Admins and Internship Candidates.",
                                    icon: ShieldCheck,
                                    color: "text-amber-500",
                                    bg: "bg-amber-500/10"
                                },
                                {
                                    title: "Live Insights",
                                    desc: "Real-time analytics on productivity and attendance trends.",
                                    icon: BarChart3,
                                    color: "text-purple-500",
                                    bg: "bg-purple-500/10"
                                },
                                {
                                    title: "Seamless Reports",
                                    desc: "Export and view daily logs without any external dependencies.",
                                    icon: CheckCircle2,
                                    color: "text-rose-500",
                                    bg: "bg-rose-500/10"
                                },
                            ].map((feature, i) => (
                                <Card key={i} className="group hover:border-primary/50 transition-all duration-300 glass border-white/10 overflow-hidden">
                                    <CardContent className="p-8 space-y-4">
                                        <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 px-6 border-t glass">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        <span className="text-lg font-bold">InternTrack</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        Built for Performance. Local & Secure. © 2026
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
