import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "bot";
    content: string;
}

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hello! I'm your AI Assistant. How can I help you with your internship today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get user from local storage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAuthenticated = !!user.id;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    message: userMsg,
                    isAdmin: user.role === "admin" || user.role === "sadmin"
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessages(prev => [...prev, { role: "bot", content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: "bot", content: "Sorry, I'm having trouble thinking right now. Please try again." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "bot", content: "Network error. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Only show if authenticated
    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-[350px] h-[500px] shadow-2xl border-primary/20 bg-white overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-primary p-4 flex items-center justify-between text-white shrink-0 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 p-1.5 rounded-lg border border-white/30">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <span className="font-black text-sm block leading-tight">Smart Assistant</span>
                                        <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Bharat Unnati AI</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Chat Area */}
                            <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
                                <div className="space-y-4">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border-2 ${msg.role === "user" ? "bg-slate-100 border-slate-200" : "bg-primary/10 border-primary/20"
                                                    }`}>
                                                    {msg.role === "user" ? <User className="h-4 w-4 text-slate-500" /> : <Bot className="h-4 w-4 text-primary" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                                        ? "bg-primary text-white rounded-tr-none"
                                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-2 shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="text-xs text-slate-400 font-medium">Assistant is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
                                <Input
                                    placeholder="Ask about tasks, attendance..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    className="rounded-full bg-slate-50 border-slate-200 text-sm focus-visible:ring-primary h-10"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="h-10 w-10 shrink-0 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-90"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? "bg-slate-800" : "bg-primary ring-4 ring-primary/20"
                        }`}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                </Button>
            </motion.div>
        </div>
    );
}
