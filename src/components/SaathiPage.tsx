import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Phone, MessageSquare, Brain, Settings, Play, Pause, RotateCcw, TestTube } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          handleVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      };
    }

    synthesisRef.current = window.speechSynthesis;
  }, [toast]);

  const handleVoiceInput = async (text: string) => {
    setCurrentInput(text);
    addMessage(text, true);
    setIsListening(false);
    setIsProcessing(true);
    
    try {
      // Call backend API for AI response
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          phoneNumber: extendedUser?.phone_number || '+91-9876543210' // Fallback for testing
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.aiResponse);
        addMessage(data.aiResponse, false);
        
        if (autoSpeak) {
          speakText(data.aiResponse);
        }
      } else {
        // Fallback to local response if API fails
        const fallbackResponses = [
          "I understand you said: " + text + ". How can I help you further?",
          "That's interesting! Tell me more about " + text + ".",
          "I heard you mention " + text + ". Let me think about that...",
          "Thank you for sharing that. What would you like to know about " + text + "?",
          "I'm processing your request about " + text + ". Please wait a moment."
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setAiResponse(randomResponse);
        addMessage(randomResponse, false);
        
        if (autoSpeak) {
          speakText(randomResponse);
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
      toast({
        title: "Connection error",
        description: "Using local fallback response.",
        variant: "destructive",
      });
      
      // Fallback response
      const fallbackResponse = "I'm having trouble connecting to my AI brain right now, but I heard you say: " + text + ". Please try again later.";
      setAiResponse(fallbackResponse);
      addMessage(fallbackResponse, false);
      
      if (autoSpeak) {
        speakText(fallbackResponse);
      }
    } finally {
      setIsProcessing(false);
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
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now to interact with SAATHI",
      });
    } else {
      toast({
        title: "Voice recognition not available",
        description: "Please use a modern browser with speech recognition support.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const handleTextInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      const text = currentInput.trim();
      addMessage(text, true);
      setCurrentInput('');
      setIsProcessing(true);
      
      try {
        // Call backend API for AI response
        const response = await fetch('/api/webhook/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            phoneNumber: extendedUser?.phone_number || '+91-9876543210'
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setAiResponse(data.aiResponse);
          addMessage(data.aiResponse, false);
          
          if (autoSpeak) {
            speakText(data.aiResponse);
          }
        } else {
          // Fallback response
          const fallbackResponse = "I understand you said: " + text + ". How can I help you further?";
          setAiResponse(fallbackResponse);
          addMessage(fallbackResponse, false);
          
          if (autoSpeak) {
            speakText(fallbackResponse);
          }
        }
      } catch (error) {
        console.error('API call failed:', error);
        const fallbackResponse = "I'm having trouble connecting right now, but I heard you say: " + text + ". Please try again later.";
        setAiResponse(fallbackResponse);
        addMessage(fallbackResponse, false);
        
        if (autoSpeak) {
          speakText(fallbackResponse);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SAATHI
                </h1>
                <p className="text-sm text-gray-500">Your AI Voice Companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={testBackendConnection}
                className="text-blue-600 hover:text-blue-700"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={voiceEnabled ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
              >
                {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                Voice
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={autoSpeak ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-gray-600'}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Auto-Speak
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversation Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversation</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearConversation}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Start a conversation with SAATHI</p>
                      <p className="text-sm">Use voice or text to begin</p>
                      {!isConnected && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
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
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isUser
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          <span className="text-sm">SAATHI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleTextInput}
                      placeholder="Type your message or use voice..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      className={`${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                      disabled={isProcessing}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Voice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Voice Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-full ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={isProcessing}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Listening
                      </>
                    )}
                  </Button>
                  
                  {isSpeaking && (
                    <div className="flex items-center justify-center p-2 bg-blue-50 rounded-md">
                      <Volume2 className="h-4 w-4 mr-2 text-blue-600 animate-pulse" />
                      <span className="text-sm text-blue-600">SAATHI is speaking...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Recognition</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={voiceEnabled ? 'text-green-600' : 'text-red-600'}
                  >
                    {voiceEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-Speak Responses</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={autoSpeak ? 'text-blue-600' : 'text-gray-600'}
                  >
                    {autoSpeak ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    User Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {user.user_metadata?.full_name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {extendedUser?.phone_number || 'Not assigned'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 text-green-600">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 