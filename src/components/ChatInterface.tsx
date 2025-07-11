import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2, RotateCcw, MessageSquare, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after sending message
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('saathi-chat-history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        
        // Rebuild conversation history
        const history = parsedMessages
          .map((msg: any) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
          .join('\n');
        setConversationHistory(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('saathi-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, isLoading = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isLoading
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    addMessage(text, true);
    setInputValue('');

    // Update conversation history
    const updatedHistory = conversationHistory + `\nUser: ${text}`;
    setConversationHistory(updatedHistory);

    // Add loading message for AI
    const loadingMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    }]);

    setIsLoading(true);

    try {
      // Send to ChatGPT API
      const response = await fetch('/api/gpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedHistory,
          voiceMode: 'chat',
          userContext: {
            name: 'User',
            phoneNumber: '+91-9876543210'
          }
        }),
      });

      const data = await response.json();

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

      if (data.success) {
        // Add AI response
        addMessage(data.response, false);
        setConversationHistory(prev => prev + `\nAssistant: ${data.response}`);
      } else {
        // Handle error
        const errorMessage = data.error || 'Failed to get response from AI';
        addMessage(`Sorry, I encountered an error: ${errorMessage}`, false);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
      
      console.error('Chat error:', error);
      addMessage('Sorry, I encountered a network error. Please try again.', false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the AI service. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory('');
    localStorage.removeItem('saathi-chat-history');
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">SAATHI AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Powered by ChatGPT</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {messages.length} messages
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8 p-0"
                disabled={messages.length === 0}
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
          <div className="text-center text-muted-foreground py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm max-w-md mx-auto">
              Ask me anything! I'm here to help with questions, brainstorming, 
              writing, analysis, and much more.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What's the weather like?",
                  "Help me write an email",
                  "Explain quantum physics",
                  "Plan my weekend"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.isUser ? 'You' : 'SAATHI'}
                  </span>
                  {message.isLoading && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
                <span className="text-xs opacity-50 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {isLoading && (
            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>SAATHI is responding...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 