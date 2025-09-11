import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface DealerRegistrationBannerProps {
  dealerStatus: string | null;
  onDismiss?: () => void;
}

export const DealerRegistrationBanner = ({ dealerStatus, onDismiss }: DealerRegistrationBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || dealerStatus === 'verified') {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getBannerContent = () => {
    switch (dealerStatus) {
      case null:
        return {
          message: "Complete your dealer registration to unlock all platform features and start listing cars.",
          buttonText: "Complete Registration",
          variant: "destructive" as const
        };
      case 'pending':
        return {
          message: "Your dealer registration is under review. You'll receive access once approved.",
          buttonText: "View Application",
          variant: "default" as const
        };
      default:
        return {
          message: "Your dealer registration requires attention. Please complete the process to access all features.",
          buttonText: "View Registration",
          variant: "destructive" as const
        };
    }
  };

  const { message, buttonText, variant } = getBannerContent();

  return (
    <Alert className={`mb-4 ${variant === 'destructive' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="flex-1 mr-4">{message}</span>
        <div className="flex items-center gap-2">
          <Link to="/dealer-registration">
            <Button size="sm" variant={variant === 'destructive' ? 'destructive' : 'default'}>
              {buttonText}
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};