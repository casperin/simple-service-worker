# Example of very service-worker caching

This is the simplest example of a working caching system that I could find. It...

* Caches files that you define in an array
* Shows cache hits (if any) before hitting the network
* If site is updated, then
    * Replace cache (it will do this regardless of content being updated)
    * Notify user that he should probably update website
* Also has an install step where it will remove old cache (not really needed I suppose)

