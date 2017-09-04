// All images should be 200x40
var theImages = new Array()
theImages[0] = 'images/budonoki.jpg'
theImages[1] = 'images/cats.png'
theImages[2] = 'images/cats2.png'
theImages[3] = 'images/error.png'
theImages[4] = 'images/hacked.png'
theImages[5] = 'images/assembly.png'
theImages[6] = 'images/graffiti.png'
theImages[7] = 'images/dj.png'

var j = 0
var p = theImages.length;
var preBuffer = new Array()
for (i = 0; i < p; i++){
   preBuffer[i] = new Image()
   preBuffer[i].src = theImages[i]
}
var whichImage = Math.round(Math.random()*(p-1));
function showImage(){
document.write('<img src="'+theImages[whichImage]+'" width="200" height="40">');
}