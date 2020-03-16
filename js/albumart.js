/* 
 * Modifications made to the original code:
	* added comments to specify what I didn't know: since my knowledge on JS, Query and API is limited they'll help me (and hope they'll help anyone who'll work on this in the future)
  * moved modal autofocus and 'Enter' key pressure management from here to my-scripts, I felt they didn't belong in here
  * "jQuerified" the code (I have to learn it even if it's hated, sorry)
  * changed all var to let, to allow me to reuse the same name for the same values
  * changed lastfm API key (used mine instead of xsaardo's one)
  * changed images ID: from comma to dash (since comma gave problems with jQuery selectors)
  * FUNCTION DEFAULT ALBUMS: 
		*	removed it's assignment to a variable, moved on top since it's one the first functions executed
	  * added title to the image so that when one hovers on it it's displayed: FIX-to-do: when drag and dropping image title isn't correctly managed (since it's related to the id and not to the image)
	*	FUNCTION GENERATEGRID:
		*	removed it's assignment to a variable
	  *	moved imageMatrix on Global Vars since var is changed to let (and thus it wasn't recognised outside its block scope)
	  *	changed the function to also save/restore title (as 'Artist - Album')
	  *	changed the image saved: extra-large (300px) instead of large() TO-DO: force the user to select an image between 100 (default) and 300 pixel
	*	DRAG AND DROP:
		* now this function also handles the title of the swapped images
*/

// Global Vars
let initialFlag = 1;
let modal = $('#myModal');
let albumArtURL, imageMatrix, curID="";
let placeholderImg = "img/placeholder.jpg"; // Changed since the old one didn't work, instead of taking it from an URL I decided to include it in the project
const lastfm_apikey = "fc796a0c61cb69cccbaccb4706b597e4";


// Execute upon page load
$(window).on('load', function(){
	generateGrid();
}); 

// Functions
/********* ALBUM GRID FUNCTIONS *********/
// Generate grid of img objects
let generateGrid = function() {
	// Save current images if not initial site load
	if (!initialFlag) {
		let numRows = $("#numRows").val();
		let numCols = $("#numCols").val();
		imageMatrix = new Array();
		let imageRow = new Array();
		let saveImage = "";
		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				saveImage = i.toString() + '-' + j.toString();
				try {
					imageRow.push({
						source: $('#'+saveImage).attr('src'),
						info: $('#'+saveImage).attr('title')
					}); // Adding to imageRow array every img's 'src' attribute
				}
				catch(err) {
					imageRow.push(placeholderImg);
				}
			}
			imageMatrix.push(imageRow); // Array of rows
			imageRow = [];
		}
	}
	
	// Grid row/cols
	let numCols = $("#numCols").val();
	let numRows = $("#numRows").val();
	
	// Image size
	let imgSize = $("#artsize").val().toString();
	$('.albumarts').css({ // albumarts class is assigned to every image
		'height': imgSize + 'px',
		'width': imgSize + 'px'
	});
	
	let id = "", albumHTML = "";  // Init album html block
	$("#albums").html(""); // Clear out existing albums
	
	// Generate HTML for album grid
	for (i = 0; i < numRows; i++) {
		albumHTML += '<div class="row"><div align="center" class="col-12">' + '\n';
		for (j = 0; j < numCols; j++) {	
			id = i.toString() + "-" + j.toString();
			/* For comments on drag functions, see DRAG AND DROP section
			 * draggable = true makes the image draggable
			 * ondragstart = what to do when element is dragged? --> call dragStart function: 
			 * ondragover = event that specifies where the dragged data can be dropped --> call allowDrop function
			 * ondrop =
			 * serc = placeholderImg and title = "Not set" will overwrite all the images: the information of previous images will be restored in the second for loop cycle, so at the end the images with placeholder and "Not set" will only be the new rows/cols
			 */
			albumHTML += 
			'<a data-target="#myModal" data-toggle="modal" onclick="setCurID(event)"> \
					<img \
						id="' + id + '" \
						draggable="true" \
						ondragstart="dragStart(event)" \
						ondragover="allowDrop(event)" \
						ondrop="drop(event)" \
						class="albumarts" \
						width=' + imgSize + ' height=' + imgSize + 
						' src=' + placeholderImg +
						' title="Not set" \
						 alt=""> \
			 </a>'; 
		}
		albumHTML +=  "</div></div>" + '\n';
	}
	
	$("#albums").html(albumHTML); // Insert HTML in div "albums"
	
	// Image Margins (wait til document is ready)
	let marginSize = $("#marginSize").val();
	$(document).ready(function () {
		$('img').css('margin', marginSize + 'px');
	});
	
	// Reinsert previous images
	if (!initialFlag) {
		for (i = 0; i < numRows; i++) {
			imageRow = imageMatrix[i];
			for (j = 0; j < numCols; j++) {
				selectedImg = i.toString() + '-' + j.toString();
				try { // Restore saved info
					$('#' + selectedImg).attr({
						'src': imageRow[j].source,
						'title': imageRow[j].info
					});
				}
				catch(err) {}
			}
		}
	}
	else { // This is called the first time since initialFlag will be 1
		defaultAlbums();
	}
	initialFlag = 0; // To make it evaluate to false the next time
};

// Generate random albums (executed on the first page load)
function defaultAlbums() {
	let numCols = $("#numCols").val();
	let numRows = $("#numRows").val();
	let artSource, selectedImg;
	let k = 0;
	let randLetter = Math.floor(Math.random()*26) + 97;
	let searchterm = String.fromCharCode(randLetter);
	$.getJSON("https://ws.audioscrobbler.com/2.0?method=album.search&album=" + searchterm + "&api_key=" + lastfm_apikey + "&format=json&callback=?", function(json){ // json: parameter passed to the callback function
		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {				
				selectedImg = i.toString() + "-" + j.toString(); // Escaping comma to be able to use it as selector
				// image[3]: extra-large version of the image, #text: URL of the image
				artSource = json.results.albummatches.album[k].image[3]['#text'];
				artTitle = json.results.albummatches.album[k].artist + ' - ' + json.results.albummatches.album[k].name;
				if (artSource === "") { // Replace not found image with proper title
					artSource = placeholderImg;
					artTitle = "Not set";
				}
				$('#' + selectedImg).attr({
					'src': artSource,
					'title': artTitle 
				});
				k++;
			}
		}
	});
}

// Shuffle images around
let shuffle = function() {
	let img1, img2;
	let selectedImg1, selectedImg2;
	let i,j,ii,jj;
	let numCols = document.getElementById("numCols").value;
	let numRows = document.getElementById("numRows").value;
	
	for (let k = 0; k < 60; k++) {
		j = Math.round(Math.random()*(numCols-1));
		i = Math.round(Math.random()*(numRows-1));
		jj = Math.round(Math.random()*(numCols-1));
		ii = Math.round(Math.random()*(numRows-1));
		selectedImg1 = i.toString() + "-" + j.toString();
		selectedImg2 = ii.toString() + "-" + jj.toString();
		img1 = document.getElementById(selectedImg1).src;
		img2 = document.getElementById(selectedImg2).src;
		document.getElementById(selectedImg1).src = img2;
		document.getElementById(selectedImg2).src = img1;
	}
};

/********* MODAL FUNCTIONS *********/
 function albumsearch() {
	$('#searchTerm').focus();
	let searchterm = $('#searchTerm').val();
	let albumHTML = ""; // Init album html block
	let k = 0;
	
	$.getJSON("https://ws.audioscrobbler.com/2.0?method=album.search&album="+ searchterm + "&api_key=" + lastfm_apikey + "&format=json&callback=?", function(json){
		// Generate HTML for album grid
		for (let i = 0; i < 3; i++) {
			albumHTML += '<div class="row"><div align="center" class="col-12">' + '\n';
			for (let j = 0; j < 4; j++) {	
				albumArtURL = json.results.albummatches.album[k].image[3]['#text'];
				albumArtInfo = json.results.albummatches.album[k].artist + ' - ' + json.results.albummatches.album[k].name;
				if (albumArtURL === "") { 
					albumArtURL = placeholderImg;
					albumArtInfo = "Image not available"
				}
				albumHTML += '<img width=100 height=100 style="margin: 1px;" src="' + albumArtURL + '" title="' + albumArtInfo + '" onclick="chooseIMG(this)">';
				k++;
			}
			albumHTML += "</div></div>" + '\n';
		}
		$("#albumsFound").html(albumHTML); // Insert HTML
	});
};

// Keeps track of which element has been clicked, to set the new image to it
function setCurID (event) { 
	curID = event.target.id;
	console.log(curID);
}

// Set the new image, overwriting the old info, to the selected image
let chooseIMG = function(url) {
	// Set the new info for the chosen image
	$('#' + curID).attr({
		src: url.src,
		title: url.title
	});
	$("#searchTerm").val(""); // Reset search term
	$('#myModal').modal('hide'); // Hide modal after insertion
};

/********* DRAG AND DROP *********/
function dragStart (event) { 
	// Specify what data to be dragged: in this case, the value of id (which has a text type) of the draggable element
	event.dataTransfer.setData("text",event.target.id); 
}

function allowDrop (event) {
	// By default, data/elements cannot be dropped in other elements, so to allow a drop the default handling is prevented
	event.preventDefault();
}

function drop (event) {
	// To prevent the browser default handling of the data (which would open as link on drop)
	event.preventDefault();
	// Get the dragged data: it'll return any data that was set to the same type in the setData() method (in this case, the id of element, which has a text element)
	let data = event.dataTransfer.getData("text");
	// Save the old image src
	let initialImg = {
		source: $('#'+data).attr('src'),
		title: $('#'+data).attr('title')
	};
	$('#' + data).attr({
		src: event.target.src,
		title: event.target.title
	})
	event.target.src = initialImg.source;
	event.target.title = initialImg.title;
}


/*
	let canvasArea = document.getElementById("albums");
	let t = canvasArea.getContext('2d');
	window.open('', document.getElementById('albums').toDataURL());
*/

