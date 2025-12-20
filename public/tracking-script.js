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
    apiUrl: null, // Will be set from script tag
    websiteId: null,
    sessionId: null,
    visitorId: null,
    trackingSessionId: null, // Server-side session ID
    batchSize: 10,
    batchInterval: 5000, // 5 seconds
    debounceDelay: 300,
  };

  // Get website ID and API URL from script tag
  const scriptTag = document.querySelector('script[data-website-id]') || document.currentScript;
  if (scriptTag) {
    config.websiteId = scriptTag.getAttribute('data-website-id');
    
    // First, try to get API URL from data-api-url attribute (most reliable)
    const apiUrlAttr = scriptTag.getAttribute('data-api-url');
    if (apiUrlAttr) {
      config.apiUrl = apiUrlAttr;
    } else {
      // Fallback: Get API URL from script tag src
      const scriptSrc = scriptTag.getAttribute('src') || scriptTag.src;
      if (scriptSrc) {
        try {
          // Parse scriptSrc as absolute URL (don't use window.location as base)
          let scriptUrl;
          if (scriptSrc.startsWith('http://') || scriptSrc.startsWith('https://')) {
            // Absolute URL
            scriptUrl = new URL(scriptSrc);
          } else if (scriptSrc.startsWith('//')) {
            // Protocol-relative URL
            scriptUrl = new URL(window.location.protocol + scriptSrc);
          } else {
            // Relative URL - this shouldn't happen, but if it does, we can't determine origin
            console.error('Tracking: Script src is relative. Please use absolute URL or data-api-url attribute.');
            return;
          }
          config.apiUrl = scriptUrl.origin + '/api/tracking';
        } catch (e) {
          console.error('Tracking: Failed to parse script URL', e);
          console.error('Tracking: Please add data-api-url attribute to script tag.');
          return;
        }
      } else {
        console.error('Tracking: Script src not found. Please add src attribute or data-api-url attribute.');
        return;
      }
    }
  }

  // Log for debugging
  if (config.apiUrl) {
    console.log('Tracking initialized:', {
      websiteId: config.websiteId,
      apiUrl: config.apiUrl,
      currentOrigin: window.location.origin,
      scriptTagSrc: scriptTag ? (scriptTag.getAttribute('src') || scriptTag.src) : 'not found'
    });
  }

  if (!config.websiteId) {
    console.warn('Tracking: website-id not found');
    return;
  }

  if (!config.apiUrl) {
    console.error('Tracking: API URL not found. Please ensure the script tag has a valid src attribute or data-api-url attribute.');
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

  // Send data to API with timeout
  async function sendToAPI(endpoint, data, timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(config.apiUrl + '/' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Tracking API error:', response.status, response.statusText, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json().catch(() => null);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Tracking: Request timeout');
        throw new Error('Request timeout');
      }
      console.error('Tracking error:', error);
      throw error;
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
          // If there's a queued pageview, send it now
          if (pageViewQueue) {
            setTimeout(() => trackPageView(), 100);
          }
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

    // Check if clicked element is a link
    const linkElement = element.closest('a');
    if (linkElement && linkElement.href) {
      const href = linkElement.href;
      const currentOrigin = window.location.origin;
      
      // Check if it's a same-origin link (not external)
      if (href.startsWith(currentOrigin) || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
        // Track pageview before navigation for current page
        if (config.trackingSessionId) {
          const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
          // Validate time_on_page: must be positive and within INTEGER range
          const validTimeOnPage = (timeOnPage > 0 && timeOnPage <= 2147483647) ? timeOnPage : null;
          // Validate scroll_depth: must be between 0-100
          const validScrollDepth = (maxScrollDepth >= 0 && maxScrollDepth <= 100) ? maxScrollDepth : null;
          
          const currentPageViewData = {
            tracking_session_id: config.trackingSessionId,
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer || null,
            scroll_depth: validScrollDepth,
            time_on_page: validTimeOnPage,
          };
          
          // Use sendBeacon for reliability during navigation
          try {
            const blob = new Blob([JSON.stringify(currentPageViewData)], { type: 'application/json' });
            navigator.sendBeacon(config.apiUrl + '/pageview', blob);
          } catch (err) {
            // Fallback to fetch if sendBeacon fails
            sendToAPI('pageview', currentPageViewData).catch(() => {});
          }
        }
      }
    }

    recordEvent('click', {
      x: position.x,
      y: position.y,
      element_tag: elementInfo?.tag,
      element_id: elementInfo?.id,
      element_class: elementInfo?.class,
      element_text: elementInfo?.text,
      element_selector: elementInfo?.selector,
      link_url: linkElement?.href || null,
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
  let pageViewRetryCount = 0;
  const MAX_PAGEVIEW_RETRIES = 15;
  let pageViewTracked = false;
  let pageViewQueue = null; // Queue pageview data if session not ready
  
  // Helper function to safely calculate load time
  function getLoadTime() {
    if (!performance.timing) return null;
    
    const { loadEventEnd, navigationStart } = performance.timing;
    
    // Check if values are valid and loadEventEnd is after navigationStart
    if (!loadEventEnd || !navigationStart || loadEventEnd === 0 || navigationStart === 0) {
      return null;
    }
    
    const loadTime = loadEventEnd - navigationStart;
    
    // Validate: must be positive and within PostgreSQL INTEGER range (-2147483648 to 2147483647)
    if (loadTime < 0 || loadTime > 2147483647) {
      return null;
    }
    
    return Math.round(loadTime);
  }

  function trackPageView() {
    const pageViewData = {
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || null,
      load_time: getLoadTime(),
    };

    // If session not ready, queue the pageview
    if (!config.trackingSessionId) {
      pageViewQueue = pageViewData;
      if (pageViewRetryCount < MAX_PAGEVIEW_RETRIES) {
        pageViewRetryCount++;
        setTimeout(() => trackPageView(), 300);
        return;
      } else {
        console.warn('Tracking: Failed to track page view - session not initialized after retries');
        // Keep queue for later when session is ready
        return;
      }
    }

    // Use queued data if available, otherwise use current
    const dataToSend = pageViewQueue || pageViewData;
    dataToSend.tracking_session_id = config.trackingSessionId;
    pageViewQueue = null; // Clear queue

    // Prevent duplicate pageview tracking
    if (pageViewTracked && !pageViewQueue) {
      return;
    }
    pageViewTracked = true;

    // Send with retry logic
    let sendRetryCount = 0;
    const MAX_SEND_RETRIES = 3;
    
    function sendPageView() {
      sendToAPI('pageview', dataToSend, 3000) // 3 second timeout
        .then(() => {
          pageViewRetryCount = 0; // Reset retry count on success
        })
        .catch(error => {
          console.error('Tracking: Failed to send page view:', error);
          if (sendRetryCount < MAX_SEND_RETRIES) {
            sendRetryCount++;
            setTimeout(() => sendPageView(), 1000 * sendRetryCount); // Exponential backoff
          } else {
            pageViewTracked = false; // Allow retry on error
            console.warn('Tracking: Max retries reached for pageview');
          }
        });
    }
    
    sendPageView();
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

  // Helper function to safely calculate time on page
  function getTimeOnPage() {
    if (!performance.timing || !performance.timing.navigationStart) {
      return null;
    }
    
    const timeOnPage = Math.round((Date.now() - performance.timing.navigationStart) / 1000);
    
    // Validate: must be positive and within PostgreSQL INTEGER range
    if (timeOnPage < 0 || timeOnPage > 2147483647) {
      return null;
    }
    
    return timeOnPage;
  }

  // Update page view on exit
  window.addEventListener('beforeunload', () => {
    if (config.trackingSessionId && maxScrollDepth > 0) {
      const pageViewData = {
        tracking_session_id: config.trackingSessionId,
        page_url: window.location.href,
        scroll_depth: maxScrollDepth,
        time_on_page: getTimeOnPage(),
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

