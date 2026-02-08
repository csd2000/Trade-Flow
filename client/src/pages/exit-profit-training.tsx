import { useQuery } from '@tanstack/react-query';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { TrendingUp } from 'lucide-react';

interface StrategyVariant {
  slug: string;
  title: string;
  variantKey: string;
  summary: string;
  isPrimary: boolean;
}

interface GroupResponse {
  groupId: string;
  primaryStrategy: any;
  variants: StrategyVariant[];
}

export default function ExitProfitTraining() {
  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/exit-profit'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading Exit & Profit Training...</div>
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
      groupId="exit-profit"
      groupTitle="Exit & Profit Management"
      groupDescription="Master the art of taking profits, exit strategies, and protecting your gains"
      groupIcon={<TrendingUp className="w-8 h-8 text-green-400" />}
      accentColor="green"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
