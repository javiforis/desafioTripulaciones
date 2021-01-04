

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById("snap");
const errorMsgElement = document.querySelector('span#errorMsg');
const switchCamera = document.getElementById('switch-camera');
const send = document.querySelector("#send");

let shouldFaceUser = true; //Default is the front cam

let previousStream=null;
let constraints = {
	audio: false,
	video: {
		width: video.videoWidth, height: video.videoHeight
		}
    };
	
	
// Access webcam


async function init() {
	constraints.video.facingMode=shouldFaceUser ? 'user' : 'environment'
		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			handleSuccess(stream);
		} catch (e) {
			errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
		}
	}

// Success
        

function handleSuccess(stream) {
	window.stream = stream;
	video.srcObject = stream;
	previousStream=stream;
	}

// Load init

init();

// Draw image

let context = canvas.getContext('2d');
	snap.addEventListener("click", function() {
			context.width=video.videoWidth;
			context.height=video.videoHeight;
			canvas.width=video.videoWidth;
			canvas.height=video.videoHeight;
			context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
		});
		switchCamera.addEventListener("click", async function() {
			shouldFaceUser = !shouldFaceUser;
			previousStream.getTracks().forEach(t => {
			    t.stop();
			});
			await init();
		});

		send.addEventListener("click", () => {
			let img = canvas.toDataURL("image/png");
			let fd = new FormData();
			fd.append("img", img);
			fetch("http://localhost:8080/upload", {
				method: "POST",
				body: fd
			}).then(r => r.json()).then(d => console.log(d));
			console.log("Send");
		})