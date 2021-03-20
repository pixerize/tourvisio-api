<?php
/**
 * Plugin name: AE API
 * Description: Get information from external APIs in WordPress
 * Author: Tarik Husovic and Djordje Sajlovic
 * version: 1.0.0
 * text-domain: ae-api
 */

// If this file is access directly, abort!!!
defined('ABSPATH') or die('Unauthorized Access');
include 'api_functions_flight.php';
include 'api_functions_hotel.php';
include 'api_functions_package.php';

function addNeededPages() {
    $my_post = array(
      'post_title'    => wp_strip_all_tags( 'Single Hotel' ),
      'post_status'   => 'publish',
      'post_author'   => 1,
      'post_type'     => 'page',
    );
    wp_insert_post( $my_post );
    $my_post = array(
      'post_title'    => wp_strip_all_tags( 'Multiple Hotels' ),
      'post_status'   => 'publish',
      'post_author'   => 1,
      'post_type'     => 'page',
    );
    wp_insert_post( $my_post );
}

register_activation_hook(__FILE__, 'addNeededPages');

//add js and css file
add_action('wp_enqueue_scripts', 'ae_api_js_init');
//get api token
add_action('init', 'ae_get_token');

add_action('wp_ajax_nopriv_ae_api_call', 'ajax_handler');
add_action('wp_ajax_ae_api_call', 'ajax_handler');

add_filter( 'http_request_timeout', 'wp9838c_timeout_extend' );

function wp9838c_timeout_extend($time)
{
    return 60;
}

//client's api url
global $url;
$url = "api_url";

function ae_get_token()
{
    global $url;
    $thisUrl = "authenticationservice/login";
    $arguments = array(
        'method' => 'POST',
        'body' => json_encode(array(
            "Agency" => "username",
            "User" => "username",
            "Password" => "password"
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);

    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        echo "Something went wrong: $error_message";
    } else {
        $response = json_decode(wp_remote_retrieve_body($response));
        if($response != '') {
            setcookie("api_token", $response->body->token, time()+3600, COOKIEPATH, COOKIE_DOMAIN);
            return $response->body->token;
        } else {
            
        }
    }
}

function ae_api_js_init()
{
    wp_enqueue_style('bootstrap', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css', 5.0);
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css', 5.15);
    wp_enqueue_style('appcss', plugins_url('css/app.css', __FILE__), array(), time());
    wp_enqueue_style('lightslider-css', plugins_url('css/lightslider.css', __FILE__), array(), 1.0);


    wp_enqueue_script('jQuery', "https://code.jquery.com/jquery-2.2.4.min.js");
    wp_enqueue_script('bootstrapJS', "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js");
    wp_enqueue_script('momentJS', "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js");
    wp_enqueue_script('lightslider-js', plugins_url('js/lightslider.js', __FILE__));
    wp_enqueue_script('ae-api-js', plugins_url('js/app.js', __FILE__), array(), time());
    wp_enqueue_script('flight-functions-js', plugins_url('js/flight_functions.js', __FILE__), array(), time());
    wp_enqueue_script('hotel-functions-js', plugins_url('js/hotel_functions.js', __FILE__), array(), time());
    wp_enqueue_script('package-functions-js', plugins_url('js/package_functions.js', __FILE__), array(), time());
    wp_enqueue_script('date-pickerui-js', plugins_url('js/datepicker-ui.js', __FILE__), array(), time());
    wp_enqueue_script('date-picker-js', 'https://cdnjs.cloudflare.com/ajax/libs/datepicker/1.0.10/datepicker.min.js', 1.1);

    wp_localize_script('ae-api-js', 'the_ajax_script', array('ajaxurl' => admin_url('admin-ajax.php')));
}

function ajax_handler()
{
    $methodName = $_POST["MethodName"];
    call_user_func_array($methodName, array($_POST['params']));
    die();
}


// register shortcode to show in frontend
function hotel_search(){
    $output = '<div class="container">
    <div role="form" id="multisearch" class="ae-search">
        <div class="page-loading">
            <svg class="ae-icon-loader" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
            c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
            c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
            L82,35.7z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            </svg>
        </div>  
        <div class="row">
            <div class="col-xl-4 col-md-4 col-sm-12">
                <label>Destinacija</label>
                <input class="form-control" id="hotel_destination" type="text" autocomplete="off">
                <div id="hotel_destination_results"></div>
            </div>
            <div class="col-xl-4 col-md-4 col-sm-12">
                <label>Check In Date</label>
                <input class="form-control" id="hotel_check_in" type="text" disabled autocomplete="off">
            </div>
            <div class="col-xl-4 col-md-4 col-sm-12">
                <label>Nights</label>
                <input class="form-control" id="hotel_nights" type="number" step="1" min="1" value="1" disabled autocomplete="off">
            </div>
        </div>
    
        <div class="row hotel_guests hotel_guests_first">
            <div class="col-xl-5 col-md-5 col-sm-12">
                <label>Odrasli</label>
                <input class="form-control adultSelect" min="0" type="number" step="1" disabled value="1">
            </div>
            <div class="col-xl-4 col-md-5 col-sm-8">
                <label>Djeca</label>
                <input class="form-control childernSelect" min="0" type="number" step="1" disabled value="0" max="5">
                <small>Maksimalan broj djece je 5!</small>
            </div>
            <div class="col-xl-3 col-sm-2 col-md-2 d-flex align-self-center add_remove_btn_hotel">
                <button disabled id="addHotelPassenger" type="button" class="btn btn-outline-primary btn-sm" onclick="addHotelPassenger()">
                    <i class="fas fa-plus"></i> Dodaj Sobu
                </button>
            </div>
        </div>
        <div class="row mt-1">
            <div class="col-xl-11 col-sm-0 col-md-0></div>
            <div class="col-xl-1 col-sm-12 col-md-12">
                <div class="form-group search-wrapper">
                    <button type="button" id="btn-hotel-search" class="btn btn-primary">Pretraga</button>
                </div>
            </div>
        </div>
    </div>  
    <div id="my_hotels_list"></div>
  </div>';

    return $output;
}

function flight_search() {
    
    return '<div class="container ae-wrapper">
                <div role="form" id="planesearch" class="ae-plane-search">
                    <div class="page-loading">
                        <svg class="ae-icon-loader" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                        <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
                        c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
                        </path>
                        <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
                        c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
                        </path>
                        <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
                        L82,35.7z">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
                        </path>
                        </svg>
                    </div>  
                <div class="row">
                    <div class="col-md-3">
                        <label>Departure</label>
                        <input class="form-control" id="plane_departure" autocomplete="off">
                        <div id="plane_departure_results"></div>
                    </div>
                    <div class="col-md-2">
                        <div class="plane-round-trip">
                        <label class="ae-block">Round Trip</label>
                        <label><input type="radio" value="1" name="plane_round_trip">No</label>
                        <label><input type="radio" value="2" name="plane_round_trip">Yes</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label>Destination</label>
                        <input class="form-control" id="plane_arrival" autocomplete="off">
                        <div id="plane_arrival_results"></div>
                    </div>
                    <div class="col-md-2">
                        <label>Check In </label>
                        <input class="form-control" id="plane_check_in" type="text" disabled="disabled">
                    </div>
                    <div class="col-md-2 d-none" id="flight_nights_col">
                        <label>Check Out</label>
                        <input class="form-control" id="num_of_nights" type="text" disabled="disabled">
                    </div>
                </div>
                <div class="row d-none flightPassengerRow" id="passanger_row_first">
                    <div class="col-xl-3 col-sm-6 col-md-6">
                    <label>Vrsta putnika</label>
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
                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="addFlightPassenger()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="row mt-1">
                    <div class="col-xl-1 col-sm-12 col-md-12">
                        <div class="form-group search-wrapper">
                            <button type="button" id="btn-search" class="btn btn-primary">Pretraga</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="my_flights_list"></div>
        </div>      
        ';
}

function package_search() {
    return '<div class="container">
    <div role="form" id="packageSearch" class="ae-search">
        <div class="page-loading">
            <svg class="ae-icon-loader" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
            c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
            c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
            L82,35.7z">
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
            </path>
            </svg>
        </div>  
        <div class="row">
            <div class="col-xl-3 col-md-3 col-sm-12">
                <label>Polazak</label>
                <select class="form-control" id="package_departure"></select>
            </div>
            <div class="col-xl-3 col-md-3 col-sm-12">
                <label>Destinacija</label>
                <select class="form-control" id="package_arrival"></select>
            </div>
            <div class="col-xl-3 col-md-3 col-sm-12">
                <label>Check In</label>
                <input class="form-control" id="package_check_in" type="text" disabled="disabled" autocomplete="off">
            </div>
            <div class="col-xl-3 col-md-3 col-sm-12">
                <label>Noći</label>
                <select class="form-control" id="package_nights" disabled="disabled"></select>
            </div>
        </div>
        <div class="row package_guests package_guests_first">
            <div class="col-xl-5 col-md-5 col-sm-12">
                <label>Odrasli</label>
                <input class="form-control adultSelect" min="0" type="number" step="1" disabled value="1">
            </div>
            <div class="col-xl-4 col-md-5 col-sm-8">
                <label>Djeca</label>
                <input class="form-control childrenSelect" min="0" type="number" step="1" disabled value="0" max="5">
                <small>Maksimalan broj djece je 5!</small>
            </div>
            <div class="col-xl-3 col-sm-2 col-md-2 d-flex align-self-center add_remove_btn_hotel">
                <button disabled id="addPackagePassenger" type="button" class="btn btn-outline-primary btn-sm" onclick="addPackagePassenger()">
                    <i class="fas fa-plus"></i> Dodaj Sobu
                </button>
            </div>
        </div>
        <div class="row mt-1">
            <div class="col-xl-1 col-sm-12 col-md-12">
                <div class="form-group search-wrapper">
                    <button type="button" id="btn-package-search" class="btn btn-primary" disabled="disabled">Pretraga</button>
                </div>
            </div>
        </div>
    </div>
    <div id="package_results" class="mt-5 pt-5">
        <div class="row">
            <div id="package_filters" class="col-sm-12 col-md-12 col-xl-3 d-none">
                <div>
                    <h5>Cijena</h5>
                    <div class="d-flex mb-2">
                        <label for="ae_api_price_filter_from" class="form-label me-2">Od:</label>
                        <div class="ae_api_price_filter" id="ae_api_price_filter_from_val"><span></span> BAM</div>
                    </div>
                    <input type="range" class="form-range packageFilter" step="0.01" min="0" max="5" id="ae_api_price_filter_from">
                    <div class="d-flex my-2">
                        <label for="ae_api_price_filter_to" class="form-label me-2">Do:</label>
                        <div class="ae_api_price_filter" id="ae_api_price_filter_to_val"><span></span> BAM</div>
                    </div>
                    <input type="range" class="form-range packageFilter" step="0.01" min="0" max="5" id="ae_api_price_filter_to">
                    <h5>Zvijezde</h5>
                    <div class="form-check">
                      <input class="form-check-input packageFilter" type="checkbox" name="ae_api_star_filter" id="ae_api_star_filter_5" val="5">
                      <label class="form-check-label" for="ae_api_star_filter_5">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input packageFilter" type="checkbox" name="ae_api_star_filter" id="ae_api_star_filter_4" val="4">
                      <label class="form-check-label" for="ae_api_star_filter_4">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input packageFilter" type="checkbox" name="ae_api_star_filter" id="ae_api_star_filter_3" val="3">
                      <label class="form-check-label" for="ae_api_star_filter_3">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input packageFilter" type="checkbox" name="ae_api_star_filter" id="ae_api_star_filter_2" val="2">
                      <label class="form-check-label" for="ae_api_star_filter_2">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input packageFilter" type="checkbox" name="ae_api_star_filter" id="ae_api_star_filter_1" val="1">
                      <label class="form-check-label" for="ae_api_star_filter_1">
                        <i class="fas fa-star"></i>
                      </label>
                    </div>
                    <h5>Vrsta Usluge</h5>
                    <div id="package_type_of_service"></div>
                </div>
            </div>
            <div id="package_list" class="col-sm-12 col-md-12 col-xl-9"></div>
        </div>
    </div>
  </div>';
}

function hotel_results() {
    return '<div class="container hotel-results-wrapper">
        <div class="page-loading ae-on">
        <svg class="ae-icon-loader" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
        c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
        c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
        L82,35.7z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        </svg>
    </div>  
    <div class="row">
        <div class="col-md-3"><h5>Filter</h5></div>
        <div class="col-md-9"><h5>Rezultati pretrage</h5>
        <div id="my_hotels_list"></div>
        </div>
    </div>
    </div>';
}

function hotel_single_results() {
    return '<div class="container hotel-results-wrapper">
        <div class="page-loading ae-on">
        <svg class="ae-icon-loader" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
        c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
        c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
        L82,35.7z">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
        </path>
        </svg>
    </div>  
    <div class="row">
       
        <div class="col-md-8"><h5 class="single-hotel-name"></h5>

            <div id="my-hotel-result"></div>
        </div>
         <div class="col-md-4" id="my-hotel-details"><h5></h5></div>
    </div>
    </div>';
}
add_shortcode('hotel_search', 'hotel_search');
add_shortcode('hotel_results', 'hotel_results');
add_shortcode('hotel_single_results', 'hotel_single_results');
add_shortcode('plane_search', 'flight_search');
add_shortcode('package_search', 'package_search');
add_shortcode('package_search', 'package_search');