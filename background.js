

function logURL(requestDetails){
    (requestDetails.url.search(intermediateUrlPath[0]) > -1) ? intermediatePath = intermediateUrlPath[0] : intermediatePath = intermediateUrlPath[1];
    _resolution = requestDetails.url.match( /\d{3,}x\d{3,}/ );
    
    id          = requestDetails.url.match( /\d{19}/ )[0];
    resolution  = _resolution[0].split( "x" );
    alreadyRequested = false;

    if( videosObjectsPerPage.has( id ) ){
        videoById = videosObjectsPerPage.get( id );
        videoById.urls.forEach( ( url ) =>{
            if( url == requestDetails.url )
                alreadyRequested = true;
        });

        if( resolution[0] > videoById.resolution[0] ){
            videoById.resolution[0] = resolution[0];
            videoById.resolution[1] = resolution[1];
        }

        if( !alreadyRequested )
            videoById.urls.push( requestDetails.url );
    }
    else{
        videoDetails = {
            urls: [requestDetails.url],
            resolution: [resolution[0], resolution[1]],
            data: []
        };
        videosObjectsPerPage.set( id, videoDetails );
    }
    browser.menus.update("TWE", { title: "Load Requested Media (" + videosObjectsPerPage.size +")" });
}


function onCreated() {
    console.log("Media Downloader V0.0.3");
    if (browser.runtime.lastError) { console.log("error creating item:" + browser.runtime.lastError); } 
    else { console.log("item created successfully"); }
}


function getData(){
    highestResUrls = [];
    for( const videoObject of videosObjectsPerPage.entries()){
        id = videoObject[0];
        videoDetails = videoObject[1];

        resolution = videoDetails.resolution[0] + "x" + videoDetails.resolution[1];

        videoDetails.urls.forEach( (mediaUrl) =>{
            if( mediaUrl.includes( resolution ) ){

                fetch( mediaUrl )
                .then( (response) =>{
                    response.body.getReader().read()
                    .then( (byteData) =>{
                        videoDetails.data.push( byteData.value );
                    });
                });
                // End Fetch
            }
        });
        // End URL iteration
    }
    // End Map Key Iteration
}


async function test(){
    for(segment of videosObjectsPerPage){
        console.log(segment.key +":"+segment.url);
    }
}



intermediateUrlPath = ["ext_tw_video", "amplify_video"]
targets = [
    "https://video.twimg.com/"+intermediateUrlPath[0]+"*.mp4",
    "https://video.twimg.com/"+intermediateUrlPath[0]+"*.ts",
    "https://video.twimg.com/"+intermediateUrlPath[0]+"*.m4s",
    "https://video.twimg.com/"+intermediateUrlPath[0]+"*.mpd",
    "https://video.twimg.com/"+intermediateUrlPath[1]+"*.mp4",
    "https://video.twimg.com/"+intermediateUrlPath[1]+"*.ts",
    "https://video.twimg.com/"+intermediateUrlPath[1]+"*.m4s",
    "https://video.twimg.com/"+intermediateUrlPath[1]+"*.mpd"
];
ALL_REQs = [];
requestsHit = [];
requestsData = [];
videoContainer = [];
var videosObjectsPerPage = new Map();

browser.menus.create({
    id: "TWE",
    title: "Load Requested Media",
    contexts: ["all"]
}, onCreated);
browser.menus.create({
    id: "clear",
    title: "Clear",
    contexts: ["all"],
    enabled: false
}, onCreated);
browser.menus.create({
    id: "data-print",
    title: "Generate",
    contexts: ["all"],
    enabled: false,
}, onCreated);
browser.menus.create({
    id: "test",
    title: "Test",
    contexts: ["all"]
}, onCreated);

browser.webRequest.onBeforeRequest.addListener(logURL, {urls: targets});

browser.menus.onClicked.addListener((info, tab) =>{
    switch(info.menuItemId){
        case "TWE":
            console.log("Printing: " + videosObjectsPerPage.size + " media requests");
            getData();
            browser.menus.update("data-print", { enabled: true, title: "Generate ("+videosObjectsPerPage.size+")" });
            browser.menus.update("clear", { enabled: true, title: "Clear ("+videosObjectsPerPage.size+")" });
            break;
        case "clear":
            console.log("Clearing requests...");
            requestsHit = [];
            requestsData = [];
            delete videosObjectsPerPage;
            videosObjectsPerPage = new Map();
            browser.menus.update("data-print", { enabled: false, title: "Generate" });
            browser.menus.update("clear", { enabled: false, title: "Clear" });
            break;
        case "data-print":
            generatedMedia = [];
            for( const videoObject of videosObjectsPerPage.entries()){
                videoId = videoObject[0];
                videoDetails = videoObject[1];
                video = new Blob(videoDetails.data, { type: "video/mp4" });
                console.log(videoDetails.data);
                console.log(video);
                content = {
                    title: id,
                    url: URL.createObjectURL(video),
                    data: video
                }
                console.log(content.url);
                generatedMedia.push(content);
            }
            break;
        case "test":
            test();
            break;
    }
})
