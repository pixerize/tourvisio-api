let departureResultsGlobal = '';
let returnResultsGlobal = '';
let foundFlightsGlobal = [];
let selectedDepartureFlightGlobal = {};
let selectedReturnFlightGlobal = {};
let availableDatesFlightGlobal = [];
let returnFlight = '';

function available(date) {
    let tempMonth = (date.getMonth() + 1).toString();
    let tempDay = date.getDate().toString();
    if (tempMonth.length < 2) { tempMonth = "0" + tempMonth }
    if (tempDay.length < 2) { tempDay = "0" + tempDay }
    dmy = date.getFullYear() + "-" + tempMonth + "-" + tempDay;
    if ($.inArray(dmy, availableDatesFlightGlobal) != -1) {
        return [true, "", "Available"];
    } else {
        return [false, "", "unAvailable"];
    }
}

function departureAutocomplete(query) {
    let myParams = {
        ProductType: "Flight",
        Query: query,
        ServiceType: 1,
        Culture: "en-US",
        currency: "BAM"
    }
    var data = makeCallData(myParams, "departureAutocomplete");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let resultsDiv = $('#plane_departure_results');
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        let results = body.body.items;
        if (results.length) {
            for (let i = 0; i < results.length; i++) {
                let tempResult = '';
                if (results[i].city) {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].city.id + "'>" + results[i].city.name + "</p>"
                } else {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].airport.id + "'>" + results[i].airport.name + "</p>"
                }
                resultsDiv.append(tempResult);
            }
        } else {
            resultsDiv.html('No results found!');
            removeResults();
        }
        resultsDiv.css('display', 'block')
        removeLoader();
    });
}

function arrivalAutocomplete(query, type, id, is_round) {
    let myParams = {
        ProductType: "Flight",
        Query: query,
        DepartureLocations: [
            {
                type: type,
                id: id
            }
        ],
        ServiceType: is_round,
        Culture: "en-US",
        currency: "BAM"
    }
    var data = makeCallData(myParams, "arrivalAutocomplete");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let resultsDiv = $('#plane_arrival_results');
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        let results = body.body.items;
        if (results.length) {
            for (let i = 0; i < results.length; i++) {
                let tempResult = '';
                if (results[i].city) {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].city.id + "'>" + results[i].city.name + "</p>"
                } else {
                    tempResult = "<p data-type='" + results[i].type + "' data-id='" + results[i].airport.id + "'>" + results[i].airport.name + "</p>"
                }
                resultsDiv.append(tempResult);
            }
        } else {
            resultsDiv.html('No results found!');
            removeResults();
        }
        resultsDiv.css('display', 'block')
        removeLoader();
    });
}

function checkInDatesFlight() {
    addLoader();
    let departureField = $('#plane_departure');
    let type = departureField.attr('field_type');
    let id = departureField.attr('field_id');
    let myParams = {
        ProductType: 3,
        DepartureLocations: [
            {
                Type: type,
                Id: id
            }
        ],
        ArrivalLocations: []
    }
    var data = makeCallData(myParams, "checkInDatesFlight");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let body = JSON.parse(response).body;
        body = JSON.parse(body);
        let dates = body.body.dates;
        if (dates.length) {
            availableDatesFlightGlobal = [];
            for (let i = 0; i < dates.length; i++) {
                availableDatesFlightGlobal.push(aeApiDateFormat(dates[i], 'sql'));
            }
            $("#plane_check_in").datepicker({
                dateFormat: 'dd-mm-yy',
                onSelect: function (dateStr) {
                    var min = $(this).datepicker('getDate'); // Get selected date
                    $("#num_of_nights").datepicker('option', 'minDate', min || '0'); // Set other min, default to today
                    let val = $('#plane_check_in').val();
                    let firstRow = $("#passanger_row_first");
                    if (val != "") {
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

                },
                beforeShowDay: available
            });
            $("#num_of_nights").datepicker({
                dateFormat: 'dd-mm-yy',
                beforeShowDay: available
            });

        }
        removeLoader();
    });
}

function addFlightPassenger() {
    let html = `<div class="row flightPassengerRow addedFlightPassengerRow">
            <div class="col-xl-3 col-sm-6 col-md-6">
                <label>Passenger Type</label>
                <select class="form-control">
                    <option value="1">Odrasli</option>
                    <option value="2">Dijete</option>
                    <option value="3">Dojenče</option>
                    <option value="4">Stariji</option>
                    <option value="5">Student</option>
                    <option value="6">Mladi</option>
                    <option value="7">Vojska</option>
                    <option value="8">Nastavnik</option>
                </select>
            </div>
            <div class="col-xl-2 col-sm-5 col-md-5">
                <label>Passengers</label>
                <input type="number" class="form-control" step="1" value="1" min="1">
            </div>
            <div class="col-xl-1 col-sm-1 col-md-1 d-flex align-self-center">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeFlightPassenger(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    let addedRows = $('.addedFlightPassengerRow');
    if (addedRows.length) {
        addedRows.last().after(html);
    } else {
        let firstPassengerRow = $('#passanger_row_first');
        firstPassengerRow.after(html);
    }
}

function removeFlightPassenger(el) {
    $(el).parent().parent().remove();
}

function flightSearch(service_type, checkIn, dep_id, dep_type, arr_id, arr_type, passengers, num_of_nights) {
    addLoader();
    resetFlightGlobals();
    let myParams = {
        ServiceTypes: [
            service_type
        ],
        CheckIn: checkIn,
        DepartureLocations: [
            {
                id: dep_id,
                type: dep_type
            }
        ],
        ArrivalLocations: [
            {
                id: arr_id,
                type: arr_type
            }
        ],
        Culture: "en-US",
        currency: "BAM",
        Passengers: passengers
    }

    if (service_type == 2) {
        myParams.ArrivalLocations[0].provider = 3;
        myParams.Night = num_of_nights;
    }
    var data = makeCallData(myParams, "searchFlight");
    jQuery.post(the_ajax_script.ajaxurl, data, function (response) {
        let body = JSON.parse(response).body;
        if (body != undefined) {
            body = JSON.parse(body);
            console.log(body);
            if (body.header.success) {
                //flight results
                let searchType = body.body.details.flightSearchType;
                let numberOfFlights = body.body.flights;
                numberOfFlights.sort(sortByPrice);
                foundFlightsGlobal = numberOfFlights;
                let html = '';
                for (let i = 0; i < numberOfFlights.length; i++) {
                    let currentFlight = numberOfFlights[i].items[0];

                    let airlineId = currentFlight.airline.id;
                    let departureAirportId = currentFlight.departure.airport.id;
                    let logo = currentFlight.airline.logo;
                    let name = currentFlight.airline.name;
                    let date = currentFlight.departure.date;
                    let price = body.body.flights[i].offers[0].price.amount + " " + body.body.flights[i].offers[0].price.currency;
                    let duration = currentFlight.duration;
                    let arrivalAirportId = currentFlight.arrival.airport.id;
                    let arrivalDate = currentFlight.arrival.date;
                    let rountTripText = '';

                    if (service_type == 1) {
                        rountTripText = '<p>Jednosmjerno putovanje</p>';
                    } else {
                        rountTripText = '<p>Povratno putovanje</p>';
                    }

                    let currentOffers = body.body.flights[i].offers;
                    let is_same_date = new Date(checkIn).getTime() === new Date(aeApiDateFormat(arrivalDate, 'sql')).getTime();
                    for (let j = 0; j < currentOffers.length; j++) {
                        html = `<div class="row search-result-wrapper" data-offer-number="` + i + `-` + j + `">
                        <div class="col-md-3 ae-results-logo-time">
                            <img src="http://service.avioexpress.ba/media` + logo + `" alt="airline logo">
                            <p>Polazak: ` + aeApiDateFormat(date, 'full') + `</p>
                            <p>Dolazak: ` + aeApiDateFormat(arrivalDate, 'full') + `</p>
                            <p>Kompanija: ` + name + `</p>
                        </div>
                        <div class="col-md-3 flight-time">
                            <p>Trajanje putovanja: ` + minutesToHours(duration) + ` </p>
                            <span>` + departureAirportId + `</span> - <span>` + arrivalAirportId + ` </span>
                            <p>` + rountTripText + `</p>
                        </div>
                        <div class="col-md-3">`;
                        if (currentOffers[j].hasBrand) {
                            html += `<p>Klasa: <b>` + currentOffers[j].flightBrandInfo.name + `</b></p><ul>`;
                            for (let k = 0; k < currentOffers[j].flightBrandInfo.features.length; k++) {
                                html += `<li>` + currentOffers[j].flightBrandInfo.features[k].commercialName + `</li>`
                            }
                        } else {
                            html += `<p>Klasa: <b>` + currentOffers[j].flightClassInformations[0].name + `</b></p><ul>`;
                        }
                        html += `</ul></div>
                        <div class="col-md-3 ae-result-price-round-trip"> <p> Cijena `
                            + currentOffers[j].price.amount + " " + currentOffers[j].price.currency + ` </p> <button type="button"
                        onclick="selectFlight(` + i + `,` + j + `,` + service_type + `,` + is_same_date + `)" id="btn-reserve" class="btn btn-primary">Odaberi</button></div>
                        </div>`;
                        if (is_same_date) {
                            departureResultsGlobal += html;
                        } else {
                            returnResultsGlobal += html;
                        }
                    }
                }
                removeLoader();
                $('#my_flights_list').html(departureResultsGlobal);
            } else {
                removeLoader();
                let errorMessage = `<div class="row search-result-wrapper"> <div class="col-md-12"> ` + body.header.messages[0].message + `</div></div>`;
                $('#my_flights_list').html(errorMessage);
            }
        } else {
            removeLoader();
            let errorMessage = `<div class="row search-result-wrapper"> <div class="col-md-12">Timeout error! Please try again.</div></div>`;
            $('#my_flights_list').html(errorMessage);
        }
    });
}

// function selectFlight(index, offerNumber, round_trip, is_departure) {
//     if (is_departure) {
//         selectedDepartureFlightGlobal = foundFlightsGlobal[index];
//         if (round_trip == 1) {
//             previewSelectedFlights(round_trip);
//         } else {
//             $('#my_flights_list').html(returnResultsGlobal);
//         }
//     } else {
//         selectedReturnFlightGlobal = foundFlightsGlobal[index];
//         previewSelectedFlights(round_trip);
//     }
// }


function selectFlight(index, offerNumber, round_trip, is_departure) {

    let flightList = $('#my_flights_list');

    if ($('#btn-reserve').hasClass('returnFlight')) {
        returnFlight = $('[data-offer-number="' + index + '-' + offerNumber + '"]').clone();
    }

    if (returnFlight != '') {        
        flightList.html(currentOffer2);
        flightList.prepend('<h4>Polazni let</h4>');
        flightList.append('<h4>Povratni let</h4>');
        flightList.append(returnFlight);
        flightList.append('<row><div class="md-col-3"><button class="btn btn-primary reserve-ticket ae-api-popup">Rezervisi</button></div></row>');

        $('.search-result-wrapper').each(function () {
            $(this).find($('#btn-reserve')).remove();
            $(this).find($('.flight-time p:nth-child(5)').text(''));
        });
        returnFlight = '';
        currentOffer2 = '';
    } else {
        currentOffer2 = $('[data-offer-number="' + index + '-' + offerNumber + '"]').clone();
        if (round_trip == 1) {
            $('#my_flights_list').html(currentOffer2);
            $('#btn-reserve').remove();
            currentOffer2.append('<row><div class="md-col-3"><button class="btn btn-primary reserve-ticket ae-api-popup">Rezervisi</button></div></row>');
            $('.reserve-ticket').click(function (e) {
                e.preventDefault();
            });
        } else {
            alert('Odabrali ste polazni let, molimo odaberite povratni');
            $('#my_flights_list').html(returnResultsGlobal);
            $('#btn-reserve').addClass('returnFlight');
        }
    }
}

$(function () {
    $(document).on("click", ".reserve-ticket", function () {
        let price = [];
        $('.search-result-wrapper').each(function () {
            
            currentPrice = $(this).find('.ae-result-price-round-trip p').text().replace(/[^0-9\.]+/g, "");
            price.push(Number(currentPrice));

        });

        
        
        sumPrice = (price[0] + price[1]).toFixed(2);
        roundTrip = $("input[name=your-price]").val();
        cityDep = $("#plane_departure").val();
        cityArr = $("#plane_arrival").val();
        dateDep = $("#plane_check_in").val();
        dateArr = $("#num_of_nights").val();

        $("input[name=round-trip]").val(roundTrip);
        $("input[name=city-arr]").val(cityArr);
        $("input[name=city-dep]").val(cityDep);
        $("input[name=date-arr]").val(dateArr);
        $("input[name=date-dep]").val(dateDep);

        $("input[name=your-price]").val(sumPrice + " BAM");
        disableForm($("#popmake-6537 .column input"));
    });
});


function previewSelectedFlights(service_type) {
    let totalAmount = 0;
    let currentFlight = selectedDepartureFlightGlobal.items[0];
    let airlineId = currentFlight.airline.id;
    let departureAirportId = currentFlight.departure.airport.id;
    let logo = currentFlight.airline.logo;
    let name = currentFlight.airline.name;
    let date = currentFlight.departure.date;
    let currency = selectedDepartureFlightGlobal.offers[0].price.currency;
    totalAmount += selectedDepartureFlightGlobal.offers[0].price.amount;
    let duration = currentFlight.duration;
    let arrivalAirportId = currentFlight.arrival.airport.id;
    let arrivalDate = currentFlight.arrival.date;

    html = `<div class="row search-result-wrapper">
        <div class="col-md-3 ae-results-logo-time">
            <img src="http://service.avioexpress.ba/media` + logo + `" alt="airline logo">
            <p>Polazak: `+ aeApiDateFormat(date, 'full') + `</p>
            <p>Dolazak: `+ aeApiDateFormat(arrivalDate, 'full') + `</p>
            <p>Kompanija: `+ name + `</p>
        </div>
        <div class="col-md-3 flight-time">
            <p>Trajanje putovanja: `+ minutesToHours(duration) + ` </p>
            <span>`+ departureAirportId + `</span> - <span>` + arrivalAirportId + ` </span>
        </div>
        <div class="col-md-3">` + ` </div>`;
    if (service_type == 1) {
        html += `<div class="col-md-3 ae-result-price-round-trip"> <p> Cijena ` + totalAmount + ` ` + currency + `</p>
                <button type="button" id="btn-reserve" class="btn btn-primary">Kupi</button>`
    }
    html += `</div></div>`;
    if (service_type != 1) {
        let currentFlight2 = selectedReturnFlightGlobal.items[0];
        let airlineId2 = currentFlight2.airline.id;
        let departureAirportId2 = currentFlight2.departure.airport.id;
        let logo2 = currentFlight2.airline.logo;
        let name2 = currentFlight2.airline.name;
        let date2 = currentFlight2.departure.date;
        totalAmount += selectedReturnFlightGlobal.offers[0].price.amount;
        let duration2 = currentFlight2.duration;
        let arrivalAirportId2 = currentFlight2.arrival.airport.id;
        let arrivalDate2 = currentFlight2.arrival.date;

        html += `<div class="row search-result-wrapper">
            <div class="col-md-3 ae-results-logo-time">
                <img src="http://service.avioexpress.ba/media` + logo2 + `" alt="airline logo">
                <p>Polazak: `+ aeApiDateFormat(date2, 'full') + `</p>
                <p>Dolazak: `+ aeApiDateFormat(arrivalDate2, 'full') + `</p>
                <p>Kompanija: `+ name2 + `</p>
            </div>
            <div class="col-md-3 flight-time">
                <p>Trajanje putovanja: `+ minutesToHours(duration2) + ` </p>
                <span>`+ departureAirportId2 + `</span> - <span>` + arrivalAirportId2 + ` </span>
            </div>
            <div class="col-md-3">` + ` </div>
            <div class="col-md-3 ae-result-price-round-trip"> <p> Cijena ` + totalAmount + ` ` + currency + ` </p>
            <button type="button" id="btn-reserve" class="btn btn-primary">Kupi</button></div></div>`;
    }
    $('#my_flights_list').html(html);
    resetFlightGlobals();
}

// Remove results on change

function resetFlightGlobals() {
    departureResultsGlobal = '';
    returnResultsGlobal = '';
    foundFlightsGlobal = [];
    selectedDepartureFlightGlobal = {};
    selectedReturnFlightGlobal = {};
}
