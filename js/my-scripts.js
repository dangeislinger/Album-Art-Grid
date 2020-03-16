function changeBG () {
  //setting initial color
  $('#bgColorPicker')
    .colorpicker({ 
      "color": "#000"
   })
   //change #albums color when color is changed
    .on('colorpickerChange', function (e) {
      $('#albums').css('background-color', e.value);
    }); 
};

function preventFormReload() {
  // Prevent page reload if user presses Enter key in the search form (inside modal), call albumSearch function instead
	$('#searchTerm, .form-control').on('keyup keypress', function(e) {
		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			e.preventDefault();
			albumsearch();
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

// Change text for artsize span on range change
function artsizeRangeChange() {
  $("#artsize").on("input change", function() {
    let inputValue = $(this).val();
    console.log(inputValue);
    $("#artsizeVal").text(inputValue + 'px');
  });
}

function setBgImage() {
  let imgUrl = $("#bgImageURL").val();
  $('#albums').css({
    'background-image': 'url(' + imgUrl + ')',
    'background-position': 'center'
  });
}

$(document).ready(function() {
  changeBG();
	preventFormReload();
  modalAutofocus();
  artsizeRangeChange();
});