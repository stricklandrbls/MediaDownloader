targets = [
    "https://video.twimg.com/ext_tw_video/*12*x7*.mp4",
    "https://video.twimg.com/ext_tw_video/*12*x7*.ts",
    "https://video.twimg.com/ext_tw_video/*12*x7*.m4s",
    "https://video.twimg.com/ext_tw_video/*12*x7*.mpd"
];
requestsHit = [];
requestsData = [];
videosPerPage = {};

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

function logURL(requestDetails){
    alreadyRequested = false;
    requestsHit.forEach((element)=>{
        if(element == requestDetails.url)
            alreadyRequested = true;
    });
    if(!alreadyRequested)
        requestsHit.push(requestDetails.url);
}
function onCreated() {
    if (browser.runtime.lastError) {
      console.log("error creating item:" + browser.runtime.lastError);
    } else {
      console.log("item created successfully");
    }
}
function getData(){
    requestsHit.forEach((media_request)=>{

        fetch(media_request)
        .then((response)=>{
            response.body.getReader().read()
            .then((data) =>{
                requestsData.push(data.value)
            })
        }, (rejection)=>{
            console.log("Response rejected: "+ rejection);
        })
    })
}
async function test(){
    requestsHit.forEach((request)=>{
        console.log(request.slice(request.indexOf('ext_tw_video/'), request.indexOf("/pu/vid")));
    })
}

browser.menus.onClicked.addListener((info, tab) =>{
    switch(info.menuItemId){
        case "TWE":
            console.log("Printing: " + requestsHit.length + " requests:");
            requestsHit.forEach(element => {
                console.log(element);
            });
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
            console.log(video);
            console.log(url);
            break;
        case "test":
            test();
            break;
    }
})
browser.webRequest.onBeforeRequest.addListener(logURL, {urls: targets});