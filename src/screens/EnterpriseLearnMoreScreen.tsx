import { useState } from 'react';
import { Cloud, Server } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface EnterpriseLearnMoreScreenProps {
  onBack?: () => void;
}

type View = 'options' | 'enterprise-saas-form' | 'self-hosted-form';

const ENTERPRISE_OPTIONS = [
  {
    id: 'enterprise-saas' as const,
    title: 'Enterprise SaaS',
    description: 'Access OpenHands in the cloud. No setup required—start coding with your team from anywhere.',
    icon: Cloud,
    bullets: [
      'No infrastructure to manage',
      'SSO and team management',
      'Access from any device',
      'Automatic updates and security',
    ],
  },
  {
    id: 'self-hosted' as const,
    title: 'Self-hosted',
    description: 'Deploy OpenHands on your own infrastructure. Full control over data, compliance, and security.',
    icon: Server,
    bullets: [
      'On-premises or private cloud',
      'Full data control',
      'Custom compliance requirements',
      'Dedicated support options',
    ],
  },
];

export function EnterpriseLearnMoreScreen({ onBack }: EnterpriseLearnMoreScreenProps) {
  const [view, setView] = useState<View>('options');
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });

  const handleBack = () => {
    if (view !== 'options') {
      setView('options');
      setForm({ name: '', company: '', email: '', message: '' });
    } else if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleOptionSelect = (id: 'enterprise-saas' | 'self-hosted') => {
    setForm({ name: '', company: '', email: '', message: '' });
    setView(id === 'enterprise-saas' ? 'enterprise-saas-form' : 'self-hosted-form');
  };

  const handleFormSubmit = () => {
    console.log('Enterprise form submitted:', { view, form });
    handleBack();
  };

  if (view === 'enterprise-saas-form' || view === 'self-hosted-form') {
    const isSaaS = view === 'enterprise-saas-form';
    const title = isSaaS ? 'Learn more about Enterprise SaaS' : 'Learn more about Self-hosted';
    const subtitle = isSaaS
      ? 'Tell us about your team and we\'ll help you get started.'
      : 'Tell us about your needs and we\'ll be in touch.';

    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-4 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            ← Back
          </button>
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-14 h-14 text-foreground" />
            <h1 className="text-2xl font-semibold text-foreground text-center leading-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 items-stretch">
            <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
              <div>
                <label htmlFor="enterprise-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <Input
                  id="enterprise-name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-10 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="enterprise-company" className="block text-sm font-medium text-foreground mb-1.5">
                  Company name
                </label>
                <Input
                  id="enterprise-company"
                  type="text"
                  placeholder="Your company"
                  value={form.company}
                  onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="h-10 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="enterprise-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <Input
                  id="enterprise-email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-10 rounded-md"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="enterprise-message" className="block text-sm font-medium text-foreground mb-1.5">
                  Custom message
                </label>
                <textarea
                  id="enterprise-message"
                  placeholder={isSaaS ? 'Tell us about your team and use case...' : 'Tell us about your deployment needs...'}
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-10 rounded-md"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleFormSubmit}
                  className="flex-1 h-10 rounded-md"
                >
                  Submit
                </Button>
              </div>
            </div>
            <aside className="sm:w-80 shrink-0 w-full">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-lg supports-[backdrop-filter]:bg-card/50 h-full min-h-[280px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_55%)]" />
                <div className="relative z-10 flex flex-col items-start text-left gap-4">
                  {isSaaS ? (
                    <Cloud className="w-10 h-10 text-muted-foreground" aria-hidden />
                  ) : (
                    <Server className="w-10 h-10 text-muted-foreground" aria-hidden />
                  )}
                  <h2 className="text-xl font-semibold text-foreground">
                    {isSaaS ? 'Enterprise SaaS' : 'Self-hosted'}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isSaaS
                      ? 'Access OpenHands in the cloud. No setup required—start coding with your team from anywhere.'
                      : 'Deploy OpenHands on your own infrastructure. Full control over your data, compliance, and security. Ideal for enterprises that require on-premises or private cloud deployment.'}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back"
        >
          ← Back
        </button>
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-14 h-14 text-foreground" />
          <h1 className="text-2xl font-semibold text-foreground text-center leading-tight">
            Get OpenHands for Enterprise
          </h1>
          <p className="text-muted-foreground text-center max-w-xl">
            Cloud allows you to access OpenHands anywhere and coordinate with your team like never before.
          </p>
        </div>
        <div className="w-full grid gap-5 sm:grid-cols-2">
          {ENTERPRISE_OPTIONS.map(({ id, title, description, icon: Icon, bullets }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleOptionSelect(id)}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl px-8 py-8 text-left shadow-lg transition-all duration-300 ease-in-out hover:border-border/80 hover:scale-[1.02] supports-[backdrop-filter]:bg-card/50 min-h-[200px] flex flex-col cursor-pointer"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                style={{ background: 'var(--gradient-card-hover)' }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
              <div className="relative z-10 flex flex-col gap-3 flex-1">
                <Icon className="w-8 h-8 text-muted-foreground shrink-0" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background px-4 py-2 h-10 w-fit ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Learn More
                </span>
              </div>
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="h-10 px-6"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
