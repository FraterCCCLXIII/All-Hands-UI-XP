import { LogoDropdownContent } from '../components/navigation/LogoDropdownContent';

interface SignInWithAdScreenProps {
  onBack?: () => void;
}

export function SignInWithAdScreen({ onBack }: SignInWithAdScreenProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-5xl">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          ← Back
        </button>
        <LogoDropdownContent
          onNavToNewUserExperience={() => {
            window.location.hash = '#/new-user-experience';
          }}
          onEnterpriseLearnMoreClick={() => {
            window.location.hash = '#/enterprise-learn-more';
          }}
        />
      </div>
    </div>
  );
}
