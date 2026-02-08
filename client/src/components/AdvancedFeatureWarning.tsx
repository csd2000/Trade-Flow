import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertTriangle, GraduationCap, ArrowRight } from 'lucide-react';
import { useSkillLevel } from '@/hooks/useSkillLevel';
import { useLocation } from 'wouter';

interface AdvancedFeatureWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  featureName: string;
  warningMessage?: string;
}

export function AdvancedFeatureWarning({
  isOpen,
  onClose,
  onContinue,
  featureName,
  warningMessage = 'This feature is designed for experienced traders and may involve complex strategies or higher risk.',
}: AdvancedFeatureWarningProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { setDismissedAdvancedWarnings } = useSkillLevel();
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    if (dontShowAgain) {
      setDismissedAdvancedWarnings(true);
    }
    onContinue();
  };

  const handleGoToTraining = () => {
    onClose();
    setLocation('/master-academy');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg">Advanced Feature</AlertDialogTitle>
              <p className="text-sm text-muted-foreground">{featureName}</p>
            </div>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>{warningMessage}</p>
            <p className="text-sm">
              We recommend completing the training modules first to get the most out of this feature.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <label
            htmlFor="dont-show-again"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Don't show this warning again
          </label>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button
            variant="outline"
            onClick={handleGoToTraining}
            className="flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Take me to training
          </Button>
          <AlertDialogAction
            onClick={handleContinue}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Continue anyway
            <ArrowRight className="w-4 h-4 ml-2" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook to use the warning dialog
export function useAdvancedFeatureWarning() {
  const [warningState, setWarningState] = useState<{
    isOpen: boolean;
    featureName: string;
    warningMessage?: string;
    onContinue: () => void;
  }>({
    isOpen: false,
    featureName: '',
    onContinue: () => {},
  });

  const { skillLevel, dismissedAdvancedWarnings } = useSkillLevel();

  const showWarning = (
    featureName: string,
    onContinue: () => void,
    warningMessage?: string
  ) => {
    // If user is experienced or has dismissed warnings, just continue
    if (skillLevel === 'experienced' || dismissedAdvancedWarnings) {
      onContinue();
      return;
    }

    setWarningState({
      isOpen: true,
      featureName,
      warningMessage,
      onContinue,
    });
  };

  const closeWarning = () => {
    setWarningState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleContinue = () => {
    warningState.onContinue();
    closeWarning();
  };

  return {
    showWarning,
    warningDialog: (
      <AdvancedFeatureWarning
        isOpen={warningState.isOpen}
        onClose={closeWarning}
        onContinue={handleContinue}
        featureName={warningState.featureName}
        warningMessage={warningState.warningMessage}
      />
    ),
  };
}

export default AdvancedFeatureWarning;
