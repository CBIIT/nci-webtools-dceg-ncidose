var restService = {protocol:'http',hostname:document.location.hostname,fqn:"nci.nih.gov",port:8765,route : "ncictRest"}
var restServerUrl = restService.protocol + "://" + restService.hostname + "/"+ restService.route;

function Create_PDF(){
	var doc = new jsPDF();  
	var cont1=""
	var cont2=""        
	var cont3=""               
	
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
	console.log(address);
	
	//recipient investigator
	
	var first_inv=document.getElementById("first_name_inv").value;
	var last_inv= document.getElementById("last_name_inv").value;
	var full_name_inv=document.getElementById("first_name_inv").value +" "+ document.getElementById("last_name_inv").value
	var title_inv=document.getElementById("title_inv").value; 	var email=document.getElementById("email").value;

	//activity
	var institution=document.getElementById("institution").value; 
	var reason=document.getElementById("reason").value; 

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
		date:today
	};

	var url = restServerUrl;
	$.ajax({
		type : 'POST',
		url : "/ncictRest/",
		data : JSON.stringify(Inputs),
		contentType : 'application/json' // JSON
	});

	$.ajax({
		url:'NCI_STA.html',
		type: 'GET',
		async:false
	}).success(function(data) {
		data=data.replace('$[Recipient Name]',full_name);
		data=data.replace("$[reason]", reason);				
		cont1 = data;
			//cont=data;

	});

	$.ajax({
		url:'NCI_STA2.html',
		type: 'GET',
		async:false
	}).success(function(data) {
		cont2 = data;
			//cont=data;

	});

	$.ajax({
		url:'NCI_STA3.html',
		type: 'GET',
		async:false
	}).success(function(data) {
		data=data.replace('$[Recipient Name]',full_name);
		data=data.replace('$[Recipient Title]',title);
		data=data.replace('$[Mailing Address]',address)

		data=data.replace('$[Investigator Name]',full_name_inv);
		data=data.replace('$[Investigator Title]',title_inv);

		data=data.replace('$[Recipient Printed Name and Title, below the line, signature above]',full_name_inv+"\n"+title_inv);

		data=data.replace("$[phone]", phone);				
		data=data.replace("$[fax]", fax);				

		cont3 = data;

			//cont=data;

	});
	doc.fromHTML
	(
		cont1,
		15,
	    1,
	    {
	      'width': 180
    	});
	doc.text(90,285, 'Page 1 of 3 ');
	doc.addPage();
	doc.fromHTML
	(
	    cont2,
	    15,
	    1,
	    {
	      'width': 180
    	});
	doc.text(90,285, 'Page 2 of 3 ');
	doc.addPage();
	doc.fromHTML
	(
	    cont3,
	    15,
	    1,
	    {
	      'width': 180
    	});
		doc.text(90,285, 'Page 3 of 3 ');
	   	doc.output("dataurlnewwindow");



}
