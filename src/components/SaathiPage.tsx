import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Phone, MessageSquare, Brain, Settings, Play, Pause, RotateCcw, TestTube, Send, User, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VoiceAssistant } from './VoiceAssistant';
import { ChatInterface } from './ChatInterface';
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

// Extend User type to include phone_number
interface ExtendedUser {
  id: string;
  email?: string;
  phone_number?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const SaathiPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const extendedUser = user as ExtendedUser;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceMode, setVoiceMode] = useState<'chat' | 'voice'>('voice');
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'ai'>('ai');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after sending message
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  // Fetch user's assigned phone number
  useEffect(() => {
    const fetchUserPhoneNumber = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/auth/phone/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.phone_number) {
          setAssignedPhoneNumber(data.phone_number);
        } else {
          // If no phone number assigned, try to assign one
          const onboardResponse = await fetch('/api/auth/onboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id
            }),
          });
          
          const onboardData = await onboardResponse.json();
          if (onboardData.success && onboardData.phone_number) {
            setAssignedPhoneNumber(onboardData.phone_number);
          }
        }
      } catch (error) {
        console.error('Failed to fetch phone number:', error);
      }
    };

    fetchUserPhoneNumber();
  }, [user?.id]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInterimTranscript(interimTranscript);
        
        if (finalTranscript) {
          handleVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
        toast({
          title: "Voice recognition error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }

    synthesisRef.current = window.speechSynthesis;
  }, [toast]);

  const handleVoiceInput = async (text: string) => {
    setCurrentInput(text);
    addMessage(text, true);
    setIsListening(false);
    setIsProcessing(true);
    
    // Update conversation history
    const updatedHistory = conversationHistory + `\nUser: ${text}`;
    setConversationHistory(updatedHistory);
    
    try {
      // Call GPT API directly for better voice-to-voice experience
      const response = await fetch('/api/gpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedHistory,
          voiceMode: voiceMode,
          userContext: {
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            phoneNumber: assignedPhoneNumber || extendedUser?.phone_number || '+91-9876543210'
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.response);
        addMessage(data.response, false);
        
        // Update conversation history with AI response
        setConversationHistory(prev => prev + `\nSAATHI: ${data.response}`);
        
        if (autoSpeak && voiceMode === 'voice') {
          speakText(data.response);
        }
      } else {
        // Enhanced fallback responses
        const fallbackResponses = [
          `I heard you say: "${text}". That's interesting! Tell me more about it.`,
          `You mentioned: "${text}". I'd love to help you with that. What specific information are you looking for?`,
          `I understand you're asking about: "${text}". Let me think about the best way to help you with this.`,
          `Thank you for sharing: "${text}". How can I assist you further with this topic?`,
          `I caught that you said: "${text}". This sounds important. What would you like to know more about?`
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setAiResponse(randomResponse);
        addMessage(randomResponse, false);
        
        if (autoSpeak && voiceMode === 'voice') {
          speakText(randomResponse);
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
      toast({
        title: "Connection error",
        description: "Using enhanced local response.",
        variant: "destructive",
      });
      
      // Enhanced local response
      const localResponses = [
        `I understand you said: "${text}". That's a great point! What would you like to explore further?`,
        `You mentioned: "${text}". I'd be happy to help you with that. Could you provide more details?`,
        `Interesting! You said: "${text}". Let me help you with this. What specific aspect would you like to focus on?`,
        `Thank you for sharing: "${text}". This is valuable information. How can I assist you best?`,
        `I caught that you said: "${text}". This is important. What would you like to know more about?`
      ];
      const randomLocalResponse = localResponses[Math.floor(Math.random() * localResponses.length)];
      setAiResponse(randomLocalResponse);
      addMessage(randomLocalResponse, false);
      
      if (autoSpeak && voiceMode === 'voice') {
        speakText(randomLocalResponse);
      }
    } finally {
      setIsProcessing(false);
      setCurrentInput('');
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startListening = () => {
    if (recognitionRef.current && voiceEnabled) {
      recognitionRef.current.start();
      setIsListening(true);
      setInterimTranscript('');
      toast({
        title: "Listening...",
        description: "Speak now to interact with SAATHI",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const speakText = (text: string) => {
    if (synthesisRef.current && voiceEnabled) {
      // Stop any ongoing speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const handleTextInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim() && !isProcessing) {
      e.preventDefault();
      const text = currentInput.trim();
      setCurrentInput('');
      addMessage(text, true);
      setIsProcessing(true);
      
      // Update conversation history
      const updatedHistory = conversationHistory + `\nUser: ${text}`;
      setConversationHistory(updatedHistory);
      
      try {
        const response = await fetch('/api/gpt/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            conversationHistory: updatedHistory,
            voiceMode: voiceMode,
            userContext: {
              name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
              phoneNumber: assignedPhoneNumber || extendedUser?.phone_number || '+91-9876543210'
            }
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setAiResponse(data.response);
          addMessage(data.response, false);
          setConversationHistory(prev => prev + `\nSAATHI: ${data.response}`);
          
          if (autoSpeak && voiceMode === 'voice') {
            speakText(data.response);
          }
        } else {
          const fallbackResponses = [
            `I understand you said: "${text}". That's interesting! Tell me more about it.`,
            `You mentioned: "${text}". I'd love to help you with that. What specific information are you looking for?`,
            `I understand you're asking about: "${text}". Let me think about the best way to help you with this.`,
            `Thank you for sharing: "${text}". How can I assist you further with this topic?`,
            `I caught that you said: "${text}". This sounds important. What would you like to know more about?`
          ];
          const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
          setAiResponse(randomResponse);
          addMessage(randomResponse, false);
          
          if (autoSpeak && voiceMode === 'voice') {
            speakText(randomResponse);
          }
        }
      } catch (error) {
        console.error('API call failed:', error);
        toast({
          title: "Connection error",
          description: "Using enhanced local response.",
          variant: "destructive",
        });
        
        const localResponses = [
          `I understand you said: "${text}". That's a great point! What would you like to explore further?`,
          `You mentioned: "${text}". I'd be happy to help you with that. Could you provide more details?`,
          `Interesting! You said: "${text}". Let me help you with this. What specific aspect would you like to focus on?`,
          `Thank you for sharing: "${text}". This is valuable information. How can I assist you best?`,
          `I caught that you said: "${text}". This is important. What would you like to know more about?`
        ];
        const randomLocalResponse = localResponses[Math.floor(Math.random() * localResponses.length)];
        setAiResponse(randomLocalResponse);
        addMessage(randomLocalResponse, false);
        
        if (autoSpeak && voiceMode === 'voice') {
          speakText(randomLocalResponse);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setAiResponse('');
    setCurrentInput('');
    setConversationHistory('');
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Backend connected!",
          description: "SAATHI is ready to help you.",
        });
      } else {
        setIsConnected(false);
        toast({
          title: "Backend disconnected",
          description: "Using local fallback mode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Backend unavailable",
        description: "Using local fallback mode.",
        variant: "destructive",
      });
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <VercelV0Chat />
    </div>
  );
}; 