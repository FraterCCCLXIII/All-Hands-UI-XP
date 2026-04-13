import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type FlowStep = 'claim' | 'payment';

interface SaasCreditCardFlowProps {
  onSkip?: () => void;
  onComplete?: () => void;
}

export function SaasCreditCardFlow({ onSkip, onComplete }: SaasCreditCardFlowProps) {
  const [step, setStep] = useState<FlowStep>('claim');
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });

  const handlePaymentChange = (field: keyof typeof paymentDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: event.target.value }));
  };

  if (step === 'payment') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-14 h-14 text-foreground" />
            <h1 className="text-[36px] font-semibold text-foreground text-center leading-tight tracking-tight">
              Add a payment method
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Your card is required to unlock free credits. You will only be charged after your credits are used.
            </p>
          </div>

          <div className="w-full flex flex-col gap-4">
            <Input
              id="payment-name"
              placeholder="Name on card"
              value={paymentDetails.name}
              onChange={handlePaymentChange('name')}
              className="h-10 rounded-md"
              autoComplete="cc-name"
              aria-label="Name on card"
            />
            <Input
              id="payment-number"
              placeholder="Card number"
              value={paymentDetails.number}
              onChange={handlePaymentChange('number')}
              className="h-10 rounded-md"
              autoComplete="cc-number"
              inputMode="numeric"
              aria-label="Card number"
            />
            <div className="flex gap-3">
              <Input
                id="payment-expiry"
                placeholder="MM / YY"
                value={paymentDetails.expiry}
                onChange={handlePaymentChange('expiry')}
                className="h-10 rounded-md"
                autoComplete="cc-exp"
                inputMode="numeric"
                aria-label="Expiration date"
              />
              <Input
                id="payment-cvc"
                placeholder="CVC"
                value={paymentDetails.cvc}
                onChange={handlePaymentChange('cvc')}
                className="h-10 rounded-md"
                autoComplete="cc-csc"
                inputMode="numeric"
                aria-label="Security code"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={onComplete}
              className="flex-1 h-10 rounded-md"
            >
              Complete setup
            </Button>
            <Button
              type="button"
              variant="outline"
            onClick={onSkip}
              className="flex-1 h-10 rounded-md"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-14 h-14 text-foreground" />
          <h1 className="text-[36px] font-semibold text-foreground text-center leading-tight tracking-tight">
            Claim your free credits
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Add a card to unlock free credits. You can skip this step and add one later, or use your own keys to use the product.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button
            type="button"
            onClick={() => setStep('payment')}
            className="flex-1 h-10 rounded-md"
          >
            Next
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="flex-1 h-10 rounded-md"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
