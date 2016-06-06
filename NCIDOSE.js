var NCIDOSE_version = "Version 1.0";

var modules = [ "ldhap", "ldmatrix", "ldpair", "ldproxy", "snpclip", "snpchip" ];

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
	loadHelp();
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

	setupTabs();


});

// Set file support trigger
$(document).on('change','.btn-file :file',function() {
		var input = $(this), numFiles = input.get(0).files ? 
		input.get(0).files.length : 1, label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [ numFiles, label ]);
	}
);





function setupTabs() {
	//Clear the active tab on a reload
	$.each(modules, function(key, id) {
		$("#"+id+"-tab-anchor").removeClass('active');
	});
	$("#home-tab-anchor").removeClass('active');
	$("#help-tab-anchor").removeClass('active');
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

	if(currentTab.search('hap')>=0) currentTab = 'ldhap';
	if(currentTab.search('matrix')>=0) currentTab = 'ldmatrix';
	if(currentTab.search('pair')>=0) currentTab = 'ldpair';
	if(currentTab.search('proxy')>=0) currentTab = 'ldproxy';
	if(currentTab.search('clip')>=0) currentTab = 'snpclip';
	if(currentTab.search('chip')>=0) currentTab = 'snpchip';

	$('#'+currentTab+'-tab').addClass("in").addClass('active');
	$('#'+currentTab+'-tab-anchor').parent().addClass('active');

	if(typeof url.inputs !="undefined") {
		//console.dir(url.inputs.replace(/\t/, '').replace(/\n/, '\\\\n'));
		updateData(currentTab, url.inputs.replace(/\t/, '').replace(/\n/, '\\\\n'));
	}

}

function refreshPopulation(pop, id) {

	$.each(pop, function(key, value){
		$('option[value="'+value+'"]', $('#'+id+'-population-codes')).prop('selected', true);
	});
	$('#'+id+'-population-codes').multiselect('refresh');

}





/*
function pushInputs(currentTab, inputs) {
	window.history.pushState({},'', "?tab="+currentTab+"&inputs="+JSON.stringify(inputs));
}
*/

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
	$("#ldlink_version").text(version);
}



function populateTextArea(event, numFiles, label) {
	id = event.target.id;
	//alert(id);
	if (window.FileReader) {

		var input = event.target;
		var reader = new FileReader();
		reader.onload = function() {
			var text = reader.result;
			$('#'+id+'-snp-numbers').val(cleanSNP(text));
			$('#'+id+'-snp-numbers').keyup();
		};
		reader.readAsText(input.files[0]);
	} else {
		alert('FileReader not supported');
		return;
	}
}

function loadHelp() {
	$('#help-tab').load('help.html');
}






function isPopulationSet(elementId) {
	//console.log("Check population: "+elementId);

	var	population =  $('#'+elementId+'-population-codes').val();
	//console.dir(population);
	if(population == null ) {
		$('#'+elementId+'-population-codes-zero').popover('show');
		return false;
	} else {
		$('#'+elementId+'-population-codes-zero').popover('hide');
		return true;
	}
}























/* Utilities */

$(document).ready(function() {
	$('#ldhap-file-snp-numbers').keyup(validateTextarea);
	$('#ldmatrix-file-snp-numbers').keyup(validateTextarea);
	$('#snpchip-file-snp-numbers').keyup(validateTextarea);
	$('#snpclip-file-snp-numbers').keyup(validateTextarea);
});

function validateTextarea() {
    var errorMsg = "Please match the format requested: rs followed by 1 or more digits (ex: rs12345), no spaces permitted";
    var textarea = this;
    var pattern = new RegExp('^' + $(textarea).attr('pattern') + '$');
    // check each line of text
    $.each($(this).val().split("\n"), function (index, value) {
        // check if the line matches the pattern
        //console.log(value);
        var hasError = !this.match(pattern);
        if(value == "" || value == "\n" || this.length<=2 )
        	hasError = false;
        //console.log("hasError: "+hasError);
        if (typeof textarea.setCustomValidity === 'function') {
            	textarea.setCustomValidity(hasError ? errorMsg : '');
        } else {
            // Not supported by the browser, fallback to manual error display...
            $(textarea).toggleClass('error', !!hasError);
            $(textarea).toggleClass('ok', !hasError);
            if (hasError) {
                $(textarea).attr('title', errorMsg);
            } else {
                $(textarea).removeAttr('title');
            }
        }
        return !hasError;
    });
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
