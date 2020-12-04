

self.addEventListener( "fetch", function ( event ) {

    event.respondWith(
    
        fetch(event.request)
        .catch( err => {
            //assume offline as everything else should be handled
            var myBlob = new Blob();
            var init = { "status" : 200 , "statusText" : "OK" };
            return myResponse = new Response('offline',init);
    
        } )
    
    );
});