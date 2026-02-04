import React from 'react';
import { Bot, Box, LayoutDashboard, List, Plus, LogOut, Settings, Users, Key, Shield, CreditCard, Cloud, UserCircle2, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Theme, ThemeElement } from '../../types/theme';

const highlightCards = [
  {
    title: 'Docs',
    text: 'Build, integrate, and scale with ease.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-foreground">
        <rect width="32" height="32" rx="2.66667" fill="black"/>
        <path d="M8.53787 11.87L8.49787 11C8.49787 10.4696 8.70858 9.96086 9.08366 9.58579C9.45873 9.21071 9.96744 9 10.4979 9H14.1699C14.7003 9.00011 15.2089 9.2109 15.5839 9.586L16.4119 10.414C16.7869 10.7891 17.2955 10.9999 17.8259 11H21.8079C22.0858 11 22.3607 11.0579 22.615 11.17C22.8693 11.2821 23.0974 11.446 23.2848 11.6512C23.4723 11.8564 23.6149 12.0985 23.7035 12.3618C23.7922 12.6252 23.825 12.9042 23.7999 13.181L23.1629 20.181C23.1177 20.6779 22.8884 21.14 22.5201 21.4766C22.1517 21.8131 21.6708 21.9998 21.1719 22H10.8239C10.3249 21.9998 9.84404 21.8131 9.47567 21.4766C9.1073 21.14 8.87803 20.6779 8.83287 20.181L8.19587 13.181C8.15326 12.7178 8.27426 12.2543 8.53787 11.871V11.87ZM10.1879 12C10.049 12 9.91156 12.0289 9.78445 12.085C9.65734 12.141 9.5433 12.2229 9.44959 12.3254C9.35589 12.428 9.28457 12.5489 9.2402 12.6806C9.19583 12.8122 9.17937 12.9516 9.19187 13.09L9.82887 20.09C9.85132 20.3385 9.96584 20.5696 10.1499 20.7379C10.334 20.9063 10.5744 20.9998 10.8239 21H21.1719C21.4213 20.9998 21.6617 20.9063 21.8458 20.7379C22.0299 20.5696 22.1444 20.3385 22.1669 20.09L22.8039 13.09C22.8164 12.9516 22.7999 12.8122 22.7555 12.6806C22.7112 12.5489 22.6399 12.428 22.5462 12.3254C22.4524 12.2229 22.3384 12.141 22.2113 12.085C22.0842 12.0289 21.9468 12 21.8079 12H10.1879ZM14.8779 10.293C14.7849 10.2 14.6745 10.1263 14.553 10.076C14.4316 10.0257 14.3014 9.9999 14.1699 10H10.4979C10.2359 9.99995 9.9844 10.1027 9.7974 10.2861C9.6104 10.4696 9.50285 10.7191 9.49787 10.981L9.50387 11.12C9.71787 11.042 9.94787 11 10.1879 11H15.5839L14.8769 10.293H14.8779Z" fill="currentColor"/>
      </svg>
    ),
    url: 'https://docs.openhands.dev/',
  },
  {
    title: 'Blog',
    text: 'Ideas, updates, and insights that inspire.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-foreground">
        <rect width="32" height="32" rx="2.66667" fill="black"/>
        <path d="M22.5 11C22.6326 11 22.7598 11.0527 22.8536 11.1464C22.9473 11.2402 23 11.3674 23 11.5V20.5C23 20.6326 22.9473 20.7598 22.8536 20.8536C22.7598 20.9473 22.6326 21 22.5 21H9.5C9.36739 21 9.24021 20.9473 9.14645 20.8536C9.05268 20.7598 9 20.6326 9 20.5V11.5C9 11.3674 9.05268 11.2402 9.14645 11.1464C9.24021 11.0527 9.36739 11 9.5 11H22.5ZM9.5 10C9.10218 10 8.72064 10.158 8.43934 10.4393C8.15804 10.7206 8 11.1022 8 11.5V20.5C8 20.8978 8.15804 21.2794 8.43934 21.5607C8.72064 21.842 9.10218 22 9.5 22H22.5C22.8978 22 23.2794 21.842 23.5607 21.5607C23.842 21.2794 24 20.8978 24 20.5V11.5C24 11.1022 23.842 10.7206 23.5607 10.4393C23.2794 10.158 22.8978 10 22.5 10H9.5Z" fill="currentColor"/>
        <path d="M11 16.5C11 16.3674 11.0527 16.2402 11.1464 16.1464C11.2402 16.0527 11.3674 16 11.5 16H20.5C20.6326 16 20.7598 16.0527 20.8536 16.1464C20.9473 16.2402 21 16.3674 21 16.5C21 16.6326 20.9473 16.7598 20.8536 16.8536C20.7598 16.9473 20.6326 17 20.5 17H11.5C11.3674 17 11.2402 16.9473 11.1464 16.8536C11.0527 16.7598 11 16.6326 11 16.5ZM11 18.5C11 18.3674 11.0527 18.2402 11.1464 18.1464C11.2402 18.0527 11.3674 18 11.5 18H17.5C17.6326 18 17.7598 18.0527 17.8536 18.1464C17.9473 18.2402 18 18.3674 18 18.5C18 18.6326 17.9473 18.7598 17.8536 18.8536C17.7598 18.9473 17.6326 19 17.5 19H11.5C11.3674 19 11.2402 18.9473 11.1464 18.8536C11.0527 18.7598 11 18.6326 11 18.5ZM11 13.5C11 13.3674 11.0527 13.2402 11.1464 13.1464C11.2402 13.0527 11.3674 13 11.5 13H20.5C20.6326 13 20.7598 13.0527 20.8536 13.1464C20.9473 13.2402 21 13.3674 21 13.5V14.5C21 14.6326 20.9473 14.7598 20.8536 14.8536C20.7598 14.9473 20.6326 15 20.5 15H11.5C11.3674 15 11.2402 14.9473 11.1464 14.8536C11.0527 14.7598 11 14.6326 11 14.5V13.5Z" fill="currentColor"/>
      </svg>
    ),
    url: '/blog',
  },
  {
    title: 'Press',
    text: 'News, releases, and media highlights.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-foreground">
        <rect width="32" height="32" rx="2.66667" fill="black"/>
        <path d="M14.5 9C14.1022 9 13.7206 9.15804 13.4393 9.43934C13.158 9.72064 13 10.1022 13 10.5V11H9.5C9.10218 11 8.72064 11.158 8.43934 11.4393C8.15804 11.7206 8 12.1022 8 12.5V20.5C8 20.8978 8.15804 21.2794 8.43934 21.5607C8.72064 21.842 9.10218 22 9.5 22H22.5C22.8978 22 23.2794 21.842 23.5607 21.5607C23.842 21.2794 24 20.8978 24 20.5V12.5C24 12.1022 23.842 11.7206 23.5607 11.4393C23.2794 11.158 22.8978 11 22.5 11H19V10.5C19 10.1022 18.842 9.72064 18.5607 9.43934C18.2794 9.15804 17.8978 9 17.5 9H14.5ZM14.5 10H17.5C17.6326 10 17.7598 10.0527 17.8536 10.1464C17.9473 10.2402 18 10.3674 18 10.5V11H14V10.5C14 10.3674 14.0527 10.2402 14.1464 10.1464C14.2402 10.0527 14.3674 10 14.5 10ZM16.386 16.914L23 15.151V20.5C23 20.6326 22.9473 20.7598 22.8536 20.8536C22.7598 20.9473 22.6326 21 22.5 21H9.5C9.36739 21 9.24021 20.9473 9.14645 20.8536C9.05268 20.7598 9 20.6326 9 20.5V15.15L15.614 16.914C15.8669 16.9814 16.1331 16.9814 16.386 16.914ZM9.5 12H22.5C22.6326 12 22.7598 12.0527 22.8536 12.1464C22.9473 12.2402 23 12.3674 23 12.5V14.116L16.129 15.948C16.0445 15.9706 15.9555 15.9706 15.871 15.948L9 14.116V12.5C9 12.3674 9.05268 12.2402 9.14645 12.1464C9.24021 12.0527 9.36739 12 9.5 12Z" fill="currentColor"/>
      </svg>
    ),
    url: '/press',
  },
  {
    title: 'Community',
    text: 'Connect, share, and grow together.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-foreground">
        <rect width="32" height="32" rx="2.66667" fill="black"/>
        <g clipPath="url(#clip0_273_31646)">
          <path d="M19 14C19 14.7956 18.6839 15.5587 18.1213 16.1213C17.5587 16.6839 16.7956 17 16 17C15.2044 17 14.4413 16.6839 13.8787 16.1213C13.3161 15.5587 13 14.7956 13 14C13 13.2044 13.3161 12.4413 13.8787 11.8787C14.4413 11.3161 15.2044 11 16 11C16.7956 11 17.5587 11.3161 18.1213 11.8787C18.6839 12.4413 19 13.2044 19 14Z" fill="currentColor"/>
          <path d="M10 8C9.46957 8 8.96086 8.21071 8.58579 8.58579C8.21071 8.96086 8 9.46957 8 10V22C8 22.5304 8.21071 23.0391 8.58579 23.4142C8.96086 23.7893 9.46957 24 10 24H22C22.5304 24 23.0391 23.7893 23.4142 23.4142C23.7893 23.0391 24 22.5304 24 22V10C24 9.46957 23.7893 8.96086 23.4142 8.58579C23.0391 8.21071 22.5304 8 22 8H10ZM22 9C22.2652 9 22.5196 9.10536 22.7071 9.29289C22.8946 9.48043 23 9.73478 23 10V22C23 22.2652 22.8946 22.5196 22.7071 22.7071C22.5196 22.8946 22.2652 23 22 23V22C22 21 21 18 16 18C11 18 10 21 10 22V23C9.73478 23 9.48043 22.8946 9.29289 22.7071C9.10536 22.5196 9 22.2652 9 22V10C9 9.73478 9.10536 9.48043 9.29289 9.29289C9.48043 9.10536 9.73478 9 10 9H22Z" fill="currentColor"/>
        </g>
        <defs>
          <clipPath id="clip0_273_31646">
            <rect width="16" height="16" fill="white" transform="translate(8 8)"/>
          </clipPath>
        </defs>
      </svg>
    ),
    url: 'http://openhands.dev/joinslack',
  },
  {
    title: 'Careers',
    text: 'Learn more about our open roles.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-foreground">
        <rect width="32" height="32" rx="2.66667" fill="black"/>
        <path d="M19.7422 18.3439C20.5329 17.2673 21 15.9382 21 14.5C21 10.9101 18.0899 8 14.5 8C10.9101 8 8 10.9101 8 14.5C8 18.0899 10.9101 21 14.5 21C15.9386 21 17.268 20.5327 18.3448 19.7415L18.3439 19.7422C18.3734 19.7822 18.4062 19.8204 18.4424 19.8566L22.2929 23.7071C22.6834 24.0976 23.3166 24.0976 23.7071 23.7071C24.0976 23.3166 24.0976 22.6834 23.7071 22.2929L19.8566 18.4424C19.8204 18.4062 19.7822 18.3734 19.7422 18.3439ZM20 14.5C20 17.5376 17.5376 20 14.5 20C11.4624 20 9 17.5376 9 14.5C9 11.4624 11.4624 9 14.5 9C17.5376 9 20 11.4624 20 14.5Z" fill="currentColor"/>
      </svg>
    ),
    url: 'https://jobs.ashbyhq.com/OpenHands',
  },
];

const navItems = [
  { icon: Plus, label: 'Create repository', action: 'new-project' },
  { icon: List, label: 'Conversations', action: 'conversations' },
  { icon: Bot, label: 'Robot assistant', action: 'skills' },
  { icon: LayoutDashboard, label: 'Dashboard view', action: 'dashboard' },
];

export interface LeftNavProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onNavItemClick: (action: string) => void;
  onFlowPrototypeClick?: (flowId: string) => void;
  activeNavItem: string;
  isConversationDrawerOpen: boolean;
  isInspectorEnabled: boolean;
  onInspectorToggle: () => void;
}

const flowPrototypes = [
  { id: 'new-user-experience', label: 'New User Experience', flowId: 'new-user-experience' },
  { id: 'saas-credit-card', label: 'SaaS - Require Credit Card for Free Credits', flowId: 'saas-credit-card' },
  { id: 'component-library', label: 'Component Library', navAction: 'components' },
  { id: 'new-components', label: 'New Components', navAction: 'new-components' },
  { id: 'new-llm-switcher', label: 'New LLM Switcher', navAction: 'new-llm-switcher' },
  { id: 'new-llm-switcher-2', label: 'New LLM Switcher 2', navAction: 'new-llm-switcher-2' },
];

export const LeftNav: React.FC<LeftNavProps> = ({
  onNavItemClick,
  onFlowPrototypeClick,
  activeNavItem,
  isConversationDrawerOpen,
  isInspectorEnabled,
  onInspectorToggle,
}) => (
  <aside className="fixed left-0 top-0 z-50 h-screen w-16 flex bg-sidebar pointer-events-auto">
    <div className="flex h-full flex-col w-16 px-2 py-4 text-sidebar-foreground">
      <div className="flex justify-center mb-3">
        <Popover>
          <PopoverTrigger asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground"
                aria-label="Hyperview logo"
              >
              <svg
                className="w-7 h-7 text-sidebar-foreground"
                viewBox="0 0 133.88 91.13"
                role="img"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M64.97,14.8V1.93c0-1.07.86-1.93,1.93-1.93s1.93.86,1.93,1.93v12.87c0,1.07-.86,1.93-1.93,1.93s-1.93-.86-1.93-1.93Z"
                />
                <path
                  fill="currentColor"
                  d="M74.95,16.72l6.43-11.15c.53-.92,1.71-1.24,2.64-.71.92.53,1.24,1.71.71,2.64l-6.43,11.15c-.53.92-1.71,1.24-2.64.71-.92-.53-1.24-1.71-.71-2.64Z"
                />
                <path
                  fill="currentColor"
                  d="M58.85,16.72l-6.43-11.15c-.53-.92-1.71-1.24-2.64-.71-.92.53-1.24,1.71-.71,2.64l6.43,11.15c.53.92,1.71,1.24,2.64.71.92-.53,1.24-1.71.71-2.64Z"
                />
                <path
                  fill="currentColor"
                  d="M128.77,56.65c0-3.35.9-13.3,1.19-16.58.19-2.22-.07-3.44-.43-4.06-.26-.46-.67-.78-1.66-.84-.71-.05-1.49.16-2.07.68-.54.49-1.15,1.48-1.15,3.47v.11s-.89,15.12-.89,15.12c-.03.54-.29,1.05-.72,1.39-.42.34-.97.49-1.51.4l-9.29-1.47-10.02-1.33c-.93-.12-1.63-.89-1.67-1.82l-.55-11.95v-.1c-.25-4.76-.49-9.1-.49-10.44,0-3.75-.63-5.33-1.19-5.99-.44-.53-1.08-.76-2.44-.76-.49,0-.83.1-1.09.25-.25.15-.54.41-.82.94-.59,1.12-1.02,3.22-.86,6.88.21,4.76.53,8.31.85,11.51.32,3.2.63,6.1.81,9.47.27,5.28.25,8.92.03,11.39-.11,1.23-.27,2.23-.48,3.02-.2.75-.51,1.51-1.04,2.07-.64.69-1.56,1.02-2.52.79-.76-.18-1.29-.66-1.58-.97-.61-.64-1.04-1.46-1.21-1.89-.98-2.47-4.01-8.22-8.12-11.46-1.2-.95-2.07-1.22-2.62-1.26-.52-.04-.89.11-1.19.35-.33.26-.57.63-.69.99-.04.13-.06.22-.07.27,1.11,1.88,5.53,8.77,7.61,15.76,1.55,5.21,5.29,10.52,8.09,12.8,2.71,2.2,7.57,3.57,13.05,3.84,5.42.27,11.01-.57,14.95-2.33,7.6-3.41,9.14-10.91,9.84-14.16.54-2.52.55-5.22.4-7.72-.07-1.25-.18-2.41-.27-3.49-.09-1.04-.17-2.05-.17-2.88ZM110.59,24.28c0-1.17-.31-2.21-.83-2.91-.47-.63-1.16-1.07-2.26-1.07-.91,0-1.52.11-1.94.29-.39.16-.71.42-1,.9-.68,1.1-1.18,3.3-1.18,7.69l.48,10.39c.18,3.47.37,7.22.49,10.35l6.25.83v-26.47ZM114.45,51.31l5.58.88.76-12.93v-9.97c0-1.37-.56-2.21-1.22-2.74-.74-.6-1.6-.81-2-.81-.74,0-1.5.11-2.05.5-.42.3-1.07,1.01-1.07,3.05v22.01ZM124.65,32c1.15-.58,2.39-.76,3.48-.69,1.97.13,3.71.96,4.75,2.77.95,1.65,1.15,3.83.93,6.31-.3,3.43-1.18,13.11-1.18,16.25,0,.63.06,1.47.16,2.54.09,1.05.21,2.28.28,3.6.15,2.63.16,5.72-.48,8.75-.67,3.15-2.49,12.6-12.03,16.88-4.64,2.08-10.87,2.95-16.72,2.66-5.79-.28-11.64-1.73-15.29-4.7-3.44-2.8-7.59-8.79-9.35-14.69-1.99-6.67-6.29-13.24-7.36-15.11-.63-1.1-.43-2.4-.14-3.27.33-.98.98-2,1.94-2.77,1-.79,2.32-1.29,3.88-1.18,1.53.12,3.11.81,4.72,2.08,4.14,3.27,7.18,8.43,8.67,11.59.02-.15.03-.3.05-.46.19-2.21.23-5.65-.04-10.86-.17-3.26-.47-6.05-.79-9.29-.32-3.24-.65-6.87-.87-11.72-.17-3.88.23-6.82,1.31-8.86.56-1.06,1.32-1.9,2.28-2.46.96-.56,2.01-.78,3.04-.78,1.53,0,3.43.22,4.95,1.66.13-.29.28-.56.44-.81.7-1.13,1.63-1.93,2.77-2.42,1.1-.47,2.29-.6,3.46-.6,2.36,0,4.19,1.04,5.36,2.63.76,1.03,1.22,2.23,1.44,3.46,1.25-.57,2.51-.64,3.28-.64,1.31,0,3.02.53,4.43,1.68,1.49,1.21,2.65,3.11,2.65,5.74v2.71Z"
                />
                <path
                  fill="currentColor"
                  d="M5.12,56.65c0-3.35-.9-13.3-1.19-16.58-.19-2.22.07-3.44.43-4.06.26-.46.67-.78,1.66-.84.71-.05,1.49.16,2.07.68.54.49,1.15,1.48,1.15,3.47v.11s.89,15.12.89,15.12c.03.54.29,1.05.72,1.39.42.34.97.49,1.51.4l9.29-1.47,10.02-1.33c.93-.12,1.63-.89,1.67-1.82l.55-11.95v-.1c.25-4.76.48-9.1.48-10.44,0-3.75.63-5.33,1.19-5.99.44-.53,1.08-.76,2.44-.76.49,0,.83.1,1.09.25.25.15.54.41.82.94.59,1.12,1.02,3.22.86,6.88-.21,4.76-.53,8.31-.85,11.51-.32,3.2-.63,6.1-.81,9.47-.27,5.28-.25,8.92-.03,11.39.11,1.23.27,2.23.48,3.02.2.75.51,1.51,1.04,2.07.65.69,1.56,1.02,2.52.79.76-.18,1.29-.66,1.58-.97.61-.64,1.04-1.46,1.21-1.89.98-2.47,4.01-8.22,8.12-11.46,1.2-.95,2.07-1.22,2.62-1.26.52-.04.89.11,1.19.35.33.26.57.63.69.99.04.13.06.22.07.27-1.11,1.88-5.53,8.77-7.61,15.76-1.55,5.21-5.29,10.52-8.09,12.8-2.71,2.2-7.57,3.57-13.05,3.84-5.43.27-11.01-.57-14.95-2.33-7.6-3.41-9.15-10.91-9.84-14.16-.54-2.52-.55-5.22-.4-7.72.07-1.25.18-2.41.27-3.49.09-1.04.17-2.05.17-2.88ZM23.29,24.28c0-1.17.31-2.21.83-2.91.47-.63,1.16-1.07,2.26-1.07.91,0,1.52.11,1.95.29.39.16.71.42,1,.9.68,1.1,1.18,3.3,1.18,7.69l-.48,10.39c-.18,3.47-.37,7.22-.49,10.35l-6.25.83v-26.47ZM19.43,51.31l-5.58.88-.76-12.93v-9.97c0-1.37.56-2.21,1.22-2.74.74-.6,1.59-.81,2-.81.74,0,1.5.11,2.05.5.42.3,1.07,1.01,1.07,3.05v22.01ZM9.24,32c-1.15-.58-2.39-.76-3.48-.69-1.97.13-3.7.96-4.75,2.77-.95,1.65-1.15,3.83-.93,6.31.3,3.43,1.18,13.11,1.18,16.25,0,.63-.07,1.47-.16,2.54-.09,1.05-.21,2.28-.28,3.6-.15,2.63-.16,5.72.48,8.75.67,3.15,2.49,12.6,12.04,16.88,4.64,2.08,10.87,2.95,16.72,2.66,5.79-.28,11.65-1.73,15.29-4.7,3.44-2.8,7.59-8.79,9.35-14.69,1.99-6.67,6.29-13.24,7.36-15.11.63-1.1.43-2.4.14-3.27-.33-.98-.98-2-1.94-2.77-1-.79-2.32-1.29-3.88-1.18-1.53.12-3.11.81-4.72,2.08-4.14,3.27-7.18,8.43-8.67,11.59-.02-.15-.03-.3-.05-.46-.19-2.21-.23-5.65.04-10.86.17-3.26.47-6.05.79-9.29.32-3.24.65-6.87.87-11.72.17-3.88-.23-6.82-1.31-8.86-.56-1.06-1.32-1.9-2.28-2.46-.96-.56-2.01-.78-3.04-.78-1.53,0-3.43.22-4.95,1.66-.13-.29-.28-.56-.44-.81-.7-1.13-1.63-1.93-2.77-2.42-1.1-.47-2.28-.6-3.46-.6-2.36,0-4.19,1.04-5.36,2.63-.76,1.03-1.22,2.23-1.44,3.46-1.25-.57-2.51-.64-3.27-.64-1.31,0-3.02.53-4.43,1.68-1.49,1.21-2.64,3.11-2.64,5.74v2.71Z"
                />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-xl rounded-lg p-4 w-[900px]">
            <div className="flex gap-4">
              {highlightCards.map((card) => (
                <a
                  key={card.title}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-sidebar-accent/20 p-4 hover:bg-muted/60 transition-colors no-underline"
                >
                  <div className="mb-3">{card.icon}</div>
                  <div className="text-sm font-semibold text-sidebar-foreground mb-1">{card.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.text}</p>
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.action === 'conversations'
              ? isConversationDrawerOpen
              : activeNavItem === item.action;
          return (
            <button
              key={item.action}
              type="button"
              aria-label={item.label}
              aria-pressed={isActive}
              onClick={() => onNavItemClick(item.action)}
              className={`p-2 rounded-md transition-colors ${
                isActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      <div className="mt-auto px-2 space-y-2">
        {/* New flow prototypes */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border"
              aria-label="New flow prototypes"
            >
              <Box className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={8}
            className="bg-sidebar text-sidebar-foreground border border-border rounded-[12px] w-56 p-3"
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              New flow prototypes
            </div>
            {flowPrototypes.map((flow) => (
              <button
                key={flow.id}
                type="button"
                onClick={() => {
                  if (flow.navAction) {
                    onNavItemClick(flow.navAction);
                    return;
                  }
                  onFlowPrototypeClick?.(flow.flowId ?? flow.id);
                }}
                className="inline-flex items-center gap-2 text-sm text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-2 transition-colors text-left"
              >
                {flow.label}
              </button>
            ))}
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Inspector mode
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Click any element to view code.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isInspectorEnabled}
                  data-testid="inspector-toggle"
                  onClick={onInspectorToggle}
                  className={`h-6 w-10 rounded-full border border-border flex items-center px-0.5 transition-colors ${
                    isInspectorEnabled ? 'bg-foreground/80' : 'bg-muted/60'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                      isInspectorEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-sidebar-accent overflow-hidden border border-border flex items-center justify-center"
              aria-label="Open account menu"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="bg-sidebar text-sidebar-foreground border border-border rounded-[12px] w-80 p-6 -translate-y-12"
          >
            <div className="text-lg font-semibold mb-4">Account</div>
            
            {/* Organization Selector */}
            <button className="w-full h-10 flex items-center justify-between px-4 mb-3 rounded-md border border-border bg-muted/40 hover:bg-muted/60 transition-colors text-left">
              <span className="text-sm text-sidebar-foreground">Acme Inc.</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Invite Team */}
            <button className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors mb-1">
              <UserCircle2 className="w-4 h-4" />
              Invite Team
            </button>

            <div className="border-t border-sidebar-border my-3"></div>

            {/* Account Management Section */}
            <div className="space-y-0.5">
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Manage Account
              </button>
              <button className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                <Users className="w-4 h-4" />
                Manage Team
              </button>
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <Cloud className="w-4 h-4" />
                Integrations
              </button>
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <Key className="w-4 h-4" />
                API Keys
              </button>
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Secrets
              </button>
            </div>

            <div className="border-t border-sidebar-border my-3"></div>

            {/* Settings Section */}
            <div className="space-y-0.5">
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <UserCircle2 className="w-4 h-4" />
                User Settings
              </button>
              <button 
                onClick={() => onNavItemClick('settings')}
                className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Application Settings
              </button>
              <button className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                <Plus className="w-4 h-4" />
                Create New Organization
              </button>
              <button className="inline-flex items-center gap-2 text-xs text-sidebar-foreground hover:text-white hover:bg-muted/60 w-full rounded-md px-3 py-1.5 transition-colors">
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </aside>
);
