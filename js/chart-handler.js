/**  
 * TODO:  add a function to generate a random chart, with a better random algorithm
 * TODO: make image downloadable
 * TODO: save current status in session
 * TODO: improve shuffle function
*/

// Global variables/constants/flags
let albumArtURL, curID="";
let firstTime = true, 
		showAlbumNames = false, 
		showAlbumNamesBelow = false, 
		showAlbumNamesRight = false
		showAlbumNamesRightOptions = false;
const lastfm_apikey = "fc796a0c61cb69cccbaccb4706b597e4";
const placeholderImg = "img/placeholder.jpg";

// Performs multiple searches based on lines in a text area, then populates the first result for each into the grid.
function albumSearchLuckyMulti() {

	// 1. Read text from input field
	$('#searchTermLuckyMulti').focus();
	let searchTermLuckyMulti = $('#searchTermLuckyMulti').val();
	let albumsFoundHTMLLuckyMulti = ""; // Init album html block
	let k = 0;
	let onClick = "";
	let numRowsLuckyMulti = $("#numRows").val();
	let numColsLuckyMulti = $("#numCols").val();

	var area = document.getElementById("searchTermLuckyMulti");
	// Debug console.log(area.value);
	var lines = area.value.replace(/\r\n/g,"\n").split("\n");
	var arrayLength = lines.length;
	// Debug console.log('ArrayLength = ' + arrayLength);

	let albumArtURL = "";
	let albumArtist = "";
	let albumTitle = "";
	let albumArtInfo = "";

	// Create array with grid reference values
	const gridValues = new Array();
	let colCounter = 0
	let rowCounter = 0
	
	// 2. Populate array of grid reference values to reference when looping through text input below
	for (var x = 0; x < arrayLength; x++) {
		// If the number of columns tracked is the same as the number of columns in the grid
		if (colCounter == numColsLuckyMulti) {
			// Then reset the columns counter
			colCounter = 0;
			// And move to the next row.
			rowCounter++;
		}
		// If the the column counters are less than and equal to the number of columns and rows
		if (colCounter <= numColsLuckyMulti && rowCounter <= numRowsLuckyMulti) {
			// Add the grid reference to the array
			gridValues.push(rowCounter + '-' + colCounter);
			// And move to the next column
			colCounter++
		}
	}
	console.log(gridValues);

	// 3. For each item in the list, fetch a response
	for (var n = 0; n < arrayLength; n++) {
		
		const line = lines[n];
		const lineTemp = n;
			
		var url = "https://ws.audioscrobbler.com/2.0?method=album.search&album="+ lines[n] + "&api_key=" + lastfm_apikey + "&format=json"

		fetch(url)
			.then((response) => {
				// handle the response
				return response.json();
			})
			.then((data) => {
				let tunes = data;

				// 4. Get first search result's image and text from response
				albumArtURL = data.results.albummatches.album[0].image[3]['#text'];
				albumArtist = data.results.albummatches.album[0].artist;
				albumTitle = data.results.albummatches.album[0].name;
				albumArtInfo = albumArtist + ' - ' + albumTitle;
				if (albumArtURL === "") {
					albumArtURL = placeholderImg;
					albumArtInfo = "Image not available";
					albumArtist = albumTitle = "Not set";
					// If the image is not available it shouldn't be clickable
					onClick = "false";
				}
				// 5. Set image and text in grid
				$('#' + gridValues[lineTemp]).attr({
					src: albumArtURL,
					title: albumArtInfo,
					'data-artist': albumArtist, 
					'data-album': albumTitle 
				});
			})
			.catch(function(error) {
				// handle the error
				console.log('Error returned: ' + error);
			});
		}
}

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
function checkRadioButtonsBelowRightStatus() {
	if (showAlbumNames) {
		// Below is checked
		let belowChecked = $('#showAlbumNamesBelow').prop('checked');
		if (belowChecked) {
			$('.card-footer-span').css('display', 'block');
			$('#albumNames').css('display', 'none');
			showAlbumNamesBelow = true;
			showAlbumNamesRight = false;	
		}
		// Right is checked
		else {
			$('#albumNames').css('display', 'flex');
			$('.card-footer-span').css('display', 'none');
			showAlbumNamesBelow = false;
			showAlbumNamesRight = true;
		}
		showHideAlbumNamesRightOptions();
	}
	else {
		$('#albumNames, .card-footer-span').css('display', 'none');
	}
}

// Check which one of the space/around option is checked, and change things based on it
function checkRadioButtonsCenterSpaceStatus() {
	if (showAlbumNames && showAlbumNamesRight) {
		// Space is checked
		let spaceChecked = $('#showAlbumNamesRightSpace').prop('checked');
		if (spaceChecked) {
			$('#albumNames > div > ul').each(function() {
				$(this).removeClass('justify-content-center');
				$(this).addClass('justify-content-around');
			});
		}
		// Around is checked
		else {
			$('#albumNames > div > ul').each(function() {
				$(this).removeClass('justify-content-around');
				$(this).addClass('justify-content-center');
			});
		}
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

// Specify which data to dra 
function dragStart(event) { 
	// In this case, the value of id attribute (text type) of the dragged element
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
	// Update the card footer text and the name on the right 
	setCardFooterText();
	showNamesRight();
}

// Listen to various events
function eventListener() {
	// Listen to change radio button
	$('input[type=radio]').change(function(){ 
		checkRadioButtonsBelowRightStatus();
		checkRadioButtonsCenterSpaceStatus();
		// Set card width (if needed, the function will determine it)
		setCardWidth();
	});
	// Listen to #artSize input change
	$('#artSize').on("input change", function() {
		let imageSize = $(this).val();
		setImageSize(imageSize);
		setCardWidth()
	});
	// Listen to #marginSize input change
	$('#marginSize').on("input change", function() {
		let marginValue = $(this).val();
		setMargin(marginValue);
	});
	// Listen to #showAlbumNames button click
	$('#showAlbumNames').click(function() {
		// Check radio button status and 
		checkRadioButtonsBelowRightStatus();
		checkRadioButtonsCenterSpaceStatus();
		// Set card width (if needed, the function will determine it)
		setCardWidth();
	});
	// Increase/decrease button click listener
	$('.btn-increase, .btn-decrease').click(function () {
		checkRadioButtonsBelowRightStatus(); // Check status of radio buttons to display/not display titles, in the correct position
		// Set card width (if needed, the function will determine it)
		checkRadioButtonsCenterSpaceStatus();
		setCardWidth();
	});
	// Listen to #setBgImageButton button click
	$('#setBgImageButton').click(setBgImage);
	// Listen to #repeatBgImgCheckbox checkbox status
	$('#repeatBgImgCheckbox').click(function() {
		let isChecked = $(this).is(":checked");
		repeatBgImg(isChecked);
	});
}

// Generate grid of img objects
function generateGrid (NR,NC) {
	let numRows, numCols;
	// First time called
	if (firstTime) {
		numCols = $("#numCols").val();
		numRows = $("#numRows").val();
		firstTime = false;
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

	let id = "", idlist="", albumArtsHTML = "",  albumNamesHTML = "";  // Init album html block
	let placeholderTitle = "Not set";
	$("#albumArts").html(""); // Clear out existing albums
	$("#albumArtsNames").html(""); // Clear out existing names
	// Generate HTML
	for (i = 0; i < numRows; i++) {
		albumArtsHTML += '<div class="row d-flex flex-nowrap justify-content-center">' + '\n';
		albumNamesHTML += 
		'<div class="row">' + '\n' + 
			'<ul class="mb-0 ml-3 p-0 d-flex flex-column">';
			// Removes padding and only add margin to the left (to outdistance it from the last albumArt column)
		for (j = 0; j < numCols; j++) {	
			id = i.toString() + "-" + j.toString();
			/* albumArtsHTML attributes explained:
				* draggable = true makes the image draggable
				* ondragstart = what to do when element is dragged?
				* ondragover = event that specifies where the dragged data can be dropped
				* ondrop = what to do when element is dropped?
				* src = placeholderImg and title = "Not set" will overwrite all the images: the information of previous images will be restored in the second for loop cycle, so at the end the images with placeholder and "Not set" will only be the new rows/cols (and those who already had these attributes' values)
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
			idlist = i.toString() + "_" + j.toString();
			albumNamesHTML += 
			'<li id="' + idlist + '">'+placeholderTitle+'</li>'
		}
		albumArtsHTML +=  
		'</div>' + '\n';
		albumNamesHTML +=  
		'</div>' + '\n';
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
  // Prevent page reload when user presses enter in modal search bar
	$('#searchTerm, .form-control').on('keyup keypress', function(e) {
		// Since jQuery standardizes things only which is needed 
		let keyCode = e.which;
		// Key = enter (normal or numpad one)
		if (keyCode === 13) { 
			e.preventDefault();
			albumSearch(); // Call proper function instead
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

// Repeat/don't repeat background image based on user choice
function repeatBgImg(isChecked) {
  if (isChecked)
    $('#chartContainer').css('background-repeat', 'repeat');
  else 
    $('#chartContainer').css('background-repeat', 'no-repeat');
}

// Set background image
function setBgImage() {
  let imgUrl = $("#bgImageUrl").val();
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
		// Set them to be the span text
		$(this).children('span').html(spanText);
  });
}


function setCardWidth() {
	// Get the current album art width
	let currentAlbumArtWidth = $('#artSize').val();
	// Default value
	let properWidthValue = currentAlbumArtWidth;
	// The user wants to show  album names below
	if (showAlbumNames && showAlbumNamesBelow) {
		properWidthValue = showNamesBelow(currentAlbumArtWidth);
		$('.card').css('width',properWidthValue+'px');
	}
	// The user wants to show  album names right
	else if (showAlbumNames && showAlbumNamesRight) {
		showNamesRight(); // Show names on the rigth
		verticalAlignNames(); // Vertical align list items to the corresponding row, and vice versa
		$('.card').css('width',properWidthValue+'px');
	}
	// Set the card width to the currentAlbumArtWidth
	else {
		$('.card').css('width',properWidthValue+'px');
	}
}

// Set image size on the fly
function setImageSize(value) {
	let size = value.toString();
	// Write current size nrea input
	$("#artSizeVal").text(size + 'px');
	// Dynamically change size
	$('.albumarts').attr({
		'width' : size+'px',
		'height' : size+'px'
	});
}

// Change card margin
function setMargin(value) {
	let size = value.toString();
	// Write current size nrea input
	$("#marginSizeVal").text(size + 'px');
	// Dynamically change margin of card
	$('.card').css('margin',size+'px');
	// Dynamically change margin of ul too, this to make the covers to properly center to it
	$('#albumNames > div.row > ul').css({
		'margin-top': size+'px',
		'margin-bottom': size+'px'
	});
}

// Keeps track of which element has been clicked, to set the new image to it
function setCurID(event) { 
	curID = event.target.id;
}

// Set #albumArts or #albumNames rows height
function setRowHeight(containerId,value) {
	// Both containers have .row inside, and for each of these the height must be changed to the proper value
	$(containerId + ' > .row').each(function () {
		$(this).height(value);
	});
}

// Show/hide Below/Right radio buttons
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
			// Set flags to false
			showAlbumNames = false,
			showAlbumNamesBelow = false,
			showAlbumNamesRight = false;
		}
  });
}

function scaleChart() {
	windowWidth = 3;
}

// Show/hide Center/Space radio buttons if Right is checked
function showHideAlbumNamesRightOptions() {
	if (showAlbumNames && showAlbumNamesRight) {
		// Show album options for right
		showAlbumNamesRightOptions = true;
		$('#showAlbumNamesRightOptions').css('display','block');
	}
	else {
		$('#showAlbumNamesRightOptions').css('display','none');
		showAlbumNamesRightOptions = false;
		// Clean class assignment that could have been set  when the user wanted to show album names on right, clean fixed height that would mess things up when the user resizes things if below is selected
		$('.card').removeClass('justify-content-center justify-content-around');
		$('#albumArts > div.row').css('height','auto');
	}
}

function showNamesBelow(currentAlbumArtWidth) {
	let cardWidth = new Array(), spanWidth = new Array();
	// Push every card and span width to the proper array (Math.ceil to have integer values, to avoid problems with sizes differing by 0.01)
	$('.card').each(function(){
		cardWidth.push(Math.ceil($(this).width()));
		spanWidth.push(Math.ceil($(this).children(".card-footer-span").width()));
	});

	// ... = spread operator, it'll "dismember" the array elements and pass them as parameters
	let maxCardWidth = Math.max(...cardWidth);
	let maxSpanWidth = Math.max(...spanWidth);

	// Case 1: maxSpanWidth > maxCardWidth
	if (maxSpanWidth > maxCardWidth) {
		properWidthValue = maxSpanWidth;
	}
	// Case 2: maxSpanWidth < maxCardWidth
	else if (maxSpanWidth < maxCardWidth) {
		if (currentAlbumArtWidth < maxSpanWidth) {
			properWidthValue = maxSpanWidth;
		}
		else {
			properWidthValue = currentAlbumArtWidth;
			maxSpanWidth = properWidthValue;
		}
	}
	// Case 3: maxSpanWidth == maxCardWidth
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
	return properWidthValue;
}

// Display album names to the right, based on images' data-artist and data-album attributes
function showNamesRight() {
	let currentImage = "", listText = "", listElemTarget = "";
	let numRows = $("#numRows").val();
	let numCols = $("#numCols").val();

	// Since images and list elements share a similar ID
	for (let i = 0; i < numRows; i++) {
		for (let j = 0; j < numCols; j++) {
			currentImage = '#' + i.toString() + '-' + j.toString();
			listElemTarget = '#' + i.toString() + '_' + j.toString();
			listText = $(currentImage).attr('data-artist') + ' - ' + $(currentImage).attr('data-album');
			$(listElemTarget).text(listText);
		}
	}

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

let i = 0;
// Vertical align names of albums to image, or image to names when the list are higher
function verticalAlignNames() {
	// Get the height of the row containing the album arts and the one containing the album names: no border, padding, margin included
	let marginVal = $("#marginSize").val();
	// artRowHeight will be influenced by the card margin, so I subtract it (*2 since it's both on top and on bottom): due to this, the setMargin() function will also set the margin to the #albumNames rows
	let artRowHeight;
	if (i==0) {
		artRowHeight = Math.ceil($('#albumArts > :first-child').height()-(marginVal*2));
		i++;
	}
	else {
		artRowHeight = Math.ceil($('#albumArts > :first-child').height());
	}
	let nameRowHeight = Math.ceil($('#albumNames > :first-child').height());
	// Since width will always be eqal to height I can take this value
	let imageHeight = $('#artSize').val();
	// This variable is the sum of every li element (equal to the cols value): the ul will grow with the row, so this is the minimum width of ul: used for if subcases
	let minUlHeight = Math.ceil($('#albumNames > .row > ul > li').height()*$("#numCols").val());


	// Case 1: artRowHeight > nameRowHeight
	if (artRowHeight > nameRowHeight) { 
		console.log("Case 1");
		setRowHeight("#albumNames",artRowHeight);
	}
	// Case 2: artRowHeight < nameRowHeight
	else if (artRowHeight < nameRowHeight) {
		// Case 2.1: nameRowHeight > rtRowHeight because the user resized the image and the nameRow height followed it
		if (minUlHeight <= artRowHeight) {
			console.log("Case 2.1");
			setRowHeight("#albumNames",artRowHeight);
		}
		// Case 2.2: nameRowHeight > artRowHeight because its li elements' heights are higher than artRow
		else {
			$('.card').addClass('justify-content-center');
			setRowHeight("#albumArts",nameRowHeight);

		}
	}
	// Case 3: artRowHeight == nameRowHeight --> do nothing
	else {
		if (imageHeight > artRowHeight) {
			setRowHeight("#albumArts",imageHeight);
		}
		if (imageHeight < minUlHeight) {
			setRowHeight("#albumArts",minUlHeight);
		}
		if (imageHeight > minUlHeight) {
			setRowHeight("#albumArts",imageHeight);
		}
	}

	//! LOG
	console.log("------------------------------------------\n" +
								"artRowHeight: " + artRowHeight + ", nameRowHeight: " + nameRowHeight + 
								"\nminUlHeight: " + minUlHeight + ", imageHeight: " + imageHeight +
								"\n------------------------------------------");
}


// Execute upon page load
$(window).on('load', function(){
	generateGrid();
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
  // Chart options
  increaseDecrease();
	showHideAlbumNamesOptions();
});
