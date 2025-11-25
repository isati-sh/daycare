'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Camera, Award, Activity, FileText, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';

type PortfolioEntry = Database['public']['Tables']['portfolio_entries']['Row'];

interface PortfolioEntriesProps {
  entries: PortfolioEntry[];
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'art':
      return <Award className="h-5 w-5 text-yellow-500" />;
    case 'learning':
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case 'physical':
      return <Activity className="h-5 w-5 text-green-500" />;
    case 'social':
      return <Star className="h-5 w-5 text-pink-500" />;
    case 'milestone':
      return <Award className="h-5 w-5 text-purple-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

export default function PortfolioEntries({ entries }: PortfolioEntriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Portfolio Entries
        </CardTitle>
        <CardDescription>Activities, observations, and special moments</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No portfolio entries yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Teachers will add entries as they observe your child's activities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(entry.category)}
                    <Badge variant="outline">{entry.category}</Badge>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{entry.title}</h4>
                <p className="text-gray-600 mb-2">{entry.description}</p>
                {entry.photos && entry.photos.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {entry.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Portfolio photo ${index + 1}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                {entry.teacher_notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Teacher Notes: {entry.teacher_notes}
                  </p>
                )}
              </div>
            ))}
            {entries.length >= 20 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Showing 20 most recent entries. More entries may be available.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

