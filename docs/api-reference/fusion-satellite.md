---
sidebar_position: 2
---
# Fusion Satellite

The Fusion Satellite API allows a Sale System running on the POI terminal to communicate with the DataMesh Satellite payment application on the same POI terminal using inter-app communication with [Android intents](https://developer.android.com/guide/components/intents-filters).

## Libraries

DataMesh have published a library to Maven Central which wraps the Satellite API. This is the recommended method of interacting with the Fusion Satellite API.

Description | Location | <div style={{width:'180px'}}></div> |
-----------------                        | ----------- | ----------- |
Library | on [Maven Central](https://central.sonatype.com/artifact/com.datameshgroup.fusion/fusion-sdk/1.3.4/versions) | |
Library | on [GitHub](https://github.com/datameshgroup/fusionsatellite-sdk-java) | |
Demo Application utilising the library | on [GitHub](https://github.com/datameshgroup/fusionsatellite-sdk-android-demo) | Tested on PAX (PAX 920) |
Another POS on Pinpad Demo Application | on [GitHub](https://github.com/datameshgroup/pos-on-pinpad-demo) | Tested on PAX (PAX 920) and Ingenico (DX8000) |

### How to include the library

`implementation "com.datameshgroup.fusion:fusion-sdk:1.3.4"`

If you are using Android you will need to add Java 8 syntax desugaring. In your app's build.gradle

```
android {
	compileOptions {
		sourceCompatibility JavaVersion.VERSION_1_8
		targetCompatibility JavaVersion.VERSION_1_8
		coreLibraryDesugaringEnabled true
	}
}
dependencies {
	coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:1.1.5'
}
```

## Device Specific Changes

If your *Sale System on Pinpad* uses the device(s) listed below, the following changes need to be included in your application:

### Printer

**If your *Sale System on Pinpad* only supports PAX:**

- Modify the App Manifest file to add the following permission: <br /> `<uses-permission android:name="com.pax.permission.PRINTER" />`

**If your *Sale System on Pinpad* supports Ingenico or**

**If your *Sale System on Pinpad* supports both Ingenico and PAX:**

Since not all the required changes specific to your application may be listed below, please refer to the [POS on Pinpad Demo Application code in GitHub](https://github.com/datameshgroup/pos-on-pinpad-demo).  This [POS on Pinpad Demo Application code in GitHub](https://github.com/datameshgroup/pos-on-pinpad-demo) has been tested in both Ingenico (DX8000) and PAX (PAX 920)

*Please only copy the code/files relevant to the device(s) that you support.(e.g. copy only the relevant Ingenico code/file(s) if you only support Ingenico)*

- Add the relevant [Library Files](https://github.com/datameshgroup/pos-on-pinpad-demo/tree/master/app/libs)
- Add the relevant device specific files:
  - [Ingenico](https://github.com/datameshgroup/pos-on-pinpad-demo/tree/master/app/src/Ingenico/java/au/com/dmg/devices)
  - [PAX](https://github.com/datameshgroup/pos-on-pinpad-demo/tree/master/app/src/Pax/java/au/com/dmg/devices)
- Add the [DeviceInterface.java](https://github.com/datameshgroup/pos-on-pinpad-demo/blob/master/app/src/main/java/au/com/dmg/terminalposdemo/DeviceInterface.java) file and its references to your code.
- Update your app's build.gradle

``` 
    flavorDimensions 'device'
    productFlavors {
        pax {
            dimension "device"
            applicationId = "you_application_id_here"
            buildConfigField 'boolean', 'DEVICE_PAX', 'true'
            buildConfigField 'boolean', 'DEVICE_IGO', 'false'
            buildConfigField 'String', 'VERSION_TYPE', "\"v1\""

        }
        ingenico {
            dimension "device"
            applicationId = "you_application_id_here"
            buildConfigField 'boolean', 'DEVICE_PAX', 'false'
            buildConfigField 'boolean', 'DEVICE_IGO', 'true'
            buildConfigField 'String', 'VERSION_TYPE', "\"v1\""
        }
    }
```

## Sending messages 

The Satellite API utilises an Android intent with request/response objects based on the Nexo `SaleToPOIRequest` and `SaleToPOIResponse`

### Sample code for Sending a Payment Request

Please refer to the method in the file listed below to view sample code handling on how to perform a payment/refund. 

 Method Name  | GitHub File | GitHub Repository |
:-----------------:                        | :-----------------:                        | :-----------------:                        |
sendPaymentRequest | [ActivityPayment.java](https://github.com/datameshgroup/pos-on-pinpad-demo/blob/master/app/src/main/java/au/com/dmg/terminalposdemo/ActivityPayment.java) | [pos-on-pinpad-demo](https://github.com/datameshgroup/pos-on-pinpad-demo)

### Intent request

The app uses intents to send and receive messages

```java
Intent intent = new Intent(Message.INTENT_ACTION_SALETOPOI_REQUEST);

// All messages to and from the terminal are wrapped inside a Message object.
// Here request is a SaleToPOIRequest object.
Message message = new Message(request);

intent.putExtra(Message.INTENT_EXTRA_MESSAGE, message.toJson());
// name of this app, that get's treated as the POS label by the terminal.
intent.putExtra(Message.INTENT_EXTRA_APPLICATION_NAME, "DemoPOS");
intent.putExtra(Message.INTENT_EXTRA_APPLICATION_VERSION, "1.0.0");

// we are using 100 as the request code - but you can use anything you want.
startActivityForResult(intent, 100);
```

### Intent response

In the same activity, add the following code.

```java
@Override
protected void onActivityResult(int requestCode, int responseCode, Intent data){
    super.onActivityResult(requestCode, responseCode, data);
    if(data != null && data.hasExtra(Message.INTENT_EXTRA_MESSAGE)) {
        this.handleResponseIntent(data);
    }
}

void handleResponseIntent(Intent intent){
    // The response is sent as a Json and we will need to deserialize it.
    Message message = null;
    try{
        message = Message.fromJson(intent.getStringExtra(Message.INTENT_EXTRA_MESSAGE));
    } catch(Exception e){
        // json errors may occur,
        // if this is occuring, make sure you are using the latest fusion-sdk library
        return;
    }
    SaleToPOIResponse response = message.response;
    // we can now access the data.
}
```

### Request/response object

<details>

<summary>
SaleToPOIRequest
</summary>

<p>

```json
{
  "SaleToPOIRequest": {
    "MessageHeader":{...},
    "PaymentRequest":{...}
  }
}
```
</p>
</details>

<details>

<summary>
SaleToPOIResponse
</summary>

<p>

```json
{
  "SaleToPOIResponse": {
    "MessageHeader":{...},
    "LoginRequest":{...}
  }
}
```
</p>
</details>

All messages use JSON format with UTF-8 encoding. 

Supported primitive data elements are:

1. **String** text string of variable length
1. **Boolean** true or false
1. **Number** defined in this document as either `integer` or `decimal`. For all number fields the Sale System _MUST_ remove the digits equal to zero on left and the right of the value and any useless 
decimal point (eg. 00320.00 is expressed 320, and 56.10 is expressed 56.1). This simplifies parsing and MAC calculations.
1. **Null** optional types can be represented as null

:::tip
Additional fields will be added to the message specification over time. To ensure forwards compatibility 
the Sale System must ignore when extra objects and fields are present in response messages. 
:::

The base of every message is the `SaleToPOIRequest` object for requests, and `SaleToPOIResponse` object for responses. 

The `SaleToPOIRequest` and `SaleToPOIResponse` contain two objects: 

1. A [MessageHeader](#messageheader) object.
1. A [Payload](#payload) object of variable types.

### MessageHeader

<details>

<summary>
MessageHeader
</summary>

<p>

```json
"MessageHeader":{
  "MessageClass":"",
  "MessageCategory":"",
  "MessageType":"",
  "ServiceID":""
}
```
</p>
</details>

A `MessageHeader` is included with each request and response. It defines the protocol and message type.

<div style={{width:'240px'}}>Attributes</div>                             |Requ.| Format | Description |
-----------------                     |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)         | ✔ | String | Informs the receiver of the class of message. Possible values are "Service", "Device", or "Event"
[MessageCategory](/docs/api-reference/data-model#messagecategory)   | ✔ | String | Indicates the category of message. Possible values are "CardAcquisition", "Display", "Login", "Logout", "Payment" 
[MessageType](/docs/api-reference/data-model#messagetype)           | ✔ | String | Type of message. Possible values are "Request", "Response", or "Notification"
[ServiceID](/docs/api-reference/data-model#serviceid)               | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).

 
### Payload

An object which defines fields for the request/response. The object name depends on the [MessageCategory](/docs/api-reference/data-model#messagecategory) defined in the `MessageHeader`

e.g. a payment will include a `PaymentRequest`/`PaymentResponse`.

The *Satellite API Reference* outlines the expected payload for each supported request.  


<!-- 
## Perform a purchase

To perform a purchase the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).


- If a login hasn't already been sent for the session, send a login request as detailed in [login request](./fusion-cloud#login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Record the [POISerialNumber](/docs/api-reference/data-model#poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](./fusion-cloud#payment) 
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set the purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid) to a unique value for the sale on this Sale System
  - Populate the [SaleItem](/docs/api-reference/data-model#saleitem) array with the product basket for the transaction 
- If configured in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities), handle any [display](./fusion-cloud#display), [print](./fusion-cloud#print), and [input](./fusion-cloud#input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
  - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future matched refunds:
    - [SaleID](/docs/api-reference/data-model#saleid)
	- [POIID](/docs/api-reference/data-model#poiid)
	- [POITransactionID](/docs/api-reference/data-model#poitransactionid)
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](#surchargeamount)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](./fusion-cloud#error-handling)


## Perform a refund

To perform a refund the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).

In most cases the Sale System should attempt to 
//

- If a login hasn't already been sent for the session, send a login request as detailed in [login request](./fusion-cloud#login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Record the [POISerialNumber](/docs/api-reference/data-model#poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](./fusion-cloud#payment) 
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Refund"
  - Set the refund amount in [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid) to a unique value for the sale on this Sale System
  - If refunding a previous purchase, set the following fields in [PaymentTransaction.OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
    - Set [SaleID](/docs/api-reference/data-model#saleid) to the [SaleID](/docs/api-reference/data-model#saleid) of the original purchase payment request 
	- Set [POIID](/docs/api-reference/data-model#poiid) to the [POIID](/docs/api-reference/data-model#poiid) of the original purchase payment request 
	- Set [POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) of the original purchase payment response 
    - The product basket is not required for refunds
- If configured in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities), handle any [display](./fusion-cloud#display), [print](./fusion-cloud#print), and [input](./fusion-cloud#input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](./fusion-cloud#error-handling)

-->

## Methods

### Payment 

The payment message is used to perform purchase, purchase + cash out, cash out only, refund, pre-authorisation, and completion requests. 

#### Payment request

<details>

<summary>
Payment request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"Payment",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "PaymentRequest":{
         "SaleData":{
            "OperatorID":"xxx",
            "OperatorLanguage":"en",
            "ShiftNumber":"xxx",
            "SaleTransactionID":{
               "TransactionID":"xxx",
               "TimeStamp":"xxx"
            },
            "SaleReferenceID":"xxx",
            "SaleTerminalData":{
               "TerminalEnvironment":"xxx",
               "SaleCapabilities":[
                  "xxx",
                  "xxx",
                  "xxx"
               ],
               "TotalsGroupID":"xxx"
            },
            "TokenRequestedType":"Customer | Transaction"
         },
         "PaymentTransaction":{
            "AmountsReq":{
               "Currency":"AUD",
               "RequestedAmount":"x.xx",
               "CashBackAmount":"x.xx",
               "TipAmount":"x.xx",
               "PaidAmount":"x.xx",
               "MaximumCashBackAmount":"x.xx",
               "MinimumSplitAmount":"x.xx"
            },
            "OriginalPOITransaction":{
               "SaleID":"xxx",
               "POIID":"xxx",
               "POITransactionID":{
                  "TransactionID":"xxx",
                  "TimeStamp":"xxx"
               },
               "ReuseCardDataFlag":true,
               "ApprovalCode":"xxx",
               "LastTransactionFlag":true
            },
            "TransactionConditions":{
               "AllowedPaymentBrands":[
                  "xxx",
                  "xxx",
                  "xxx"
               ],
               "AcquirerID":[
                  "xxx",
                  "xxx",
                  "xxx"
               ],
               "DebitPreferredFlag":true,
               "ForceOnlineFlag":true,
               "MerchantCategoryCode":"xxx"
            },
            "SaleItem":[
               {
                  "ItemID":"xxx",
                  "ProductCode":"xxx",
                  "EanUpc":"xxx",
                  "UnitOfMeasure":"xxx",
                  "Quantity":"xx.x",
                  "UnitPrice":"xx.x",
                  "ItemAmount":"xx.x",
                  "TaxCode":"xxx",
                  "SaleChannel":"xxx",
                  "ProductLabel":"xxx",
                  "AdditionalProductInfo":"xxx",
				  "CostBase":"xxx",
				  "Discount":"xxx",
				  "Categories":["xxx","xxx"],
				  "Brand":"xxx",
				  "QuantityInStock":"xxx",
				  "Tags":["xxx","xxx","xxx"]
                  "PageURL":"xxx",
                  "ImageURLs":["xxx","xxx"],
                  "Size":"xxx",
                  "Colour":"xxx",
                  "Weight":xx.xx,
                  "WeightUnitOfMeasure":"xxx"	
               }
            ]
         },
         "PaymentData":{
            "PaymentType":"xxx",
            "PaymentInstrumentData":{
               "PaymentInstrumentType":"xxx",
               "CardData":{
                  "EntryMode":"xxx",
                  "ProtectedCardData":{
                     "ContentType":"id-envelopedData",
                     "EnvelopedData":{
                        "Version":"v0",
                        "Recipient":{
                           "KEK":{
                              "Version":"v4",
                              "KEKIdentifier":{
                                 "KeyIdentifier":"xxxDATKey",
                                 "KeyVersion":"xxx"
                              },
                              "KeyEncryptionAlgorithm":{
                                 "Algorithm":"des-ede3-cbc"
                              },
                              "EncryptedKey":"xxx"
                           }
                        },
                        "EncryptedContent":{
                           "ContentType":"id-data",
                           "ContentEncryptionAlgorithm":{
                              "Algorithm":"des-ede3-cbc",
                              "Parameter":{
                                 "InitialisationVector":"xxx"
                              }
                           },
                           "EncryptedData":"xxx"
                        }
                     }
                  },
                  "SensitiveCardData":{
                     "PAN":"xxx",
                     "ExpiryDate":"xxx",
                     "CCV":"xxx"
                  },
                  "PaymentToken":{
                     "TokenRequestedType":"xxx",
                     "TokenValue":"xxx"
                  }
               }
            }
         },
         "CustomFields": [
            {
               "Key": "xxx",
               "Type": "xxx",
               "Value": "xxx"
            }
         ]
      }
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Payment"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).

**PaymentRequest**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
**SaleData**                                 | ✔ | Object | Sale System information attached to this payment
 [OperatorID](/docs/api-reference/data-model#operatorid)                   |   | String | Only required if different from Login Request
 [OperatorLanguage](#operatorlanguage)       |   | String | Set to "en"
 [ShiftNumber](/docs/api-reference/data-model#shiftnumber)                 |   | String | Only required if different from Login Request
 [SaleReferenceID](/docs/api-reference/data-model#salereferenceid)         |  | String | Mandatory for pre-authorisation and completion, otherwise optional. See [SaleReferenceID](/docs/api-reference/data-model#salereferenceid)
 [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype)   |  | String | If present, indicates which type of token should be created for this payment. See [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype)
 **SaleTransactionID**                       | ✔ | Object |
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | Unique reference for this sale ticket. Not necessarily unique per payment request; for example a sale with split payments will have a number of payments with the same [TransactionID](/docs/api-reference/data-model#transactionid)
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Time of initiating the payment request on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   
 **SaleTerminalData**                        |  | Object | Define Sale System configuration. Only include if elements within have different values to those in Login Request
  [TerminalEnvironment](/docs/api-reference/data-model#terminalenvironment)| | String | "Attended", "SemiAttended", or "Unattended"
  [SaleCapabilities](/docs/api-reference/data-model#salecapabilities)      | | Array  | Advises the POI System of the Sale System capabilities. See [SaleCapabilities](/docs/api-reference/data-model#salecapabilities) 
  [TotalsGroupId](/docs/api-reference/data-model#totalsgroupid)            |  | String | Groups transactions in a login session
**PaymentTransaction**                       | ✔ | Object | 
 **AmountsReq**                               | ✔ | Object | Object which contains the various components which make up the payment amount
  [Currency](#currency)                      | ✔ | String | Three character currency code. Set to "AUD"
  [RequestedAmount](#requestedamount)        | ✔ | Decimal| The requested amount for the transaction sale items, including cash back and tip requested
  [CashBackAmount](#cashbackamount)          |  | Decimal | The Cash back amount. Only if cash back is included in the transaction by the Sale System
  [TipAmount](#tipamount)                    |  | Decimal | The Tip amount. Inlude this in the request if you want the Tip handled on your app. Otherwise, if you want to show the Tip Prompt via Satellite, do not include this parameter in the request.
  [PaidAmount](#paidamount)                  |  | Decimal | Sum of the amount of sale items – `RequestedAmount`. Present only if an amount has already been paid in the case of a split payment.
  [MaximumCashBackAmount](#maximumcashbackamount)|  | Decimal | Available if `CashBackAmount` is not present. If present, the POI Terminal prompts for the cash back amount up to a maximum of `MaximumCashBackAmount`
  [MinimumSplitAmount](#minimumsplitamount)  |   | Decimal | Present only if the POI Terminal can process an amount less than the `RequestedAmount` as a split amount. Limits the minimum split amount allowed.
 **[OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)** |  | Object | Identifies a previous POI transaction. Mandatory for Refund and Completion. See [OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
  [SaleID](/docs/api-reference/data-model#saleid)                          | ✔ | String | [SaleID](/docs/api-reference/data-model#saleid) which performed the original transaction
  [POIID](/docs/api-reference/data-model#poiid)                            | ✔ | String | [POIID](/docs/api-reference/data-model#poiid) which performed the original transaction
  **POITransactionID**                       | ✔ | Object | 
   [TransactionID](/docs/api-reference/data-model#transactionid)           | ✔ | String | `TransactionID` from the original transaction
   [TimeStamp](/docs/api-reference/data-model#timestamp)                   | ✔ | String | `TimeStamp` from the original transaction
  [ReuseCardDataFlag](#reusecarddataflag)    |  | Boolean| If 'true' the POI Terminal will retrieve the card data from file based on the `PaymentToken` included in the request. Otherwise the POI Terminal will read the same card again.
  [ApprovalCode](#approvalcode)              |  | String | Present if a referral code is obtained from an Acquirer
  [LastTransactionFlag](#lasttransactionflag)| ✔ | Boolean| Set to true to process the Last Transaction with a referral code
 **TransactionConditions**                   |  | Object | Optional transaction configuration. Present only if any of the JSON elements within are present.
  [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)
  [AcquirerID](/docs/api-reference/data-model#paymenttransaction.transactionconditions.acquirerid) |  | Array  | Used to restrict the payment to specified acquirers. See [AcquirerID](/docs/api-reference/data-model#paymenttransaction.transactionconditions.acquirerid)
  [DebitPreferredFlag](#debitpreferredflag)  |  | Boolean| If present, debit processing is preferred to credit processing.
  [ForceOnlineFlag](/docs/api-reference/data-model#forceonlineflag)        |  | Boolean| If 'true' the transaction will only be processed in online mode, and will fail if there is no response from the Acquirer.
  [MerchantCategoryCode](/docs/api-reference/data-model#merchantcategorycode)|  | String | If present, overrides the MCC used for processing the transaction if allowed. Refer to ISO 18245 for available codes.
 **[SaleItem](/docs/api-reference/data-model#saleitem)**                   | ✔ | Array  | Array of [SaleItem](/docs/api-reference/data-model#saleitem) objects which represent the product basket attached to this transaction. See [SaleItem](/docs/api-reference/data-model#saleitem) for examples.
  [ItemID](/docs/api-reference/data-model#itemid)                          | ✔ | Integer | A unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
  [ProductCode](/docs/api-reference/data-model#productcode)                | ✔ | String | A unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
  [EanUpc](/docs/api-reference/data-model#eanupc)                          |  | String | A standard unique identifier for the product. Either the UPC, EAN, or ISBN. Required for products with a UPC, EAN, or ISBN
  [UnitOfMeasure](/docs/api-reference/data-model#unitofmeasure)            | ✔ | String | Unit of measure of the `Quantity`. If this item has no unit of measure, set to "Other"
  [Quantity](/docs/api-reference/data-model#quantity)                      | ✔ | Decimal| Sale item quantity based on `UnitOfMeasure`.
  [UnitPrice](/docs/api-reference/data-model#unitprice)                    | ✔ | Decimal| Price per sale item unit. Present if `Quantity` is included.
  [ItemAmount](/docs/api-reference/data-model#itemamount)                  | ✔ | Decimal| Total amount of the sale item
  [TaxCode](/docs/api-reference/data-model#taxcode)                        |  | String | Type of tax associated with the sale item. Default = "GST"
  [SaleChannel](/docs/api-reference/data-model#salechannel)                |  | String | Commercial or distribution channel of the sale item. Default = "Unknown"
  [ProductLabel](/docs/api-reference/data-model#productlabel)              | ✔ | String | a short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
  [AdditionalProductInfo](/docs/api-reference/data-model#additionalproductinfo)|  | String | Additional information, or more detailed description of the product item. 
  [ParentItemID](#parentitemid)                              |  | Integer | *Required* if this item is a 'modifier' or sub-item. Contains the [ItemID](/docs/api-reference/data-model#itemid) of the parent `SaleItem`
  [CostBase](#costbase)                                      |  | Decimal| Cost of the product to the merchant per unit
  [Discount](#discount)                                      |  | Decimal| If applied, the amount this sale item was discounted by
  [Categories](/docs/api-reference/data-model#categories)                  |  | Array  | Array of categories. Top level "main" category at categories[0]. See [Categories](/docs/api-reference/data-model#categories) for more information.
  [Brand](#brand)                                            |  | String | Brand name - typically visible on the product packaging or label
  [QuantityInStock](/docs/api-reference/data-model#quantityinstock)        |  | Decimal| Remaining number of this item in stock in same unit of measure as `Quantity`
  [Tags](#sale-item-tags)                                    |  | Array  | String array with descriptive tags for the product
  [Restricted](#restricted)                                  |  | Boolean| `true` if this is a restricted item, `false` otherwise. Defaults to `false` when field is null.
  [PageURL](#productpageurl)                                 |  | String | URL link to the sale items product page
  [ImageURLs](#productimageurls)                             |  | Array | String array of images URLs for this sale item
  [Style](#style)                                            |  | String | Style of the sale item
  [Size](#size)                                              |  | String | Size of the sale item
  [Colour](#colour)                                          |  | String | Colour of the sale item
  [Weight](#weight)                                          |  | Decimal | Sale item weight, based on `WeightUnitOfMeasure`
  [WeightUnitOfMeasure](/docs/api-reference/data-model#unitofmeasure)      |  | String | Unit of measure of the `Weight`. 
 **PaymentData**                             | ✔ | Object | Object representing the payment method. Present only if any of the JSON elements within are present.
  [PaymentType](/docs/api-reference/data-model#paymenttype)                | ✔ | String | Defaults to "Normal". Indicates the type of payment to process. "Normal", "Refund", "CashAdvance", "FirstReservation", or "Completion". See [PaymentType](/docs/api-reference/data-model#paymenttype)
  **[PaymentInstrumentData](/docs/api-reference/data-model#paymentinstrumentdata)** |  | Object | Object with represents card details for token or manually enter card details. See  for object structure
 **[CustomFields](/docs/api-reference/data-model#customfields)**                             |  | Array | Array of key/type/value objects containing additional payment information

#### Payment response

<details>

<summary>
Payment response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"Payment",
         "MessageType":"Response",
         "ServiceID":"xxx"
      },
      "PaymentResponse":{
         "Response":{
            "Result":"Success| Partial | Failure",
            "ErrorCondition":"xxx",
            "AdditionalResponse":"xxx"
         },
         "SaleData":{
            "SaleTransactionID":{
               "TransactionID":"xxx",
               "TimeStamp":"xxx"
            },
            "SaleReferenceID":"xxxx"
         },
         "POIData":{
            "POITransactionID":{
               "TransactionID":"xxx",
               "TimeStamp":"xxx"
            },
            "POIReconciliationID":"xxx"
         },
         "PaymentResult":{
            "PaymentType":"xxx",
            "PaymentInstrumentData":{
               "PaymentInstrumentType":"xxx",
               "CardData":{
                  "EntryMode":"xxx",
                  "PaymentBrand":"xxx",
				  "Account":"xxx",
                  "MaskedPAN":"xxxxxx…xxxx",
                  "PaymentToken":{
                     "TokenRequestedType":"xxx",
                     "TokenValue":"xxx",
                     "ExpiryDateTime":"xxx"
                  }
               }
            },
            "AmountsResp":{
               "Currency":"AUD",
               "AuthorizedAmount":"x.xx",
               "TotalFeesAmount":"x.xx",
               "CashBackAmount":"x.xx",
               "TipAmount":"x.xx",
			   "SurchargeAmount":"x.xx"
            },
            "OnlineFlag":true,
            "PaymentAcquirerData":{
               "AcquirerID":"xxx",
               "MerchantID":"xxx",
               "AcquirerPOIID":"xxx",
               "AcquirerTransactionID":{
                  "TransactionID":"xxx",
                  "TimeStamp":"xxx"
               },
               "ApprovalCode":"xxx",
               "ResponseCode":"xxx",
               "HostReconciliationID":"xxx"
            }
         },
         "AllowedProductCodes":[
            "1",
            "2",
            "3"
         ],
         "PaymentReceipt":[
            {
               "DocumentQualifier":"xxx",
               "RequiredSignatureFlag":true,
               "OutputContent":{
                  "OutputFormat":"XHTML",
                  "OutputXHTML":"xxx"
               }
            }
         ]
      }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)                | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)          | ✔ | String | "Payment"
[MessageType](/docs/api-reference/data-model#messagetype)                  | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid)                      | ✔ | String | Mirrored from the request

**PaymentResponse**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
**Response**                                 | ✔ | Object | Object indicating the result of the payment
 [Result](/docs/api-reference/data-model#result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
**SaleData**                                 | ✔ | Object | 
 **SaleTransactionID**                       | ✔ | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | Mirrored from the request
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Mirrored from the request
 [SaleReferenceID](/docs/api-reference/data-model#salereferenceid)         |  | String | Mirrored from the request
**POIData**                                  | ✔ | Object | 
 **POITransactionID**                        | ✔ | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | A unique transaction id from the POI system
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 [POIReconciliationID](/docs/api-reference/data-model#poireconciliationid) |  | String | Present if `Result` is "Success" or "Partial". See [POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)
**PaymentResult**                            |  | Object | Object related to a processed payment
 [PaymentType](/docs/api-reference/data-model#paymenttype)                 |  | String | Mirrored from the request
 **PaymentInstrumentData**                   |  | Object 
  [PaymentInstrumentType](/docs/api-reference/data-model#paymentinstrumenttype) |  | String | "Card" or "Mobile"
  **CardData**                               |  | Object
   [EntryMode](/docs/api-reference/data-model#entrymode)                   | ✔ | String | Indicates how the card was presented. See [EntryMode](/docs/api-reference/data-model#entrymode)
   [PaymentBrand](/docs/api-reference/data-model#paymentbrand)             | ✔ | String | Indicates the card type used. See [PaymentBrand](/docs/api-reference/data-model#paymentbrand)
   [MaskedPAN](/docs/api-reference/data-model#maskedpan)                   | ✔ | String | PAN masked with dots, first 6 and last 4 digits visible
   [Account](/docs/api-reference/data-model#account)                       |  | String | Present if `EntryMode` is "MagStripe", "ICC", or "Tapped". Indicates the card account used. See [Account](/docs/api-reference/data-model#account)
   **PaymentToken**                          |  | Object | Object representing a token. Only present if token was requested
    [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype)| ✔ | String | Mirrored from the request
    [TokenValue](#tokenvalue)                | ✔ | String | The value of the token
    [ExpiryDateTime](#expirydatetime)        | ✔ | String | Expiry of the token, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 **AmountsResp**                             |  | Object | Present if `Result` is "Success" or "Partial"
  [Currency](#currency)                      |  | String | "AUD"
  [AuthorizedAmount](#authorizedamount)      | ✔ | Decimal| Authorised amount which could be more, or less than the requested amount
  [TotalFeesAmount](#totalfeesamount)        |  | Decimal| Total of financial fees associated with the payment transaction if known at time of transaction
  [CashBackAmount](#cashbackamount)          |  | Decimal| Cash back paid amount
  [TipAmount](#tipamount)                    |  | Decimal| The amount of any tip added to the transaction
  [SurchargeAmount](#surchargeamount)        |  | Decimal| The amount of any surcharge added to the transaction
 [OnlineFlag](#onlineflag)                   | ✔ | Boolean| True if the transaction was processed online, false otherwise
 **PaymentAcquirerData**                     |  | Object | Data related to the response from the payment acquirer
  [AcquirerID](/docs/api-reference/data-model#paymentacquirerdata.acquirerid) | ✔ | String | The ID of the acquirer which processed the transaction
  [MerchantID](#merchantid)                  | ✔ | String | The acquirer merchant ID (MID)
  [AcquirerPOIID](#acquirerPOIID)            | ✔ | String | The acquirer terminal ID (TID)
  **AcquirerTransactionID**                  | ✔ | Object | 
   [TransactionID](/docs/api-reference/data-model#transactionid)           | ✔ | String | The acquirer transaction ID
   [TimeStamp](/docs/api-reference/data-model#timestamp)                   | ✔ | String | Timestamp from the acquirer, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  [ApprovalCode](#approvalcode)              | ✔ | String | The Acquirer Approval Code. Also referred to as the Authentication Code
  [ResponseCode](#responsecode)              | ✔ | String | The Acquirer Response Code. Also referred as the PINPad response code
  [STAN](#stan)                              |  | String | The Acquirer STAN if available
  [RRN](#rrn)                                |  | String | The Acquirer RRN if available
  [HostReconciliationID](#hostreconciliationid)|✔| String | Identifier of a reconciliation period with the acquirer. This normally has a date and time component in it
 [AllowedProductCodes](#allowedproductcodes)  |  | Array | Present if `ErrorCondition` is "PaymentRestriction". Consists of a list of product codes corresponding to products that are purchasable with the given card. Items that exist in the basket but do not belong to this list corresponds to restricted items
 **PaymentReceipt**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
  [DocumentQualifier](#documentqualifier)     | ✔ | String | "CashierReceipt" for a merchant receipt, otherwise "SaleReceipt"
  [RequiredSignatureFlag](#requiredsignatureflag) | ✔|Boolean| If true, the card holder signature is required on the merchant CashierReceipt.
  **OutputContent**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
   [OutputFormat](/docs/api-reference/data-model#outputformat)              | ✔ | String | "XHTML"  
   [OutputXHTML](/docs/api-reference/data-model#outputxhtml)                | ✔ | String | The payment receipt in XHTML format but coded in BASE64 

### Transaction status 

A transaction status request can be used to obtain the status of a previous transaction. Required for error handling. 

#### Transaction status request

<details>

<summary>
Transaction status request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"TransactionStatus",
         "MessageType":"Request",
         "ServiceID":"xxx"
      },
      "TransactionStatusRequest":{
         "MessageReference":{
            "MessageCategory":"xxx",
            "ServiceID":"xxx"
         }
      }
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "TransactionStatus"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).

**TransactionStatusRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*MessageReference*                            |    | Object | Identification of a previous POI transaction. Present if it contains any data. 
 [MessageCategory](/docs/api-reference/data-model#messagecategory)          |    | String | "Payment"
 [ServiceID](/docs/api-reference/data-model#serviceid)                      |    | String | The [ServiceID](/docs/api-reference/data-model#serviceid) of the transaction to retrieve the status of. If not included the last payment status is returned.


#### Transaction status response

<details>

<summary>
Transaction status response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"TransactionStatus",
         "MessageType":"Response",
         "ServiceID":"xxx"
      },
      "TransactionStatusResponse":{
         "Response":{
            "Result":"xxx",
            "ErrorCondition":"xxx",
            "AdditionalResponse":"xxx"
         },
         "MessageReference":{
            "MessageCategory":"xxx",
            "ServiceID":"xxx"
         },
         "RepeatedMessageResponse":{
            "MessageHeader":{...},
            "RepeatedResponseMessageBody":{
               "PaymentResponse":{...},
               "ReversalResponse":{...}
            }
         }
      }
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "TransactionStatus"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from request

**TransactionStatusResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*Response*                                    | ✔ | Object | Object indicating the result of the payment
 [Result](/docs/api-reference/data-model#result)                            | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
*MessageReference*                            |  | Object | Identification of a previous POI transaction. Present if `Result` is "Success", or `Result` is "Failure" and `ErrorCondition` is "InProgress"
 [MessageCategory](/docs/api-reference/data-model#messagecategory)          | ✔ | String | Mirrored from request
 [ServiceID](/docs/api-reference/data-model#serviceid)                      | ✔ | String | Mirrored from request, or `ServiceID` of last transaction if not present in request.
*RepeatedMessageResponse*                     |  | Object | Present if `Result` is "Success"
 *MessageHeader*                              | ✔ | Object | `MessageHeader` of the requested payment
 *PaymentResponse*                            | ✔ | Object | `PaymentResponse` of the requested payment


### Void/Reversal

A successful payment transaction can be voided/reversed by sending a reversal request message. 

:::caution
There are only specific cases wherein the reversal request message must be sent.  In most cases, refund request message should be sent instead.  

Please discuss first with the DataMesh Integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a> if you plan to implement any void/reversal processing.
:::

When the Sale System receives the successful payment response, the Sale System needs to store the **TransactionID** (*Response.POIData.POITransactionID.TransactionID*) since this will be used in the reversal request message.

##### Reversal request

The reversal message is used to perform void/reversal request. 

<details>

<summary>
Reversal request
</summary>

<p>

```json

{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageCategory": "Reversal",
			"MessageClass": "Service",
			"MessageType": "Request",
			"ProtocolVersion": "3.1-dmg",
			"ServiceID": "xxx"
		},
		"ReversalRequest": {
			"OriginalPOITransaction": {
				"ReuseCardDataFlag": true,
				"POIID": "xxx",
				"POITransactionID": {
					"TimeStamp": "xxx",
					"TransactionID": "xxx" //This should be the set to the TransactionID in the Original Successful Payment Response
				},
				"SaleID": "xxx"
			},
			"ReversalReason": "SignatureDeclined"// (e.g. CustCancel, MerchantCancel, Malfunction, Unable2Compl, SignatureDeclined, Unknown)
		}
	}
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Reversal"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ProtocolVersion](/docs/api-reference/data-model#protocolversion)       | ✔ | String | "3.1-dmg"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).

**ReversalRequest**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
 **[OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)** | ✔ | Object | Identifies a previous POI transaction. See [OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
  [SaleID](/docs/api-reference/data-model#saleid)                          | ✔ | String | [SaleID](/docs/api-reference/data-model#saleid) which performed the original transaction
  [POIID](/docs/api-reference/data-model#poiid)                            | ✔ | String | [POIID](/docs/api-reference/data-model#poiid) which performed the original transaction
  [ReuseCardDataFlag](#reusecarddataflag)    |  | Boolean| If 'true' the POI Terminal will retrieve the card data from file based on the `PaymentToken` included in the request. Otherwise the POI Terminal will read the same card again.
  **POITransactionID**                       | ✔ | Object | 
   [TransactionID](/docs/api-reference/data-model#transactionid)           | ✔ | String | `TransactionID` from the original transaction
   [TimeStamp](/docs/api-reference/data-model#timestamp)                   | ✔ | String | `TimeStamp` from the original transaction
 **[ReversalReason](/docs/api-reference/data-model#reversal-reason)** | ✔ | Object | Reason for cancelling the successful payment transaction.  See [ReversalReason](/docs/api-reference/data-model#reversalreason)

#### Reversal response

<details>

<summary>
Reversal response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageCategory": "Reversal",
			"MessageClass": "Service",
			"MessageType": "Response",
			"POIID": "xxx",
			"ProtocolVersion": "3.1-dmg",
			"ServiceID": "xxx"
		},
		"ReversalResponse": {
			"POIData": {
				"POITransactionID": {
					"TimeStamp": "xxx",
					"TransactionID": "xxxx"
				}
			},
			"PaymentReceipt": [
				{
					"DocumentQualifier": "SaleReceipt",
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "xxx"
					},
					"RequiredSignatureFlag": false
				},
				{
					"DocumentQualifier": "CashierReceipt",
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "xxx"
					},
					"RequiredSignatureFlag": false
				}
			],
			"Response": {
				"Result": "Success"
			}
		}
	}
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)                | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)          | ✔ | String | "Reversal"
[MessageType](/docs/api-reference/data-model#messagetype)                  | ✔ | String | "Response"
[ProtocolVersion](/docs/api-reference/data-model#protocolversion)       | ✔ | String | "3.1-dmg"
[ServiceID](/docs/api-reference/data-model#serviceid)                      | ✔ | String | Mirrored from the request

**ReversalResponse**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
**Response**                                 | ✔ | Object | Object indicating the result of the payment
 [Result](/docs/api-reference/data-model#result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
**POIData**                                  | ✔ | Object | 
 **POITransactionID**                        | ✔ | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | A unique transaction id from the POI system
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 **PaymentReceipt**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
  [DocumentQualifier](#documentqualifier)     | ✔ | String | "CashierReceipt" for a merchant receipt, otherwise "SaleReceipt"
  [RequiredSignatureFlag](#requiredsignatureflag) | ✔|Boolean| If true, the card holder signature is required on the merchant CashierReceipt.
  **OutputContent**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
   [OutputFormat](/docs/api-reference/data-model#outputformat)              | ✔ | String | "XHTML"  
   [OutputXHTML](/docs/api-reference/data-model#outputxhtml)                | ✔ | String | The payment receipt in XHTML format but coded in BASE64 
