import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ProfessionalTrainingLayout } from '@/components/professional-training-layout';
import { Brain } from 'lucide-react';

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

export default function AIToolsTraining() {
  const [, setLocation] = useLocation();

  const { data: groupData, isLoading } = useQuery<GroupResponse>({
    queryKey: ['/api/strategies/group/ai-tools'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading AI Tools Training...</div>
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
      groupId="ai-tools"
      groupTitle="AI Tools & Pattern Mastery"
      groupDescription="Leverage AI-powered decision systems, stock scanners, and master candlestick patterns for high-probability trading setups"
      groupIcon={<Brain className="w-8 h-8 text-cyan-400" />}
      accentColor="cyan"
      variants={groupData.variants}
      defaultVariant={groupData.variants.find(v => v.isPrimary)?.variantKey || groupData.variants[0]?.variantKey}
    />
  );
}
