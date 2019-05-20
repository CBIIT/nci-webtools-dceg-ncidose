/**
 * @file Contains routing and form validation and logic for
 * the NCIDose tool
 *
 * @version 1.1
 */

/** hide loading overlay */
$('#loading-overlay').hide()

/**
 * Enables hash-based routing based on bootstrap tabs
 */
$(function enableRoutes() {

  var routes = $('nav a').map(function(index, element) {
    return $(element).attr('href');
  }).get();

  $(window).on('hashchange', function(event) {
    console.log(event);
    var hash = window.location.hash;

    // if this is a valid route, then show the appropriate tab
    if (routes.indexOf(hash) != -1) {
      $('nav a[href="' + hash + '"]')
        .tab('show')
        .on('shown.bs.tab', function() {
          window.scrollTo(0, 0);
        });
      $(document.body).focus();
    }

  }).trigger('hashchange');

  var hash = window.location.hash;
  if (!hash || hash.length < 2 || routes.indexOf(hash) == -1) {
    window.location.hash = '#home';
  }
});


/**
 * Any elements that have the data-modal attribute
 * will show a modal dialog once clicked.
 */
$('[data-modal]').click(function() {
  var data = $(this).data();
  createModal(data.title, data.content);
});


/**
 * Any elements that have the data-open attribute
 * will open a new window with the specified url
 * once clicked.
 */
$('[data-open]').click(function(event) {
  event.preventDefault();
  var url = $(this).data('open');
  open(url, "Help", "alwaysRaised,dependent,status,scrollbars,resizable,width=1000,height=800").focus();
})


/**
 * Creates a modal dialog with the given title, content, and template selector
 * @param {string} title
 * @param {string} content
 * @param {string} templateSelector
 * @returns {jQuery} The created bootstrap modal
 */
function createModal(title, content, templateSelector) {
  var dialog = $(templateSelector || '#modal-template').clone();
  dialog.find('.modal-title').html(title);
  dialog.find('.modal-body').html(content);
  dialog.modal('show');
  return dialog;
}

/**
 * Returns true if the provided form is valid, false otherwise
 * If the form is invalid, this function
 * generates a modal with error messages
 *
 * @param {HTMLFormElement} form
 */
function validateForm(form) {
  // this form is invalid if any of its elements are invalid
  var invalid = $(form).find(':invalid').length > 0;
  $(form).toggleClass('inva/lid', invalid);

  // if this form is invalid, generate error messages
  var errors = [];
  if (invalid) {
    var invalids = $(form).find(':invalid');

    // add error message for required fields
    if (invalids.filter(function() {
        return this.validity.valueMissing;
      }).length)
      errors.push('Please fill in required field(s).');

    // add error message for invalid emails
    if (invalids.filter(function() {
        return this.type == 'email' && this.validity.typeMismatch;
      }).length)
      errors.push('Please ensure a valid email address has been provided.');

    // generate modal for any errors
    createModal(
      'Error',
      errors.join('\n')
    ).on('hidden.bs.modal', null);
  }

  // return true if this form is valid, false otherwise
  return !invalid;
}


/**
 * If form inputs are changed, determine if the form should be disabled
 */
$('#agreement form input').change(function() {
  // determine if form should be disabled
  var disabled = $('#agreement form input:checked').length === 0;
  $('#agreement form input:not([type="checkbox"])')
    .add('#agreement form textarea')
    .add('#agreement form button')
    .add('#recipient-investigator')
    .add('#research-activity')
    .add('#feedback')
    .prop('disabled', disabled)
    .toggleClass('disabled', disabled);

  // if form is disabled, remove validation errors
  disabled && $('#agreement form').removeClass('invalid');

}).trigger('change'); // trigger a change event to update form state


/**
 * Create an event handler for the form's submit event
 */
$('#agreement form').submit(function(e) {
  // prevent the default submission event
  e.preventDefault();

  // prevent form submission if invalid
  if (!validateForm(this)) {
    return;
  }

  // get software descriptions
  var software = {
    'phantoms': {
      title: 'Phantoms',
      description: $('[data-for="phantoms"]').data('content'),
    },

    'ncict': {
      title: 'NCICT',
      description: $('[data-for="ncict"]').data('content'),
    },

    'ncinm': {
      title: 'NCINM',
      description: $('[data-for="ncinm"]').data('content'),
    },

    'dose-coefficients': {
      title: 'Dose Coefficients',
      description: $('[data-for="dose-coefficients"]').data('content'),
    }
  }

  // serialize form as an object
  var parameters = $(this).serializeArray()
    .reduce(function(accumulator, current) {
      var name = current.name;
      var value = current.value;

      // if a software checkbox has been checked, add its description to the list of software
      // otherwise, assign the current key and value to the object
      software[name]
        ? (accumulator.software_descriptions.push('&#x2611; ' + software[name].description),
          accumulator.software_titles.push(software[name].title))
        : accumulator[name] = value

      return accumulator;
    }, {
      software_titles: [],
      software_descriptions: [],
      first: null,
      last: null,
      job_title: null,
      email: null,
      phone: null,
      institution: null,
      address: null,
      purpose: null,
      date: null,
      discovery_mechanism: null,
    });

  // set parameter object's date
  var date = new Date();
  parameters.date = [
    ('0' + (date.getMonth() + 1)).slice(-2), // ensure month is left-padded
    ('0' + date.getDate()).slice(-2), // ensure day is left-padded
    date.getFullYear()
  ].join('/');

  // send parameters to application
  $('#loading-overlay').show()
  $.post('submit/', JSON.stringify(parameters))
    .done(function(response) {
      createModal(
        'NCIDose Materials Confirmation',
        'Thank you for registering with NCIDose. A confirmation email will be sent shorty with a copy of the STA Agreement in PDF format.'
      ).on('hidden.bs.modal', reset);
    })
    .fail(function(error) {
      createModal(
        'Error',
        'Unfortunately there was an error during the registration process. Please <a target="_top" href="mailto: NCIDOSEWebAdmin@mail.nih.gov?subject=NCIDOSE">contact</a> the system administrator if this issue persists.'
      ).on('hidden.bs.modal', null);
    })
    .always(function() {
      $('#loading-overlay').hide();
    });

  // call reset function when confirmation modal is closed
  function reset() {
    $('#agreement form').trigger('reset');
    $('#agreement form input').trigger('change');
    window.location.hash = '#home';
  }
});