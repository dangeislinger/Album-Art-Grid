/**  
 * Modifications made to the original code:
	* added comments to specify what I didn't know: since my knowledge on JS, Query and API is limited they'll help me (and hope they'll help anyone who'll work on this in the future)
  * "jQuerified" the code (I have to learn it even if it's hated, sorry)
  * changed all var to let, to allow me to reuse the same name for the same values
  * changed lastfm API key (used mine instead of xsaardo's one)
  * changed images ID: from comma to dash (since comma gave problems with jQuery selectors)
  * added page for users with JS disabled
  * Rethinked the general functioning of the code:
		*	on page load, the chart is created empty: this because lastFM docs suggests not to make an API call on first page load (defaultAlbums did that)
		* another function (updateGrid) will handle the addition/removal of rows and columns
		* TODO:  add a function to generate a random chart, with a better random algorithm

  * FUNCTION DEFAULT ALBUMS: 
		*	TODO: removed, to make in the future a better randomChart function
	  
	*	FUNCTION GENERATEGRID:
		*	removed it's assignment to a variable
	  *	moved imageMatrix on Global Vars since var is changed to let (and thus it wasn't recognised outside its block scope)
	  *	changed the function to also save/restore title (as 'Artist - Album')
	  *	changed the image saved: extra-large (300px) instead of large() TO-DO: force the user to select an image between 100 (default) and 300 pixel
	  *	this function now generates a row of card with image inside and footer for artist and album information
	  
	*	DRAG AND DROP:
		* now this function also handles the title of the swapped images

	* TODO: make canvas
			let canvasArea = document.getElementById("albums");
			let t = canvasArea.getContext('2d');
			window.open('', document.getElementById('albums').toDataURL());
*/

// Global Vars
let albumArtURL, curID="";
const lastfm_apikey = "fc796a0c61cb69cccbaccb4706b597e4";
let initialFlag = true, showAlbumNames = false, showAlbumNamesBelow = false, showAlbumNamesRight = false;
const placeholderImg = "img/placeholder.jpg";

// Shows albums found in modal 
function albumSearch() {
	$('#searchTerm').focus();
	let searchterm = $('#searchTerm').val();
	let albumsFoundHTML = ""; // Init album html block
	let k = 0;
	let onClick = "";
	
	$.getJSON("https://ws.audioscrobbler.com/2.0?method=album.search&album="+ searchterm + "&api_key=" + lastfm_apikey + "&format=json&callback=?", function(json){
		// Generate HTML for album grid

		for (let i = 0; i < 5; i++) {
			albumsFoundHTML += '<div class="row"><div class="col-12 d-flex justify-content-center">';
			for (let j = 0; j < 5; j++) {	
				// Set onclick function
				onClick = "chooseIMG(this)";
				let albumArtURL = json.results.albummatches.album[k].image[3]['#text'];
				let albumArtist = json.results.albummatches.album[k].artist;
				let albumTitle = json.results.albummatches.album[k].name;
				let albumArtInfo = albumArtist + ' - ' + albumTitle;
				if (albumArtURL === "") { 
					albumArtURL = placeholderImg;
					albumArtInfo = "Image not available";
					albumArtist = albumTitle = "Not set";
					// If the image is not available it shouldn't be clickable
					onClick = "false";
				}
				albumsFoundHTML += 
				'<img width=80 height=80 style="margin: 1px;" \
						src="' + albumArtURL + 
						'" title="' + albumArtInfo +
						'" data-artist="' + albumArtist +
						'" data-album="' + albumTitle +
						'" onclick="' + onClick + '" \
						alt="Album art" \
				 >';
				k++;
			}
			albumsFoundHTML += "</div></div>";
		}
		$("#albumsFound").html(albumsFoundHTML); // Insert HTML
	});
};

// Prevent default handling to allow drop
function allowDrop(event) {
	event.preventDefault();
}

// Change #chartContainer background color
function changeBgColor () {
  //setting initial color
  $('#bgColorPicker')
    .colorpicker({ 
      "color": "#000"
   })
   //change #albumArts bg color when color is changed
    .on('colorpickerChange', function (e) {
      $('#chartContainer').css('background-color', e.value);
    }); 
}

// Change card margin
function changeMargin() {
	$("#marginSize").on("input change", function() {
		let size = $(this).val().toString();
		// Write current size nrea input
		$("#marginSizeVal").text(size + 'px');
		// Dynamically change size
		$('.card').css('margin',size+'px');
	});
}

// Change #chartContainer text color
function changeTextColor () {
  //setting initial color
  $('#textColorPicker')
    .colorpicker({ 
      "color": "#fff"
   })
   //change #albumArts bg color when color is changed
    .on('colorpickerChange', function (e) {
      $('#chartContainer').css('color', e.value);
    }); 
}

// Monitors the radio buttons status and shows the 
function checkRadioButtonsStatus() {
	if (showAlbumNames) {
		let belowChecked = $('#showAlbumNamesBelow').prop('checked');
		if (belowChecked) {
			$('.card-footer-span').css('display', 'block');
			$('#albumNames').css('display', 'none');
			showAlbumNamesBelow = true;
			showAlbumNamesRight = false;
		}
		else {
			$('#albumNames').css('display', 'block');
			$('.card-footer-span').css('display', 'none');
			showAlbumNamesBelow = false;
			showAlbumNamesRight = true;
		}
	}
	else {
		$('#albumNames, .card-footer-span').css('display', 'none');
	}
}

// Set the new image, overwriting the old info, to the selected image
function chooseIMG (image) {
	// Set the new info for the chosen image
	$('#' + curID).attr({
		src: image.src,
		title: image.title,
		'data-artist': image.dataset.artist, 
		'data-album': image.dataset.album 
	});
	// NOTE: console.log(image) would print the whole <img ...> stuff, to print the object properties I had to use console.dir(image). This way I saw the dataset property that allowed me to easily access the info needed
	$("#searchTerm").val(""); // Reset search term
	$('#myModal').modal('hide'); // Hide modal after insertion
	setCardFooterText();
	setCardWidth();
};

// Specify which data to drag: in this case, the value of id attribute (text type) of the dragged element
function dragStart(event) { 
	event.dataTransfer.setData("text",event.target.id); 
}

// Swap the drag and dropped images' attributes
function drop(event) {
	// To prevent the browser default handling of the data (which would open as link on drop)
	event.preventDefault();
	// Get the dragged data: it'll return any data that was set to the same type in the setData() method (in this case, the id of element, which has a text element)
	let data = event.dataTransfer.getData("text");
	let imageId = '#'+data;
	// Save the dragged image attributes
	let initialImg = {
		source: $(imageId).attr('src'),
		title: $(imageId).attr('title'),
		artist: $(imageId).attr('data-artist'),
		album: $(imageId).attr('data-album')
	};
	// Set the dragged image attributes to those that has been replaced
	$(imageId).attr({
		'src': event.target.src,
		'title': event.target.title,
		'data-artist': event.target.dataset.artist,
		'data-album': event.target.dataset.album
	});
	// Set the replaced image's attributes to the dragged one ones
	event.target.src = initialImg.source;
	event.target.title = initialImg.title;
	event.target.dataset.artist = initialImg.artist;
	event.target.dataset.album = initialImg.album;
	// Update the card footer text
	setCardFooterText();
}

function eventListener() {
	// Listen to change radio button
	$('input[type=radio]').change(function(){ 
		checkRadioButtonsStatus();
		// If the user selected to show the text on the right there's no more need to keep the old card width value
		setCardWidth();
	});
	// Listen to #artSize input change
	$('#artSize').on("input change", setCardWidth);
	// Listen to #showAlbumNames button click
	$('#showAlbumNames').click(function() {
		// Check radio button status and 
		checkRadioButtonsStatus();
		// Set card width (if needed, the function will determine it)
		setCardWidth();
	});
	// Increase/decrease button click listener
	$('.btn-increase, .btn-decrease').click(function () {
		checkRadioButtonsStatus(); // Check status of radio buttons to display/not display titles, in the correct position
		// Set card width (if needed, the function will determine it)
		setCardWidth();
	});
}


// Generate grid of img objects
function generateGrid (NR,NC) {
	let numRows, numCols;
	// First time called
	if (initialFlag) {
		numCols = $("#numCols").val();
		numRows = $("#numRows").val();
		initialFlag = false;
	}
	// If this function is called by updateGrid
	else {
		numRows = NR, numCols = NC;
	}

	// Image and margin size
	let imgSize = $("#artSize").val().toString();
	let marginSize = $("#marginSize").val().toString();
	// Wait until document is ready before setting the margin
	$(document).ready(function () {
		$('.card').css('margin', marginSize + 'px');
	});

	let id = "", albumArtsHTML = "",  albumNamesHTML = "";  // Init album html block
	let placeholderTitle = "Not set";
	$("#albumArts").html(""); // Clear out existing albums
	$("#albumArtsNames").html(""); // Clear out existing names
	// Generate HTML
	for (i = 0; i < numRows; i++) {
		albumArtsHTML += '<div class="row d-flex flex-nowrap justify-content-center">' + '\n';
		albumNamesHTML += 
		'<div class="row" id="albumArtRow'+i+'"> \
			<div class="col p-0">' + '\n' + 
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
			'<div class="card"> \
				<a data-target="#myModal" data-toggle="modal" onclick="setCurID(event)"> \
					<img \
						id="' + id + '" \
						draggable="true" \
						ondragstart="dragStart(event)" \
						ondragover="allowDrop(event)" \
						ondrop="drop(event)" \
						class="albumarts" \
						width=' + imgSize + ' height=' + imgSize + 
						' src=' + placeholderImg +
						' data-artist="' + placeholderTitle +
						'" data-album="' + placeholderTitle +
						'" title="' + placeholderTitle +
						'"	alt="Album art"> \
				</a> \
				<span class="card-footer-span"></span>' +
			'</div>';
			albumNamesHTML += 
			'<li>'+placeholderTitle+'</li>'
		}
		albumArtsHTML +=  
		'</div>' + '\n';
		albumNamesHTML +=  
		'</div></div>' + '\n';
	}
	$("#albumArts").html(albumArtsHTML); // Insert HTML in div "albumArts"
	$("#albumNames").html(albumNamesHTML);
}

// Increase decrease number of columns/rows
function increaseDecrease() {
  $('.btn-increase').click(function () {
    // Get the input associated to the button (row or col)
    let inputId = '#'+$(this).attr('data-target');
    // Save its value
    let currVal = parseInt($(inputId).attr('value'));
    // Update the value increased by one
    $(inputId).attr('value',++currVal);
    // Update grid
		updateGrid();
  });
  $('.btn-decrease').click(function () {
    let inputId = '#'+$(this).attr('data-target');
    let currVal = parseInt($(inputId).attr('value'));
    // Decrease the value only if it's not already at the minimum
    if (currVal !== parseInt($(inputId).attr('min'))) {
      $(inputId).attr('value',--currVal);
			updateGrid();
    }
	});
}

// Autofocus on modal text input
function modalAutofocus() {
  // Autofocus when modal is shown
	$('#myModal').on('shown.bs.modal', function(){
		$('#searchTerm').focus();
	});
}

function preventFormReload() {
  // Prevent page reload if user presses Enter key in the search form (inside modal), call albumSearch function instead
	$('#searchTerm, .form-control').on('keyup keypress', function(e) {
		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			e.preventDefault();
			albumSearch();
			return false;
		}
	});
}

//TODO: improve this function
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

// Repeat/don't repeat background image when user clicks on #repeatBgImgCheckbox
function repeatBgImg() {
	let checkboxId = "#repeatBgImgCheckbox";
	$(checkboxId).click(function () {
    let isChecked = $(checkboxId).is(":checked");
  if (isChecked)
    $('#albumArts').css('background-repeat', 'repeat');
  else 
    $('#albumArts').css('background-repeat', 'no-repeat');
  });
}

// Resize image when user changes #artSize value
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

// Set background image
function setBgImage() {
  let imgUrl = $("#bgImageURL").val();
  $('#chartContainer').css({
    'background-image': 'url(' + imgUrl + ')',
    'background-repeat': 'no-repeat',
    'background-position': 'center'
  });
}

// Set image data-artist and data-album to the card span-footer
function setCardFooterText() {
  // Function called generically
  let spanText="";
  // Take title from children image of each .card
  $('.card').each(function () {
    // Get this card image artist and album
		let artist = $(this).find('img').attr('data-artist');
		let album = $(this).find('img').attr('data-album');
		spanText = artist + '<br/>' + album;
		// Set them to be the span content (that will be editable)
		$(this).children('span').html(spanText);
		// Set the content editable, but only if the 
		if (artist !== "Not set") {
			$(this).children('span').attr('contenteditable','true');
		}
  });
}


function setCardWidth() {
	// Image #0-0 will always exist
	let currentAlbumArtWidth = parseInt($('#0-0').attr('width'));
	let properWidthValue = currentAlbumArtWidth;
	// This function has only meaning if user is showing album names below the image
	if (showAlbumNames && showAlbumNamesBelow) {
		let cardWidth = new Array(), spanWidth= new Array();
		// Push every card and span width to the proper array
		$('.card').each(function(){
			cardWidth.push($(this).outerWidth());
			spanWidth.push($(this).children(".card-footer-span").outerWidth());
		});
		// ... = spread operator, it'll "dismember" the array elements and pass them as singular parameters
		let maxCardWidth = Math.max(...cardWidth);
		let maxSpanWidth = Math.max(...spanWidth);

		// Case 1: maxSpanWidth is greater than maxCardWidth --> set properWidth to it
		if (maxSpanWidth > maxCardWidth) {
			properWidthValue = maxSpanWidth;
		}
		// Case 2: maxSpanWidth is lower than maxCardWidth --> set properWidth to currentAlbumArtWidth
		else if (maxSpanWidth < maxCardWidth) {
			if (currentAlbumArtWidth < maxSpanWidth) {
				properWidthValue = maxSpanWidth;
			}
			else {
				properWidthValue = currentAlbumArtWidth;
			}
		}
		// If maxSpanWidth == maxCardWidth
		else {
			if (currentAlbumArtWidth < maxSpanWidth)
				properWidthValue = maxSpanWidth;
			else 
				properWidthValue = currentAlbumArtWidth;
		}
		//! LOG
		console.log("------------------------------------------\n" +
									"maxSpan: " + maxSpanWidth + ", maxCard: " + maxCardWidth + 
									"\ncurrentArtWidth: " + currentAlbumArtWidth + ", properWidth: " + properWidthValue +
									"\n------------------------------------------");
		// Set this to every other elements
		$('.card').css('width',properWidthValue+'px');
	}
	// Set the card width to the currentAlbumArtWidth
	else {
		$('.card').css('width',properWidthValue+'px');
	}
}


// Keeps track of which element has been clicked, to set the new image to it
function setCurID (event) { 
	curID = event.target.id;
}

// Show/hide radio buttons options
function showHideAlbumNamesOptions() { 
  $('#showAlbumNames').click(function () {
		// Show/hide radio buttons
		$('#showAlbumNamesOptions').toggle();
		// If the button is "Show album names"
    if (!showAlbumNames) {
			// Change button text
			$(this).text("Hide album names");
			showAlbumNames = true; // Set flag to true
    }
    else {
			// Change button text
			$(this).text("Show album names");
			// Hide album names
			$('.card-footer-span').css('display', 'none');
			$('#albumNames').css('display', 'none');
			showAlbumNames = false; // Set flag to false
		}
  });
}

// TODO: improve this function
function shuffle () {
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
}

// Update grid: calls generateGrid, called by increaseDecrease
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
					title: $('#'+saveImage).attr('title'),
					artist: $('#'+saveImage).attr('data-artist'),
					album: $('#'+saveImage).attr('data-album')
				}); // Adding to imageRow array image's attributes
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
					'title': imageRow[j].title,
					'data-artist': imageRow[j].artist,
					'data-album': imageRow[j].album
				});
			}
			catch(err) {}
		}
	}
	setCardFooterText();
}

// Execute upon page load
$(window).on('load', function(){
	generateGrid();
	resizeImg();
	changeMargin();
	setCardFooterText();
	eventListener();
});

// Execute upon document ready
$(document).ready(function() {
  // Form related
	preventFormReload();
  modalAutofocus();
  // Background image
  changeBgColor();
	changeTextColor ();
  repeatBgImg();
  // Chart options
  increaseDecrease();
	showHideAlbumNamesOptions();
	
});