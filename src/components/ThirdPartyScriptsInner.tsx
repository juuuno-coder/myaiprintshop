'use client';

import Script from 'next/script';

export default function ThirdPartyScriptsInner() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7704550771011130"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CGK1BSBM63"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CGK1BSBM63');
        `}
      </Script>
    </>
  );
}
