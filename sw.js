var files = [
        '/',
        //'/offline.html'
    ],
    version = 'v1',

    saveFilesToCache = event =>
        event.waitUntil(caches.open(version).then(cache => cache.addAll(files))),

    //+ String -> Boolean
    notCurrentVersion = key => !key.includes(version),

    //+ String -> Promise
    deleteKey = key => caches.delete(key),

    removeOldCache = event =>
        event.waitUntil(caches.keys().then(keys =>
            Promise.all(keys.filter(notCurrentVersion).map(deleteKey))
        )),

    unableToResolve = () =>
        new Response('', {status: 503, statusText: 'Service Unavailable'}),
        //caches.match('/offline.html'),

    //+ Response, Response -> Boolean
    isSame = (response1, response2) => {
        var url1 = response1.url,
            url2 = response2.url,
            contentLength1 = response1 && response1.headers.get('content-length'),
            contentLength2 = response2 && response2.headers.get('content-length');

        // Not exactly a perfect check, but it'll do for our purpose.
        return response1 && response2 && url1 === url2 && contentLength1 === contentLength2;
    },

    //+ Response, Response -> Boolean
    isNew = (r1, r2) => !isSame(r1, r2),

    sendMessage = (msg) =>
        self.clients.matchAll().then(all => all.map(client => client.postMessage(msg))),

    interceptFetch = event => {
        var req = event.request;

        // If the request is not a get request, we just let it through.
        if (req.method !== 'GET') return event.respondWith(fetch(req));

        var response = caches.match(req).then(cached => {
            var networked = fetch(req)
                .then(res => {
                    caches.open(version).then(cache => cache.put(req, res.clone()));

                    sendMessage({updated: isNew(cached, res)});

                    return res;
                }, unableToResolve)
                .catch(unableToResolve);

            return cached || networked;
        });

        event.respondWith(response);
    };


self.addEventListener('install', saveFilesToCache);
self.addEventListener('activate', removeOldCache);
self.addEventListener('fetch', interceptFetch);

