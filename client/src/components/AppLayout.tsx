import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

interface AppLayoutProps {
    children: React.ReactNode;
    hideSidebarOnPrint?: boolean;
}

export default function AppLayout({ children, hideSidebarOnPrint = false }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-[#f4f6fb] dark:bg-secondary/30 min-h-screen print:bg-white print:p-0">
            {/* Desktop Sidebar */}
            <div className={`hidden lg:block lg:w-64 lg:shrink-0 ${hideSidebarOnPrint ? "no-print" : ""}`}>
                <Sidebar />
            </div>

            {/* Mobile/Tablet Sidebar Drawer */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden no-print">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setIsSidebarOpen(false)} 
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-2xl transition-transform duration-300 ease-in-out z-50">
                        <div className="flex justify-end p-4">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(false)}
                                className="h-8 w-8 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="-mt-12 h-screen">
                           <Sidebar />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden print:overflow-visible">
                {/* Mobile/Tablet Top Bar */}
                <header className={`lg:hidden h-14 bg-white border-b flex items-center px-4 sticky top-0 z-40 w-full shrink-0 ${hideSidebarOnPrint ? "no-print" : ""}`}>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(true)}
                        className="h-9 w-9 -ml-1 text-muted-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-3 font-black text-sm tracking-tight text-primary uppercase">
                        InternTrack
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0">
                    <div className="max-w-7xl mx-auto space-y-6 print:space-y-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
