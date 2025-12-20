/**
 * Website Tracking Script
 * Similar to Hotjar for heatmap and behavior analytics
 * 
 * Usage: Add this script to your website with:
 * <script src="https://yourdomain.com/tracking-script.js" data-website-id="YOUR_WEBSITE_ID"></script>
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    apiUrl: window.location.origin + '/api/tracking',
    websiteId: null,
    sessionId: null,
    visitorId: null,
    trackingSessionId: null, // Server-side session ID
    batchSize: 10,
    batchInterval: 5000, // 5 seconds
    debounceDelay: 300,
  };

  // Get website ID from script tag
  const scriptTag = document.querySelector('script[data-website-id]');
  if (scriptTag) {
    config.websiteId = scriptTag.getAttribute('data-website-id');
  }

  if (!config.websiteId) {
    console.warn('Tracking: website-id not found');
    return;
  }

  // Generate or get session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  // Generate or get visitor ID
  function getVisitorId() {
    let visitorId = localStorage.getItem('tracking_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('tracking_visitor_id', visitorId);
    }
    return visitorId;
  }

  config.sessionId = getSessionId();
  config.visitorId = getVisitorId();

  // Event queue
  const eventQueue = [];
  let batchTimer = null;

  // Get viewport dimensions
  function getViewport() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
    };
  }

  // Get screen dimensions
  function getScreen() {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  // Get element info
  function getElementInfo(element) {
    if (!element) return null;

    const info = {
      tag: element.tagName?.toLowerCase(),
      id: element.id || null,
      class: element.className || null,
      text: element.textContent?.substring(0, 100) || null,
      selector: null,
    };

    // Generate CSS selector
    if (element.id) {
      info.selector = '#' + element.id;
    } else if (element.className) {
      const classes = element.className.split(' ').filter(c => c).slice(0, 3).join('.');
      info.selector = element.tagName.toLowerCase() + '.' + classes;
    } else {
      info.selector = element.tagName?.toLowerCase() || 'unknown';
    }

    return info;
  }

  // Get element position
  function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    };
  }

  // Send data to API
  async function sendToAPI(endpoint, data) {
    try {
      const response = await fetch(config.apiUrl + '/' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Tracking API error:', response.statusText);
      }
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }

  // Initialize session
  async function initSession() {
    const viewport = getViewport();
    const screen = getScreen();

    const sessionData = {
      website_id: config.websiteId,
      session_id: config.sessionId,
      visitor_id: config.visitorId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: viewport.width,
      viewport_height: viewport.height,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
    };

    try {
      const response = await fetch(config.apiUrl + '/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          config.trackingSessionId = data.id;
        }
      }
    } catch (error) {
      console.error('Tracking session init error:', error);
    }
  }

  // Get device type
  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Get browser
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Get OS
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Record event
  function recordEvent(eventType, data = {}) {
    if (!config.trackingSessionId) {
      // Wait for session to be initialized
      setTimeout(() => recordEvent(eventType, data), 100);
      return;
    }

    const viewport = getViewport();
    const event = {
      tracking_session_id: config.trackingSessionId,
      event_type: eventType,
      page_url: window.location.href,
      viewport_width: viewport.width,
      viewport_height: viewport.height,
      ...data,
    };

    eventQueue.push(event);

    // Send batch if queue is full
    if (eventQueue.length >= config.batchSize) {
      flushEvents();
    } else {
      // Schedule batch send
      if (!batchTimer) {
        batchTimer = setTimeout(flushEvents, config.batchInterval);
      }
    }
  }

  // Flush events queue
  async function flushEvents() {
    if (eventQueue.length === 0) return;

    const events = eventQueue.splice(0);
    batchTimer = null;

    await sendToAPI('event', events);
  }

  // Track click
  function trackClick(e) {
    const element = e.target;
    const elementInfo = getElementInfo(element);
    const position = getElementPosition(element);

    recordEvent('click', {
      x: position.x,
      y: position.y,
      element_tag: elementInfo?.tag,
      element_id: elementInfo?.id,
      element_class: elementInfo?.class,
      element_text: elementInfo?.text,
      element_selector: elementInfo?.selector,
    });
  }

  // Track scroll (debounced)
  let scrollTimer = null;
  function trackScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = maxScroll > 0 ? Math.round((scrollY / maxScroll) * 100) : 0;

      recordEvent('scroll', {
        scroll_position: scrollY,
        y: scrollY,
      });
    }, config.debounceDelay);
  }

  // Track mouse move (throttled)
  let moveTimer = null;
  function trackMove(e) {
    if (moveTimer) return;
    moveTimer = setTimeout(() => {
      recordEvent('move', {
        x: e.clientX,
        y: e.clientY,
      });
      moveTimer = null;
    }, 1000); // Track every 1 second
  }

  // Track page view
  function trackPageView() {
    if (!config.trackingSessionId) {
      setTimeout(() => trackPageView(), 100);
      return;
    }

    const pageViewData = {
      tracking_session_id: config.trackingSessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || null,
      load_time: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : null,
    };

    sendToAPI('pageview', pageViewData);
  }

  // Track scroll depth
  let maxScrollDepth = 0;
  function trackScrollDepth() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = Math.round(((scrollY + winHeight) / docHeight) * 100);

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
    }
  }

  // Update page view on exit
  window.addEventListener('beforeunload', () => {
    if (config.trackingSessionId && maxScrollDepth > 0) {
      const pageViewData = {
        tracking_session_id: config.trackingSessionId,
        page_url: window.location.href,
        scroll_depth: maxScrollDepth,
        time_on_page: performance.timing ? 
          Math.round((Date.now() - performance.timing.navigationStart) / 1000) : null,
      };
      
      // Use sendBeacon for reliability
      const blob = new Blob([JSON.stringify(pageViewData)], { type: 'application/json' });
      navigator.sendBeacon(config.apiUrl + '/pageview', blob);
    }

    // Flush remaining events
    flushEvents();
  });

  // Initialize
  initSession();
  trackPageView();

  // Event listeners
  document.addEventListener('click', trackClick, true);
  window.addEventListener('scroll', trackScroll, { passive: true });
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
  document.addEventListener('mousemove', trackMove, { passive: true });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      flushEvents();
    }
  });

  // Expose API for manual tracking
  window.trackingAPI = {
    recordEvent: recordEvent,
    flush: flushEvents,
  };

  console.log('Website tracking initialized for website:', config.websiteId);
})();

