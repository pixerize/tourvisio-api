let hotelsFoundGlobal = [];
let hotelResults = '';
let hotelFacilities = [];
let HotelAddress = [];

function arrivalAutocompleteHotel(query) {
    addLoader();
    let myParams = {
        ProductType: 2,
        Query: query
    }
    var data = makeCallData(myParams, "arrivalAutocompleteHotel");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let resultsDiv = $('#hotel_destination_results');
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        let results = body.body.items;
        console.log(body);
        if (results.length) {
            for (let i = 0; i < results.length; i++) {
                let tempResult = '';
                if (results[i].type == 1) {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].city.id + "'>" + results[i].city.name + " - " + results[i].country.name + "</p>"
                } else {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].hotel.id + "'>" + results[i].hotel.name + "</p>"
                }
                resultsDiv.append(tempResult);
            }
        } else {
            resultsDiv.html('No results found!');
        }
        resultsDiv.css('display', 'block');
        removeLoader();
    });
}

function searchHotel(id, check_in, rooms, nights, isCity) {
    addLoader();
    let myRooms = encodeURIComponent(JSON.stringify(rooms));
    let baseUrl = window.location.host;
    if (isCity) {
        window.location.href = baseUrl + "/multiple-hotels?isCity=" + isCity + "&location=" + id + "&check_in=" + check_in + "&nights=" + nights + "&roomCriteria=" + myRooms;
    } else {
        window.location.href = baseUrl + "/single-hotel?isCity=" + isCity + "&location=" + id + "&check_in=" + check_in + "&nights=" + nights + "&roomCriteria=" + myRooms;
    }
}

function addHotelPassenger() {
    let html = `<div class="row hotel_guests hotel_guests_added">
                    <div class="col-xl-5 col-md-5 col-sm-12">
                        <label>Odrasli</label>
                        <input class="form-control adultSelect" min="0" type="number" step="1" value="1">
                    </div>
                    <div class="col-xl-4 col-md-5 col-sm-8">
                        <label>Djeca</label>
                        <input class="form-control childernSelect" min="0" type="number" step="1" value="0" max="5">
                    </div>
                    <div class="col-xl-3 col-sm-2 col-md-2 d-flex align-self-center add_remove_btn_hotel">
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeHotelPassenger(this)">
                        <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
    let addedRows = $('.childrenAges');
    let addedRows2 = $('.hotel_guests_added');
    if (addedRows.length) {
        addedRows.last().after(html);
    } else if (addedRows2.length) {
        addedRows2.last().after(html);
    } else {
        let firstPassengerRow = $('.hotel_guests_first');
        firstPassengerRow.after(html);
    }
}

function removeHotelPassenger(el) {
    let parentEl = $(el).parent().parent();
    let nextEl = parentEl.next();
    if (nextEl.hasClass('childrenAges')) {
        nextEl.remove();
    }
    parentEl.remove();
}

function previewMultipleHotels() {
    console.log(hotelsFoundGlobal);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const entries = urlParams.entries();
    let checkInDate = urlParams.get('check_in');
    let nights = urlParams.get('nights');
    let hotelRoomCriteria = encodeURIComponent(urlParams.get('roomCriteria'));

    let html = '';

    for (let i = 0; i < hotelsFoundGlobal.length; i++) {
        hotelname = hotelsFoundGlobal[i].name;
        hotelLocationId = hotelsFoundGlobal[i].id;
        hotelAddress = hotelsFoundGlobal[i].address;
        hotelImage = hotelsFoundGlobal[i].thumbnail;
        hotelPrice = hotelsFoundGlobal[i].offers[0].price.amount;
        hotelCurrency = hotelsFoundGlobal[i].offers[0].price.currency;
        hotelName = hotelsFoundGlobal[i].name;
        hotelStar = hotelsFoundGlobal[i].stars;
        hotelStars = "";
        for (stars = 0; stars < hotelStar; stars++) {
            hotelStars += '<i class="fa fa-star" aria-hidden="true"></i>';
        }
        hotelCity = hotelsFoundGlobal[i].city.name;
        hotelFacilities = hotelsFoundGlobal[i].facilities;
        hotelCountry = hotelsFoundGlobal[i].country.name;
        hotelOffers = hotelsFoundGlobal[i].offers;

        html = `<div class="row search-result-wrapper" data-offer-number="` + i + `">
                            <div class="col-md-9 hotel-address-wrapper">
                                <div class="row">
                                    <div class="col-md-6">
                                         <a href="#"><img class="hotel-image" src="http://service.avioexpress.ba/media` + hotelImage + `" alt="hotel image"></a>
                                   
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <p class="hotel-name"><a href="` + "/single-hotel?isCity=false" + "&location=" + hotelLocationId + "&check_in=" + checkInDate + "&nights=" + nights + "&roomCriteria=" + hotelRoomCriteria + `" target="_blank">` + hotelName + `</a></p>
                                        <p class="hotel-stars">` + hotelStars + ` </p>
                                        <p class="hotel-city">` + hotelCity + " / " + hotelCountry + ` </p>
                                        <p class="hotel-address">` + hotelAddress + ` </p>
                                    </div>
                                    <div class="col-md-12">
                                    <button type="button" class="btn btn-primary show-price-list"> CJENOVNIK </button>
                                        <div class="hotel-price-wrapper">`;
                                        if (hotelOffers.length) {
                                            $.each(hotelOffers, function (i) {
                                                html += `<div class="room-number"><p><b>Soba broj: ` + (i + 1) + `</b><br><span>` + hotelOffers[i].rooms[0].roomName + `</span></p> <p> Opis: <span>` + hotelOffers[i].rooms[0].boardName + `</span></p>`;
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
                            if (hotelFacilities) {
                                $.each(hotelFacilities, function (i) {
                                    html += `<li>` + hotelFacilities[i].name + `</li>`;
                                });
                            } else {
                                html += `<li>Dodatni sadržaji nisu uneseni</li>`;
                            }
                            // html += `</ul><div class="hotel-reserve"><button type="button" class="btn btn-primary"> REZERVIŠI </button></div>
                            html += ` </ul></div>
                                            </div>`;
                            hotelResults += html;
                        }

                        $("#my_hotels_list").html(hotelResults);
}

function previewSingleHotel() {
    console.log(hotelsFoundGlobal);
    addLoader();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const entries = urlParams.entries();
    let location_id = urlParams.get('location');
    let checkInDate = urlParams.get('check_in');
    let nights = urlParams.get('nights');
    let hotelRoomCriteria = urlParams.get('roomCriteria');
    let hotelChildren = 0;

    // console.log(checkInDate);
    // console.log(nights);
    console.log(hotelRoomCriteria);
    console.log(JSON.parse(hotelRoomCriteria));

    let hotelAdults = JSON.parse(hotelRoomCriteria)[0].adult;
    if (JSON.parse(hotelRoomCriteria)[0].childAges) {
        hotelChildren = JSON.parse(hotelRoomCriteria)[0].childAges.length;
    }

    let myParams = {
        culture: "en-US",
        productType: 2,
        ownerProvider: 2,
        product: location_id
        // roomCriteria: hotelRoomCriteria
    }
    for (const entry of entries) {
        if (entry[0].includes("roomCriteria")) {
            myParams[entry[0]] = JSON.parse(entry[1]);
        }
    }
    var data = makeCallData(myParams, "singleHotelResults");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        console.log(body);
        let singleHotelResult = body.body.hotel;
        let hotelName = singleHotelResult.name;
        hotelStar = singleHotelResult.stars;
        hotelStars = "";
        for (stars = 0; stars < hotelStar; stars++) {
            hotelStars += '<i class="fa fa-star" aria-hidden="true"></i>';
        }
        let hotelDescription = "";
        if (singleHotelResult.description.text != "") {
             hotelDescription = singleHotelResult.description.text;
        } else {
             hotelDescription = "Nema unesenog opisa.";
        }
        

        let hotelImages = [];
        htmlImages = '';
        htmlAddress = '';
        comma = ', ';
        
        if (hotelsFoundGlobal.length){
            hotelOffers = hotelsFoundGlobal[0].offers;
        } else {
            hotelOffers = [];
        }

        let singleHotelAddress = singleHotelResult.address.addressLines;
            $.each(singleHotelAddress, function(i) {
                HotelAddress.push(singleHotelAddress[i]);
            });

        $.each(HotelAddress, function (i) {
            if (i == (HotelAddress.length - 1)) { comma = ''; }
            htmlAddress += `${HotelAddress[i] + comma}`;
        });
        

        $('.single-hotel-name').text(hotelName + " ");
        $('.single-hotel-name').append(hotelStars);

        if(singleHotelResult.seasons !== undefined) {
            hotelImagesTotal = singleHotelResult.seasons[0].mediaFiles;
    
            if (hotelImagesTotal.length) {
                $.each(hotelImagesTotal, function (i) {
                    hotelImages.push(hotelImagesTotal[i].url);
                });
            }
            
            htmlImages += `<div class="ae-hotel-slider">
                <ul id="lightSlider">`;
    
            $.each(hotelImages, function (i) {
                    htmlImages += `<li data-thumb="http://service.avioexpress.ba/media` + hotelImages[i] + `"><img src="http://service.avioexpress.ba/media` + hotelImages[i] + `" />  </li>`;
            });
    
            htmlImages +=`    </ul>
            </div>`;
    
            $('#my-hotel-result').html(htmlImages);
            //single hotel slider 
    
            $(function () {
                $('#lightSlider').lightSlider({
                    gallery: true,
                    item: 1,
                    loop: true,
                    slideMargin: 0,
                    thumbItem: 9,
                    // autoWidth: true
                });
            });
        } else {
            $('#my-hotel-result').html('<img src="https://via.placeholder.com/840x460?text=Hotel%20Image%20Missing">');
        }


        let hotelInformations = `<h5 class="mt-4">Hotel Informations</h5> <p class="hotelAddress">Address: ${htmlAddress}</p> <p>Hotel Description: ${hotelDescription}</p>`;
        let reserveHotel = `<div class="container">
                                <div class="row">
                                    <div class="col-md-6">
                                        <label>Check In </label>
                                        <input class="form-control" id="single-hotel-date" type="text">
                                    </div>
                                    <div class="col-md-6">
                                        <label>Nights </label>
                                        <input id="single-hotel-night" type="text">
                                    </div>
                                    <div class="col-md-6">
                                        <label>Adults </label>
                                        <input id="single-hotel-adult" value="0" type="text">
                                    </div>
                                    <div class="col-md-6">
                                        <label>Children </label>
                                        <input id="single-hotel-children" value="0" type="text">
                                    </div>
                                </div>`;
            reserveHotel +=     `  <div class="col-md-12 mt-3">
                                                <button type="button" class="btn btn-primary show-price-list"> CJENOVNIK </button>
                                                    <div class="hotel-price-wrapper">`;
                                                    if (hotelOffers.length) {
                                                        $.each(hotelOffers, function (i) {
                                                            reserveHotel += `<div class="room-number"><p><b>Soba broj: ` + (i + 1) + `</b><br><span>` + hotelOffers[i].rooms[0].roomName + `</span></p> <p> Opis: <span>` + hotelOffers[i].rooms[0].boardName + `</span></p>`;
                                                            reserveHotel += `<p>Cijena: <span>` + hotelOffers[i].price.amount + `</span> <span>` + hotelOffers[i].price.currency + `</span></p><a href="#" class="selectThisRoom"> REZERVISI </a></div>`;
                                                        });
                                                    }
                                        reserveHotel += `</div>
                                    </div>`;
        reserveHotel +=      `</div>`; 

       
        $('#my-hotel-result').append(hotelInformations);
        $('#my-hotel-details').append(reserveHotel);
        $('#single-hotel-night').val(nights);
        $('#single-hotel-adult').val(hotelAdults);
        $('#single-hotel-children').val(hotelChildren);
        disable($('#single-hotel-night'));
        disable($('#single-hotel-adult'));
        disable($('#single-hotel-children'));

        $("#single-hotel-date").datepicker({
            dateFormat: 'dd-mm-yy',
            minDate: 0,
            defaultDate: aeApiDateFormat(checkInDate, 'd-m-y')
        }).datepicker('setDate', aeApiDateFormat(checkInDate, 'd-m-y'));


        removeLoader();
    });
}


//hotel_results

$(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const entries = urlParams.entries();
    if (urlParams.has('isCity')) {
        let isCity = urlParams.get('isCity');
        let location_id = urlParams.get('location');
        let checkIn = urlParams.get('check_in');
        let nights = urlParams.get('nights');
        let myParams = {
            currency: 'BAM',
            culture: 'en-US',
            checkAllotment: true,
            checkStopSale: true,
            getOnlyDiscountedPrice: false,
            productType: 2,
            checkIn: checkIn,
            nationality: 'BA',
            night: nights
        }
        for (const entry of entries) {
            if (entry[0].includes("roomCriteria")) {
                myParams[entry[0]] = JSON.parse(entry[1]);
            }
        }
        if (isCity == "true") {
            myParams.arrivalLocations = [
                {
                    id: location_id,
                    type: 2
                }
            ];
        } else {
            myParams.Products = [location_id]
        }
        var data = makeCallData(myParams, "searchHotel");
        jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
            let body = JSON.parse(response).body;
            body = JSON.parse(body);
            console.log(body);
            if (body.header.success) {
                removeLoader();
                hotelsFoundGlobal = body.body.hotels;
                if (isCity == "true") {
                    previewMultipleHotels();
                } else {
                    previewSingleHotel();
                }
            } else {
                removeLoader();
                previewSingleHotel();
            }
        });
    }
});


//opet hotel price list
$(document).on("click", ".show-price-list", function () {
    $(this).parent().find('.hotel-price-wrapper').slideToggle();
});



