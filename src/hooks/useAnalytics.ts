import { useEffect } from "react";
import { useLocation } from "react-router-dom";
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env?.VITE_GA_MEASUREMENT_ID as string | undefined;
let gaLoaded = false;

function loadGa(id: string) {
  if (gaLoaded) return;
  gaLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

export function useAnalytics() {
  const location = useLocation();
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || import.meta.env?.VITE_DISABLE_ANALYTICS === 'true' || import.meta.env?.MODE === 'preview') return;
    loadGa(GA_MEASUREMENT_ID);
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
