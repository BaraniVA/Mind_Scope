// src/lib/console-override.ts
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // List of patterns to suppress
  const suppressPatterns = [
    /Download the React DevTools/,
    /Long Running Recorder/,
    /LaunchDarkly/,
    /chrome-extension:/,
    /Denying load of/,
    /Resources must be listed in the web_accessible_resources/,
    /Fast Refresh/,
    /contentScript\.bundle\.js/,
    /A listener indicated an asynchronous response/,
    /general\.js.*LaunchDarkly/,
    /bis_skin_checked/
  ];

  const shouldSuppress = (message: string): boolean => {
    return suppressPatterns.some(pattern => pattern.test(message));
  };

  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalLog.apply(console, args);
    }
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };
}
