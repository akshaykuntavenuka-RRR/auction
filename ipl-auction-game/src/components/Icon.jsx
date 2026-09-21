import React from 'react';

/**
 * Universal SVG Icon component.
 * Replaces webfont ligatures with crisp, resolution-independent vector SVGs.
 * Never renders raw text strings if fonts fail to load.
 */
export default function Icon({ name, className = '', size = 20, style = {} }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `inline-block align-middle flex-shrink-0 ${className}`,
    style: { display: 'inline-flex', verticalAlign: 'middle', ...style }
  };

  switch (name) {
    case 'arrow_back':
      return (
        <svg {...iconProps}>
          <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2.5" />
        </svg>
      );
    case 'arrow_forward':
      return (
        <svg {...iconProps}>
          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5" />
        </svg>
      );
    case 'home':
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'sports_cricket':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>🏏</span>;
    case 'smart_toy':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>🤖</span>;
    case 'groups':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>👥</span>;
    case 'payments':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>💰</span>;
    case 'timer':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>⏱️</span>;
    case 'sort':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>🔀</span>;
    case 'edit_square':
    case 'edit':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>✏️</span>;
    case 'meeting_room':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>🔑</span>;
    case 'check_circle':
    case 'check':
      return (
        <svg {...iconProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'close':
    case 'cancel':
      return (
        <svg {...iconProps}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'person_add':
    case 'group_add':
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      );
    case 'rocket_launch':
      return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>🚀</span>;
    case 'refresh':
      return (
        <svg {...iconProps}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case 'pause':
    case 'pause_circle':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="10" y1="15" x2="10" y2="9" />
          <line x1="14" y1="15" x2="14" y2="9" />
        </svg>
      );
    case 'play_arrow':
      return (
        <svg {...iconProps} fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'share':
      return (
        <svg {...iconProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    case 'expand_more':
      return (
        <svg {...iconProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'expand_less':
      return (
        <svg {...iconProps}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}
