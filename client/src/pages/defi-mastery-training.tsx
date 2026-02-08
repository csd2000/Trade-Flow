import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { Coins } from 'lucide-react';

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

export default function DeFiMasteryTraining() {
  const [, setLocation] = useLocation();

  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/defi-mastery'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading DeFi Mastery Training...</div>
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
      groupId="defi-mastery"
      groupTitle="DeFi Mastery Training"
      groupDescription="Complete decentralized finance education covering yield farming, protocols, safety, and passive income strategies"
      groupIcon={<Coins className="w-8 h-8 text-blue-400" />}
      accentColor="blue"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
