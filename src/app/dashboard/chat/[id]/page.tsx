'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useDashboard } from '@/contexts/DashboardContext';
import type { ChatMessage, ChatModelKey, IntentCategory, ChatStreamEvent } from '@/lib/types';

// Model display info
const MODEL_INFO: Record<ChatModelKey, { name: string; color: string }> = {
  claude: { name: 'Claude', color: '#f59e0b' },
  gpt: { name: 'GPT-4o', color: '#10b981' },
  gemini: { name: 'Gemini', color: '#8b5cf6' },
  llama: { name: 'Llama', color: '#06b6d4' },
};

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshChats } = useDashboard();

  const chatId = params.id as string;
  const initialMessage = searchParams.get('message');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [routingInfo, setRoutingInfo] = useState<{
    model?: ChatModelKey;
    category?: IntentCategory;
    reason?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasProcessedInitialMessage = useRef(false);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else if (res.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Process initial message from URL
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current && !isLoading) {
      hasProcessedInitialMessage.current = true;
      // Clear the URL param
      router.replace(`/dashboard/chat/${chatId}`, { scroll: false });
      // Send the message - use a local async function to avoid dependency issues
      const sendInitialMessage = async () => {
        if (!initialMessage.trim() || isStreaming) return;

        const userMsg: ChatMessage = {
          id: `temp-${Date.now()}`,
          chat_id: chatId,
          role: 'user',
          content: initialMessage.trim(),
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsStreaming(true);
        setStreamingContent('');
        setRoutingInfo(null);

        try {
          const res = await fetch('/api/chats/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              content: initialMessage.trim(),
            }),
          });

          if (!res.ok) throw new Error('Failed to send message');

          const reader = res.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error('No response body');

          let fullContent = '';
          let messageId = '';
          let finalModel: ChatModelKey | undefined;
          let finalCategory: IntentCategory | undefined;
          let finalReason: string | undefined;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event: ChatStreamEvent = JSON.parse(line.slice(6));
                  switch (event.type) {
                    case 'routing':
                      setRoutingInfo({
                        model: event.model,
                        category: event.category,
                        reason: event.routing_reason,
                      });
                      finalModel = event.model;
                      finalCategory = event.category;
                      finalReason = event.routing_reason;
                      break;
                    case 'chunk':
                      fullContent += event.content || '';
                      setStreamingContent(fullContent);
                      break;
                    case 'complete':
                      messageId = event.message_id || '';
                      break;
                  }
                } catch { /* skip */ }
              }
            }
          }

          const assistantMsg: ChatMessage = {
            id: messageId || `msg-${Date.now()}`,
            chat_id: chatId,
            role: 'assistant',
            content: fullContent,
            model: finalModel,
            category: finalCategory,
            routing_reason: finalReason,
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent('');
          refreshChats();
        } catch (error) {
          console.error('Error:', error);
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        } finally {
          setIsStreaming(false);
          setRoutingInfo(null);
        }
      };
      sendInitialMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, isLoading, chatId, router]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setRoutingInfo(null);

    try {
      const res = await fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      let messageId = '';
      let finalModel: ChatModelKey | undefined;
      let finalCategory: IntentCategory | undefined;
      let finalReason: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ChatStreamEvent = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'routing':
                  setRoutingInfo({
                    model: event.model,
                    category: event.category,
                    reason: event.routing_reason,
                  });
                  finalModel = event.model;
                  finalCategory = event.category;
                  finalReason = event.routing_reason;
                  break;

                case 'chunk':
                  fullContent += event.content || '';
                  setStreamingContent(fullContent);
                  break;

                case 'complete':
                  messageId = event.message_id || '';
                  break;

                case 'error':
                  console.error('Stream error:', event.error);
                  break;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add the complete assistant message
      const assistantMessage: ChatMessage = {
        id: messageId || `msg-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant',
        content: fullContent,
        model: finalModel,
        category: finalCategory,
        routing_reason: finalReason,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
      refreshChats(); // Update sidebar

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temp user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsStreaming(false);
      setRoutingInfo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Debate this prompt
  const handleDebateThis = (message: ChatMessage) => {
    const prompt = message.role === 'user' ? message.content : messages.find((m) => m.role === 'user')?.content;
    if (prompt) {
      router.push(`/?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  // Try different model
  const handleTryDifferentModel = async (message: ChatMessage, newModel: ChatModelKey) => {
    if (isStreaming) return;

    // Find the user message that triggered this response
    const messageIndex = messages.findIndex((m) => m.id === message.id);
    const userMessage = messages.slice(0, messageIndex).reverse().find((m) => m.role === 'user');

    if (!userMessage) return;

    setIsStreaming(true);
    setStreamingContent('');
    setRoutingInfo({ model: newModel, category: message.category, reason: `Manually selected ${MODEL_INFO[newModel].name}` });

    try {
      const res = await fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          content: userMessage.content,
          force_model: newModel,
        }),
      });

      if (!res.ok) throw new Error('Failed to regenerate');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullContent = '';
      let messageId = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ChatStreamEvent = JSON.parse(line.slice(6));
              if (event.type === 'chunk') {
                fullContent += event.content || '';
                setStreamingContent(fullContent);
              } else if (event.type === 'complete') {
                messageId = event.message_id || '';
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      const newAssistantMessage: ChatMessage = {
        id: messageId || `msg-${Date.now()}`,
        chat_id: chatId,
        role: 'assistant',
        content: fullContent,
        model: newModel,
        category: message.category,
        routing_reason: `Manually selected ${MODEL_INFO[newModel].name}`,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      setStreamingContent('');
      refreshChats();

    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsStreaming(false);
      setRoutingInfo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm font-mono text-gray-400">Start the conversation...</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onDebateThis={() => handleDebateThis(message)}
            onTryDifferentModel={(model) => handleTryDifferentModel(message, model)}
            isLatestAssistant={
              message.role === 'assistant' &&
              message.id === messages.filter((m) => m.role === 'assistant').pop()?.id
            }
          />
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 border border-black flex items-center justify-center">
              {routingInfo?.model ? (
                <span
                  className="text-xs font-display"
                  style={{ color: MODEL_INFO[routingInfo.model].color }}
                >
                  {routingInfo.model.charAt(0).toUpperCase()}
                </span>
              ) : (
                <div className="w-3 h-3 border border-black animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {routingInfo && (
                <div className="mb-2 flex items-center gap-2 text-xs font-mono text-gray-400">
                  <span style={{ color: routingInfo.model ? MODEL_INFO[routingInfo.model].color : undefined }}>
                    {routingInfo.model ? MODEL_INFO[routingInfo.model].name : 'Routing...'}
                  </span>
                  {routingInfo.reason && (
                    <>
                      <span>•</span>
                      <span>{routingInfo.reason}</span>
                    </>
                  )}
                </div>
              )}
              <div className="bg-white border border-gray-200 p-4">
                <p className="text-sm font-mono text-gray-600 whitespace-pre-wrap">
                  {streamingContent || <span className="animate-pulse">Thinking...</span>}
                  <span className="inline-block w-2 h-4 bg-black ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-white border border-gray-200 text-black placeholder-gray-400 p-3 text-sm font-mono outline-none resize-none focus:border-black transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-black text-white font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  onDebateThis,
  onTryDifferentModel,
  isLatestAssistant,
}: {
  message: ChatMessage;
  onDebateThis: () => void;
  onTryDifferentModel: (model: ChatModelKey) => void;
  isLatestAssistant: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 border flex items-center justify-center ${
          isUser ? 'border-gray-400' : 'border-black'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-display text-gray-400">U</span>
        ) : message.model ? (
          <span
            className="text-xs font-display"
            style={{ color: MODEL_INFO[message.model].color }}
          >
            {message.model.charAt(0).toUpperCase()}
          </span>
        ) : (
          <span className="text-xs font-display text-black">AI</span>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        {/* Model info for assistant messages */}
        {!isUser && message.model && (
          <div className="mb-2 flex items-center gap-2 text-xs font-mono text-gray-400">
            <span style={{ color: MODEL_INFO[message.model].color }}>
              {MODEL_INFO[message.model].name}
            </span>
            {message.routing_reason && (
              <>
                <span>•</span>
                <span>{message.routing_reason}</span>
              </>
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={`inline-block max-w-full p-4 ${
            isUser
              ? 'bg-gray-100 border border-gray-200'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-sm font-mono text-gray-600 whitespace-pre-wrap text-left">
            {message.content}
          </p>
        </div>

        {/* Actions for assistant messages */}
        {!isUser && isLatestAssistant && showActions && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={onDebateThis}
              className="text-xs font-mono text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              DEBATE THIS
            </button>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-gray-400">TRY:</span>
              {(Object.keys(MODEL_INFO) as ChatModelKey[])
                .filter((m) => m !== message.model)
                .map((model) => (
                  <button
                    key={model}
                    onClick={() => onTryDifferentModel(model)}
                    className="text-xs font-mono hover:opacity-100 opacity-60 transition-opacity"
                    style={{ color: MODEL_INFO[model].color }}
                  >
                    {MODEL_INFO[model].name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
