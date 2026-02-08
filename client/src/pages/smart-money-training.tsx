import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { Building2 } from 'lucide-react';

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

export default function SmartMoneyTraining() {
  const [, setLocation] = useLocation();

  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/smart-money'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading Smart Money Training...</div>
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
      groupId="smart-money"
      groupTitle="Smart Money & Institutional Trading"
      groupDescription="Learn to trade alongside institutional capital by following smart money movements, order flow, and news-based strategies"
      groupIcon={<Building2 className="w-8 h-8 text-purple-400" />}
      accentColor="purple"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
