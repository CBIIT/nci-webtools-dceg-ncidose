var NCIDOSE_version = "Version 1.0";
var fields = ['first_name','last_name','email','phone','address','institution','purpose','title'];

var modules = [ "NCICT", "2nd Tab" ];

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

$(document).ready(function() {

	updateVersion(NCIDOSE_version);
	//addValidators();
	$('#ldlink-tabs').on('click', 'a', function(e) {
		//console.warn("You clicked a tab");
		//console.info("Check for an attribute called data-url");
		//If data-url use that.
		var currentTab = e.target.id.substr(0, e.target.id.search('-'));
		//console.log(currentTab);
		var last_url_params = $("#"+currentTab+"-tab-anchor").attr("data-url-params");
		//console.log("last_url_params: "+last_url_params);
		if(typeof last_url_params === "undefined") {
			window.history.pushState({},'', "?tab="+currentTab);
		} else {
			window.history.pushState({},'', "?"+last_url_params);
		}

	});
	
	
	$('[data-toggle="popover"]').popover();
	// Apply Bindings

	$.each(modules, function(key, id) {
		$("#"+ id + "-results-container").hide();
		$('#'+ id + '-message').hide();
		$('#'+ id + '-message-warning').hide();
		$('#'+ id + "-loading").hide();
	});
	$('.NCICTForm').on('submit', function(e) {
		//alert('Validate');
		Make_PDF(e);
	});

	// setupTabs();
	pageURL();

});

// Set file support trigger
$(document).on('change','.btn-file :file',function() {
		var input = $(this), numFiles = input.get(0).files ? 
		input.get(0).files.length : 1, label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [ numFiles, label ]);
	}
);

// Jump to certain tab if tab is specified in URL
function pageURL () {
	var url = window.location.href;
	// console.log(url);
	var path = url.substring(url.lastIndexOf("/") + 1);
	var tab = ""
	switch(path) {
		case "#phantoms":
			tab = "#Phantoms-tab"
			break;
		case "#ncict":
			tab = "#NCICT-tab"
			break;
		case "#dose":
			tab = "#DOSE-Coefficients-tab"
			break;
		case "#agreement":
			tab = "#Agreement-tab"
			break;
		default:
			tab = "";
	}
	if (tab.length == 0) {
		setupTabs();
	}
	else {
		setupTabs();
		$("#home-tab-anchor").removeClass('active');
		$("#home-tab").removeClass('active');
		$(tab + '-anchor').addClass('active');
		$(tab).addClass("in").addClass('active');
		$(tab + '-anchor').parent().addClass('active');
	}
}

function setupTabs() {
	//Clear the active tab on a reload
	$.each(modules, function(key, id) {
		$("#"+id+"-tab-anchor").removeClass('active');
	});
	$("#home-tab-anchor").removeClass('active');
	//Look for a tab variable on the url
	var url = "{tab:''}";
	var search = location.search.substring(1);
	if(search.length >0 ) {
		url = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\n/, '\\\\n').replace(/\t/, '') + '"}');
	}
	var currentTab;
	if(typeof url.tab !="undefined") {
		currentTab = url.tab.toLowerCase();
	} else {
		currentTab = 'home';
	}
	$('#'+currentTab+'-tab').addClass("in").addClass('active');
	$('#'+currentTab+'-tab-anchor').parent().addClass('active');

	$('#'+currentTab+'-tab-anchor').addClass('active');

	if(typeof url.inputs !="undefined") {
		//console.dir(url.inputs.replace(/\t/, '').replace(/\n/, '\\\\n'));
		updateData(currentTab, url.inputs.replace(/\t/, '').replace(/\n/, '\\\\n'));
	}
}

// Shortcut for to enter agreement tab in Home-tab
$('#Agreement-tab-link').click(function() {
	$("#Agreement-tab-anchor").addClass('active');
	$("#home-tab-anchor").removeClass('active');
});


function showFFWarning() {
	// Is this a version of Mozilla?
	if ($.browser.mozilla) {
		var userAgent = navigator.userAgent.toLowerCase();
		// Is it Firefox?
		if (userAgent.indexOf('firefox') != -1) {
			userAgent = userAgent.substring(userAgent.indexOf('firefox/') + 8);
			var version = userAgent.substring(0, userAgent.indexOf('.'));
			if (version < 36) {
				$('.ffWarning').show();
			}
		}
	}
}



function updateVersion(version) {
	$("#NCIDOSE_version").text(version);
}





function toggleChevron(e) {
    $(e.target).prev('.panel-heading').find("i.indicator")
        .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
}

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}
function openHelpWindow(pageURL) {
    var helpWin = window.open(pageURL, "Help", "alwaysRaised,dependent,status,scrollbars,resizable,width=1000,height=800");
    helpWin.focus();
}

$('#consent :checkbox').change(function () {
    var a = $('#consent :checked').filter(":checked").length;
    if (a >= 1) {
        $('#overlay').removeClass('overlay');
		$('#first_name').removeAttr("disabled")        
		$('#last_name').removeAttr("disabled")        
		$('#title').removeAttr("disabled")        
		$('#email').removeAttr("disabled")        
		$('#phone').removeAttr("disabled")        
		$('#institution').removeAttr("disabled")		       
		$('#address').removeAttr("disabled")
		$('#purpose').removeAttr("disabled")        
		$('#generate').removeAttr("disabled")        


    } else {
        $('#overlay').addClass('overlay');
        $('#first_name').prop("disabled",true)        
		$('#last_name').prop("disabled",true)        
		$('#title').prop("disabled",true)        
		$('#email').prop("disabled",true)        
		$('#phone').prop("disabled",true)        
		$('#institution').prop("disabled",true)
		$('#address').prop("disabled",true)                
		$('#purpose').prop("disabled",true)        
		$('#generate').prop("disabled",true)       
    }
});
function addEventListeners() {
 	$('#email').on('keydown', function(e) {
 		validateEmail();
 	});
 
 	$('#generate').click(function() {
 		clearTransferAgreementPage();
    		 if(validateTransferAgreement()&&validateEmail()==true){
 		    $('#errorMessage').html("<font color='red'>Please fill in required field(s)</font>");
 	        $('#errorMessage').show();
 	        return;
 	}
 
 	 else if(validateTransferAgreement()&&validateEmail()==false){
 		    $('#errorMessage').html("<font color='red'>Please fill in required field(s)</font><br><font color='red'>Please Please enter a valid email address</font>");
 	        $('#errorMessage').show();
 	        return;
 	}
 
 	 else if(!validateTransferAgreement()&&validateEmail()==false){
 		    $('#errorMessage').html("<font color='red'>Please enter a valid email address</font>");
 	        $('#errorMessage').show();
 	        return;
 	}
 	else{
 		check_software();
 	}
 
 	})

 	$('#NCIDOSE-tabs-right > li').click(function() {
 		$('#NCIDOSE-tabs > li').removeClass('active')
 	});

 	$('#NCIDOSE-tabs > li').click(function() {
 		$('#NCIDOSE-tabs-right > li').removeClass('active')
 	});
 }
 
 
 function clearTransferAgreementPage(){
 	var index = 0;
 	for(index = 0; index < fields.length; index++){
 		$('#'+fields[index]).css("background-color","");
 	}
 	$('#errorMessage').hide();
 }
 function validateEmail() {
 
 
       var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
   	  return regex.test($('#email').val());
 }

 function validateTransferAgreement(){
 	var hasError = false;
	var index = 0;
 
 	for (index = 0; index < fields.length; index++){
 		if($.trim($('#' + fields[index]).val()).length == 0){
 				$('#'+fields[index]).css("background-color", "yellow");
 				hasError = true;
 	    }
 	}
     return hasError;
 }
 
 
 addEventListeners();
