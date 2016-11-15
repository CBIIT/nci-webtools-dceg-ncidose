
$(document).ready(function() {
	var request = $.ajax({
		type: 'GET',
		url: './json/overlay.json',
		contentType: 'application/json',
	}).fail(function(response) {
	}).always(function(response) {


		var modalContent=response
		var header=$('#header2').html();
		Object.keys(response[header]).forEach(function(id) {
			$('#' + id).click(function() {
				createModal(id,header,response)
//				console.log(id)
			})
})
 
	});

})
var template_string='<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">'
  +'<div class="modal-dialog" role="document">'
    +'<div class="modal-content">'
      +'<div class="modal-header">'
        +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
        +'<h4 class="modal-title" id="modalTitle">Modal title</h4>'
      +'</div>'
      +'<div class="modal-body" id="modalContent">'
      +'</div></div></div></div>'

function createModal(id,title,modalContent) {
	console.log(id)
	var header = modalContent[title][id].header;
	var content = modalContent[title][id].content;
	$('body').append($(template_string))
	$('#modalTitle').html(header);
	$('#modalContent').html(content);

	$('#modal').modal('show')

}


