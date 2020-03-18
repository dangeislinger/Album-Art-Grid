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
};

// *********MODAL********

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

function modalAutofocus() {
  // Autofocus when modal is shown
	$('#myModal').on('shown.bs.modal', function(){
		$('#searchTerm').focus();
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

// Repeat background image
function repeatBgImg() {
  $('#repeatBgImgCheckbox').click(function () {
    let isChecked = $("#repeatBgImgCheckbox").is(":checked");
  if (isChecked)
    $('#albumArts').css('background-repeat', 'repeat');
  else 
    $('#albumArts').css('background-repeat', 'no-repeat');
  });
}

function showHideAlbumNames() {
  let content = "";
  $('#showHideNames').click(function () {
    content = $(this).text();
    $('#albumNames').toggle();
    // Button is "Show album names" --> change it
    if (content[0]==="S") {
      $(this).text("Hide album names");
    }
    else {
      $(this).text("Show album names");
    }
  });
}

// Increase decrease number of columns/rows
function increaseDecrease() {
  $('.btn-increase').click(function () {
    // Get the input associated to the button
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

$(document).ready(function() {
  // Form related
	preventFormReload();
  modalAutofocus();
  // Background image
  changeBgColor();
  repeatBgImg();
  // Other
  increaseDecrease();
  showHideAlbumNames();
});