var restService = {protocol:'http',hostname:document.location.hostname,fqn:"nci.nih.gov",port:8765,route : "ncictRest"}
var restServerUrl = restService.protocol + "://" + restService.hostname + "/"+ restService.route;

//var link = document.querySelector('link[rel="import"]');
//var importedDoc = link.import;
//var form = importedDoc.getElementById("test");
//var a4  =[ 595.28,  841.89];  // for a4 size paper width and height
function Create_PDF(){
    //validation
    

	var cont=""

	//recipient
	var first=document.getElementById("first_name").value;
	var last= document.getElementById("last_name").value;
	var full_name=document.getElementById("first_name").value +" "+ document.getElementById("last_name").value;
	var title=document.getElementById("title").value;
	var email=document.getElementById("email").value;
	var institution=document.getElementById("institution").value;
	var phone=document.getElementById("phone").value;
	var fax=document.getElementById("fax").value;
	var address=document.getElementById("address").value;
		address=address.split("\n").join("<br>");
	console.log(address);

	//recipient investigator

	var first_inv=document.getElementById("first_name_inv").value;
	var last_inv= document.getElementById("last_name_inv").value;
	var full_name_inv=document.getElementById("first_name_inv").value +" "+ document.getElementById("last_name_inv").value
	var title_inv=document.getElementById("title_inv").value; 	var email=document.getElementById("email").value;

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


		data=data.replace("$[reason]", reason);

		data=data.replace('$[Mailing Address]',address)
		data=data.replace('$[Investigator Name]',full_name_inv);
		data=data.replace('$[Investigator Title]',title_inv);
		data=data.replace("$[phone]", phone);
		data=data.replace("$[fax]", fax);
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
		first_inv: document.getElementById("first_name_inv").value,
		last_inv: document.getElementById("last_name_inv").value,
		title_inv: document.getElementById("title_inv").value,
		purpose: document.getElementById("reason").value,
		address: address,
		date:today,
		page:cont
	};
	$.ajax({
		type : 'POST',
		url : "/ncidoseRest/",
		data : JSON.stringify(Inputs),
		contentType : 'application/json' // JSON
		}).success(function(token){
			console.log(token)
			window.open("content/NCI_STA_"+token+".pdf",'_blank');

		});
}

