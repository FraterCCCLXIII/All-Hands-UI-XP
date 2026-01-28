import { useLayoutEffect, useRef, useState } from 'react';
import { GitPullRequest, Search } from 'lucide-react';

export type DashboardTabId = 'kanban' | 'active' | 'reviews';

interface DashboardHeaderProps {
  activeTab: DashboardTabId;
  onSelectTab: (tabId: DashboardTabId) => void;
}

export function DashboardHeader({ activeTab, onSelectTab }: DashboardHeaderProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const tabs = [
    { id: 'kanban', label: 'Kanban' },
    { id: 'active', label: 'Active Repos' },
    { id: 'reviews', label: 'Review PRs' },
  ];

  useLayoutEffect(() => {
    const updateHighlight = () => {
      const activeElement = tabRefs.current[activeTab];
      if (activeElement) {
        setHighlightStyle({
          left: activeElement.offsetLeft,
          top: activeElement.offsetTop,
          width: activeElement.offsetWidth,
          height: activeElement.offsetHeight,
        });
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [activeTab]);

  return (
    <header className="bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 sticky top-0 z-50">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">Hyperboard</span>
          </div>
          <div
            data-slot="tabList"
            role="tablist"
            aria-label="Options"
            ref={tabListRef}
            className="relative flex items-center gap-2 flex-nowrap bg-transparent border border-[#ffffff40] rounded-[6px] px-1 py-1"
          >
            <span
              data-slot="cursor"
              data-animated="true"
              data-initialized="true"
              aria-hidden="true"
              className="absolute z-0 will-change-[transform,width,height] invisible data-[initialized=true]:visible data-[animated=true]:transition-[left,top,width,height] data-[animated=true]:duration-250 data-[animated=true]:ease-out dark:bg-default shadow-small bg-white rounded-sm"
              style={{
                left: highlightStyle.left,
                top: highlightStyle.top,
                width: highlightStyle.width,
                height: highlightStyle.height,
              }}
            />
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                data-key={tab.id}
                data-slot="tab"
                role="tab"
                tabIndex={activeTab === tab.id ? 0 : -1}
                type="button"
                aria-selected={activeTab === tab.id}
                data-selected={activeTab === tab.id}
                onClick={() => onSelectTab(tab.id as DashboardTabId)}
                className="z-0 w-full flex group relative justify-center items-center cursor-pointer transition-opacity tap-highlight-transparent data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[hover-unselected=true]:opacity-disabled outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-small rounded-small px-2 py-1"
              >
                <div
                  className={`relative z-10 whitespace-nowrap transition-colors text-[12px] font-normal ${
                    activeTab === tab.id ? 'text-black' : 'text-white'
                  }`}
                >
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search PRs, repos, or authors"
              className="w-full h-9 rounded-md bg-muted/50 border border-border pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">3 agents online</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitPullRequest className="w-4 h-4" />
            <span>5 PRs assigned</span>
          </div>
        </div>
      </div>
      <div className="border-b border-sidebar-border" />
    </header>
  );
}
