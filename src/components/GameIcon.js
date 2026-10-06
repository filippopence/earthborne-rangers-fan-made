import React from 'react';

// Original redrawings of the game symbols, not the publisher's icon font.
const ICONS = {
  progress: {
    label: 'progress',
    path: 'M12 3l8 12h-3.6L12 8.4 7.6 15H4zM4.6 17h5l-2.5 4h-5zM14.4 17h5l2.5 4h-5z',
  },
  harm: {
    label: 'harm',
    path:
      'M12 2l2.89 5h5.77l-2.89 5 2.89 5h-5.77L12 22l-2.89-5H3.34l2.89-5-2.89-5h5.77z' +
      'M8.6 9.6h6.8L12 15.4z',
  },
};

// Inline game symbol that follows the text colour and size.
export default function GameIcon({name}) {
  const icon = ICONS[name];
  if (!icon) {
    throw new Error(`Unknown game icon "${name}"`);
  }
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={icon.label}
      style={{height: '1.3em', width: '1.3em', verticalAlign: '-0.25em'}}>
      <title>{icon.label}</title>
      <path d={icon.path} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
