'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Download, FileText } from 'lucide-react';
import { formatDate, getAge } from '@/lib/utils';
import { Database } from '@/types/database';

type Child = Database['public']['Tables']['children']['Row'];

interface PortfolioHeaderProps {
  child: Child;
}

export default function PortfolioHeader({ child }: PortfolioHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          {child.first_name} {child.last_name}
        </CardTitle>
        <CardDescription>
          Age: {getAge(child.date_of_birth)} years old • {child.age_group}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Child Information</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Age Group:</span> {child.age_group}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{' '}
                {formatDate(child.date_of_birth)}
              </p>
              {child.allergies && child.allergies.length > 0 && (
                <p>
                  <span className="font-medium">Allergies:</span>{' '}
                  {child.allergies.join(', ')}
                </p>
              )}
              {child.medical_notes && (
                <p>
                  <span className="font-medium">Medical Notes:</span> {child.medical_notes}
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full justify-start">
                <Link href={`/dashboard/portfolio/${child.id}/download`}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Portfolio
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href={`/dashboard/portfolio/${child.id}/print`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Print Report
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

