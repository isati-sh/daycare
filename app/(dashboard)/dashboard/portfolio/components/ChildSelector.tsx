'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Database } from '@/types/database';

type Child = Database['public']['Tables']['children']['Row'];

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child;
  onChildChange: (childId: string) => void;
}

export default function ChildSelector({
  children,
  selectedChild,
  onChildChange,
}: ChildSelectorProps) {
  if (children.length === 0) return null;

  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Child
      </label>
      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <Button
            key={child.id}
            variant={selectedChild.id === child.id ? 'default' : 'outline'}
            onClick={() => onChildChange(child.id)}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>
              {child.first_name} {child.last_name}
            </span>
            <Badge variant="secondary">{child.age_group}</Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}

