import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { Zap } from 'lucide-react';

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

export default function DayTradingTraining() {
  const [, setLocation] = useLocation();

  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/day-trading'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading Day Trading Training...</div>
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
      groupId="day-trading"
      groupTitle="Day Trading & Scalping Mastery"
      groupDescription="Master fast-paced intraday trading with professional techniques from 30-second setups to classic entries and leverage strategies"
      groupIcon={<Zap className="w-8 h-8 text-yellow-400" />}
      accentColor="yellow"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
