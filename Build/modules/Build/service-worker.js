// Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js
/*
  Welcome to our basic Service Worker! This Service Worker offers a basic offline experience
  while also being easily customizeable. You can add in your own code to implement the capabilities
  listed below, or change anything else you would like.


  Need an introduction to Service Workers? Check our docs here: https://docs.pwabuilder.com/#/home/sw-intro
  Want to learn more about how our Service Worker generation works? Check our docs here: https://docs.pwabuilder.com/#/studio/existing-app?id=add-a-service-worker

  Did you know that Service Workers offer many more capabilities than just offline?
    - Background Sync: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06
    - Periodic Background Sync: https://web.dev/periodic-background-sync/
    - Push Notifications: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=push-notifications-on-the-web
    - Badges: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=application-badges
*/
const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
];
// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
    var now = Date.now();
    var url = new URL(req.url);
    // 1. fixed http URL
    // Just keep syncing with location.protocol
    // fetch(httpURL) belongs to active mixed content.
    // And fetch(httpRequest) is not supported yet.
    url.protocol = self.location.protocol;
    // 2. add query for caching-busting.
    // Github Pages served with Cache-Control: max-age=600
    // max-age on mutable content is error-prone, with SW life of bugs can even extend.
    // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
    // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
    if (url.hostname === self.location.hostname) {
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
    }
    return url.href;
};
/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});
/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request);
        const fixedUrl = getFixedUrl(event.request);
        const fetched = fetch(fixedUrl, { cache: 'no-store' });
        const fetchedCopy = fetched.then(resp => resp.clone());
        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(Promise.race([fetched.catch(_ => cached), cached])
            .then(resp => resp || fetched)
            .catch(_ => { }));
        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(Promise.all([fetchedCopy, caches.open("pwa-cache")])
            .then(([response, cache]) => response.ok && cache.put(event.request, response))
            .catch(_ => { }));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS13b3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zZXJ2aWNlLXdvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDSSw4RUFBOEU7QUFFOUU7Ozs7Ozs7Ozs7Ozs7O0VBY0U7QUFFRixNQUFNLGtCQUFrQixHQUFHO0lBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUTtJQUN0QixtQkFBbUI7SUFDbkIsc0JBQXNCO0lBQ3RCLGtCQUFrQjtDQUNyQixDQUFBO0FBRUQseURBQXlEO0FBQ3pELE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDeEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUxQixvQkFBb0I7SUFDcEIsMkNBQTJDO0lBQzNDLGtEQUFrRDtJQUNsRCwrQ0FBK0M7SUFDL0MsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQTtJQUVyQyxvQ0FBb0M7SUFDcEMsc0RBQXNEO0lBQ3RELG1GQUFtRjtJQUNuRiwrRkFBK0Y7SUFDL0Ysa0ZBQWtGO0lBQ2xGLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtRQUN6QyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLEdBQUcsR0FBRyxDQUFBO0tBQy9EO0lBQ0QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFBO0FBQ25CLENBQUMsQ0FBQTtBQUVEOzs7OztHQUtHO0FBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRTtJQUN4QyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtBQUN2QyxDQUFDLENBQUMsQ0FBQTtBQUVGOzs7OztHQUtHO0FBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtJQUN2Qyx1RUFBdUU7SUFDdkUsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUN0RSx5QkFBeUI7UUFDekIsdUZBQXVGO1FBQ3ZGLGlHQUFpRztRQUNqRyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUMxQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzNDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUN0RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7UUFFdEQsaURBQWlEO1FBQ2pELDZEQUE2RDtRQUM3RCxtREFBbUQ7UUFDbkQsc0RBQXNEO1FBQ3RELEtBQUssQ0FBQyxXQUFXLENBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQzthQUM3QixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBd0IsQ0FBQyxDQUFDLENBQ3hDLENBQUE7UUFFRCxvRUFBb0U7UUFDcEUsS0FBSyxDQUFDLFNBQVMsQ0FDZixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUMvQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDOUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQXdCLENBQUMsQ0FBQyxDQUN4QyxDQUFBO0tBQ0o7QUFDRCxDQUFDLENBQUMsQ0FBQSJ9