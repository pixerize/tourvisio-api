<?php

function departureAutocomplete($data)
{
    $productType = $data["ProductType"];
    $query = $data["Query"];
    $serviceType = $data["ServiceType"];
    $culture = $data["Culture"];
    $currency = $data["currency"];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/getdepartureautocomplete";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $productType,
            "Query" => $query,
            "ServiceType" => $serviceType,
            "Culture" => $culture,
            "currency" => $currency,
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}


function arrivalAutocomplete($data)
{
    $productType = $data["ProductType"];
    $query = $data["Query"];
    $serviceType = $data["ServiceType"];
    $culture = $data["Culture"];
    $currency = $data["currency"];
    $departureLocations = $data["DepartureLocations"];
    
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/getarrivalautocomplete";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $productType,
            "Query" => $query,
            "DepartureLocations" => $departureLocations,
            "ServiceType" => $serviceType,
            "Culture" => $culture,
            "currency" => $currency,
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function checkInDatesFlight($data)
{
    $productType = $data["ProductType"];
    $departureLocations = $data["DepartureLocations"];
    
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/getcheckindates";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $productType,
            "DepartureLocations" => $departureLocations,
            "ArrivalLocations" => []
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function searchFlight($data)
{
    $serviceTypes = $data["ServiceTypes"];
    $departureLocations = $data["DepartureLocations"];
    $arrivalLocations = $data["ArrivalLocations"];
    $checkIn = $data["CheckIn"];
    $culture = $data["Culture"];
    $currency = $data["currency"];
    $passengers = $data['Passengers'];
    if(isset($data['Night'])) {
        $nights = $data['Night'];
    } else {
        $nights = null;
    }
    
    $apiBody = [
        "ProductType" => 3,
        "ServiceTypes" => $serviceTypes,
        "DepartureLocations" => $departureLocations,
        "ArrivalLocations" => $arrivalLocations,
        "CheckIn" => $checkIn,
        "Culture" => $culture,
        "currency" => $currency,
        "Passengers" => $passengers
    ];
    
    if($nights != null) {
        $apiBody['Night'] = $nights;
    }
    
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/pricesearch";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode($apiBody)
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}