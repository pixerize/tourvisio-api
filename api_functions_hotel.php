<?php

function arrivalAutocompleteHotel($data)
{
    $productType = $data["ProductType"];
    $query = $data["Query"];
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
            "Query" => $query
        ))
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}


function singleHotelResults($data)
{
    $culture = $data["culture"];
    $productType = $data["productType"];
    $ownerProvider = $data["ownerProvider"];
    $product = $data["product"];
    
    if (!isset($_COOKIE['api_token'])) {
        $token = ae_get_token();
    } else {
        $token = $_COOKIE['api_token'];
    }
    global $url;
    $thisUrl = "productservice/getproductInfo";
    $arguments = array(
        'method' => 'POST',
        'headers' => array(
            "Authorization" => "Bearer " . $token
        ),
        'body' => json_encode(array(
            "culture" => $culture,
            "productType" => $productType,
            "ownerProvider" => $ownerProvider,
            "product" => $product
        ))
    );
    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}


function searchHotel($data)
{
    $currency = $data["currency"];
    $culture = $data["culture"];
    $checkAllotment = $data["checkAllotment"];
    $checkStopSale = $data["checkStopSale"];
    $getOnlyDiscountedPrice = $data["getOnlyDiscountedPrice"];
    $productType = $data["productType"];
    if(isset($data["arrivalLocations"])) {
        $arrivalLocations = $data["arrivalLocations"];
    } else {
        $products = $data["Products"];
    }
    $roomCriteria = $data["roomCriteria"];
    $nationality = $data["nationality"];
    $checkIn = $data["checkIn"];
    $night = $data["night"];
    $myData = [
        "currency" => $currency,
        "culture" => $culture,
        "checkAllotment" => $checkAllotment,
        "checkStopSale" => $checkStopSale,
        "getOnlyDiscountedPrice" => $getOnlyDiscountedPrice,
        "productType" => $productType,
        "roomCriteria" => $roomCriteria,
        "nationality" => $nationality,
        "checkIn" => $checkIn,
        "night" => $night
    ];
    if(isset($arrivalLocations)) {
        $myData["arrivalLocations"] = $arrivalLocations;
    } else {
        $myData["Products"] = $products;
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
        'body' => json_encode($myData)
    );

    $response = wp_remote_post($url . $thisUrl, $arguments);
    echo json_encode($response);
    die();
}