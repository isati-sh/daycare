'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/types/database';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import MessageForm from '../components/MessageForm';
import { MessageSquare } from 'lucide-react';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { id: string; full_name: string; site_role: string };
  recipient?: { id: string; full_name: string; site_role: string };
  sender_name?: string;
  recipient_name?: string;
};

interface MessagesClientProps {
  initialMessages: Message[];
  availableRecipients: Array<{
    id: string;
    full_name: string;
    site_role: string;
  }>;
  userRole: string;
  userId: string;
}

export default function MessagesClient({
  initialMessages,
  availableRecipients,
  userRole,
  userId,
}: MessagesClientProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((msg: any) => ({
      ...msg,
      sender_name: msg.sender?.full_name,
      recipient_name: msg.recipient?.full_name,
    }))
  );

  // Sync with server data when it updates
  useEffect(() => {
    const mapped = initialMessages.map((msg: any) => ({
      ...msg,
      sender_name: msg.sender?.full_name,
      recipient_name: msg.recipient?.full_name,
    }));
    setMessages(mapped);
  }, [initialMessages]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(
    initialMessages.length > 0 ? initialMessages[0] : null
  );
  const [showCompose, setShowCompose] = useState(false);

  const handleMessageSent = () => {
    // Message will be refreshed via router.refresh() in MessageForm
    setShowCompose(false);
  };

  const handleMessageRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Communicate with daycare staff and parents
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Message List */}
          <div className="lg:col-span-1">
            <ConversationList
              messages={messages}
              selectedMessage={selectedMessage}
              userId={userId}
              onSelectMessage={(message: Message) => {
                setSelectedMessage(message);
                if (!message.read && message.recipient_id === userId) {
                  handleMessageRead(message.id);
                }
              }}
              onNewMessage={() => setShowCompose(true)}
            />
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <MessageThread
                message={selectedMessage}
                userId={userId}
                onReply={() => {
                  setShowCompose(true);
                  setSelectedMessage(null);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-600">
                  Choose a message from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compose Message Modal */}
        {showCompose && (
          <MessageForm
            availableRecipients={availableRecipients}
            replyTo={selectedMessage}
            userId={userId}
            onClose={() => setShowCompose(false)}
              onSent={() => handleMessageSent()}
          />
        )}
      </div>
    </div>
  );
}

