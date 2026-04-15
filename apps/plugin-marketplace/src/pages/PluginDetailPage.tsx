import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { Button } from '@all-hands/ui';
import { Badge } from '../../../prototype/src/components/ui/badge';
import { getPluginById, MOCK_USER_NAME, type MarketplacePlugin } from '../data/plugins';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { PluginArtifactsPanel } from '../components/PluginArtifactsPanel';
import { StarRating } from '../components/StarRating';
import type { PluginReview } from '../types/review';

const textareaClassName =
  'flex min-h-[140px] w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-muted/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50';

function displayRepoUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === '/' ? '' : u.pathname}`.replace(/\/$/, '') || url;
  } catch {
    return url;
  }
}

function formatReviewDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/** Seed reviews for the detail page when the catalog lists existing review counts (max two for demo). */
function buildInitialReviews(plugin: MarketplacePlugin): PluginReview[] {
  if (plugin.reviewCount === 0) return [];
  const templates: Array<{ authorName: string; rating: number; body: string }> = [
    {
      authorName: 'Alex Chen',
      rating: 5,
      body: 'Worked great in our workspace. Clear prompts and reliable behavior with large repos.',
    },
    {
      authorName: 'Jamie Rivera',
      rating: 4,
      body: 'Solid plugin. A few rough edges on first load but worth it for the automation.',
    },
  ];
  const n = Math.min(plugin.reviewCount, templates.length);
  return templates.slice(0, n).map((t, i) => ({
    id: `seed-${plugin.id}-${i}`,
    authorName: t.authorName,
    rating: t.rating,
    body: t.body,
    createdAt: Date.now() - (i + 1) * 86_400_000 * 4,
  }));
}

export default function PluginDetailPage() {
  const { pluginId } = useParams<{ pluginId: string }>();
  const plugin = pluginId ? getPluginById(pluginId) : undefined;

  const [draftRating, setDraftRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<PluginReview[]>(() => {
    const p = pluginId ? getPluginById(pluginId) : undefined;
    return p ? buildInitialReviews(p) : [];
  });

  const repoDisplay = useMemo(() => (plugin ? displayRepoUrl(plugin.repoUrl) : ''), [plugin]);

  useEffect(() => {
    const p = pluginId ? getPluginById(pluginId) : undefined;
    if (p) setReviews(buildInitialReviews(p));
  }, [pluginId]);

  if (!plugin) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketplaceHeader search="" onSearchChange={() => {}} showSearch={false} />
        <main className="mx-auto flex max-w-4xl flex-1 flex-col items-start gap-4 px-3 py-6 md:px-4">
          <p className="text-muted-foreground">Plugin not found.</p>
          <Button variant="secondary" asChild>
            <Link to="/">Back to marketplace</Link>
          </Button>
        </main>
      </div>
    );
  }

  const displayRating = useMemo(() => {
    if (reviews.length === 0) return plugin.rating;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews, plugin.rating]);

  const reviewLabel =
    reviews.length === 0
      ? 'No Reviews'
      : `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;

  const canSubmitReview = draftRating > 0 && comment.trim().length > 0;

  const handleSubmitReview = () => {
    if (!canSubmitReview) return;
    const newReview: PluginReview = {
      id: crypto.randomUUID(),
      authorName: MOCK_USER_NAME,
      rating: draftRating,
      body: comment.trim(),
      createdAt: Date.now(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setDraftRating(0);
    setComment('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketplaceHeader search="" onSearchChange={() => {}} showSearch={false} />

      <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pt-3 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-4 px-3 sm:px-4">
          <div className="grid min-h-0 gap-4 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0">
              <Link
                to="/"
                className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                <span>Back</span>
              </Link>

              <div className="mb-4 mt-1">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <h1 className="min-w-0 text-xl font-semibold leading-6 text-foreground">{plugin.name}</h1>
                      <span
                        className="shrink-0 tabular-nums text-xs text-muted-foreground"
                        aria-label={`Version ${plugin.version ?? '1.0.0'}`}
                      >
                        v{plugin.version ?? '1.0.0'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plugin.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-4 w-4 shrink-0" aria-hidden />
                        {plugin.author}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <StarRating value={displayRating} aria-label="Average rating" />
                        <span className="text-muted-foreground">{reviewLabel}</span>
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plugin.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full border-transparent font-normal text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3">
                      <a
                        href={plugin.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 max-w-full items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      >
                        <span className="truncate font-mono">{repoDisplay}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="mb-4 w-full sm:w-auto">Create New Conversation</Button>

              <section
                className="mb-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                aria-labelledby="review-heading"
              >
                <div className="mb-4">
                  <h2 id="review-heading" className="text-base font-semibold text-foreground">
                    Write a Review
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">Reviewing as {MOCK_USER_NAME}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-medium text-foreground">Rating</div>
                    <StarRating
                      value={draftRating}
                      onChange={setDraftRating}
                      aria-label="Your rating"
                    />
                  </div>
                  <div>
                    <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-foreground">
                      Comment
                    </label>
                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this plugin..."
                      rows={5}
                      className={textareaClassName}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!canSubmitReview}
                    onClick={handleSubmitReview}
                  >
                    Submit Review
                  </Button>
                </div>
              </section>

              <section aria-labelledby="reviews-list-heading">
                <h2 id="reviews-list-heading" className="text-base font-semibold text-foreground">
                  Reviews
                  {reviews.length > 0 ? (
                    <span className="ml-2 font-normal text-muted-foreground">({reviews.length})</span>
                  ) : null}
                </h2>
                {reviews.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No reviews yet. Submit one using the form above.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-border bg-muted/20 p-4 shadow-[var(--shadow-card)]"
                      >
                        <StarRating
                          value={r.rating}
                          aria-label={`${r.authorName} rated ${r.rating} out of 5`}
                        />
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{r.authorName}</span>
                          <time
                            className="text-xs text-muted-foreground"
                            dateTime={new Date(r.createdAt).toISOString()}
                          >
                            {formatReviewDate(r.createdAt)}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col lg:h-[min(100vh-10rem,40rem)]">
              <PluginArtifactsPanel
                plugin={plugin}
                className="h-[min(320px,40vh)] min-h-[280px] lg:h-full lg:min-h-0"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
