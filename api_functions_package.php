<?php

function searchPackageHotelDetails($data) {
    $product = $data['product'];
    $myData = [
        "culture" => "en-US",
        "productType" => 2,
        "ownerProvider" => 1,
        "product" => $product
    ];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/GetProductInfo";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode($myData)
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function searchPackage($data) {
    $ProductType = $data["ProductType"];
    $ArrivalLocations = $data["ArrivalLocations"];
    $DepartureLocations = $data["DepartureLocations"];
    $RoomCriteria = $data["RoomCriteria"];
    $CheckIn = $data["CheckIn"];
    $Night = $data["Night"];
    $myData = [
        "ProductType" => $ProductType,
        "CheckIn" => $CheckIn,
        "Night" => $Night,
        "Products" => [],
        "DepartureLocations" => $DepartureLocations,
        "ArrivalLocations" => $ArrivalLocations,
        "IncludeSubLocations" => true,
        "RoomCriteria" => $RoomCriteria,
        "Currency" => 'BAM',
        "CheckAllotment" => false,
        "CheckStopSale" => false,
        "GetOnlyDiscountedPrice" => false,
        "Nationality" => "BA",
    ];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/PriceSearch";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode($myData)
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function getPackageNights($data) {
    $ProductType = $data['ProductType'];
    $DepartureLocations = $data['DepartureLocations'];
    $ArrivalLocations = $data['ArrivalLocations'];
    $CheckIn = $data['CheckIn'];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/GetNights";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $ProductType,
            "DepartureLocations" => $DepartureLocations,
            "ArrivalLocations" => $ArrivalLocations,
            "IncludeSubLocations" => true,
            "CheckIn" => $CheckIn
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function getPackageCheckInDates($data) {
    $ProductType = $data['ProductType'];
    $DepartureLocations = $data['DepartureLocations'];
    $ArrivalLocations = $data['ArrivalLocations'];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/GetCheckinDates";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $ProductType,
            "DepartureLocations" => $DepartureLocations,
            "ArrivalLocations" => $ArrivalLocations,
            "IncludeSubLocations" => true
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function getPackageDepartures($data) {
    $ProductType = $data['ProductType'];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/GetDepartures";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $ProductType
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}

function getPackageArrivals($data) {
    $ProductType = $data['ProductType'];
    $DepartureLocations = $data['DepartureLocations'];
    if(!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/GetArrivals";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "ProductType" => $ProductType,
            "DepartureLocations" => $DepartureLocations
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}