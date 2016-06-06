function Create_PDF(){
	var doc = new jsPDF();  
	var cont=""        
	$.ajax({
		url:'NCI_STA.html',
		type: 'GET',
		async:false
	}).success(function(data) {
		cont = data;
			//cont=data;

	});
	console.log(cont)
	doc.fromHTML(
		    cont,
		    15,
		    1,
		    {
		      'width': 180
	    	});
	    	    doc.output("dataurlnewwindow");
}