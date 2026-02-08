import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { Newspaper } from 'lucide-react';

interface StrategyVariant {
  slug: string;
  title: string;
  variantKey: string;
  summary: string;
  isPrimary: boolean;
  category: string;
  risk: string;
}

interface GroupResponse {
  groupId: string;
  primaryStrategy: any;
  variants: StrategyVariant[];
}

export default function NewsDiscoveryTraining() {
  const [, setLocation] = useLocation();

  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/news-discovery'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading News & Discovery Training...</div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">No training data found</div>
      </div>
    );
  }

  return (
    <ProfessionalTrainingLayout
      groupId="news-discovery"
      groupTitle="News & Discovery Trading"
      groupDescription="Discover new opportunities through narrative trading, airdrops, and contrarian reversal strategies that exploit market psychology"
      groupIcon={<Newspaper className="w-8 h-8 text-orange-400" />}
      accentColor="orange"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
