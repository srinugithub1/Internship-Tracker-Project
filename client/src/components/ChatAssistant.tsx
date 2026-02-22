import React, { useState } from "react";
import { MessageCircle, X, Sparkles, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);

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
                        <Card className="w-[320px] shadow-2xl border-primary/20 bg-white overflow-hidden">
                            <div className="bg-primary p-4 flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    <span className="font-bold">AI Support Assistant</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                                <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center">
                                    <Hammer className="h-8 w-8 text-amber-500 animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Feature Under Development</h3>
                                    <p className="text-sm text-slate-500 mt-2 italic">
                                        "I am currently learning about your program! The Smart Assistant will be live shortly to help you with attendance and tasks."
                                    </p>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        className="bg-primary h-full w-full"
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                    Coming Soon for Batch 2026
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 text-center border-t">
                                <p className="text-xs text-slate-400">System maintenance in progress...</p>
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
                    className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? "bg-slate-900" : "bg-primary"
                        }`}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                </Button>
            </motion.div>
        </div>
    );
}
