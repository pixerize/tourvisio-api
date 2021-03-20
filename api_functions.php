<?php

function departureAutocomplete($data)
{
    $productType = $data["ProductType"];
    $query = $data["Query"];
    $serviceType = $data["ServiceType"];
    $culture = $data["Culture"];
    $currency = $data["currency"];
    $token = $_COOKIE['api_token'];
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
    global $api_token;
    $productType = $data["ProductType"];
    $query = $data["Query"];
    $serviceType = $data["ServiceType"];
    $culture = $data["Culture"];
    $currency = $data["currency"];
    $departureLocations = $data["DepartureLocations"];
    
    $token = $_COOKIE['api_token'];
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