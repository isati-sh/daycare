'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Shield, Users, Baby, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { id: string; full_name: string; site_role: string };
  recipient?: { id: string; full_name: string; site_role: string };
  sender_name?: string;
  recipient_name?: string;
};

interface MessageThreadProps {
  message: Message;
  userId: string;
  onReply: () => void;
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

function getRoleBadgeColor(roleType: string) {
  switch (roleType) {
    case 'admin':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'teacher':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'parent':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function MessageThread({ message, userId, onReply }: MessageThreadProps) {
  const isSent = message.sender_id === userId;
  const otherPerson = isSent ? message.recipient : message.sender;
  const otherPersonName = isSent ? message.recipient_name : message.sender_name;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            {message.subject}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{isSent ? 'Sent' : 'Received'}</Badge>
            <span className="text-sm text-gray-500">{formatDate(message.created_at)}</span>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center space-x-2">
          <span>{isSent ? 'To: ' : 'From: '}</span>
          {otherPerson && getRoleIcon(otherPerson.site_role)}
          <span>{otherPersonName}</span>
          {otherPerson && (
            <Badge className={`text-xs ${getRoleBadgeColor(otherPerson.site_role)}`}>
              {otherPerson.site_role}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onReply}>
            <Send className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

