import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function NoChildrenState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Children Enrolled
          </h3>
          <p className="text-gray-600 mb-4">
            Enroll your child to view detailed reports
          </p>
          <Button asChild>
            <Link href="/dashboard/enroll">Enroll Child</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

