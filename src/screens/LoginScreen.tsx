import React, { useState, useRef, useCallback } from 'react';
import { Github, Mail, AlertTriangle } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const OTP_LENGTH = 6;

interface OnboardingQuestion {
  question: string;
  options: string[];
}

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    question: 'How big is your organization?',
    options: ['Just me', '2–10 people', '11–50 people', '51–200 people', '200+ people'],
  },
  {
    question: "What's your primary role?",
    options: ['Developer', 'Designer', 'Product Manager', 'DevOps / Engineering', 'Other'],
  },
  {
    question: 'What do you want to use this for?',
    options: ['Coding', 'Code review', 'Documentation', 'All of the above'],
  },
  {
    question: 'How did you hear about us?',
    options: ['Search', 'A colleague', 'Social media', 'Conference or event', 'Other'],
  },
  {
    question: 'Which best describes your experience level?',
    options: ['Just getting started', 'Some experience', 'Very experienced'],
  },
];

interface LoginScreenProps {
  onBack?: () => void;
}

const GitLabIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_gitlab)">
      <path d="M13.647 5.94384L13.6276 5.89315L11.7565 0.886146C11.7184 0.78799 11.6509 0.704724 11.5638 0.648288C11.4767 0.592813 11.3751 0.566088 11.2727 0.571724C11.1703 0.577359 11.072 0.615083 10.9912 0.679801C10.9112 0.746371 10.8532 0.836597 10.8251 0.938181L9.56175 4.90157H4.44578L3.18229 0.938181C3.15488 0.836083 3.09679 0.74544 3.01627 0.679128C2.93543 0.61441 2.83717 0.576686 2.73476 0.571051C2.63234 0.565416 2.53071 0.59214 2.44358 0.647616C2.3567 0.7043 2.28934 0.787487 2.25098 0.885473L0.376304 5.89023L0.357711 5.94092C-0.195612 7.42335 0.274258 9.10249 1.51018 10.0584L1.51664 10.0636L1.53381 10.076L4.38421 12.2646L5.79436 13.3589L6.65339 14.0239C6.75388 14.1021 6.87657 14.1445 7.00273 14.1445C7.12889 14.1445 7.25158 14.1021 7.35207 14.0239L8.21109 13.3589L9.62125 12.2646L12.4888 10.0628L12.4959 10.0569C13.7289 9.1008 14.198 7.4247 13.647 5.94384Z" fill="currentColor"/>
      <path d="M13.645 5.94131L13.6257 5.89062C12.7139 6.08252 11.8547 6.47851 11.1095 7.05031L7 10.2364C8.39944 11.322 9.61776 12.2651 9.61776 12.2651L12.4853 10.0633L12.4924 10.0574C13.7274 9.10119 14.1971 7.42341 13.645 5.94131Z" fill="currentColor"/>
      <path d="M4.38379 12.2631L5.79395 13.3574L6.65297 14.0224C6.75346 14.1006 6.87615 14.1429 7.00231 14.1429C7.12847 14.1429 7.25116 14.1006 7.35165 14.0224L8.21068 13.3574L9.62084 12.2631C9.62084 12.2631 8.4011 11.317 7.00166 10.2344C6.1285 10.9099 5.25587 11.5861 4.38379 12.2631Z" fill="currentColor"/>
      <path d="M2.89169 7.05322C2.14707 6.4803 1.2881 6.08329 0.376304 5.89062L0.357711 5.94131C-0.195612 7.42375 0.274258 9.10288 1.51018 10.0588L1.51664 10.064L1.53381 10.0764L4.38421 12.265L7.00196 10.2363L2.89169 7.05322Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_gitlab">
        <rect width="13.9999" height="14.3544" fill="white" transform="translate(0 0.179688)"/>
      </clipPath>
    </defs>
  </svg>
);

const BitbucketIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13.5508 0.555664C13.8304 0.555669 14.04 0.794414 13.9941 1.08105L13.3906 4.8584H4.78516L5.55469 9.08887H8.46875L8.99902 5.98438H13.2109L12.082 13.0566C12.0353 13.2715 11.8489 13.4385 11.6387 13.4385H2.50098C2.19793 13.4385 1.94217 13.2238 1.89551 12.9131L0.00683594 1.05762C-0.0392224 0.794892 0.169738 0.531535 0.449219 0.53125L13.5508 0.555664Z" fill="currentColor"/>
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M15.57 8.28493C15.57 7.73386 15.5205 7.20399 15.4287 6.69531H8.10938V9.70146H12.2918C12.1117 10.6729 11.5642 11.496 10.7411 12.047V13.997H13.2527C14.7222 12.644 15.57 10.6517 15.57 8.28493Z" fill="#4285F4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M8.10894 15.8808C10.2072 15.8808 11.9664 15.1849 13.2523 13.998L10.7407 12.0481C10.0448 12.5144 9.15456 12.7899 8.10894 12.7899C6.08483 12.7899 4.37157 11.4228 3.76044 9.58594H1.16406V11.5995C2.44282 14.1393 5.071 15.8808 8.10894 15.8808Z" fill="#34A853"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M3.76088 9.58387C3.60545 9.11758 3.51713 8.6195 3.51713 8.10729C3.51713 7.59508 3.60545 7.097 3.76088 6.63071V4.61719H1.16449C0.638152 5.66634 0.337891 6.85326 0.337891 8.10729C0.337891 9.36133 0.638152 10.5482 1.16449 11.5974L3.76088 9.58387Z" fill="#FBBC05"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M8.10894 3.42687C9.24994 3.42687 10.2744 3.81898 11.0798 4.58906L13.3088 2.36006C11.9629 1.10602 10.2037 0.335938 8.10894 0.335938C5.071 0.335938 2.44283 2.07746 1.16406 4.61732L3.76044 6.63084C4.37157 4.79394 6.08483 3.42687 8.10894 3.42687Z" fill="#EA4335"/>
  </svg>
);

const ChatGPTIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="146.694 227.042 267.198 264.812" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
    <path d="M249.176 323.434V298.276C249.176 296.158 249.971 294.569 251.825 293.509L302.406 264.381C309.29 260.409 317.5 258.555 325.973 258.555C357.75 258.555 377.877 283.185 377.877 309.399C377.877 311.253 377.877 313.371 377.611 315.49L325.178 284.771C322.001 282.919 318.822 282.919 315.645 284.771L249.176 323.434ZM367.283 421.415V361.301C367.283 357.592 365.694 354.945 362.516 353.092L296.048 314.43L317.763 301.982C319.617 300.925 321.206 300.925 323.058 301.982L373.639 331.112C388.205 339.586 398.003 357.592 398.003 375.069C398.003 395.195 386.087 413.733 367.283 421.412V421.415ZM233.553 368.452L211.838 355.742C209.986 354.684 209.19 353.095 209.19 350.975V292.718C209.19 264.383 230.905 242.932 260.301 242.932C271.423 242.932 281.748 246.641 290.49 253.26L238.321 283.449C235.146 285.303 233.555 287.951 233.555 291.659V368.455L233.553 368.452ZM280.292 395.462L249.176 377.985V340.913L280.292 323.436L311.407 340.913V377.985L280.292 395.462ZM300.286 475.968C289.163 475.968 278.837 472.259 270.097 465.64L322.264 435.449C325.441 433.597 327.03 430.949 327.03 427.239V350.445L349.011 363.155C350.865 364.213 351.66 365.802 351.66 367.922V426.179C351.66 454.514 329.679 475.965 300.286 475.965V475.968ZM237.525 416.915L186.944 387.785C172.378 379.31 162.582 361.305 162.582 343.827C162.582 323.436 174.763 305.164 193.563 297.485V357.861C193.563 361.571 195.154 364.217 198.33 366.071L264.535 404.467L242.82 416.915C240.967 417.972 239.377 417.972 237.525 416.915ZM234.614 460.343C204.689 460.343 182.71 437.833 182.71 410.028C182.71 407.91 182.976 405.792 183.238 403.672L235.405 433.863C238.582 435.715 241.763 435.715 244.938 433.863L311.407 395.466V420.622C311.407 422.742 310.612 424.331 308.758 425.389L258.179 454.519C251.293 458.491 243.083 460.343 234.611 460.343H234.614ZM300.286 491.854C332.329 491.854 359.073 469.082 365.167 438.892C394.825 431.211 413.892 403.406 413.892 375.073C413.892 356.535 405.948 338.529 391.648 325.552C392.972 319.991 393.766 314.43 393.766 308.87C393.766 271.003 363.048 242.666 327.562 242.666C320.413 242.666 313.528 243.723 306.644 246.109C294.725 234.457 278.307 227.042 260.301 227.042C228.258 227.042 201.513 249.815 195.42 280.004C165.761 287.685 146.694 315.49 146.694 343.824C146.694 362.362 154.638 380.368 168.938 393.344C167.613 398.906 166.819 404.467 166.819 410.027C166.819 447.894 197.538 476.231 233.024 476.231C240.172 476.231 247.058 475.173 253.943 472.788C265.859 484.441 282.278 491.854 300.286 491.854Z" fill="currentColor"/>
  </svg>
);

const socialLogins = [
  { id: 'github', label: 'Sign in with Github', icon: Github, className: 'bg-[#9E28B0] hover:bg-[#8a2399] text-white border-0' },
  { id: 'gitlab', label: 'Sign in with Gitlab', icon: GitLabIcon, className: 'bg-[#FC6B0E] hover:bg-[#e55f0c] text-white border-0' },
  { id: 'bitbucket', label: 'Sign in with Bitbucket', icon: BitbucketIcon, className: 'bg-[#2684FF] hover:bg-[#1a6ce6] text-white border-0' },
  { id: 'google', label: 'Sign in with Google', icon: GoogleIcon, className: 'bg-white hover:bg-gray-100 text-gray-800 border border-border' },
  { id: 'chatgpt', label: 'Sign in with ChatGPT', icon: ChatGPTIcon, className: 'bg-white hover:bg-gray-100 text-black border border-border', iconClassName: 'w-5 h-5' },
];

export function LoginScreen({ onBack }: LoginScreenProps) {
  const [view, setView] = useState<'options' | 'email' | 'otp' | 'onboarding'>('options');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<number, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleVerify = () => {
    setView('otp');
  };

  const handleOtpChange = useCallback((index: number, value: string) => {
    setOtpError(false);
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    setOtpError(false);
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    setOtp((prev) => {
      const next = [...prev];
      pasted.split('').forEach((char, i) => { next[i] = char; });
      return next;
    });
    const focusIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    setTimeout(() => otpRefs.current[focusIndex]?.focus(), 0);
  }, []);

  const handleResendCode = () => {
    console.log('Resend code to:', email);
  };

  const handleOtpNext = () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    setView('onboarding');
    setOnboardingStep(0);
    setOnboardingAnswers({});
  };

  const currentOnboardingQuestion = ONBOARDING_QUESTIONS[onboardingStep];
  const selectedAnswer = onboardingAnswers[onboardingStep];
  const isLastOnboardingStep = onboardingStep === ONBOARDING_QUESTIONS.length - 1;

  const handleOnboardingNext = () => {
    if (!selectedAnswer) return;
    if (isLastOnboardingStep) {
      console.log('Onboarding complete:', onboardingAnswers);
      onBack?.();
      return;
    }
    setOnboardingStep((s) => s + 1);
  };

  const handleOnboardingBack = () => {
    if (onboardingStep === 0) {
      setView('otp');
    } else {
      setOnboardingStep((s) => s - 1);
    }
  };

  if (view === 'onboarding') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-14 h-14 text-foreground" />
            <div className="flex gap-1.5 w-full max-w-[320px]" role="progressbar" aria-valuenow={onboardingStep + 1} aria-valuemin={1} aria-valuemax={ONBOARDING_QUESTIONS.length} aria-label={`Step ${onboardingStep + 1} of ${ONBOARDING_QUESTIONS.length}`}>
              {ONBOARDING_QUESTIONS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= onboardingStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground text-center leading-tight">
            {currentOnboardingQuestion.question}
          </h2>
          <div className="w-full flex flex-col gap-3">
            {currentOnboardingQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setOnboardingAnswers((prev) => ({ ...prev, [onboardingStep]: option }))
                }
                className={`h-10 w-full rounded-md border text-left px-4 text-sm font-medium transition-colors ${
                  selectedAnswer === option
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={handleOnboardingNext}
              disabled={!selectedAnswer}
              className="flex-1 h-10 rounded-md"
            >
              {isLastOnboardingStep ? 'Finish' : 'Next'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleOnboardingBack}
              className="flex-1 h-10 rounded-md"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'otp') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-16 h-16 text-foreground" />
            <h1 className="text-[40px] font-semibold text-foreground text-center leading-tight tracking-tight">
              Enter code
            </h1>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            An OTP code has been sent to your email address. Enter that code here. Didn&apos;t receive it?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              className="text-primary underline underline-offset-2 hover:no-underline font-medium"
            >
              Resend Code
            </button>
          </p>
          <div
            className="flex gap-2 justify-center"
            onPaste={handleOtpPaste}
          >
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="h-12 w-12 rounded-md text-center text-lg font-medium p-0"
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-invalid={otpError}
              />
            ))}
          </div>
          {otpError && (
            <div
              role="alert"
              className="w-full flex items-center gap-3 rounded-md border border-red-600 bg-red-950/95 px-4 py-3 text-white text-sm"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-white" aria-hidden />
              <span>That code was invalid, please try again.</span>
            </div>
          )}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={handleOtpNext}
              className="flex-1 h-10 rounded-md"
            >
              Next
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setView('email')}
              className="flex-1 h-10 rounded-md"
            >
              Back
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (view === 'email') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={() => setView('options')}
            className="absolute top-4 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            ← Back
          </button>
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-16 h-16 text-foreground" />
            <h1 className="text-[40px] font-semibold text-foreground text-center leading-tight tracking-tight">
              Sign-in with your email
            </h1>
          </div>
          <div className="w-full flex flex-col gap-4">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground sr-only">
              Your email address
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md"
              autoComplete="email"
              aria-label="Your email address"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleVerify}
                className="flex-1 h-10 rounded-md"
              >
                Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setView('options')}
                className="flex-1 h-10 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-4 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            ← Back
          </button>
        )}
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-16 h-16 text-foreground" />
          <h1 className="text-[40px] font-semibold text-foreground text-center leading-tight tracking-tight">
            Let&apos;s get started
          </h1>
        </div>

        <div className="w-full flex flex-col gap-3">
          {socialLogins.map(({ id, label, icon: Icon, className, iconClassName }) => (
            <button
              key={id}
              type="button"
              className={`h-10 w-full flex items-center justify-center gap-2 rounded-md text-sm font-medium border transition-colors ${className}`}
            >
              <Icon className={iconClassName ?? 'w-5 h-5 shrink-0'} />
              {label}
            </button>
          ))}
        </div>

        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={() => setView('email')}
          className="h-10 w-full flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-muted/60 hover:bg-muted border border-border text-foreground transition-colors"
        >
          <Mail className="w-5 h-5" />
          Use Email
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
