// app/components/Chatbot.tsx

import { useState, useRef, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatbotProps {
    feedback: any;
    onClose: () => void;
}

export function Chatbot({ feedback, onClose }: ChatbotProps) {
    const { ai } = usePuterStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! Ask me anything about this resume analysis."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const userInput = formData.get('user-input') as string;

        if (!userInput.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setIsLoading(true);
        event.currentTarget.reset();

        const prompt = `You are an expert career assistant. Based ONLY on the resume analysis provided, answer the user's questions. Resume Analysis: ${JSON.stringify(feedback)}. Conversation: ${newMessages.map((m) => `${m.role}: ${m.content}`).join('\n')}`;

        try {
            const aiResponse = await ai.chat(prompt);
            // This check fixes the 'possibly undefined' error
            if (!aiResponse || !aiResponse.message || !aiResponse.message.content) {
                throw new Error("Invalid AI response");
            }
            const replyText = aiResponse.message.content as string;
            setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
        } catch (error) {
            console.error("Chatbot AI error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, an error occurred." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-96 h-[32rem] bg-white rounded-2xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">AI Career Assistant</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <img src="/icons/cross.svg" alt="close" className="w-5 h-5" />
                </button>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                           <p className="text-sm italic">Assistant is typing...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end px-4 py-2">
                <img src="/images/robot-typing.gif" alt="AI Assistant" className="w-20 h-16" />
            </div>
            <div className="p-4 border-t">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-3">
                        <input type="text" name="user-input" className="flex-grow p-3 border rounded-full focus:ring-2 focus:ring-blue-500" placeholder="Ask a question..." disabled={isLoading}/>
                        <button type="submit" className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300 flex-shrink-0" aria-label="Send message" disabled={isLoading}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}