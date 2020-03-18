/* 
 * Modifications made to the original code:
	* added comments to specify what I didn't know: since my knowledge on JS, Query and API is limited they'll help me (and hope they'll help anyone who'll work on this in the future)
  * moved modal autofocus and 'Enter' key pressure management from here to my-scripts, I felt they didn't belong in here
  * "jQuerified" the code (I have to learn it even if it's hated, sorry)
  * changed all var to let, to allow me to reuse the same name for the same values
  * changed lastfm API key (used mine instead of xsaardo's one)
  * changed images ID: from comma to dash (since comma gave problems with jQuery selectors)
  * Rethinked the general functioning of the code:
		*	on page load, the chart is created empty: this because lastFM docs suggests not to make a call in the first page (defaultAlbums did that)
	  *	TO-DO: add a function to generate a random chart, with a better random algorithm
	  * another function will handle the addition/removal of rows and columns

  * FUNCTION DEFAULT ALBUMS: 
		*	removed, to make in the future a better randomChart function
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
let albumArtURL, imageMatrix, curID="";
const placeholderImg = "img/placeholder.jpg";
const lastfm_apikey = "fc796a0c61cb69cccbaccb4706b597e4";


// Execute upon page load
$(window).on('load', function(){
	generateGrid();
	resizeImg();
	changeMargin();
}); 


/********* ALBUM GRID FUNCTIONS *********/
// Generate grid of img objects
function generateGrid (NR,NC) {
	let numRows, numCols;
	// First time called
	if (initialFlag) {
		numCols = $("#numCols").val();
		numRows = $("#numRows").val();
		initialFlag = 0;
	}
	// If this function is called by modifyGrid
	else {
		numRows = NR, numCols = NC;
	}

	// Image and margin size
	let imgSize = $("#artSize").val().toString();
	let marginSize = $("#marginSize").val().toString();
	// Wait until document is ready before setting the margin
	$(document).ready(function () {
		$('img').css('margin', marginSize + 'px');
	});

	let id = "", albumArtsHTML = "", albumNamesHTML = "";  // Init album html block
	let placeholderTitle = "Not set";
	$("#albumArts").html(""); // Clear out existing albums
	// Generate HTML
	for (i = 0; i < numRows; i++) {
		albumArtsHTML += 
		'<div class="row"> \
			<div class="d-flex justify-content-center col p-0">' + '\n';
			// col: to make it change when the albumNames div is shown
		albumNamesHTML += 
		'<div class="row" id="albumArtRow"'+i+'> \
			<div class="d-flex  col p-0">' + '\n' + 
			'<ul class="list'+i+'">';
		for (j = 0; j < numCols; j++) {	
			id = i.toString() + "-" + j.toString();
			/* For comments on drag functions, see DRAG AND DROP section
				* draggable = true makes the image draggable
				* ondragstart = what to do when element is dragged? --> call dragStart function: 
				* ondragover = event that specifies where the dragged data can be dropped --> call allowDrop function
				* ondrop =
				* serc = placeholderImg and title = "Not set" will overwrite all the images: the information of previous images will be restored in the second for loop cycle, so at the end the images with placeholder and "Not set" will only be the new rows/cols
				*/
			albumArtsHTML += 
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
						' title=' + placeholderTitle +
						'	alt="Album art"> \
				</a>';
			albumNamesHTML += 
			'<li>'+placeholderTitle+'</li>'
		}
		albumArtsHTML +=  
		'</div></div>' + '\n';
		albumNamesHTML +=  
		'</div></div>' + '\n';
	}
	$("#albumArts").html(albumArtsHTML); // Insert HTML in div "albumArts"
	$("#albumNames").html(albumNamesHTML);
}

function updateGrid() {
	
	let imageMatrix = new Array();
	let imageRow = new Array();
	let saveImage = "";
	let numRows = $("#numRows").val();
	let numCols = $("#numCols").val();

	// Save current images
	for (let i = 0; i < numRows; i++) {
		for (let j = 0; j < numCols; j++) {
			saveImage = i.toString() + '-' + j.toString();
			try {
				imageRow.push({
					source: $('#'+saveImage).attr('src'),
					info: $('#'+saveImage).attr('title')
				}); // Adding to imageRow array every image's src and title attributes
			}
			catch(err) {
				imageRow.push(placeholderImg);
			}
		}
		imageMatrix.push(imageRow); // Array of rows
		imageRow = [];
	}
		
	generateGrid(numRows,numCols); //Regenerate grid

	// Reinsert images
	for (let i = 0; i < numRows; i++) {
		imageRow = imageMatrix[i];
		for (let j = 0; j < numCols; j++) {
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


function resizeImg() {
	$("#artSize").on("input change", function() {
    let size = $(this).val().toString();
		// Write current size nrea input
    $("#artSizeVal").text(size + 'px');
		// Dynamically change size
		$('.albumarts').attr({
			'width' : size+'px',
			'height' : size+'px'
		});
	});
}

function changeMargin() {
	$("#marginSize").on("input change", function() {
		let size = $(this).val().toString();
		// Write current size nrea input
		$("#marginSizeVal").text(size + 'px');
		// Dynamically change size
		$('.albumarts').css('margin',size+'px');
	});
}


// Shuffle images around
let shuffle = function() {
	let img1, img2;
	let selectedImg1, selectedImg2;
	let i,j,ii,jj;
	let numCols = $("#numCols").val();
	let numRows = $("#numRows").val();
	
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

// TO-DO: improve this function
function randomChart() {
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



/********* MODAL FUNCTIONS *********/
 function albumSearch() {
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
				albumHTML += 
				'<img width=100 height=100 style="margin: 1px;" \
						src="' + albumArtURL + 
						'" title="' + albumArtInfo + 
						'" onclick="chooseIMG(this)" \
						alt="Album art" \
				 >';
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

/********* DRAG&DROP FUNCTIONS *********/
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

