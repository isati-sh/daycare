'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Activity, BookOpen, Heart, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';

type DevelopmentMilestone = Database['public']['Tables']['development_milestones']['Row'];

interface DevelopmentMilestonesProps {
  milestones: DevelopmentMilestone[];
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'physical':
      return <Activity className="h-5 w-5 text-blue-500" />;
    case 'cognitive':
      return <BookOpen className="h-5 w-5 text-green-500" />;
    case 'social':
      return <Heart className="h-5 w-5 text-pink-500" />;
    case 'language':
      return <FileText className="h-5 w-5 text-purple-500" />;
    default:
      return <Award className="h-5 w-5 text-yellow-500" />;
  }
}

export default function DevelopmentMilestones({ milestones }: DevelopmentMilestonesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Development Milestones
        </CardTitle>
        <CardDescription>Track your child's developmental progress</CardDescription>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No milestones recorded yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Teachers will add milestones as your child achieves them
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(milestone.category)}
                    <Badge variant="outline">{milestone.category}</Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(milestone.achieved_date)}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{milestone.milestone}</h4>
                {milestone.notes && (
                  <p className="text-sm text-gray-600">{milestone.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

