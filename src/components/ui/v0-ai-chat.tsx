"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    Loader2,
    User,
    Bot,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isLoading?: boolean;
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMsg: ChatMessage = {
            id: Date.now().toString() + Math.random(),
            text,
            isUser: true,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setValue("");
        adjustHeight(true);
        setIsLoading(true);
        // Add loading message
        const loadingId = Date.now().toString() + Math.random();
        setMessages((prev) => [
            ...prev,
            {
                id: loadingId,
                text: "",
                isUser: false,
                timestamp: new Date(),
                isLoading: true,
            },
        ]);
        try {
            const res = await fetch("/api/gpt/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== loadingId)
            );
            if (data.success && data.response) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        text: data.response,
                        isUser: false,
                        timestamp: new Date(),
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        text: data.error || "Sorry, something went wrong.",
                        isUser: false,
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (e) {
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== loadingId)
            );
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + Math.random(),
                    text: "Sorry, I encountered a network error. Please try again.",
                    isUser: false,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                sendMessage(value);
            }
        }
    };

    const handleSendClick = () => {
        if (value.trim()) {
            sendMessage(value);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-black dark:text-white">
                What can I help you ship?
            </h1>
            <div className="w-full">
                <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="overflow-y-auto max-h-[400px] min-h-[120px] p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-neutral-400 text-sm py-8">
                                Start a conversation!
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex",
                                    msg.isUser ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-2 max-w-[80%] flex items-center gap-2",
                                        msg.isUser
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {msg.isUser ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                    {msg.isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <span className="text-sm whitespace-pre-wrap">{msg.text}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-neutral-800" />
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-2 py-1 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Project
                            </button>
                            <button
                                type="button"
                                onClick={handleSendClick}
                                disabled={!value.trim() || isLoading}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                                    value.trim()
                                        ? "bg-white text-black"
                                        : "text-zinc-400",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowUpIcon
                                        className={cn(
                                            "w-4 h-4",
                                            value.trim()
                                                ? "text-black"
                                                : "text-zinc-400"
                                        )}
                                    />
                                )}
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                    <ActionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Clone a Screenshot"
                    />
                    <ActionButton
                        icon={<Figma className="w-4 h-4" />}
                        label="Import from Figma"
                    />
                    <ActionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="Upload a Project"
                    />
                    <ActionButton
                        icon={<MonitorIcon className="w-4 h-4" />}
                        label="Landing Page"
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-4 h-4" />}
                        label="Sign Up Form"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
} 