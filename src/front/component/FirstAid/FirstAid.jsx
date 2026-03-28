import axios from "axios";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../Footer/Footer';
import Navbar from "../NavBar/Navbar";

// Icons
import { IoSend } from "react-icons/io5";

export default function FirstAid() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t, i18n } = useTranslation();
    const chatEndRef = useRef(null);
    const isAr = i18n.language === 'ar';

    // Initial greeting
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                text: t('firstaid.welcome_message', isAr ? 'مرحبا! أنا هنا لمساعدتك في تعليمات الإسعافات الأولية. يرجى وصف الحالة.' : 'Hi! I am here to help you with First Aid instructions. Please describe the situation.')
            }
        ]);
    }, [i18n.language, isAr, t]);

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const fetchGeminiFallback = async (text, isArabic) => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: isArabic
                        ? 'عذراً، الخادم المحلي لا يستجيب ولم يتم العثور على مفتاح Gemini (VITE_GEMINI_API_KEY).'
                        : 'Sorry, the local server is down and no Gemini API key was found (VITE_GEMINI_API_KEY).'
                }]);
                return;
            }

            const prompt = isArabic
                ? `أنت مساعد طبي خبير في الإسعافات الأولية. قدم تعليمات إسعافات أولية دقيقة وموجزة بناءً على هذه الحالة: "${text}"`
                : `You are an expert medical assistant for first aid. Provide accurate and concise first aid instructions based on this situation: "${text}"`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiResponse = response.data.candidates[0].content.parts[0].text;
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
        } catch (error) {
            console.error("Gemini fallback failed:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: t('firstaid.error', isAr ? 'حدث خطأ في الاتصال بـ Gemini. يرجى المحاولة لاحقاً.' : 'Connection error with Gemini. Please try again later.')
            }]);
        }
    };

    const predictionHandle = async () => {
        if (!value.trim()) return;

        const userText = value.trim();
        const lowerText = userText.toLowerCase();
        setValue("");
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        // Conversational check (Greetings & Thanks)
        const greetings = ['hi', 'hello', 'hey', 'مرحبا', 'اهلا', 'سلام', 'صباح الخير', 'مساء الخير'];
        const thanks = ['thanks', 'thank you', 'thx', 'شكرا', 'تسلم', 'جزاك الله خيرا', 'مشكور'];

        if (greetings.some(word => lowerText.includes(word))) {
            const reply = isAr ? 'أهلاً بك! كيف يمكنني مساعدتك في الإسعافات الأولية اليوم؟' : 'Hello! How can I help you with first aid today?';
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        if (thanks.some(word => lowerText.includes(word))) {
            const reply = isAr ? 'العفو! أنا هنا دائماً للمساعدة. أتمنى لك السلامة.' : "You're welcome! I'm always here to help. Stay safe.";
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        const baseURL = 'https://web-production-654d2.up.railway.app/predict/?text= ' + userText;
        try {
            const response = await axios.get(baseURL);
            const data = response.data;
            const instruction = isAr ? data.firstaid_instructions_in_arabic : data.firstaid_instructions;

            const isFailureMsg =
                instruction === "I don't understand!" ||
                instruction === "لا أفهم!" ||
                data.firstaid_instructions === "I don't understand!";

            if (instruction && !isFailureMsg) {
                setMessages(prev => [...prev, { role: 'assistant', text: instruction }]);
            } else {
                throw new Error("Local model returned inability to understand.");
            }
        } catch (err) {
            console.log("Local model failed, falling back to Gemini...", err.message || err);
            await fetchGeminiFallback(userText, isAr);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            predictionHandle();
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-color)]   pt-20 transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex-grow flex flex-col max-w-2xl mx-auto w-full bg-[var(--card-bg)] shadow-2xl relative overflow-hidden sm:rounded-b-[2.5rem] border-x border-b border-[var(--border-color)]">

                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#0076f7] to-[#00c6ff] p-2 relative">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-white text-2xl font-black tracking-tight">First Care</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse  "></div>
                            <span className="text-white/90 text-sm font-medium">We're online!</span>
                        </div>
                    </div>
                    {/* Wavy bottom effect */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
                        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="relative block w-full h-4 fill-[var(--bg-color)] transition-all">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-color)] transition-all">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-[17px] font-medium leading-relaxed shadow-sm
                                ${msg.role === 'user'
                                    ? 'bg-[#0091ff] text-white rounded-tr-none'
                                    : 'bg-[var(--card-bg)] text-[var(--text-main)] rounded-tl-none border border-[var(--border-color)]'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-[var(--border-color)] shadow-sm">
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] transition-all">
                    <div className="flex items-center gap-3 w-full" dir={isAr ? 'rtl' : 'ltr'}>
                        <input
                            type="text"
                            placeholder={isAr ? "اكتب رسالتك..." : "Enter your message..."}
                            className="flex-grow p-4 bg-transparent text-lg text-[var(--text-main)] outline-none focus:ring-0 placeholder-[var(--text-muted)] font-medium"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && predictionHandle()}
                        />
                        <button
                            className={`w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-[#0091ff] to-[#00c6ff] text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center p-0 ${isLoading || !value.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={predictionHandle}
                            disabled={isLoading || !value.trim()}
                        >
                            <IoSend size={20} className={isAr ? 'rotate-180 mr-1' : 'ml-1'} />
                        </button>
                    </div>
                    {/* Powered By Footer */}
                    <div className="flex items-center justify-center gap-1 mt-4 opacity-50 text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                        <span>Powered By</span>
                        <span className="text-[#0091ff]">First Care</span>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
