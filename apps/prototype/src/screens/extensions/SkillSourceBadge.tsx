import type { SkillRepositoryItem, SkillSource } from '../../data/skillsPageData';
import { SKILL_SOURCE_LABELS } from '../../data/skillsPageData';
import { cn } from '../../lib/utils';

export function getSkillSource(skill: Pick<SkillRepositoryItem, 'skillSource'>): SkillSource {
  return skill.skillSource ?? 'openhands';
}

export type SkillSourceBadgeProps = {
  source: SkillSource;
  className?: string;
};

/** Small monochrome source label for marketplace cards and detail headers. */
export function SkillSourceBadge({ source, className }: SkillSourceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center rounded border border-border bg-muted/60 px-1.5 py-px text-[10px] leading-tight font-medium uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      {SKILL_SOURCE_LABELS[source]}
    </span>
  );
}
