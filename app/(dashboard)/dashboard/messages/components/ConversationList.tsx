'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, Plus, Shield, Users, Baby, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { id: string; full_name: string; site_role: string };
  recipient?: { id: string; full_name: string; site_role: string };
  sender_name?: string;
  recipient_name?: string;
};

interface ConversationListProps {
  messages: Message[];
  selectedMessage: Message | null;
  userId: string;
  onSelectMessage: (message: Message) => void;
  onNewMessage: () => void;
}

function getRoleIcon(roleType: string) {
  switch (roleType) {
    case 'admin':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'teacher':
      return <Users className="h-4 w-4 text-green-600" />;
    case 'parent':
      return <Baby className="h-4 w-4 text-purple-600" />;
    default:
      return <User className="h-4 w-4 text-gray-600" />;
  }
}

export default function ConversationList({
  messages,
  selectedMessage,
  userId,
  onSelectMessage,
  onNewMessage,
}: ConversationListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Inbox className="h-5 w-5 mr-2" />
            Messages
          </div>
          <Button onClick={onNewMessage} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </CardTitle>
        <CardDescription>{messages.length} messages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages yet</p>
              <Button onClick={onNewMessage} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          ) : (
            messages.map((message) => {
              const isSelected = selectedMessage?.id === message.id;
              const isUnread = !message.read && message.recipient_id === userId;
              const otherPerson =
                message.sender_id === userId ? message.recipient : message.sender;
              const otherPersonName =
                message.sender_id === userId
                  ? message.recipient_name
                  : message.sender_name;

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isUnread ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => onSelectMessage(message)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {message.subject}
                    </h4>
                    {isUnread && (
                      <Badge variant="default" className="text-xs bg-red-500 hover:bg-red-600">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1 truncate">
                      <span>{message.sender_id === userId ? 'To: ' : 'From: '}</span>
                      {otherPerson && getRoleIcon(otherPerson.site_role)}
                      <span className="truncate">{otherPersonName}</span>
                    </div>
                    <span className="ml-2 flex-shrink-0">{formatDate(message.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

