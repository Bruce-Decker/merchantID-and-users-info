(function() {
	var video = document.getElementById('video'),
	    canvas = document.getElementById('canvas'),
	   
	    context = canvas.getContext('2d'),
	    vendorUrl = window.URL || window.webkitURL;
	navigator.getMedia = navigator.getUserMedia ||
	                     navigator.webkitGetUserMedia ||
	                     navigator.mozGetUserMedia ||
	                     navigator.msGetUserMedia;

	navigator.getMedia ({
		video: true,
		audio: false
	}, function(stream) {
         video.src = vendorUrl.createObjectURL(stream);
         video.play();
	}, function(error) {

	});

	$('#form_button').on('click', function() { 

          context.drawImage(video, 0, 0, 400, 300);
            dataURL = canvas.toDataURL();
          
          var name = document.getElementById('name').value;
          var age = document.getElementById('age').value;
          var merchantID = document.getElementById('merchantID').value;
         
          var selfie = dataURL;
          var info = {name: name, age: age, selfie: selfie, merchantID: merchantID};
          $.ajax({
            type: 'POST',
            url: '/demoData',
            data: info
          });


          
   });
})