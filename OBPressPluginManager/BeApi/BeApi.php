<?php

const BEAPI_URL = "https://beapi.omnibees.com/api/BE/";
// const BEAPI_URL = "https://beapi-cert.omnibees.com/api/BE/";



class BeApi
{

  public static $token; //beapi token 
  public static $chain_id;
  public static $hotel_id;

  public static function setToken()
  {
    self::$token = get_option('obpress_api_token');
  }

  public static function setChainId()
  {
    // self::$chain_id = $chain_id;
    self::$chain_id = get_option('chain_id');
  }

  public static function setHotelId()
  {
    // self::$hotel_id = $hotel_id;
    self::$hotel_id = get_option('hotel_id');
  }

  public static function post($endPoint, $data = null)
  {
    self::setToken();
    $token = self::$token;

    $curl = curl_init(); //start curl and curl options
    curl_setopt_array(
      $curl,
      array(
        CURLOPT_URL => BEAPI_URL . $endPoint, //endpoint for post
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => $data,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => array("Content-Type: application/json", "Authorization: Bearer " . $token),
      )
    );


    $response = curl_exec($curl); //response
    $info = curl_getinfo($curl);  //contains other details about connection
    $code = $info["http_code"]; //200 means http success

    curl_close($curl); //close the connection

    $result = new stdClass(); //result object
    $result->success = false;
    $result->message = "";
    $result->data = null;

    if($code==200){
        $response = json_decode($response);            
        $result->success = true;            
        $result->data = $response;

    }else{
        if($code==401 || $code==404){
            $result->message = json_decode($response)->Message;
        }
    }
    return $result;
  }

  public static function getEchoToken()
  {
    return sprintf(
      '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
      mt_rand(0, 0xffff),
      mt_rand(0, 0xffff),
      mt_rand(0, 0xffff),
      mt_rand(0, 0x0fff) | 0x4000,
      mt_rand(0, 0x3fff) | 0x8000,
      mt_rand(0, 0xffff),
      mt_rand(0, 0xffff),
      mt_rand(0, 0xffff)
    );
  }

  public static function createGUID()
  {

    // Create a token
    $token      = $_SERVER['HTTP_HOST'];
    $token     .= $_SERVER['REQUEST_URI'];
    $token     .= uniqid(rand(), true);

    // GUID is 128-bit hex
    $hash        = strtoupper(md5($token));

    // Create formatted GUID
    $guid        = '';

    // GUID format is XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX for readability    
    $guid .= substr($hash,  0,  8) .
      '-' .
      substr($hash,  8,  4) .
      '-' .
      substr($hash, 12,  4) .
      '-' .
      substr($hash, 16,  4) .
      '-' .
      substr($hash, 20, 12);

    return $guid;
  }

  public static function baseInfo()
  {
    self::setChainId();


    $data = new stdClass();
    $data->ClientUID = self::$chain_id;


    $base = self::post("ListClientPropertiesBaseInfo", json_encode($data));

    return $base->data;
  }


  public static function getHotelSearchForProperty($property, $avilOnly = "true", $language = 1)
  {

    $data =
      '
        {
            "EchoToken": "' . self::createGUID() . '",
            "TimeStamp": "' . gmdate(DATE_W3C) . '",
            "PrimaryLangID" : ' . $language . ',
            "Criteria": {
                "AvailableOnlyIndicator": ' . $avilOnly . ',
                "Criterion": {
                    "HotelRefs": [{"HotelCode":' . $property . '} ]
                }
            }
        }
        ';

    $base = self::post("HotelSearch", $data);

    return $base->data;
  }

  public static function getClientPropertyFolders($chain)
  {
    $data =
      '
        {
          "ClientUID": ' . $chain . '
        }
        ';

    $base = self::post("GetClientPropertyFolders", $data);

    return $base->data;
  }

  public static function getPropertyStyle($hotel_code, $currency = 34)
  {

    $data =
      '
        {
          "PropertyUID": ' . $hotel_code . ',
          "SelectedCurrencyUID": ' . $currency . ',
          "IsForMobile": false,
          "LanguageUID": 1
        }
        ';

    $base = self::post("GetPropertyBEStyleDetails", $data);

    return $base->data;
  }

  public static function getCurrencies($chain)
  {
    $data =
      '
	    {
	      "ClientUIDs": [
	        ' . $chain . '
	      ],
	      "ReturnTotal": true,
	      "LanguageUID": 1
	    }
		';

    $base = self::post("GetBECurrencies", $data);

    return $base->data;
  }

  public static function getLanguages($chain)
  {
    $data =
      '
	    {
	      "ClientUIDs": [
	        ' . $chain . '
	      ]
	    }
		';

    $base = self::post("GetBELanguages", $data);

    return $base->data;
  }

  public static function getHotelAvailCalendar($hotel_id, $date_from, $date_to, $currency = null)
  {

    $adults = get_option('calendar_adults');

    if($adults == 1) {
      $ResGuestRPH = '0';
    }
    else {
      $ResGuestRPH = '0,1';
    }

    $data =
      '
		{
            "MaxResponses": 100,
            "RequestedCurrency": ' . $currency . ',
            "PageNumber": 10,
            "EchoToken": "' . self::createGUID() . '",
            "TimeStamp": "' . gmdate(DATE_W3C) . '",
            "Target": 1,
            "Version": 3.0,
            "PrimaryLangID": 1,
            "AvailRatesOnly": true,
            "BestOnly": false,
            "HotelSearchCriteria": {
              "Criterion": {
                "GetPricesPerGuest": true,
                "HotelRefs": [
                  {
                    "HotelCode": ' . $hotel_id . '
                  }
                ],
                "StayDateRange": {
                  "Start": "' . date("Y-m-d\TH:i:sP", strtotime($date_from)) . '",
                  "End": "' . date("Y-m-d\TH:i:sP", strtotime($date_to)) . '"
                },
                "RoomStayCandidatesType": {
                  "RoomStayCandidates": [
                        {
                          "GuestCountsType": {
                            "GuestCounts": [
                              {
                                "Age": "",
                                "AgeQualifyCode": 10,
                                "Count": ' . $adults . ',
                                "ResGuestRPH": [
                                  ' . $ResGuestRPH . '
                                ]
                              }
                            ]
                          },
                          "Quantity": 1,
                          "RPH": 0
                        }
                  ]
                }
              }
            }
          }
		';

    $base = self::post("GetHotelAvailCalendar", $data);

    return $base->data;
  }

  public static function getChainAvailCalendar($chain, $date_from, $date_to, $currency = null)
  {

    $data =
      '
		{
		  "MaxResponses": 100,
		  "RequestedCurrency": ' . $currency . ',
		  "PageNumber": 10,
		  "EchoToken": "' . self::createGUID() . '",
		  "TimeStamp": "' . gmdate(DATE_W3C) . '",
		  "Target": 1,
		  "Version": 3.0,
		  "PrimaryLangID": 1,
		  "AvailRatesOnly": true,
		  "BestOnly": false,
		  "HotelSearchCriteria": {
		    "Criterion": {
		      "GetPricesPerGuest": true,
		      "HotelRefs": [
		        {
		          "ChainCode": ' . $chain . '
		        }
		      ],
		      "StayDateRange": {
		        "Start": "' . date("Y-m-d\TH:i:sP", strtotime($date_from)) . '",
		        "End": "' . date("Y-m-d\TH:i:sP", strtotime($date_to)) . '"
		      },
		      "RoomStayCandidatesType": {
		        "RoomStayCandidates": [
		          	{
			            "GuestCountsType": {
			              "GuestCounts": [
			                {
			                  "Age": "",
			                  "AgeQualifyCode": 10,
			                  "Count": 1,
			                  "ResGuestRPH": [
			                    0
			                  ]
			                }
			              ]
			            },
			            "Quantity": 1,
			            "RPH": 0
		          	}
		        ]
		      }
		    }
		  }
		}
		';

    $base = self::post("GetHotelAvailCalendar", $data);

    return $base->data;
  }
}
