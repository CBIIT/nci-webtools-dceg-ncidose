var restService = {protocol:'http',hostname:document.location.hostname,fqn:"nci.nih.gov",port:8765,route : "ncictRest"}
var restServerUrl = restService.protocol + "://" + restService.hostname + "/"+ restService.route;


//var link = document.querySelector('link[rel="import"]');
//var importedDoc = link.import;
//var form = importedDoc.getElementById("test");
//var a4  =[ 595.28,  841.89];  // for a4 size paper width and height
function Create_PDF(){
	var doc = new jsPDF();  
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
/*	doc.fromHTML
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
doc.output("dataurlnewwindow");*/



//var test="<html><head><style>h1 {    text-decoration: overline;}h2 {    text-decoration: line-through;}h3 {   text-decoration: underline;}</style></head><body><h1>This is heading 1</h1><h2>This is heading 2</h2><h3>This is heading 3</h3></body></html>";


//  console.log(importedDoc);

//source =htmlObject.getElementsByTagName("div")[0];
/*document.getElementById("test_object").innerHTML=cont1;

var STA_html = document.querySelector('link[rel="import"]');
var importedSTA = STA_html.import;
var test_div =importedSTA.getElementById("test");
var margins = {
   top: 15,
   bottom: 60,
   left: 10,
   right: 10,
   width: 180
};
//doc.addHTML(document.getElementById("test_object"), margins.top, margins.left, function() {
//   doc.output("dataurlnewwindow");
//});
doc.addHTML(document.body, margins.top, margins.left, function() {
   doc.output("datauri");
});
//doc.output("dataurlnewwindow");

 getCanvas().then(function(canvas){
  var 
  img = canvas.toDataURL("image/png"),
  doc = new jsPDF({
          unit:'px', 
          format:'a4'
        });     
        doc.addImage(img, 'JPEG', 20, 20);
        doc.save('techumber-html-to-pdf.pdf');
 });
 
// create canvas object

setTimeout(function(){ document.getElementById("test_object").innerHTML=""; }, 1000);*/



}

