'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Activity, BookOpen, Heart, FileText } from 'lucide-react';
import { Database } from '@/types/database';

type DevelopmentMilestone = Database['public']['Tables']['development_milestones']['Row'];

interface ProgressSummaryProps {
  milestones: DevelopmentMilestone[];
}

export default function ProgressSummary({ milestones }: ProgressSummaryProps) {
  const categoryCounts = {
    physical: milestones.filter((m) => m.category === 'physical').length,
    cognitive: milestones.filter((m) => m.category === 'cognitive').length,
    social: milestones.filter((m) => m.category === 'social').length,
    language: milestones.filter((m) => m.category === 'language').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Progress Summary
        </CardTitle>
        <CardDescription>Overview of your child's development areas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Physical</h4>
            <p className="text-sm text-gray-600">{categoryCounts.physical} milestones</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Cognitive</h4>
            <p className="text-sm text-gray-600">{categoryCounts.cognitive} milestones</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Social</h4>
            <p className="text-sm text-gray-600">{categoryCounts.social} milestones</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Language</h4>
            <p className="text-sm text-gray-600">{categoryCounts.language} milestones</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

