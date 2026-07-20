'use client';

export function PrintButton() {
  return <button className="secondary-action print-button" type="button" onClick={() => window.print()}>Print / save PDF</button>;
}
