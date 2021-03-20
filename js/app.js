//Handling searching hotel
$(function() {
    var timer;
    $("#hotel_destination").on("keyup", function (e) {
        $('#hotel_check_in').val('').trigger('change').attr('disabled', true);
        $('#hotel_nights').val('1').attr('disabled', true);
        e.preventDefault();
        clearTimeout(timer);
        $(this).removeAttr('field_id').removeAttr('field_type');
        let that = this;
        timer = setTimeout(function() {
            let val = $(that).val();
            let resultsDiv = $('#hotel_destination_results');
            resultsDiv.html('');
            if(val.length >= 3) {
                arrivalAutocompleteHotel(val)
            } else {
                resultsDiv.css('display', 'none');
            }
        }, 500);
    }); 
});

//Handling results of searching hotels
$(function() {
    $(document).on("click", "#hotel_destination_results p" ,function () { 
        dep = $(this).text();
        let inputField = $(this).parent().parent().find('input');
        inputField.val(dep);
        inputField.attr('field_id', $(this).data('id'));
        inputField.attr('field_type', $(this).data('type'));
        $(this).parent().slideUp();
        
        //enable num of rooms when departure is selected
        $('#hotel_nights').attr('disabled', false);
        $('#hotel_check_in').attr('disabled', false);
        $('#hotel_check_in').datepicker({
            dateFormat: 'dd-mm-yy', 
            minDate: new Date
        });
    });
    
    $("#btn-hotel-search").on("click", function(e) {
        addLoader();
        removeResults();
        e.preventDefault();
        let hotelDestination = $('#hotel_destination');
        let id = hotelDestination.attr('field_id');
        let type = hotelDestination.attr('field_type');
        let isCity = true;
        if(type == "2") {
            isCity = false;
        }
        let check_in = aeApiDateFormat($('#hotel_check_in').val(), 'sql', 'DD-MM-YYYY');
        let nights = $('#hotel_nights').val();
        let rooms = [];
        let count = 0;
        $('.hotel_guests').each(function(e) {
            let nextElement = $(this).next();
            let hasChildren = false;
            if(nextElement.hasClass('childrenAges')) {
                hasChildren = true;
            }
            let adults = $(this).find('.adultSelect').val();
            
            let children = [];
            if(hasChildren) {
                nextElement.find('input').each(function(e) {
                    let childsAge = $(this).val();
                    if(childsAge > 0) {
                        children.push(childsAge); 
                    }
                });
            }
            if((adults != null && adults != '') || children.length) {
                rooms.push({});
                if(adults != null && adults != '') {
                    rooms[count].adult = adults;
                }
                if(children.length) {
                    rooms[count].childAges = children;
                }
            }
            count++;
        });
        if(id != '' && id != undefined && check_in != "Invalid date" && rooms.length && nights != '' && nights != undefined && nights > 0) {
            searchHotel(id, check_in, rooms, nights, isCity);
        }
    });
});

//Handling searching flights
$(function() {
    var timer;
    $("#plane_departure").on("keyup", function (e) {
        removeResults()
        clearAllFlightFields();
        e.preventDefault();
        clearTimeout(timer);
        $(this).removeAttr('field_id').removeAttr('field_type');
        let that = this;
        timer = setTimeout(function() {
            let val = $(that).val();
            let resultsDiv = $('#plane_departure_results');
            resultsDiv.html('');
            if(val.length >= 3) {
                addLoader();
                departureAutocomplete(val)
            } else {
                resultsDiv.css('display', 'none');
            }
        }, 500);
    });
    
    $("#plane_arrival").on("keyup", function (e) {
        removeResults()
        e.preventDefault();
        clearTimeout(timer);
        $(this).removeAttr('field_id').removeAttr('field_type');
        let that = this;
        timer = setTimeout(function() {
            let val = $(that).val();
            let resultsDiv = $('#plane_arrival_results');
            let departureField = $("#plane_departure");
            let field_type = departureField.attr('field_type');
            let field_id = departureField.attr('field_id');
            let is_round = $("input[name=plane_round_trip]").val();
            resultsDiv.html('');
            if(field_type == undefined || field_id == undefined) {
                resultsDiv.html('Please select departure first!');
            } else if(val.length >= 3) {
                addLoader();
                arrivalAutocomplete(val, field_type, field_id, is_round)
            } else {
                resultsDiv.css('display', 'none');
            }
            disable($('#plane_check_in'));
            disable($('#num_of_nights'));
            $('.flightPassengerRow').addClass('d-none');
            $('#plane_check_in').val('');
            $('#num_of_nights').val('');
        }, 500);
    });
    
    $("#plane_check_in").on("change", function(e) {
        let val = $(this).val();
        let firstRow = $("#passanger_row_first");
        if(val != "") {
            firstRow.removeClass('d-none');
            enable($('#num_of_nights'));
        } else {
           let addedRows = $('.addedFlightPassengerRow');
           addedRows.remove();
           firstRow.addClass('d-none');
           firstRow.find('select').val('');
           firstRow.find('input').val('');
           disable($('#num_of_nights'));
       }
    });
    
    
    $("#hotel_check_in").on("change", function(e) {
        let val = $(this).val();
        let firstRow = $(".hotel_guests_first");
        if(val != '' && val != undefined) {
            firstRow.find('input').attr('disabled', false);
            firstRow.find('select').attr('disabled', false);
            firstRow.find('#addHotelPassenger').attr('disabled', false);
        } else {
            firstRow.find('input').attr('disabled', true);
            firstRow.find('select').attr('disabled', true);
            firstRow.find('#addHotelPassenger').attr('disabled', true);
            $('.hotel_guests_added').remove();
            $('.childrenAges').remove();
        }
    });
    
    $('#multisearch').on("change", '.childernSelect', function(e) {
        let parentRow = $(this).parent().parent();
        let parentNext = parentRow.next();
        if (parentNext.hasClass('childrenAges')) {
            parentNext.remove();
        }
        let val = $(this).val();
        if(val > 5 || val < 0) {
            $(this).val('');
        } else {
            let result = '<div class="d-flex justify-content-start childrenAges">';
            for(let i = 0; i<val; i++) {
                result += `<div class="px-2">
                    <label>Dob djeteta</label>
                    <input type="number" class="form-control" min="0" max="17" step="1">
                </div>`;
            }
            result += '</div>';
            parentRow.after(result);
        }
    });
    
    $("#btn-search").on("click", function(e) {
        removeResults();
        e.preventDefault();
        let service_type = $("input[name=plane_round_trip]:checked").val();
        let checkIn = $('#plane_check_in').val();
        let departureField = $("#plane_departure");
        let arrivalField = $("#plane_arrival");
        let dep_type = departureField.attr('field_type');
        let dep_id = departureField.attr('field_id');
        let arr_type = arrivalField.attr('field_type');
        let arr_id = arrivalField.attr('field_id');
        let num_of_nights = $('#num_of_nights').val();
        let passengers = [];
        
        $('.flightPassengerRow').each(function(e) {
           let typeVal = $(this).find('select').val(); 
           let amount = $(this).find('input').val();
           if(typeVal != '' && amount != '' && amount > 0) {
               passengers.push({
                   type: typeVal,
                   count: amount
               });
           }
        });
        
        if(service_type != '' && checkIn != '' && dep_type != undefined && dep_id != undefined && arr_type != undefined && arr_id != undefined && passengers.length) {
            if(service_type == 2) {
                if(num_of_nights != '') {
                   flightSearch(service_type, aeApiDateFormat(checkIn, 'sql', 'DD-MM-YYYY'), dep_id, dep_type, arr_id, arr_type, passengers, numOfNights($("#plane_check_in"), $("#num_of_nights")));

                } else {
                    alert('Popunite sva polja prije pretrage');
                }
            } else {
                flightSearch(service_type, aeApiDateFormat(checkIn, 'sql', 'DD-MM-YYYY'), dep_id, dep_type, arr_id, arr_type, passengers, '');
            }
        } else {
            alert('Popunite sva polja prije pretrage');
        }
    });
});

//Handling results of searching flights
$(function() {
    $(document).on("click", "#plane_departure_results p" ,function () { 
       dep = $(this).text();
       let inputField = $(this).parent().parent().find('input');
       inputField.val(dep);
       inputField.attr('field_id', $(this).data('id'));
       inputField.attr('field_type', $(this).data('type'));
       $(this).parent().slideUp();

        //enable destination when departure is selected
        enable($('#plane_arrival'));
        
        //enable Check Out date when departure is selected
        $('#flight_nights_col').removeClass('d-none');
        

       //enable round trip when departure is selected
       let field_id = $("#plane_departure").attr('field_id');
        if(field_id != undefined) {
            $('input[name=plane_round_trip]').attr('disabled', false);
            $('input[name=plane_round_trip]').prop('checked', true);
        } else {
            $('input[name=plane_round_trip]').attr('disabled', true);
            $('input[name=plane_round_trip]').prop('checked', false);
        }     
    });
     
    $(document).on("click", "#plane_arrival_results p" ,function () { 
       dep = $(this).text();
       let inputField = $(this).parent().parent().find('input');
       inputField.val(dep);
       inputField.attr('field_id', $(this).data('id'));
       inputField.attr('field_type', $(this).data('type'));
       $(this).parent().slideUp();

       let field_id = $("#plane_arrival").attr('field_id');
       if (field_id != undefined) {
        enable($('#plane_check_in'));
       } 
       
       checkInDatesFlight();
    });
});

//Other operations
$(function() {
    //enable round trip when departure is selected (morao sam duplicirati jer input i on change funkcije nikako da uskladim ako imas bolji nacin pricaj :D)
    let field_id = $("#plane_departure").attr('field_id');
    let round_trip = $('input[name=plane_round_trip]')
    let plane_destination = $('#plane_arrival');

    round_trip.attr('disabled', true);
    plane_destination.attr('disabled', true);

    $(document).on('input', '#plane_departure',  function() {

        // check if departure field has value / enable destination and road trip
        if(field_id != undefined) {
            enable(round_trip);
            round_trip.prop('checked', true);
            enable(plane_destination);
        } else {
            disable(round_trip);
            round_trip.prop('checked', false);
            disable(plane_destination);
            plane_destination.val('');
        }             

});

    // check if round trip is selected
    $(round_trip).click(function() {
        if($(round_trip).is(':checked')) { 
            plane_destination.attr('disabled', false);
            let roundTripVal = $('input[name=plane_round_trip]:checked').val();
            if(roundTripVal == 2) {
                $('#flight_nights_col').removeClass('d-none');
            } else {
                $('#flight_nights_col').addClass('d-none');
                $('#num_of_nights').val('');
            }
        } else {
            plane_destination.attr('disabled', true);
            plane_destination.val('');
        }
    });
    
    $('.dropdown-toggle').click(function (e) { 
        e.preventDefault();
        $('.dropdown-menu').slideToggle();        
    });
    
    $('#product_type_id').change(function(e) {
        let val = $(this).val();
        if(val == 2) {
            $('#hotel_fields').removeClass('d-none');
        } else {
            let hotelFields = $('#hotel_fields')
            hotelFields.addClass('d-none');
            hotelFields.find('input').val('');
            hotelFields.find('select').val('');
        }
    })
    
    $('#myTabs a').click(function (e) {
      e.preventDefault()
      $(this).tab('show')
    })
});

function makeCallData(params, method) {
    return {
        action: 'ae_api_call',
        params: params,
        MethodName: method
    };
}

function aeApiDateFormat(date, format, incomingFormat = null) {
    let myDate = new Date(date)
    let momentDate = '';
    if(incomingFormat != null) {
        momentDate = moment(date, incomingFormat);
    } else {
        momentDate = moment(myDate);
    }
    if(format == 'full') {
        return momentDate.format("DD/MM/YYYY, HH:mm Z");
    } else if(format == 'date') {
        return momentDate.format("DD/MM/YYYY");
    } else if(format == 'time') {
        return momentDate.format("HH:mm:ss Z");
    } else if(format == 'sql') {
        return momentDate.format("YYYY-MM-DD");
    } else if(format == 'd-m-y') {
        return momentDate.format('DD-MM-YYYY');
    }
}

function sortByPrice(a, b) {
  if ( a.offers[0].price.amount < b.offers[0].price.amount ){
    return -1;
  }
  if ( a.offers[0].price.amount > b.offers[0].price.amount ){
    return 1;
  }
  return 0;
}

function minutesToHours(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
}

function addLoader() {
    $(".page-loading").addClass("ae-on");
    $(".page-loading").removeClass("ae-off");
}

function removeLoader() {
    $(".page-loading").addClass("ae-off");
    $(".page-loading").removeClass("ae-on");
}

function enable(field) {
    field.attr('disabled', false);
}

function disable(field) {
    field.attr('disabled', true);
}

function disableForm(field) {
    field.addClass('disableForm');
}

function removeResults() {
    $('.search-result-wrapper').remove();
}

function numOfNights(start, end) {
    start = start.datepicker("getDate");
    end = end.datepicker("getDate");
    var days = (end - start) / (1000 * 60 * 60 * 24);
    return days;
}

function clearAllFlightFields(){
    $('#plane_check_in').val('');
    $('#num_of_nights').val('');
    disable($('#plane_check_in'));
    disable($('#num_of_nights'));
    $('.flightPassengerRow').addClass('d-none');  
}

function paginator(items, current_page, per_page_items) {
	let page = current_page || 1, // if not set, use 1st page
    per_page = per_page_items || 10, // if not set, use 10 items per page
	offset = (page - 1) * per_page,

    //slice amount of items you wanna skip
	paginatedItems = items.slice(offset).slice(0, per_page_items),
	total_pages = Math.ceil(items.length / per_page);

    //return object 
	return {
		page: page,
		per_page: per_page,
		pre_page: page - 1 ? page - 1 : null,
		next_page: (total_pages > page) ? page + 1 : null,
		total: items.length,
		total_pages: total_pages,
		data: paginatedItems
	};
}

function scrollToTargetAdjusted(elementId, offset = 60){
    let headerHight = $('header').css('height');
    offset = headerHight.substring(0, headerHight.length - 2);
    var element = document.getElementById(elementId);
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });
}