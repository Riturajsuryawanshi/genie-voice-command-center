import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Send, User, Bot, Loader2, Settings, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

interface VoiceAssistantProps {
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string, provider: string}>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available voices on component mount
  useEffect(() => {
    loadAvailableVoices();
  }, []);

  const loadAvailableVoices = async () => {
    try {
      const response = await fetch('/api/tts/voices');
      const data = await response.json();
      if (data.success) {
        setAvailableVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const addMessage = (text: string, isUser: boolean, audioUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      audioUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processAudioRecording();
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now to interact with SAATHI",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioRecording = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to STT API
      const sttResponse = await fetch('/api/stt/transcribe', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttResponse.json();

      if (!sttData.success) {
        throw new Error(sttData.error || 'Transcription failed');
      }

      const transcribedText = sttData.text;
      
      if (!transcribedText || transcribedText.trim() === '') {
        toast({
          title: "No speech detected",
          description: "Please try speaking more clearly",
          variant: "destructive",
        });
        return;
      }

      // Add user message
      addMessage(transcribedText, true);

      // Update conversation history
      const updatedHistory = conversationHistory + `\nUser: ${transcribedText}`;
      setConversationHistory(updatedHistory);

      // Send to GPT API
      const gptResponse = await fetch('/api/gpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcribedText,
          conversationHistory: updatedHistory,
          voiceMode: 'voice',
          userContext: {
            name: 'User',
            phoneNumber: '+91-9876543210'
          }
        }),
      });

      const gptData = await gptResponse.json();

      if (!gptData.success) {
        throw new Error(gptData.error || 'AI response failed');
      }

      const aiResponse = gptData.response;
      
      // Add AI message
      addMessage(aiResponse, false);

      // Update conversation history
      setConversationHistory(prev => prev + `\nSAATHI: ${aiResponse}`);

      // Convert to speech if auto-speak is enabled
      if (autoSpeak) {
        await speakText(aiResponse);
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const speakText = async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);
    
    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          provider: 'openai'
        }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };
      
      await audio.play();

    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech synthesis failed",
        description: "Text will be displayed only",
        variant: "destructive",
      });
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory('');
    toast({
      title: "Conversation cleared",
      description: "Start a new conversation",
    });
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
    toast({
      title: autoSpeak ? "Auto-speak disabled" : "Auto-speak enabled",
      description: autoSpeak ? "Responses will be text-only" : "Responses will be spoken",
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Voice Assistant</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={autoSpeak ? "default" : "secondary"}>
                {autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoSpeak}
                className="h-8 w-8 p-0"
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Click the microphone button to begin</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.isUser ? 'You' : 'SAATHI'}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              size="lg"
              className={`h-16 w-16 rounded-full ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
          
          {isRecording && (
            <div className="text-center mt-2">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recording...</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 