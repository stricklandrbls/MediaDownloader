// import "src/bg-utils.js";
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
var videosPerPage = new Map();

browser.menus.create({
    id: "TWE",
    title: "Load Twitter Media",
    contexts: ["all"]
}, onCreated);
browser.menus.create({
    id: "clear",
    title: "Clear Requests Array",
    contexts: ["all"]
}, onCreated);
browser.menus.create({
    id: "data-print",
    title: "Print Byte Data",
    contexts: ["all"]
}, onCreated);
browser.menus.create({
    id: "test",
    title: "Test",
    contexts: ["all"]
}, onCreated);

browser.webRequest.onBeforeRequest.addListener(logURL, {urls: targets});
function logURL(requestDetails){
    (requestDetails.url.search(intermediateUrlPath[0]) > -1) ? intermediatePath = intermediateUrlPath[0] : intermediatePath = intermediateUrlPath[1];
    _resolution = requestDetails.url.match(/\d{3,}x\d{3,}/);
    
    id = requestDetails.url.match(/\d{19}/);
    resolution = _resolution[0].split("x");
    alreadyRequested = false;
    console.log(videosPerPage.has( id[0] ));
    if( videosPerPage.has( id[0]) ){

        if( resolution[0] < videosPerPage.get(id).resolution[0] )
            alreadyRequested = true;
    }

    if(!alreadyRequested){
        videoDetails = {
            url: requestDetails.url,
            resolution: [resolution[0], resolution[1]],
            data: []
        };
        videosPerPage.set(id[0], videoDetails);
        console.log(videosPerPage.get(id[0]));
    }
    console.log(videosPerPage);
}

function onCreated() {
    console.log("Media Downloader V0.0.3");
    if (browser.runtime.lastError) {
      console.log("error creating item:" + browser.runtime.lastError);
    } else {
      console.log("item created successfully");
    }
}
function getData(){
    videosPerPage.forEach((media_request)=>{

        fetch(media_request.url)
        .then((response)=>{
            response.body.getReader().read()
            .then((data) =>{
                videosPerPage[media_request.id].requestsData.push(data.value)
            })
        }, (rejection)=>{
            console.log("Response rejected: "+ rejection);
        })
    })
}
async function test(){
    for(segment of videosPerPage){
        console.log(segment.key +":"+segment.url);
    }
}

browser.menus.onClicked.addListener((info, tab) =>{
    switch(info.menuItemId){
        case "TWE":
            console.log("Printing: " + videosPerPage.length + " requests:");
            getData(requestsHit[0]);
            break;
        case "clear":
            console.log("Clearing requests...");
            requestsHit = [];
            requestsData = [];
            console.log(requestsHit.length());
            break;
        case "data-print":
            video = new Blob(requestsData, {type: "video/mp4"});
            url = URL.createObjectURL(video);
            console.log(requestsData);
            console.log(video);
            console.log(url);
            break;
        case "test":
            test();
            break;
    }
})
