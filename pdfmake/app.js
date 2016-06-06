$(document).ready(function() {
	$('#createPDF').click(function() {

		doc = JSON.stringify(doc);
		doc = doc.replace("${placeholder}", "Replaced the placeholder value");
		doc = JSON.parse(doc);

		pdfMake.createPdf(doc).download();
	})
})
