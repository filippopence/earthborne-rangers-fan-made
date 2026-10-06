import React from 'react';

// These components reproduce the page furniture of the official campaign guides.

// Stack of alternating highlighted rows: "IF ... GO TO ...", "CLEAR ...: GO TO ...".
// One <Option> per row; a row may hold a lead line followed by a list of sub-choices.
export function Options({children}) {
  return <div className="guide-options">{children}</div>;
}

export function Option({children}) {
  return <div className="guide-option">{children}</div>;
}

// One lettered option under a "RANGERS CHOOSE:" heading (#### in Markdown).
export function Choice({children}) {
  return <p className="guide-choice">{children}</p>;
}

// A campaign tracker entry the Rangers record or check.
export function Log({children}) {
  return <span className="guide-log">{children}</span>;
}

// The line that tells the Rangers what to do next.
export function Objective({children}) {
  return <p className="guide-objective">{children}</p>;
}
