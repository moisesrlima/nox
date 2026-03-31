import React, { useEffect } from 'react';

interface AdUnitProps {
  className?: string;
  slot?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdUnit({ className = "", slot = "YOUR_AD_SLOT_ID" }: AdUnitProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col items-center justify-center p-4 ${className}`}>
      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Patrocinado</span>
      <div className="w-full flex-1 flex items-center justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%' }}
             data-ad-client="ca-pub-8363850505048882"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
}
