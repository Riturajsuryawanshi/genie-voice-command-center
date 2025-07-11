import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Phone, MessageSquare, Brain, Settings, Play, Pause, RotateCcw, TestTube, Send, User, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VoiceAssistant } from './VoiceAssistant';
import { ChatInterface } from './ChatInterface';

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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">SAATHI</h1>
              <p className="text-xs text-gray-500">Your AI Voice Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceMode(voiceMode === 'voice' ? 'chat' : 'voice')}
              className={`text-xs ${voiceMode === 'voice' ? 'text-purple-600 border-purple-600' : 'text-gray-600 border-gray-600'}`}
            >
              {voiceMode === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
              {voiceMode === 'voice' ? 'Voice' : 'Chat'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Chat Mode
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'voice'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mic className="h-4 w-4 inline mr-2" />
              Voice Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'ai' ? (
          <ChatInterface className="flex-1" />
        ) : activeTab === 'voice' ? (
          <VoiceAssistant className="flex-1" />
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to SAATHI</h2>
              <p className="text-gray-600 mb-4">Your AI voice companion is ready to help you</p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startListening}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!voiceEnabled}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Voice Chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputRef.current?.focus()}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Type Message
                </Button>
              </div>
              {!isConnected && (
                <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Backend disconnected - using local mode
                  </p>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-indigo-600' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}>
                    {message.isUser ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">SAATHI is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Interim Transcript */}
          {interimTranscript && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-indigo-100 border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs text-indigo-600 font-medium">Listening...</span>
                  </div>
                  <p className="text-sm text-indigo-700 italic">"{interimTranscript}"</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleTextInput}
                  placeholder={voiceMode === 'voice' ? "Type your message or use voice..." : "Type your message..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={isProcessing}
                />
                {voiceMode === 'voice' && (
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                    disabled={isProcessing}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {voiceMode === 'chat' && (
                <Button
                  onClick={() => {
                    if (currentInput.trim() && !isProcessing) {
                      const event = { key: 'Enter', preventDefault: () => {} } as React.KeyboardEvent<HTMLInputElement>;
                      handleTextInput(event);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full"
                  disabled={!currentInput.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Voice Status */}
            {voiceMode === 'voice' && (isSpeaking || isListening) && (
              <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
                {isListening && (
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <div className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Listening...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    <span>SAATHI is speaking...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}; 