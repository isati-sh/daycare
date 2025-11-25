'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database';
import ChildSelector from './ChildSelector';
import PortfolioHeader from './PortfolioHeader';
import DevelopmentMilestones from './DevelopmentMilestones';
import PortfolioEntries from './PortfolioEntries';
import ProgressSummary from './ProgressSummary';

type Child = Database['public']['Tables']['children']['Row'];
type PortfolioEntry = Database['public']['Tables']['portfolio_entries']['Row'];
type DevelopmentMilestone = Database['public']['Tables']['development_milestones']['Row'];

interface PortfolioClientProps {
  children: Child[];
  selectedChild: Child;
  portfolioEntries: PortfolioEntry[];
  milestones: DevelopmentMilestone[];
}

export default function PortfolioClient({
  children,
  selectedChild,
  portfolioEntries,
  milestones,
}: PortfolioClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChildChange = (childId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('child', childId);
    router.push(`/dashboard/portfolio?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Child Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Track your child's development, activities, and milestones
          </p>
        </div>

        {/* Child Selector */}
        <ChildSelector
          children={children}
          selectedChild={selectedChild}
          onChildChange={handleChildChange}
        />

        <div className="space-y-8">
          {/* Child Info Card */}
          <PortfolioHeader child={selectedChild} />

          {/* Development Milestones */}
          <DevelopmentMilestones milestones={milestones} />

          {/* Portfolio Entries */}
          <PortfolioEntries entries={portfolioEntries} />

          {/* Progress Summary */}
          <ProgressSummary milestones={milestones} />
        </div>
      </div>
    </div>
  );
}

