let availableDatesPackageGlobal = [];
let hotelsFoundPackageGlobal = [];
let hotelsFilteredPackageGlobal = [];
let packageMinPrice = null;
let packageMaxPrice = null;
let packageGlobalCheckIn = null;
let packageGlobalNights = null;
let packageGlobalRooms = null;
let packageGlobalTypesOfService = [];

$(function() {
    /*
    $( "#test" ).slider({
      range: true,
      min: 0,
      max: 500,
      values: [ 75, 300 ],
      slide: function( event, ui ) {
        $( "#ae_api_price_filter_from_val" ).html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    */
    let rangePriceFromPackage = document.getElementById("ae_api_price_filter_from");
    if (rangePriceFromPackage != null) {
        rangePriceFromPackage.addEventListener('input', updateFromPriceInput); // change on input, without releasing
    }
    let rangePriceToPackage = document.getElementById("ae_api_price_filter_to");
    if(rangePriceToPackage != null) {
        rangePriceToPackage.addEventListener('input', updateToPriceInput);
    }
    
    getPackageDepartures();
    
    // use .packageFilter to call filtering on any input change
    $('#package_filters').on('change', '.packageFilter', function() {
        addLoader();
        let priceFrom = $('#ae_api_price_filter_from').val();
        let priceTo = $('#ae_api_price_filter_to').val();
        let stars = [];
        let hotelTypes = [];
        if($('#ae_api_star_filter_5:checked').length) {
           stars.push(5);
        }
        if($('#ae_api_star_filter_4:checked').length) {
           stars.push(4);
        }
        if($('#ae_api_star_filter_3:checked').length) {
           stars.push(3);
        }
        if($('#ae_api_star_filter_2:checked').length) {
           stars.push(2);
        }
        if($('#ae_api_star_filter_1:checked').length) {
           stars.push(1);
        }
        
        $('#package_filters').find('.packageHotelServiceTypeFilter').each(function() {
            if($(this).is(':checked')) {
                hotelTypes.push($(this).val())
            }
        });
        filterPackageHotels(stars, priceFrom, priceTo, hotelTypes);
        removeLoader();
    });
    
    $('#package_departure').on('change', function() {
       let val = $(this).val();
       $('#package_arrival').val('').trigger('change');
       if(val != "") {
           getPackageArrivals(val);
       }
    });
    
    $('#package_arrival').on('change', function() {
        $('#package_check_in').val('').trigger('change').attr('disabled', true);
        let arrival_val = $(this).val();
        let departure_val = $('#package_departure').val();
        if(arrival_val != "" && departure_val != "" && arrival_val != null && departure_val != null) {
           getPackageCheckInDates(arrival_val, departure_val);
        }
    });
    
    $('#package_check_in').on('change', function() {
        $('#package_nights').attr('disabled', true).html('');
        $('#btn-package-search').attr('disabled', true);
        let check_in = $('#package_check_in').val();
        let firstRow = $(".package_guests_first");
        check_in = aeApiDateFormat(check_in, 'sql', 'DD-MM-YYYY');
        if(check_in != "Invalid date") {
            let arrival_val = $('#package_arrival').val();
            let departure_val = $('#package_departure').val();
            if(arrival_val != "" && departure_val != "" && arrival_val != null && departure_val != null) {
                getPackageNights(arrival_val, departure_val, check_in);
            }
            firstRow.find('input').attr('disabled', false);
            firstRow.find('#addPackagePassenger').attr('disabled', false);
        } else {
            $('#package_nights').val('').attr('disabled', true);
            firstRow.find('input').attr('disabled', true);
            firstRow.find('#addPackagePassenger').attr('disabled', true);
            $('.package_guests_added').remove();
            $('.childrenAgesPackage').remove();
            firstRow.find('.childrenSelect').val(0);
            firstRow.find('.adultSelect').val(1);
        }
    });
    
    $('#btn-package-search').on('click', function() {
        let arrival_val = $('#package_arrival').val();
        let departure_val = $('#package_departure').val();
        let check_in = $('#package_check_in').val();
        check_in = aeApiDateFormat(check_in, 'sql', 'DD-MM-YYYY');
        let nights = $('#package_nights').val();
        let rooms = [];
        let count = 0;
        $('.package_guests').each(function(e) {
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
                    rooms[count].Adult = adults;
                }
                if(children.length) {
                    rooms[count].ChildAges = children;
                }
            }
            count++;
        });
        if(arrival_val != "" && departure_val != "" && arrival_val != null && departure_val != null && check_in != "Invalid date" && nights != "" && rooms.length ) {
            searchPackage(arrival_val, departure_val, check_in, nights, rooms);
        }
    });
    
    $('#packageSearch').on("change", '.childrenSelect', function(e) {
        let parentRow = $(this).parent().parent();
        let parentNext = parentRow.next();
        if (parentNext.hasClass('childrenAgesPackage')) {
            parentNext.remove();
        }
        let val = $(this).val();
        if(val > 5 || val < 0) {
            $(this).val('');
        } else {
            let result = '<div class="d-flex justify-content-start childrenAgesPackage">';
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
});

function handlePackageResults(myBody) {
    hotelsFoundPackageGlobal = myBody.body.hotels;
    console.log(hotelsFoundPackageGlobal);
    for (let i = 0; i < hotelsFoundPackageGlobal.length; i++) {
        let currentItem = hotelsFoundPackageGlobal[i];
        let myParams = {
            product: currentItem.id
        };
        var data = makeCallData(myParams, "searchPackageHotelDetails");
        jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
            let body = JSON.parse(response).body;
            body = JSON.parse(body);
        });
    }
    removeLoader();
}

function searchPackage(arrival_val, departure_val, check_in, nights, rooms) {
    addLoader();
    let arr_info = arrival_val.split('|');
    let dep_info = departure_val.split('|');
    let myParams = {
        ProductType: 1,
        Night: nights,
        DepartureLocations: [{
            Type: 2,
            Id: dep_info[0]
        }],
        ArrivalLocations: [{
            Type: 2,
            Id: arr_info[0] 
        }],
        CheckIn: check_in,
        RoomCriteria: rooms
    };
    packageGlobalCheckIn = check_in;
    packageGlobalRooms = rooms;
    packageGlobalNights = nights;
    var data = makeCallData(myParams, "searchPackage");
    jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        if(body.header.success) {
            hotelsFoundPackageGlobal = body.body.hotels;
            hotelsFilteredPackageGlobal = body.body.hotels;
            generateHotelListPackage(true);
            $('#ae_api_price_filter_from').attr('min', packageMinPrice).attr('max', packageMaxPrice).val(packageMinPrice);
            $('#ae_api_price_filter_to').attr('min', packageMinPrice).attr('max', packageMaxPrice).val(packageMaxPrice);
            $('#ae_api_price_filter_from_val span').html(packageMinPrice);
            $('#ae_api_price_filter_to_val span').html(packageMaxPrice);
            $('#package_filters').removeClass('d-none');
        } else {
            $('#package_list').html(body.header.messages[0].message)
        }
        removeLoader();
    });
}

function addPackagePassenger() {
    let html = `<div class="row package_guests package_guests_added">
                    <div class="col-xl-5 col-md-5 col-sm-12">
                        <label>Odrasli</label>
                        <input class="form-control adultSelect" min="0" type="number" step="1" value="1">
                    </div>
                    <div class="col-xl-4 col-md-5 col-sm-8">
                        <label>Djeca</label>
                        <input class="form-control childrenSelect" min="0" type="number" step="1" value="0" max="5">
                    </div>
                    <div class="col-xl-3 col-sm-2 col-md-2 d-flex align-self-center add_remove_btn_package">
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removePackagePassenger(this)">
                        <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
    let addedRows = $('.childrenAgesPackage');
    let addedRows2 = $('.package_guests_added');
    if(addedRows.length) {
        addedRows.last().after(html);
    } else if (addedRows2.length) {
        addedRows2.last().after(html);
    } else {
        let firstPassengerRow = $('.package_guests_first');
        firstPassengerRow.after(html);
    }
}

function removePackagePassenger(el) {
    let parentEl = $(el).parent().parent();
    let nextEl = parentEl.next();
    if(nextEl.hasClass('childrenAgesPackage')) {
        nextEl.remove();
    }
    parentEl.remove();
}

function getPackageNights(arrival_val, departure_val, check_in) {
    addLoader();
    let arr_info = arrival_val.split('|');
    let dep_info = departure_val.split('|');
    let myParams = {
        ProductType: 1,
        DepartureLocations: [{
            Type: dep_info[1],
            Id: dep_info[0]
        }],
        ArrivalLocations: [{
            Type: arr_info[1],
            Id: arr_info[0] 
        }],
        CheckIn: check_in
    };
    var data = makeCallData(myParams, "getPackageNights");
    jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        if(body.header.success) {
            let nights = body.body.nights;
            let html = '';
            for(let i = 0; i<nights.length; i++) {
                html += `<option value="${nights[i]}">${nights[i]}</option>`;
            }
            $('#package_nights').attr('disabled', false).html(html);
            $('#btn-package-search').attr('disabled', false);
        }
        removeLoader();
    });
}

function getPackageCheckInDates(arrival_val, departure_val) {
    addLoader();
    let arr_info = arrival_val.split('|');
    let dep_info = departure_val.split('|');
    let myParams = {
        ProductType: 1,
        DepartureLocations: [{
            Type: dep_info[1],
            Id: dep_info[0]
        }],
        ArrivalLocations: [{
            Type: arr_info[1],
            Id: arr_info[0] 
        }]
    };
    var data = makeCallData(myParams, "getPackageCheckInDates");
    jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        if(body.header.success) {
            $('#package_check_in').attr('disabled', false);
            availableDatesFlightGlobal = [];
            let dates = body.body.dates;
            for (let i = 0; i < dates.length; i++) {
                availableDatesPackageGlobal.push(aeApiDateFormat(dates[i], 'sql'));
            }
            $("#package_check_in").datepicker({
                dateFormat: 'dd-mm-yy',
                beforeShowDay: availableCheckInPackage,
                defaultDate: availableCheckInPackage[0]
            }).datepicker('setDate', aeApiDateFormat(dates[0], 'd-m-y'));
            $("#package_check_in").trigger('change');
        }
    });
}

function getPackageDepartures() {
    let myParams = {
        ProductType: 1
    };
    var data = makeCallData(myParams, "getPackageDepartures");
    jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        if(body.header.success) {
            let locations = body.body.locations;
            let html = '<option value="">Select</option>';
            for(let i = 0; i<locations.length; i++) {
                html += `<option value="${locations[i].id}|${locations[i].type}">${locations[i].name}</option>`;
            }
            $('#package_departure').html(html);
        } else {
           $('#package_departure').html(''); 
        }
    });
}

function getPackageArrivals(val) {
    addLoader();
    $('#package_list').html('');
    let info = val.split('|');
    let myParams = {
        ProductType: 1,
        DepartureLocations: [{
            Type: info[1],
            Id: info[0]
        }]
    };
    var data = makeCallData(myParams, "getPackageArrivals");
    jQuery.post(the_ajax_script.ajaxurl, data, function(response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        if(body.header.success) {
            let locations = body.body.locations;
            let html = '<option value="">Select</option>';
            for(let i = 0; i<locations.length; i++) {
                html += `<option value="${locations[i].id}|${locations[i].type}">${locations[i].name}</option>`;
            }
            $('#package_arrival').html(html);
        } else {
           $('#package_arrival').html('');
           $('#package_list').html("Nema rezultata za izabranu lokaciju, molim vas pokusajte opet.")
        }
        removeLoader();
    });
}

function availableCheckInPackage(date) {
    let tempMonth = (date.getMonth() + 1).toString();
    let tempDay = date.getDate().toString();
    if (tempMonth.length < 2) { tempMonth = "0" + tempMonth }
    if (tempDay.length < 2) { tempDay = "0" + tempDay }
    dmy = date.getFullYear() + "-" + tempMonth + "-" + tempDay;
    if ($.inArray(dmy, availableDatesPackageGlobal) != -1) {
        return [true, "", "Available"];
    } else {
        return [false, "", "unAvailable"];
    }
}

function updateFromPriceInput () {
    let val = $('#ae_api_price_filter_from').val()
    $('#ae_api_price_filter_from_val span').html(val);
}
function updateToPriceInput () {
    let val = $('#ae_api_price_filter_to').val()
    $('#ae_api_price_filter_to_val span').html(val);
}

function filterPackageHotels(stars, priceFrom, priceTo, hotelTypes) {
    hotelsFilteredPackageGlobal = [];
    for(let i = 0; i < hotelsFoundPackageGlobal.length; i++) {
        currentHotel = hotelsFoundPackageGlobal[i];
        let hotelLowestPrice = currentHotel.offers[0].price.amount;
        let hotelStars = currentHotel.stars;
        let hotelType = currentHotel.offers[0].rooms[0].boardName;
        
        if(hotelLowestPrice >= priceFrom && hotelLowestPrice <= priceTo && (stars.includes(hotelStars) || stars.length == 0) && (hotelTypes.includes(hotelType) || hotelTypes.length == 0)) {
            hotelsFilteredPackageGlobal.push(currentHotel);
        }
    }
    generateHotelListPackage();
}

// set default value with: "firstSearch = false". Means if not defined use 'false' value
function generateHotelListPackage(firstSearch = false, current_page = 1) {
    addLoader();
    packageMinPrice = null;
    packageMaxPrice = null;
    let html = "";
    if(firstSearch) {
        packageGlobalTypesOfService = [];
    }
    let myRooms = encodeURIComponent(JSON.stringify(packageGlobalRooms));
    let currentPageData = paginator(hotelsFilteredPackageGlobal, current_page, 10)
    for (let i = 0; i < hotelsFilteredPackageGlobal.length; i++) {
        let currentItem = hotelsFilteredPackageGlobal[i];
        let hotelPrice = currentItem.offers[0].price.amount;
        let hotelOffers = currentItem.offers;
        
        if(packageMinPrice == null) {
            packageMinPrice = hotelPrice;
        }
        if(packageMaxPrice == null) {
            packageMaxPrice = hotelPrice;
        }
        if(hotelPrice < packageMinPrice) {
            packageMinPrice = hotelPrice;
        }
        if(hotelPrice > packageMaxPrice) {
            packageMaxPrice = hotelPrice;
        }
        
        if (hotelOffers.length){
            $.each(hotelOffers, function(i){
                if(firstSearch) {
                    if(!packageGlobalTypesOfService.includes(hotelOffers[i].rooms[0].boardName)) {
                        packageGlobalTypesOfService.push(hotelOffers[i].rooms[0].boardName);
                    }
                }
            });
        }  
    }
    for (let i = 0; i < currentPageData.data.length; i++) {
        let currentItem = currentPageData.data[i];
        hotelname = currentItem.name;
        hotelAddress = currentItem.address;
        hotelImage = currentItem.thumbnail;
        hotelPrice = currentItem.offers[0].price.amount;
        let locationId = currentItem.id;
        hotelCurrency = currentItem.offers[0].price.currency;
        hotelName = currentItem.name;
        hotelStar = currentItem.stars;
        hotelStars = "";
        for(stars=0; stars < hotelStar; stars++) {
            hotelStars += '<i class="fa fa-star" aria-hidden="true"></i>';
        }
        hotelCity = currentItem.city.name;
        hotelCountry = currentItem.country.name;
        hotelOffers = currentItem.offers;
        hotelFacilities = currentItem.facilities;

        html += `<div class="row search-result-wrapper" data-offer-number="` + i + `">
            <div class="col-md-9 hotel-address-wrapper">
                <div class="row">
                    <div class="col-md-6">`;
                    if(hotelImage == undefined) {
                        html += `<a href="#"><img class="hotel-image rounded shadow" src="https://via.placeholder.com/300x150?text=Hotel%20Image%20Missing" alt="hotel image"></a>`;
                    } else {
                        html += `<a href="#"><img class="hotel-image rounded shadow" src="http://service.avioexpress.ba/media` + hotelImage + `" alt="hotel image"></a>`;
                   }
                    html += `</div>
                    
                    <div class="col-md-6">
                        <p class="hotel-name"><a href="` + "/single-hotel?isCity=false" + "&location=" + locationId + "&check_in=" + packageGlobalCheckIn + "&nights=" + packageGlobalNights + "&roomCriteria=" + myRooms + `" target="_blank">` + hotelName + `</a></p>
                        <p class="hotel-stars">` + hotelStars + ` </p>
                        <p class="hotel-city">` + hotelCity + " / " + hotelCountry + ` </p>
                        <p class="hotel-address">` + hotelAddress + ` </p>
                    </div>
                    <div class="col-md-12">
                    <button type="button" class="btn btn-primary show-price-list"> CJENOVNIK </button>
                        <div class="hotel-price-wrapper">`;
                        if (hotelOffers.length){
                            $.each(hotelOffers, function(i){
                                html += `<div class="room-number"><p><b>Soba broj: ` + (i+1) + `</b><br><span>` + hotelOffers[i].rooms[0].roomName + `</span></p> <p> Opis: <span>` + hotelOffers[i].rooms[0].boardName + `</span></p>`;
                                html += `<p>Cijena: <span>` + hotelOffers[i].price.amount + `</span> <span>` + hotelOffers[i].price.currency + `</span></p><a href="#" class="selectThisRoom"> ODABERI </a></div>`;
                            });
                        }  
               html += `</div>
                     </div>
                </div>
            </div>
            <div class="col-md-3 hotel-details-wrapper">
            <p class="hotel-price"><b>Najniža cijena: </b>`+ hotelPrice + " " + hotelCurrency + `</p>
            <p><b>Sadržaji</b></p>
            <ul>`;
                 if (hotelFacilities !== undefined && hotelFacilities.length) {
                    $.each(hotelFacilities, function(i){
                        html += `<li>` + hotelFacilities[i].name + `</li>`  ;
                    });
                } else {
                    html += `<li>Dodatni sadržaji nisu uneseni</li>`  ;
                }
              // html += `</ul><div class="hotel-reserve"><button type="button" class="btn btn-primary"> REZERVIŠI </button></div>
              html +=` </ul>
            </div>
         </div>`;
    }
    html += 
    `<div id="pagination_package_hotels">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item ${currentPageData.page === 1 ? 'disabled' : ''}">
              <a class="page-link" href="javascript:generateHotelListPackage(false, ${currentPageData.pre_page})" tabindex="-1"><span aria-hidden="true">&laquo;</span></a>
            </li>`;
            if(currentPageData.pre_page != 1 && currentPageData.pre_page != null) {
                html +=
                `<li class="page-item"><a class="page-link" href="javascript:generateHotelListPackage(false, 1)">1</a></li>
                <li class="page-item"><span>...</span></li>`;
            } // use curly braces in `` for short js usage
            html += 
            `<li class="page-item ${currentPageData.page === 1 ? 'd-none' : ''}"><a class="page-link" href="javascript:generateHotelListPackage(false, ${currentPageData.pre_page})">${currentPageData.pre_page}</a></li>
            <li class="page-item active" style="pointer-events:none;"><a class="page-link" href="#">${currentPageData.page}</a></li>
            <li class="page-item ${currentPageData.next_page == null ? 'd-none' : ''}"><a class="page-link" href="javascript:generateHotelListPackage(false, ${currentPageData.next_page})">${currentPageData.next_page}</a></li>`;
            if(currentPageData.next_page != currentPageData.total_pages && currentPageData.next_page != null) {
                html +=
                `<li class="page-item"><span>...</span></li>
                <li class="page-item"><a class="page-link" href="javascript:generateHotelListPackage(false, ${currentPageData.total_pages})">${currentPageData.total_pages}</a></li>`;
            }
            html += 
            `<li class="page-item ${currentPageData.next_page == null ? 'disabled' : ''}">
              <a class="page-link" href="javascript:generateHotelListPackage(false, ${currentPageData.next_page})"><span aria-hidden="true">&raquo;</span></a>
            </li>
          </ul>
        </nav>
    </div>`
    $('#package_list').html(html);
    
    if(firstSearch) {
        let typeOfServiceHtml = '';
        for(let i = 0; i < packageGlobalTypesOfService.length; i++) {
            typeOfServiceHtml += `<div class="form-check">
                  <input class="form-check-input packageFilter packageHotelServiceTypeFilter" type="checkbox" id="ae_api_hotel_service_filter_` + i + `" value="` + packageGlobalTypesOfService[i] + `">
                  <label class="form-check-label" for="ae_api_hotel_service_filter_` + i + `">` + packageGlobalTypesOfService[i] + `</label>
                </div>`;
        }
        $('#package_type_of_service').html(typeOfServiceHtml);
    }
    removeLoader();
    scrollToTargetAdjusted('package_list'); 
}