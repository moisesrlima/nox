import ReactGA from 'react-ga4';

export const initGA = () => {
  const measurementId = (import.meta as any).env.VITE_GA_MEASUREMENT_ID;
  if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(measurementId);
  }
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
