import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Theme, ThemeElement } from '../../types/theme';

interface Project {
  id: string;
  name: string;
}

interface CurrentProjectsProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  projects: Project[];
}

const MAX_VISIBLE = 10;
const MAX_EXPANDED = 20;

const customScrollbar = `scrollbar-thin scrollbar-thumb-stone-500 scrollbar-track-transparent rounded scrollbar-thumb-rounded-full`;

const CurrentProjects: React.FC<CurrentProjectsProps> = ({ projects }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleProjects = expanded ? projects.slice(0, MAX_EXPANDED) : projects.slice(0, MAX_VISIBLE);
  const hasMore = projects.length > MAX_VISIBLE;
  const needsScroll = expanded && projects.length > MAX_EXPANDED;

  return (
    <div className={`w-full rounded-xl p-2 bg-transparent mb-2`}>
      <div className="font-semibold text-xs mb-2 whitespace-nowrap">Current Projects</div>
      <div className={`flex flex-col ${needsScroll ? 'max-h-60 overflow-y-auto' : ''} ${customScrollbar}`}>
        {visibleProjects.map((project) => (
          <div key={project.id} className="py-1 rounded hover:bg-stone-800 text-xs text-stone-100 cursor-pointer whitespace-nowrap">
            {project.name}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          className="flex items-center space-x-1 text-xs text-stone-400 hover:text-stone-100 mt-2 py-1 rounded transition-colors whitespace-nowrap"
          onClick={() => setExpanded((e) => !e)}
        >
          <span>{expanded ? 'View less' : 'View more'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
      <style>{`
        .${customScrollbar}::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .${customScrollbar}::-webkit-scrollbar-thumb {
          background: #78716c;
          border-radius: 9999px;
        }
        .${customScrollbar}::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .${customScrollbar} {
          scrollbar-color: #78716c transparent;
        }
      `}</style>
    </div>
  );
};

export default CurrentProjects; 