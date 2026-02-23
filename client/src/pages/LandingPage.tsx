import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    BookOpen,
    Users,
    Code,
    Briefcase,
    CheckCircle,
    Menu,
    X,
    ChevronRight,
    Play,
    Rocket,
    BrainCircuit,
    Cpu,
    Cloud,
    Database,
    MapPin,
    Phone,
    Mail
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const courses = [
        {
            title: "GenAI",
            desc: "Master Generative AI, LLMs, and prompt engineering to build the next generation of intelligent applications.",
            icon: BrainCircuit,
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=70&w=600&auto=format&fm=webp&fit=crop"
        },
        {
            title: "CodeExpert",
            desc: "Deep dive into advanced algorithms, clean code practices, and large-scale system architecture.",
            icon: Cpu,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=70&w=600&auto=format&fm=webp&fit=crop"
        },
        {
            title: "AWS Cloud",
            desc: "Learn to architect, deploy, and scale robust applications on the world's leading cloud platform.",
            icon: Cloud,
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=70&w=600&auto=format&fm=webp&fit=crop"
        },
        {
            title: "Salesforce",
            desc: "Become a certified Salesforce developer and master the world's #1 CRM platform for enterprises.",
            icon: Database,
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=70&w=600&auto=format&fm=webp&fit=crop"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-[#0A3DFF]/10 font-sans">
            {/* STICKY HEADER */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12 ${isScrolled ? "bg-white shadow-md h-16" : "bg-white h-20"
                }`}>
                <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center">
                        <Logo className="h-10" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        {["Home", "About", "Courses", "Training", "Success"].map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                className="text-[15px] font-bold text-slate-900 transition-colors relative group py-2"
                            >
                                {link}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A3DFF] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button className="bg-[#0A3DFF] hover:bg-[#0835CC] text-white rounded-full px-10 h-11 font-black shadow-lg shadow-[#0A3DFF]/20 transition-all active:scale-95 uppercase tracking-wider text-xs">
                                Login
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 shadow-xl md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {["Home", "About", "Courses", "Training", "Success"].map((link) => (
                                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-800">{link}</a>
                            ))}
                            <div className="h-px bg-slate-100 w-full"></div>
                            <Link href="/login">
                                <Button className="w-full bg-[#0A3DFF] h-12 rounded-xl font-bold">Login</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            <main className="flex-1">
                {/* 1. HERO SECTION */}
                <section id="home" className="relative h-screen min-h-[750px] w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=70&w=1200&auto=format&fm=webp&fit=crop"
                            alt="Training Classroom"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A3DFF]/90 via-[#0A3DFF]/60 to-transparent"></div>
                    </div>

                    <div className="container mx-auto px-6 lg:px-12 relative z-10">
                        <div className="max-w-5xl">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-white text-[#0A3DFF] text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-xl"
                            >
                                India's Leading Technical Institute
                            </motion.span>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tighter mb-10"
                            >
                                Elevate Your <br />
                                <span className="text-[#FFFFFF]">Career Potential.</span>
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="mb-12 p-8 md:p-10 bg-white/10 backdrop-blur-xl rounded-[40px] border border-white/20 shadow-2xl inline-block"
                            >
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                    Empowering India's youth with AI skills through the <br />
                                    <span className="text-[#0A3DFF] bg-white px-3 py-1 rounded-lg mt-2 inline-block">Bharat Unnati AI Fellowship.</span>
                                </h2>
                                <p className="text-white/80 mt-4 text-lg font-bold tracking-widest uppercase">
                                    NEAT 6.0 powered | AICTE aligned
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-col sm:flex-row gap-5"
                            >
                                <Link href="/login">
                                    <Button className="bg-white text-[#0A3DFF] hover:bg-slate-100 h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-black/20 group uppercase tracking-widest">
                                        Join Now <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 2. ABOUT SECTION */}
                <section id="about" className="py-24 lg:py-32 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 text-center mb-16">
                        <motion.div {...fadeInUp} className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 text-left">
                            <div className="lg:w-1/2 relative">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0A3DFF]/5 rounded-full -z-10 blur-3xl"></div>
                                <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#0A3DFF]/10 rounded-full -z-10 blur-3xl"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop"
                                    className="rounded-[40px] shadow-2xl w-full object-cover h-[500px]"
                                    alt="Mentorship Session"
                                />
                                <div className="absolute -bottom-8 -right-8 bg-[#0A3DFF] text-white p-8 rounded-[30px] hidden md:block shadow-2xl">
                                    <p className="text-4xl font-black mb-1">10k+</p>
                                    <p className="text-xs uppercase font-bold tracking-widest opacity-80">Students Trained</p>
                                </div>
                            </div>
                            <div className="lg:w-1/2 space-y-8">
                                <span className="text-[#0A3DFF] font-black text-xs uppercase tracking-[0.3em]">About Our Ecosystem</span>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">Where Theory Meets <br />Industry Excellence</h2>
                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                    At our institute, we believe in bridging the gap between academic knowledge and corporate requirements. Our environment is designed to simulate a professional tech agency, providing students with the exact pressure, tools, and collaboration workflows used in global companies.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    {[
                                        "Expert Technical Mentors",
                                        "Industry-Grade Projects",
                                        "Global Tech Standards",
                                        "Corporate Atmosphere"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-[#0A3DFF]/10 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-[#0A3DFF]" />
                                            </div>
                                            <span className="font-bold text-slate-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. COURSE EXPERIENCE SECTION */}
                <section id="courses" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0A3DFF_1px,transparent_1px)] [background-size:40px_40px]"></div>
                    </div>

                    <div className="container mx-auto px-6 lg:px-12 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-4 mb-20">
                            <span className="text-[#0A3DFF] font-black text-xs uppercase tracking-[0.3em]">Curated Learning Paths</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Your Path to Tech Success</h2>
                            <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
                                Join our specialized programs designed to transform you from a student to a job-ready professional.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {courses.map((course, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-[#0A3DFF] shadow-lg">
                                                <course.icon size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <h3 className="text-xl font-black tracking-tight group-hover:text-[#0A3DFF] transition-colors">{course.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed font-semibold opacity-80">{course.desc}</p>
                                        <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-black text-[#0A3DFF]">
                                            Professional Training <ArrowRight className="ml-1 h-2 w-2" />
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. HANDS-ON TRAINING SECTION */}
                <section id="training" className="py-24 lg:py-32 bg-white">
                    <div className="container mx-auto px-6 lg:px-12">
                        <motion.div {...fadeInUp} className="max-w-[1200px] mx-auto bg-slate-900 rounded-[60px] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-3xl">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0A3DFF]/20 blur-[120px] rounded-full pointer-events-none"></div>

                            <div className="lg:w-1/2 relative z-10 group">
                                <img
                                    src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=1200&auto=format&fit=crop"
                                    alt="Coding Session"
                                    className="rounded-[40px] shadow-2xl w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-[#0A3DFF] shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                                        <Play fill="currentColor" size={24} className="ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-1/2 space-y-10 relative z-10">
                                <div className="space-y-4">
                                    <span className="text-[#0A3DFF] font-black text-xs uppercase tracking-[0.3em]">Signature Education</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Advanced Coding & <br />Product Development</h2>
                                    <p className="text-white/60 text-lg leading-relaxed font-medium">
                                        We don't teach from textbooks. Our students learn by building production-ready applications with modern tech stacks.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Full Stack Development Focus",
                                        "Agile Methodology Workflows",
                                        "Code Quality & CI/CD Practices",
                                        "Real-World Problem Solving"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-4 group/item">
                                            <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center group-hover/item:border-[#0A3DFF] transition-colors">
                                                <div className="h-2 w-2 rounded-full bg-[#0A3DFF]"></div>
                                            </div>
                                            <span className="text-white font-black text-sm uppercase tracking-wider">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 5. CAREER TRANSFORMATION SECTION */}
                <section id="success" className="relative py-32 lg:py-48 overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2000&auto=format&fit=crop"
                            alt="Placement Success"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900"></div>
                    </div>

                    <div className="container mx-auto px-6 lg:px-12 relative z-10">
                        <motion.div {...fadeInUp} className="max-w-4xl mx-auto text-center space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">Your New Career <br />Starts Right Here</h2>
                                <p className="text-white/70 text-xl font-medium max-w-2xl mx-auto">
                                    Our alumni are now working in top Fortune 500 companies. Your transformation is just 12 weeks away.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {[
                                    { n: "95%", t: "Placement Rate" },
                                    { n: "8 LPA", t: "Avg Package" },
                                    { n: "500+", t: "Hiring Partners" },
                                    { n: "24/7", t: "Member Support" }
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="text-5xl font-black text-white tracking-tighter italic">{stat.n}</p>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0A3DFF]">{stat.t}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10">
                                <Link href="/login">
                                    <Button className="bg-[#0A3DFF] hover:bg-[#0835CC] text-white h-20 px-16 rounded-full font-black text-xl shadow-3xl shadow-[#0A3DFF]/40 animate-bounce-subtle uppercase tracking-widest">
                                        Login to Get Started
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="pt-24 pb-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        <div className="space-y-8">
                            <Logo className="h-12" />
                            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                                Empowering the next generation of engineers through elite technical internship training and professional mentorship since 2018.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Quick Links</h4>
                            <div className="flex flex-col gap-4">
                                {["Home", "About", "Courses", "Training", "Success"].map(link => (
                                    <a key={link} href="#" className="text-sm font-bold text-slate-500 hover:text-[#0A3DFF] transition-colors">{link}</a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Contact Us</h4>
                            <div className="flex flex-col gap-5 text-sm font-bold text-slate-500">
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-[#0A3DFF] shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">T-hub, 4th Floor, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="h-5 w-5 text-[#0A3DFF] shrink-0" />
                                    <p className="text-[#0A3DFF] font-black underline decoration-2 underline-offset-4">info@learnersbyte.com</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="h-5 w-5 text-[#0A3DFF] shrink-0" />
                                    <p>9247599672 / 73</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Newsletter</h4>
                            <div className="space-y-4">
                                <Input placeholder="Email Address" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 ExpertPedia AI Training Institute. All Rights Reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-[#0A3DFF] uppercase tracking-widest">Terms</a>
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-[#0A3DFF] uppercase tracking-widest">Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s infinite ease-in-out;
                }
                .glass {
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}
