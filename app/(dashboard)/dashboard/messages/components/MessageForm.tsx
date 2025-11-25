'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendMessageAction } from '../actions/sendMessage';
import { Database } from '@/types/database';
import { useRouter } from 'next/navigation';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: { id: string; full_name: string; site_role: string };
  recipient?: { id: string; full_name: string; site_role: string };
};

interface MessageFormProps {
  availableRecipients: Array<{
    id: string;
    full_name: string;
    site_role: string;
  }>;
  replyTo?: Message | null;
  userId: string;
  onClose: () => void;
  onSent: () => void;
}

export default function MessageForm({
  availableRecipients,
  replyTo,
  userId,
  onClose,
  onSent,
}: MessageFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: replyTo
      ? replyTo.sender_id === userId
        ? replyTo.recipient_id
        : replyTo.sender_id
      : '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await sendMessageAction({
        recipient_id: formData.recipient_id,
        subject: formData.subject,
        content: formData.content,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to send message');
        setSubmitting(false);
        return;
      }

      toast.success('Message sent successfully');
      
      // Reset form
      setFormData({
        recipient_id: '',
        subject: '',
        content: '',
      });
      
      // Refresh the page to get updated messages
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-sm sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {replyTo ? 'Reply to Message' : 'New Message'}
            </h2>
            <Button variant="ghost" onClick={onClose} className="p-1 sm:p-2" disabled={submitting}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="recipient" className="text-xs sm:text-sm">
                To
              </Label>
              <select
                id="recipient"
                value={formData.recipient_id}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_id: e.target.value })
                }
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base h-10 sm:h-12 mt-1"
                required
                disabled={submitting || !!replyTo}
              >
                <option value="">Select recipient...</option>
                {availableRecipients.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.site_role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subject" className="text-xs sm:text-sm">
                Subject
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject..."
                className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                required
                maxLength={200}
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-xs sm:text-sm">
                Message
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Type your message..."
                rows={6}
                className="text-sm sm:text-base mt-1 min-h-[120px] sm:min-h-[150px]"
                required
                maxLength={5000}
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 sm:h-12 text-sm sm:text-base"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 sm:h-12 text-sm sm:text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

