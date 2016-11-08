var restService = {protocol:'http',hostname:document.location.hostname,fqn:"nci.nih.gov",port:8765,route : "ncictRest"}
var restServerUrl = restService.protocol + "://" + restService.hostname + "/"+ restService.route;

//var link = document.querySelector('link[rel="import"]');
//var importedDoc = link.import;
//var form = importedDoc.getElementById("test");
//var a4  =[ 595.28,  841.89];  // for a4 size paper width and height
function check_software(){
	var checked_software={};
	 checked_software.Granted=[];
	var software_content=""

	$("input:checkbox").each(function(){
	    var $this = $(this);

	    if($this.is(":checked")){
	        checked_software.Granted.push($this.attr("id"));
	    }
	});

	$(document).ready(function() {
	var request = $.ajax({
		type: 'GET',
		url: './json/overlay.json',
		contentType: 'application/json',
	}).fail(function(response) {
	}).always(function(response) {
		 software_content=response
		 	Create_PDF(checked_software,software_content)

	});

})

}
function Create_PDF(checked_software,software_content){
    //validation


	var cont=""
	var software=""
	//recipient
	var first=document.getElementById("first_name").value;
	var last= document.getElementById("last_name").value;
	var full_name=first+" "+ last;
	var title=document.getElementById("title").value;
	var email=document.getElementById("email").value;
	var institution=document.getElementById("institution").value;
	var phone=document.getElementById("phone").value;
	var address=document.getElementById("address").value;
	address=address.split("\n").join("<br>");

	


	//recipient investigator

	//var first_inv=document.getElementById("first_name_auth").value;
	//var last_inv= document.getElementById("last_name_auth").value;
	//var full_name_auth=document.getElementById("first_name_auth").value +" "+ document.getElementById("last_name_auth").value
	//var title_auth=document.getElementById("title_auth").value; 	
	var email=document.getElementById("email").value;

	//activity
	var institution=document.getElementById("institution").value;
	var purpose=document.getElementById("reason").value;
		purpose=purpose.replace("\n","<br>")

	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }
	    var today = mm+'/'+dd+'/'+yyyy;
	console.log(today);


	$.ajax({
		url:'./content/NCI_STA.html',
		type: 'GET',
		async:false
	}).success(function(data) {
		
		data=data.replace('$[Recipient Name]',full_name);
		data=data.replace('$[Recipient Title]',title);

		data=data.replace('$[Recipient Name_sig]',full_name);
		data=data.replace('$[Recipient Title_sig]',title);
		data=data.replace('$[Recipient Institution]',institution);

		data=data.replace("$[reason]", reason);

		data=data.replace('$[Mailing Address]',address)
		data=data.replace("$[phone]", phone);
		data=data.replace("$[email]", email);
		var header=$('#header2').html();
			if(checked_software.Granted.indexOf("phantoms")!=-1){
				data=data.replace('$[Phantoms]',software_content[header]["Phantoms"].content);
								software+= " Phantoms";

			}
			else{
				data=data.replace('&#9745 $[Phantoms]',"")
			}
			
			if(checked_software.Granted.indexOf("ncict")!=-1){
				data=data.replace('$[NCICT]',software_content[header]["NCICT"].content);
				software+= " NCICT";
			}
			else{
				data=data.replace('&#9745 $[NCICT]',"")
			}

			if(checked_software.Granted.indexOf("dose")!=-1){
				data=data.replace('$[DOSE]',software_content[header]["DOSE"].content);
				software+= " DOSE";
			}
			else{
				data=data.replace('&#9745 $[DOSE]',"")
			}
		


		cont = data;
	});
  		address=address.replace("<br>"," ");
  		address=address.replace(","," ");
  		purpose=purpose.replace("<br>"," ");

		var Inputs = {
		first : first,
		last : last,
		title: title,
		email: email,
		institution: institution,
		purpose: purpose,
		software:software,
		address: address,
		date:today,
		page:cont
	};
	$.ajax({
		type : 'POST',
		url : "ncidoseRest/",
		data : JSON.stringify(Inputs),
		contentType : 'application/json' // JSON
		}).success(function(token){
			console.log(token)
			Confirmation_Modal();

		});
}

function Confirmation_Modal(){
	var template_string='<div class="modal fade" id="modal_confir" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">'
  +'<div class="modal-dialog" role="document">'
    +'<div class="modal-content">'
      +'<div class="modal-header">'
        +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
        +'<h4 class="modal-title" id="modalTitle_confir">Modal title</h4>'
      +'</div>'
      +'<div class="modal-body" id="modalContent_confir">Thank you for registering with NCIDose. A confirmation email will be sent shorty with a copy of the STA Agreement in PDF format. </div><button type="button" id="ok" class="btn btn-primary btn-sm" style="display:inline-block;margin-left:50%;margin-bottom:2%" \" >Ok</button><div>'
      +'</div></div></div></div>'

  var header = "NCIDose Materials Confirmation";
  $('body').append($(template_string));
  $('#modalTitle_confir').html(header);

  //$('#data_table').html(table_data);
	$('#modal_confir').modal('show')

  $('#modal_confir').modal({backdrop: 'static', keyboard: false}) 


  
  $('#ok').click(function() {
      $('#modal_confir').modal('hide');
      $('#home-tab-anchor').tab('show')

  });

}


