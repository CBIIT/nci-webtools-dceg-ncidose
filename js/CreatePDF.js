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
	var full_name=document.getElementById("first_name").value +" "+ document.getElementById("last_name").value;
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
	var reason=document.getElementById("reason").value;
		reason=reason.replace("\n","<br>")

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
				software+= software_content[header]["Phantoms"].content+"\n";

			}
			else{
				data=data.replace('&#9745 $[Phantoms]',"")
			}
			
			if(checked_software.Granted.indexOf("ncict")!=-1){
				data=data.replace('$[NCICT]',software_content[header]["NCICT"].content);
				software+= software_content[header]["NCICT"].content+"\n";
			}
			else{
				data=data.replace('&#9745 $[NCICT]',"")
			}

			if(checked_software.Granted.indexOf("dose")!=-1){
				data=data.replace('$[DOSE]',software_content[header]["DOSE"].content);
				software+= software_content[header]["DOSE"].content+"\n";
			}
			else{
				data=data.replace('&#9745 $[DOSE]',"")
			}
		


		cont = data;
	});
  		address=address.replace("<br>"," ");
  		address=address.replace(","," ");
  		reason=reason.replace("<br>"," ");

		var Inputs = {
		first : document.getElementById("first_name").value,
		last : document.getElementById("last_name").value,
		title: document.getElementById("title").value,
		email: document.getElementById("email").value,
		institution: document.getElementById("institution").value,
	//	first_auth: document.getElementById("first_name_auth").value,
	//	last_auth: document.getElementById("last_name_auth").value,
	//	title_auth: document.getElementById("title_auth").value,
		purpose: document.getElementById("reason").value,
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
		//	window.open("tmp/NCI_STA_"+token+".pdf",'_blank');

		});
}

