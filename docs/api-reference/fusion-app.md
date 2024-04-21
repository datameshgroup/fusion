---
sidebar_position: 1
---

# Fusion App

Fusion App is a DataMesh middleware that is installed in the PC as the Sale System.

Fusion App wraps the Fusion Cloud API and handles many of the interactions between the Sale System and the POI terminal (web socket, security, pairing, error handling, UI etc).

There are two methods for processing a payment using Fusion App: 

* Events mode - the Sale System sends a HTTP POST to a local endpoint, and if valid receives 202 ACCEPTED. The Sale System polls Fusion App, processing events received until the payment response is returned. 
* Blocking - the Sale System sends a HTTP POST to a local endpoint, and waits for a response. If successful (200 OK) the response will contain the payment response details.

In both methods, in case of an error (timeout, system crash etc), the Sale System sends a HTTP GET request to request the status of the payment.

## Reference code  

| Description | Location |
:-----------------:                        | -----------------                        |
| Demo Application implementing the Fusion App | on [GitHub](https://github.com/datameshgroup/fusionapp-demo) |

## Getting started with Fusion App

### Install Fusion App

:::info
The latest dev release Fusion App installer can be downloaded from this [link](https://cloudposintegration.io/fusion/fusionapp/releases/FusionAppSetup_vDev.exe).
:::

- Run the installer and select the _Development_ install type. (For installation in _Production_ environment, select _Production_)

  ![](/img/fusion-app-install-1.png)

- Wait for the installation to complete and click _Finish_

  ![](/img/fusion-app-install-2.png)

### Configure Fusion App

- Launch Fusion App from the icon in the system tray.

  ![](/img/fusion-app-icon.png)

- The _Status_ tab displays the terminal pairing status.
  
  - You can pair a terminal by clicking on the _Pair with terminal_ button.  Doing this will launch the pairing dialog, which will ask you to [scan a pairing QR Code using the DataMesh terminal](/docs/appendix#qr-pos-pairing).

    ![](/img/fusion-app-settings-not-paired.png)

  - When the Fusion App has been paired with a terminal, the paired terminal's POI ID will be displayed.  You can unpair from the terminal by clicking on the _Unpair from terminal_ option.

    ![](/img/fusion-app-settings-paired.png)

- The _Util_ tab will allow you to:
  - update the POS Name (which is used during [QR POS Pairing](/docs/getting-started#qr-pos-pairing)).     
    - If the Fusion App has been paired with a terminal _before_ the POS name was updated, you'll need to unpair from the terminal and then, pair with the terminal again to use the updated POS name.
  - perform a login
  - access log files 

DataMesh may ask for log files to diagnose issues during development. 

  ![](/img/fusion-app-settings.png)

### Send your first payment request

- Download and install [Postman](https://www.postman.com/downloads)
- Import the Fusion App postman script:
  - In Postman, select Menu(☰) → File → Import...
  - Browse to `%PROGRAMFILES(X86)%\DataMeshGroup\FusionApp\FusionApp.postman_collection.json` and import
- Select Collections → Payments (blocking) → Payment, and click _Send_

![](/img/fusion-app-postman.png)


### Next steps

- Ensure you've read [Getting Started](../getting-started) and scoped your integration requirements
- Read [Perform a purchase](#perform-a-purchase) and [Perform a refund](#perform-a-refund) and implement this functionality in your Sale System
- Implement other required features based on this API specification
- On the PC you've installed Fusion App, you can also view the locally installed [Swagger docs](http://localhost:4242/swagger)

## Perform a purchase (events mode)

To perform a purchase with events mode, the Sale System will need to POST a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload to the `http://localhost:4242/fusion/v1/payments` endpoint.

- Construct a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload including all required fields
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set the purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  - Populate the [SaleItem](/docs/api-reference/data-model#saleitem) array with the product basket for the purchase
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the payment and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/payments/{{SessionId}}events=true`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [Payment request](/docs/api-reference/data-model#payment-request) JSON payload
- Await the POST result (this should take under 5 seconds).
  - On 4xx the request was invalid and the payment could not be processed
  - On 5xx an error occured, the Sale System should enter error handling
  - On 202 ACCEPTED, the Sale System should GET the payment result
- Call `GET http://localhost:4242/fusion/v1/payments/{{SessionId}}/events` using the `SessionId` from the POST payment to get the next event in the payment (this could take as long as 5 minutes). Fusion App will return a [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse) containing the [Payment response](/docs/api-reference/data-model#payment-response), or a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) containing the [Print request](/docs/api-reference/data-model#print-request)
  - On [print request](/docs/api-reference/data-model#print-request), handle the print and call GET again 
  - On [payment response](/docs/api-reference/data-model#payment-response)
    - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future matched refunds: [POITransactionID](/docs/api-reference/data-model#poitransactionid)
    - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
    - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](/docs/api-reference/data-model#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount)
    - Print the receipt contained in `PaymentReceipt`
  - On 404, enter error handling
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)

## Perform a purchase (blocking mode)

To perform a purchase, the Sale System will need to POST a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload to the `http://localhost:4242/fusion/v1/payments` endpoint.

- Construct a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload including all required fields
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set the purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  - Populate the [SaleItem](/docs/api-reference/data-model#saleitem) array with the product basket for the purchase
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the payment and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/payments/{{SessionId}}`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [Payment request](/docs/api-reference/data-model#payment-request) JSON payload
- Await the POST result (this could take as long as 5 minutes). Fusion App will return a [Payment response](/docs/api-reference/data-model#payment-response) in the message body
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
  - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future matched refunds: [POITransactionID](/docs/api-reference/data-model#poitransactionid)
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](/docs/api-reference/data-model#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount)
  - Print the receipt contained in `PaymentReceipt`
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)


## Perform a refund (events mode)

<!-- TODO need to add support here for matched refunds -->

To perform a refund with events mode, the Sale System will need to POST a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload to the `http://localhost:4242/fusion/v1/payments` endpoint.

:::tip
If refunding a previous purchase, the Sale System should include details of the original purchase. 
:::

- Construct a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload including all required fields
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Refund"
  - Set the refund amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  - If refunding a previous purchase, set the following fields in [PaymentTransaction.OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
	- Set [POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) of the original purchase payment response 
  - Follow the refund rules outlined in the [Sale Item](/docs/api-reference/data-model#refunds) documentation to populate the Sale Item array
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the payment and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/payments/{{SessionId}}?events=true`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [Payment request](/docs/api-reference/data-model#payment-request) JSON payload
- Await the POST result (this should take under 5 seconds).
  - On 4xx the request was invalid and the payment could not be processed
  - On 5xx an error occured, the Sale System should enter error handling
  - On 202 ACCEPTED, the Sale System should GET the payment result
- Call `GET http://localhost:4242/fusion/v1/payments/{{SessionId}}/events` using the `SessionId` from the POST payment to get the next event in the payment (this could take as long as 5 minutes). Fusion App will return a [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse) containing the [Payment response](/docs/api-reference/data-model#payment-response), or a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) containing the [Print request](/docs/api-reference/data-model#print-request)
  - On [print request](/docs/api-reference/data-model#print-request), handle the print and call GET again 
  - On [payment response](/docs/api-reference/data-model#payment-response)
    - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future matched refunds: [POITransactionID](/docs/api-reference/data-model#poitransactionid)
    - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
    - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](/docs/api-reference/data-model#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount)
    - Print the receipt contained in `PaymentReceipt`
  - On 404, enter error handling
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)

## Perform a refund (blocking mode)

<!-- TODO need to add support here for matched refunds -->

To perform a purchase the Sale System will need to POST a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload to the `http://localhost:4242/fusion/v1/payments`) endpoint.

:::tip
If refunding a previous purchase, the Sale System should include details of the original purchase. 
:::

- Construct a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload including all required fields
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Refund"
  - Set the refund amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  - If refunding a previous purchase, set the following fields in [PaymentTransaction.OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
	- Set [POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) of the original purchase payment response 
  - Follow the refund rules outlined in the [Sale Item](/docs/api-reference/data-model#refunds) documentation to populate the Sale Item array
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the payment and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/payments/{{SessionId}}`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [Payment request](/docs/api-reference/data-model#payment-request) JSON payload
- Await the POST result (this could take as long as 5 minutes). Fusion App will return a [Payment response](/docs/api-reference/data-model#payment-response) in the message body
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - Print the receipt contained in `PaymentReceipt`
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)


## Activate a gift card (events mode)

To perform a gift card activation with events mode, the Sale System will need to POST a [Stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload to the `http://localhost:4242/fusion/v1/storedvalue` endpoint.

:::tip
`ItemAmount` indicates the value to activate the card with. e.g. for a $100 giftcard with $5.95 activation fee `ItemAmount` will be $100, and `TotalFeesAmount` will be $5.95
:::

- Construct a [Stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload including all required fields
  - Create an object in StoredValueData[]
  	- Set [StoredValueTransactionType](/docs/api-reference/data-model#storedvaluetransactiontype) to "Activate"
  	- Set [StoredValueAccountID.StoredValueAccountType](/docs/api-reference/data-model#storedvalueaccounttype) to "GiftCard"
	- Set [StoredValueAccountID.IdentificationType](/docs/api-reference/data-model#identificationtype) to "BarCode"
	- Set [StoredValueAccountID.StoredValueID](/docs/api-reference/data-model#storedvalueid) to the "activation barcode" read from the back of the gift card
    - Set [ProductCode](/docs/api-reference/data-model#productcode) to the product code used to identify the product in the Sale System
	- Set [EanUpc](/docs/api-reference/data-model#eanupc) to the "activation barcode" read from the back of the gift card
	- Set [ItemAmount](/docs/api-reference/data-model#itemamount) to the amount to be loaded onto the card (exclusive of any fees)
	- Set [TotalFeesAmount](#totalfeesamount) to the activation fee, if any, associated with this gift card
	- Set [Currency](#currency) to "AUD". 
  - Set [SaleData.SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system. This should be the same as `PaymentRequest` used to pay for the gift card (if paid for with card)
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the transaction and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}events=true`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload
- Await the POST result (this should take under 5 seconds).
  - On 4xx the request was invalid and the payment could not be processed
  - On 5xx an error occured, the Sale System should enter error handling
  - On 202 ACCEPTED, the Sale System should GET the payment result
- Call `GET http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}/events` using the `SessionId` from the POST to get the next event in the transaction (this could take as long as 5 minutes). Fusion App will return a [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse) containing the [stored value response](/docs/api-reference/data-model#stored-value-response), or a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) containing the [Print request](/docs/api-reference/data-model#print-request)
  - On [print request](/docs/api-reference/data-model#print-request), handle the print and call GET again 
  - On [stored value response](/docs/api-reference/data-model#stored-value-response)
    - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future account deactivation: [POITransactionID](/docs/api-reference/data-model#poitransactionid)
    - Print the receipt contained in `PaymentReceipt`
  - On 404, enter error handling
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)

## Deactivate a gift card (events mode)

To perform a gift card deactivation with events mode, the Sale System will need to POST a [Stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload to the `http://localhost:4242/fusion/v1/storedvalue` endpoint.

:::tip
To perform a deactivation, the Sale System will need to recall the [POITransactionID](/docs/api-reference/data-model#poitransactionid) from the original activation.
:::

- Construct a [Stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload including all required fields
  - Create an object in StoredValueData[]
  	- Set [StoredValueTransactionType](/docs/api-reference/data-model#storedvaluetransactiontype) to "Reversal"
  	- Set [StoredValueAccountID.StoredValueAccountType](/docs/api-reference/data-model#storedvalueaccounttype) to "GiftCard"
	- Set [StoredValueAccountID.IdentificationType](/docs/api-reference/data-model#identificationtype) to "BarCode"
	- Set [StoredValueAccountID.StoredValueID](/docs/api-reference/data-model#storedvalueid) to the "activation barcode" read from the back of the gift card
    - Set [ProductCode](/docs/api-reference/data-model#productcode) to the product code used to identify the product in the Sale System
	- Set [EanUpc](/docs/api-reference/data-model#eanupc) to the "activation barcode" read from the back of the gift card
	- Set [ItemAmount](/docs/api-reference/data-model#itemamount) to the amount to be loaded onto the card (exclusive of any fees)
	- Set [TotalFeesAmount](#totalfeesamount) to the activation fee, if any, associated with this gift card
	- Set [Currency](#currency) to "AUD". 
    - Set [OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction) to the value returned in [StoredValueResponse.POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) of the original activation response
  - Set [SaleData.SaleTransactionID](/docs/api-reference/data-model#saletransactionid)
    - `SaleTransactionID.TransactionID` should be the ID which identifies the sale on your system. This should be the same as `PaymentRequest` used to pay for the gift card (if paid for with card)
    - `SaleTransactionID.Timestamp` should be the current time formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the transaction and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}events=true`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [stored value request](/docs/api-reference/data-model#stored-value-request) JSON payload
- Await the POST result (this should take under 5 seconds).
  - On 4xx the request was invalid and the payment could not be processed
  - On 5xx an error occured, the Sale System should enter error handling
  - On 202 ACCEPTED, the Sale System should GET the payment result
- Call `GET http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}/events` using the `SessionId` from the POST to get the next event in the transaction (this could take as long as 5 minutes). Fusion App will return a [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse) containing the [stored value response](/docs/api-reference/data-model#stored-value-response), or a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) containing the [Print request](/docs/api-reference/data-model#print-request)
  - On [print request](/docs/api-reference/data-model#print-request), handle the print and call GET again 
  - On [stored value response](/docs/api-reference/data-model#stored-value-response)
    - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - Print the receipt contained in `PaymentReceipt`
  - On 404, enter error handling
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)

## Perform a balance inquiry (events mode)

To perform a balance inquiry with events mode, the Sale System will need to POST a [balance inquiry request](/docs/api-reference/data-model#balance-inquiry-request) JSON payload to the `http://localhost:4242/fusion/v1/balanceinquiry` endpoint.

- Construct a [balance inquiry request](/docs/api-reference/data-model#balance-inquiry-request) JSON payload including all required fields
  - Note the `BalanceInquiryRequest` object can be left empty
- Create a globally unique UUIDv4 `SessionId`. This will be used to uniquely identify the transaction and perform error recovery.
- POST the JSON payload to `http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}events=true`
  - Set the `Content-Type` header to `application/json`
  - Set the `X-Application-Name` header to the name of your Sale System
  - Set the `X-Software-Version` header to the software version of your Sale System
  - Set the message body to the [balance inquiry request](/docs/api-reference/data-model#balance-inquiry-request) JSON payload
- Await the POST result (this should take under 5 seconds).
  - On 4xx the request was invalid and the request could not be processed
  - On 5xx an error occured, the Sale System should enter error handling
  - On 202 ACCEPTED, the Sale System should GET the result
- Call `GET http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}/events` using the `SessionId` from the POST to get the next event in the transaction (this could take as long as 5 minutes). Fusion App will return a [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse) containing the [balance inquiry response](/docs/api-reference/data-model#balance-inquiry-response)
  - On [balance inquiry response](/docs/api-reference/data-model#balance-inquiry-response)
    - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
    - If [Response.Result](/docs/api-reference/data-model#result) is "Success", handle the remaining fields in the response
  - On 404, enter error handling
- If the Sale System does not receive a POST result (i.e. timeout, socket dropped, system crash etc) implement error handling outlined in [error handling](#error-handling)



## Methods

### Status

The `status` endpoint returns the current Fusion App status. 

**Endpoint**

`GET http://localhost:4242/fusion/v1/status`

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

A JSON payload representing the Fusion App status.


```json
{
    "Version": "3.0.1.0", //Formatted version number of the Fusion App
    "TerminalPaired": false, //True if a terminal has been paired, false otherwise
    "Status": "Ready" //Status of the Fusion App
}
```

### UI

The `ui` endpoint enables the Sale System to launch the Fusion App main UI so the operator can _pair the Fusion App to a terminal_ and _unpair the Fusion App from the terminal_.

:::tip
This is important when the task bar/system tray is hidden and the operator cannot access the main Fusion App icon, while the Sale System is running.  
:::

**Endpoint**
`POST http://localhost:4242/fusion/v1/ui?launchCommand=`

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
LaunchCommand      | Set to "pairing" to launch directly to the pairing UI  |


**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

Empty.

### Login 

The `Login` endpoint is a useful method for validating connectivity with DataMesh without sending a financial request. The Sale System is not required to implement this functionality. 

**Endpoint**
`POST http://localhost:4242/fusion/v1/login/{{SessionId}}`

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |


**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

A JSON payload based on [Login response](/docs/api-reference/data-model#login-response)

<details>

<summary>
Login response
</summary>

<p>

```json
{
	"LoginResponse": {
		"Response": {
			"Result": "xxx",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},
		"POISystemData": {
			"DateTime": "xxx",
			"POISoftware": {
				"ProviderIdentification": "xxx",
				"ApplicationName": "xxx",
				"SoftwareVersion": "xxx"
			},
			"POITerminalData": {
				"TerminalEnvironment": "xxx",
				"POICapabilities": [
					"xxx",
					"xxx",
					"xxx"
				],
				"POIProfile": {
					"GenericProfile": "Custom"
				},
				"POISerialNumber": "xxx"
			},
			"POIStatus": {
				"GlobalStatus": "xxx",
				"PEDOKFlag": "true or false",
				"CardReaderOKFlag": "true or false",
				"PrinterStatus": "xxx",
				"CommunicationOKFlag": "true or false",
				"FraudPreventionFlag": "true or false"
			},
			"TokenRequestStatus": "true or false"
		}
	}
}
```
</p>

</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `LoginResponse.Response.Result` for the result of the login request |
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and try again.
5xx  | Error       | Fusion App was unable to process the request. Try again.



### Payments

The `Payments` endpoint is used to perform purchase, purchase + cash out, cash out only, and refund requests. 

**Endpoints**

Name                    | Endpoint                                                                  | Description                                                             | 
----------------------- | ----------------------------------------------------------------------    | ----------------------------------------------------------------------- |
Request (blocking mode) | `POST http://localhost:4242/fusion/v1/payments/{{SessionId}}`             | Initate a payment in blocking mode                                      |
Request (events mode)   | `POST http://localhost:4242/fusion/v1/payments/{{SessionId}}?events=true` | Initate a payment in events mode                                        |
Error handling          | `GET http://localhost:4242/fusion/v1/payments/{{SessionId}}`              | Called by the Sale System to enter error handling                       |
Get events              | `GET http://localhost:4242/fusion/v1/payments/{{SessionId}}/events`       | Get events for the request. See [Payment events](#payment-events)       |

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |
Events             | Set to true to enable events mode, false otherwise     | 

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

A JSON payload based on [Payment request](/docs/api-reference/data-model#payment-request)

<details>

<summary>
Payment request
</summary>

<p>

```json
{
    "PaymentRequest": {
        "SaleData": {
            "SaleTransactionID": {
                "TransactionID": "X_SALE_ID",
                "TimeStamp": "X_ISO8601_FORMAT"
            }
        },
        "PaymentTransaction": {
            "AmountsReq": {
                "Currency": "AUD",
                "RequestedAmount": 10.42
            },
           "SaleItem":[
               {
                  "ItemID":"0",
                  "ProductCode":"X_PRODUCT_CODE",
                  "UnitOfMeasure":"Other",
                  "Quantity":"1",
                  "UnitPrice":"10.42",
                  "ItemAmount":"10.42",
                  "ProductLabel":"Big Kahuna Burger"
               }
            ]            
        },
        "PaymentData": {
            "PaymentType": "Normal"
        }
    }
}
```
</p>
</details>

**Response Body**

:::info

A response body is only returned when using blocking mode.

:::

A JSON payload based on [Payment response](/docs/api-reference/data-model#payment-response)

<details>

<summary>
Payment response
</summary>

<p>

```json
{
	"PaymentResponse": {
		"Response": {
			"Result": "Success| Partial | Failure",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},
		"SaleData": {
			"SaleTransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			},
			"SaleReferenceID": "xxxx"
		},
		"POIData": {
			"POITransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			},
			"POIReconciliationID": "xxx"
		},
		"PaymentResult": {
			"PaymentType": "xxx",
			"PaymentInstrumentData": {
				"PaymentInstrumentType": "xxx",
				"CardData": {
					"EntryMode": "xxx",
					"PaymentBrand": "xxx",
					"PaymentBrandID": "xxx",
					"PaymentBrandLabel": "xxx",
					"Account": "xxx",
					"MaskedPAN": "xxxxxx…xxxx",
					"PaymentToken": {
						"TokenRequestedType": "xxx",
						"TokenValue": "xxx",
						"ExpiryDateTime": "xxx"
					}
				}
			},
			"AmountsResp": {
				"Currency": "AUD",
				"AuthorizedAmount": "x.xx",
				"TotalFeesAmount": "x.xx",
				"CashBackAmount": "x.xx",
				"TipAmount": "x.xx",
				"SurchargeAmount": "x.xx"
			},
			"OnlineFlag": true,
			"PaymentAcquirerData": {
				"AcquirerID": "xxx",
				"MerchantID": "xxx",
				"AcquirerPOIID": "xxx",
				"AcquirerTransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"ApprovalCode": "xxx",
				"ResponseCode": "xxx",
				"HostReconciliationID": "xxx"
			}
		},
		"AllowedProductCodes": [
			"1",
			"2",
			"3"
		],
		"PaymentReceipt": [
			{
				"DocumentQualifier": "xxx",
				"RequiredSignatureFlag": true,
				"OutputContent": {
					"OutputFormat": "XHTML",
					"OutputXHTML": "xxx"
				}
			}
		]
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `PaymentResponse.Response.Result` for the result of the payment request |
202  | Accepted    | Fusion App processed the request in events mode. Call the [payment events](#payment-events) endpoint for the payment result |
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and request body and try again.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the payment result.


### Payment events

The `Payment events` endpoint is used to request the events associated with an ongoing payment session. 

:::tip 

Use the `SessionId` used in the POST to initiate the payment. 

The `SessionId` is only valid during the lifetime of the payment (i.e. when a payment is initiated until PaymentResponse is returned to the Sale System). If 404 is returned, the Sale System should enter [error handling](#error-handling).

:::

**Endpoint**
`GET http://localhost:4242/fusion/v1/payments/{{SessionId}}/events`

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

A JSON payload containing either a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) or [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse). 



<details>

<summary>
Print request
</summary>

<p>

```json
{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageClass": "Device",
			"MessageCategory": "Print",
			"MessageType": "Request",
			"ServiceID": "xxxx"
		},
		"PrintRequest": {
			"PrintOutput": {
				"DocumentQualifier": "Cashier | Customer",
				"IntegratedPrintFlag": "true|false",
				"RequiredSignatureFlag": "true|false",
				"OutputContent": {
					"OutputFormat": "XHTML",
					"OutputXHTML": "xxx"
				}
			}
		}
	}
}
```

</p>
</details>

<details>

<summary>
Payment response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Response",
			"ServiceID": "xxxx"
		},
		"PaymentResponse": {
			"Response": {
				"Result": "Success| Partial | Failure",
				"ErrorCondition": "xxx",
				"AdditionalResponse": "xxx"
			},
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"SaleReferenceID": "xxxx"
			},
			"POIData": {
				"POITransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"POIReconciliationID": "xxx"
			},
			"PaymentResult": {
				"PaymentType": "xxx",
				"PaymentInstrumentData": {
					"PaymentInstrumentType": "xxx",
					"CardData": {
						"EntryMode": "xxx",
						"PaymentBrand": "xxx",
						"PaymentBrandID": "xxx",
						"PaymentBrandLabel": "xxx",
						"Account": "xxx",
						"MaskedPAN": "xxxxxx…xxxx",
						"PaymentToken": {
							"TokenRequestedType": "xxx",
							"TokenValue": "xxx",
							"ExpiryDateTime": "xxx"
						}
					}
				},
				"AmountsResp": {
					"Currency": "AUD",
					"AuthorizedAmount": "x.xx",
					"TotalFeesAmount": "x.xx",
					"CashBackAmount": "x.xx",
					"TipAmount": "x.xx",
					"SurchargeAmount": "x.xx"
				},
				"OnlineFlag": true,
				"PaymentAcquirerData": {
					"AcquirerID": "xxx",
					"MerchantID": "xxx",
					"AcquirerPOIID": "xxx",
					"AcquirerTransactionID": {
						"TransactionID": "xxx",
						"TimeStamp": "xxx"
					},
					"ApprovalCode": "xxx",
					"ResponseCode": "xxx",
					"HostReconciliationID": "xxx"
				}
			},
			"AllowedProductCodes": [
				"1",
				"2",
				"3"
			],
			"PaymentReceipt": [
				{
					"DocumentQualifier": "xxx",
					"RequiredSignatureFlag": true,
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "xxx"
					}
				}
			]
		}
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. If a print request, check `SaleToPOIRequest.PrintRequest` and process the print. If a payment response, check `SaleToPOIResponse.PaymentResponse.Response.Result` for the result of the payment request 
404  | Not found   | Fusion App was unable to find the session. The Sale System should perform [error handling](#error-handling) to retreive the payment result.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the payment result.










<!-------------------------------------- BALANCE INQUIRY ---------------------------------------------->

### Balance inquiry

The `balance inquiry` endpoint is used to request the balance of an account. 

**Endpoints**

Name                    | Endpoint                                                                        | Description                                                                             | 
----------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
Request (blocking mode) | `POST http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}`             | Initate a balance inquiry in blocking mode                                              |
Request (events mode)   | `POST http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}?events=true` | Initate a balance inquiry in events mode                                                |
Error handling          | `GET http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}`              | Called by the Sale System to enter error handling                                       |
Get events              | `GET http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}/events`       | Get events for the request. See [balance inquiry events](#balance-inquiry-events)       |

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |
Events             | Set to true to enable events mode, false otherwise     | 

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

A JSON payload based on [balance inquiry request](/docs/api-reference/data-model#balance-inquiry-request)

<details>

<summary>
Balance inquiry request
</summary>

<p>

```json
{
    "BalanceInquiryRequest": {
    }
}
```
</p>
</details>

:::note
The `BalanceInquiryRequest` node is intentionally empty.
:::


**Response Body**

:::info
A response body is only returned when using blocking mode.
:::

A JSON payload based on [balance inquiry response](/docs/api-reference/data-model#balance-inquiry-response)

<details>

<summary>
Balance inquiry response
</summary>

<p>

```json
{
	"BalanceInquiryResponse": {	
		"Response": {
			"Result": "Success | Failure",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},	
		"PaymentAccountStatus": {
			"PaymentInstrumentType": "Card",
			"PaymentInstrumentData": {
				"PaymentInstrumentType": "xxx",
				"CardData": {
					"EntryMode": "xxx",
					"PaymentBrand": "xxx",
					"PaymentBrandId": "xxx",
					"PaymentBrandLabel": "xxx",
					"Account": "xxx",
					"MaskedPAN": "xxxxxx…xxxx",
					"PaymentToken": {
						"TokenRequestedType": "xxx",
						"TokenValue": "xxx",
						"ExpiryDateTime": "xxx"
					}
				},
				"StoredValueAccountID": {
					"StoredValueAccountType": "GiftCard | PhoneCard | Other",
					"StoredValueProvider": "",
					"OwnerName": "",
					"ExpiryDate": "MMYY",
					"EntryMode": "",
					"IdentificationType": "",
					"StoredValueID": ""
				}
			},
			"CurrentBalance": 0.00,
			"Currency": "AUD",

			"PaymentAcquirerData": {
				"AcquirerID": "xxx",
				"MerchantID": "xxx",
				"AcquirerPOIID": "xxx",
				"AcquirerTransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"ApprovalCode": "xxx",
				"ResponseCode": "xxx",
				"HostReconciliationID": "xxx"
			},

		}
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `BalanceInquiryResponse.Response.Result` for the result of the request.
202  | Accepted    | Fusion App processed the request in events mode. Call the [balance inquiry events](#balance-inquiry-events) endpoint for the result.
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and request body and try again.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the result.


### Balance inquiry events

The `balance inquiry events` endpoint is used to request the events associated with an ongoing balance inquiry session. 

:::tip 
Use the `SessionId` used in the POST to initiate the transaction. 

The `SessionId` is only valid during the lifetime of the transaction (i.e. when a transaction is initiated until `BalanceInquiryResponse` is returned to the Sale System). If 404 is returned, the Sale System should enter [error handling](#error-handling).
:::

**Endpoint**
`GET http://localhost:4242/fusion/v1/balanceinquiry/{{SessionId}}/events`

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

A JSON payload containing either a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) or [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse). 



<details>

<summary>
Print request
</summary>

<p>

```json
{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageClass": "Device",
			"MessageCategory": "Print",
			"MessageType": "Request",
			"ServiceID": "xxxx"
		},
		"PrintRequest": {
			"PrintOutput": {
				"DocumentQualifier": "Cashier | Customer",
				"IntegratedPrintFlag": "true|false",
				"RequiredSignatureFlag": "true|false",
				"OutputContent": {
					"OutputFormat": "XHTML",
					"OutputXHTML": "xxx"
				}
			}
		}
	}
}
```

</p>
</details>

<details>

<summary>
Balance inquiry response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Response",
			"ServiceID": "xxxx"
		},
		"BalanceInquiryResponse": {	
				"Response": {
					"Result": "Success | Failure",
					"ErrorCondition": "xxx",
					"AdditionalResponse": "xxx"
				},	
				"PaymentAccountStatus": {
					"PaymentInstrumentType": "Card",
					"PaymentInstrumentData": {
						"PaymentInstrumentType": "xxx",
						"CardData": {
							"EntryMode": "xxx",
							"PaymentBrand": "xxx",
							"PaymentBrandId": "xxx",
							"PaymentBrandLabel": "xxx",
							"Account": "xxx",
							"MaskedPAN": "xxxxxx…xxxx",
							"PaymentToken": {
								"TokenRequestedType": "xxx",
								"TokenValue": "xxx",
								"ExpiryDateTime": "xxx"
							}
						},
						"StoredValueAccountID": {
							"StoredValueAccountType": "GiftCard | PhoneCard | Other",
							"StoredValueProvider": "",
							"OwnerName": "",
							"ExpiryDate": "MMYY",
							"EntryMode": "",
							"IdentificationType": "",
							"StoredValueID": ""
						}
					},
					"CurrentBalance": 0.00,
					"Currency": "AUD",

					"PaymentAcquirerData": {
						"AcquirerID": "xxx",
						"MerchantID": "xxx",
						"AcquirerPOIID": "xxx",
						"AcquirerTransactionID": {
							"TransactionID": "xxx",
							"TimeStamp": "xxx"
						},
						"ApprovalCode": "xxx",
						"ResponseCode": "xxx",
						"HostReconciliationID": "xxx"
					},

				}
			}
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. If a print request, check `SaleToPOIRequest.PrintRequest` and process the print. If a payment response, check `SaleToPOIResponse.BalanceInquiryResponse.Response.Result` for the result of the transaction.
404  | Not found   | Fusion App was unable to find the session. The Sale System should perform [error handling](#error-handling) to retreive the transaction result.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the transaction result.








<!-------------------------------------- STORED VALUE ---------------------------------------------->

### Stored value

The `stored value` endpoint is used to activate or deactivate a gift card. 

**Endpoints**

Name                    | Endpoint                                                                        | Description                                                                             | 
----------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
Request (blocking mode) | `POST http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}`                | Initate a stored value request in blocking mode                                              |
Request (events mode)   | `POST http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}?events=true`    | Initate a stored value request in events mode                                                |
Error handling          | `GET http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}`                 | Called by the Sale System to enter error handling                                       |
Get events              | `GET http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}/events`          | Get events for the request. See [stored value events](#stored-value-events)       |

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |
Events             | Set to true to enable events mode, false otherwise     | 

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

A JSON payload based on [stored value request](/docs/api-reference/data-model#stored-value-request)

<details>
<summary>
Stored value request
</summary>
<p>

```json
{
	"StoredValueRequest": {		
		"SaleData": {
			"OperatorID": "xxx",
			"OperatorLanguage": "en",
			"ShiftNumber": "xxx",
			"SaleTransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			},
			"SaleReferenceID": "xxx",
			"SaleTerminalData": {
				"TerminalEnvironment": "xxx",
				"SaleCapabilities": [
					"xxx",
					"xxx",
					"xxx"
				],
				"TotalsGroupID": "xxx"
			},
			"TokenRequestedType": "Customer | Transaction"
		},
		"StoredValueData": [
			{
			"StoredValueProvider": "",
			"StoredValueTransactionType":"Reserve | Activate | Load | Unload | Reverse | Duplicate",
			"StoredValueAccountID": {
				"StoredValueAccountType": "GiftCard | PhoneCard | Other",
				"StoredValueProvider": "",
				"OwnerName": "",
				"ExpiryDate": "MMYY",
				"EntryMode": "",
				"IdentificationType": "",
				"StoredValueID": ""
			},
			"OriginalPOITransaction": {
				"SaleID": "xxx",
				"POIID": "xxx",
				"POITransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"ReuseCardDataFlag": true,
				"ApprovalCode": "xxx",
				"LastTransactionFlag": true
			},
			"ProductCode": "xxx",
			"EanUpc": "xxx",
			"ItemAmount": "xx.x",			
			"TotalFeesAmount": "xx.x",
			"Currency": "",

		}
		]		
	}
}
```
</p>
</details>


**Response Body**

:::info
A response body is only returned when using blocking mode.
:::

A JSON payload based on [stored value response](/docs/api-reference/data-model#stored-value-response)

<details>
<summary>
Stored value response
</summary>
<p>

```json
{
	"StoredValueResponse": {	
		"Response": {
			"Result": "Success | Failure",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},	
		"SaleData": {
			"SaleTransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			},
		},
		"POIData": {
			"POITransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			},
			"POIReconciliationID": "xxx"
		},
		"StoredValueResult": [
			{
				"StoredValueTransactionType":"Reserve | Activate | Load | Unload | Reverse | Duplicate",
				"ProductCode": "xxx",
				"EanUpc": "xxx",
				"ItemAmount": "xx.x",		
				"TotalFeesAmount": "xx.x",		
				"Currency": "",
				"StoredValueAccountStatus": {
					"StoredValueAccountID": {
						"StoredValueAccountType": "GiftCard | PhoneCard | Other",
						"StoredValueProvider": "",
						"OwnerName": "",
						"ExpiryDate": "MMYY",
						"EntryMode": "",
						"IdentificationType": "",
						"StoredValueID": ""
					},
					"CurrentBalance": 0.00,
				},
			}		
		],
		"PaymentReceipt": [
			{
				"DocumentQualifier": "xxx",
				"RequiredSignatureFlag": true,
				"OutputContent": {
					"OutputFormat": "XHTML",
					"OutputXHTML": "xxx"
				}
			}
		]
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `StoredValueResponse.Response.Result` for the result of the request.
202  | Accepted    | Fusion App processed the request in events mode. Call the [stored value events](#stored-value-events) endpoint for the result.
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and request body and try again.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the result.


### Stored value events

The `stored value events` endpoint is used to request the events associated with an ongoing stored value session. 

:::tip 
Use the `SessionId` used in the POST to initiate the transaction. 

The `SessionId` is only valid during the lifetime of the transaction (i.e. when a transaction is initiated until `StoredValueResponse` is returned to the Sale System). If 404 is returned, the Sale System should enter [error handling](#error-handling).
:::

**Endpoint**
`GET http://localhost:4242/fusion/v1/storedvalue/{{SessionId}}/events`

**Query Parameters**

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |

**Headers**

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

**Request Body**

Empty.

**Response Body**

A JSON payload containing either a [SaleToPOIRequest](/docs/api-reference/data-model#saletopoirequest) or [SaleToPOIResponse](/docs/api-reference/data-model#saletopoiresponse). 



<details>

<summary>
Print request
</summary>

<p>

```json
{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageClass": "Device",
			"MessageCategory": "Print",
			"MessageType": "Request",
			"ServiceID": "xxxx"
		},
		"PrintRequest": {
			"PrintOutput": {
				"DocumentQualifier": "Cashier | Customer",
				"IntegratedPrintFlag": "true|false",
				"RequiredSignatureFlag": "true|false",
				"OutputContent": {
					"OutputFormat": "XHTML",
					"OutputXHTML": "xxx"
				}
			}
		}
	}
}
```

</p>
</details>

<details>

<summary>
Stored value response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Response",
			"ServiceID": "xxxx"
		},
		"StoredValueResponse": {	
			"Response": {
				"Result": "Success | Failure",
				"ErrorCondition": "xxx",
				"AdditionalResponse": "xxx"
			},	
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
			},
			"POIData": {
				"POITransactionID": {
					"TransactionID": "xxx",
					"TimeStamp": "xxx"
				},
				"POIReconciliationID": "xxx"
			},
			"StoredValueResult": [
				{
					"StoredValueTransactionType":"Reserve | Activate | Load | Unload | Reverse | Duplicate",
					"ProductCode": "xxx",
					"EanUpc": "xxx",
					"ItemAmount": "xx.x",		
					"TotalFeesAmount": "xx.x",		
					"Currency": "",
					"StoredValueAccountStatus": {
						"StoredValueAccountID": {
							"StoredValueAccountType": "GiftCard | PhoneCard | Other",
							"StoredValueProvider": "",
							"OwnerName": "",
							"ExpiryDate": "MMYY",
							"EntryMode": "",
							"IdentificationType": "",
							"StoredValueID": ""
						},
						"CurrentBalance": 0.00,
					},
				}		
			],
			"PaymentReceipt": [
				{
					"DocumentQualifier": "xxx",
					"RequiredSignatureFlag": true,
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "xxx"
					}
				}
			]
		}
	}
}
```
</p>
</details>

**Response HTTP Status Codes**

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. If a print request, check `SaleToPOIRequest.PrintRequest` and process the print. If a payment response, check `SaleToPOIResponse.StoredValueResponse.Response.Result` for the result of the transaction.
404  | Not found   | Fusion App was unable to find the session. The Sale System should perform [error handling](#error-handling) to retreive the transaction result.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the transaction result.

## Error handling

When the Sale System POSTs a [payment](/docs/api-reference/data-model#payment-request), [balance inquiry](/docs/api-reference/data-model#balance-inquiry-request), or [stored value](/docs/api-reference/data-model#stored-value-request) request, it will eventually receive a matching [payment](/docs/api-reference/data-model#payment-response), [balance inquiry](/docs/api-reference/data-model#balance-inquiry-response), or [stored value](/docs/api-reference/data-model#stored-value-response) response, or via the `~/events` endpoint in events mode.
 

The Sale System should verify the result of the transaction by checking the [Response.Result](/docs/api-reference/data-model#result) field in the response.

- If the [Response.Result](/docs/api-reference/data-model#result) is "Success", the payment transaction was successful.
- If the [Response.Result](/docs/api-reference/data-model#result) is "Failure", the payment transaction failed.  The Sale System may check for any errors specified in the [Response.ErrorCondition](/docs/api-reference/data-model#errorcondition) field in the same response message and handle the error accordingly.

:::tip 
In the event the Sale System does not receive a response (for example, due to network error, timeout, or any other unexpected error) it must enter error handling.
:::

To perform error handling the Sale System should send a `GET` request to the error handling endpoint using the `SessionId` of the failed request. Fusion App will return a response containing the result of the payment. 


**Base Uri**
`http://localhost:4242/fusion/v1/`

Request endpoint                                       | Error handling endpoint             | Response content
------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------
`POST ~payments/{{SessionId}}`       | `GET ~payments/{{SessionId}}`       | [PaymentResponse](/docs/api-reference/data-model#payment-response)
`POST ~balanceinquiry/{{SessionId}}` | `GET ~balanceinquiry/{{SessionId}}` | [BalanceInquiryResponse](/docs/api-reference/data-model#balance-inquiry-response) 
`POST ~storedvalue/{{SessionId}}`    | `GET ~storedvalue/{{SessionId}}`    | [StoredValueResponse](/docs/api-reference/data-model#stored-value-response) 