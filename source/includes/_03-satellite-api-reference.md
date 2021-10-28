# Satellite API Reference

<aside class="warning">
The new Fusion Satellite API documented below is currently unavailable in production. Please contact the Data Mesh integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a> for details on how to use the Fusion Satellite API.
</aside>

The Fusion Satellite API allows a Sale System running on the POI terminal to communicate with the DataMesh Satellite payment application on the same POI terminal using inter-app communication with [Android intents](https://developer.android.com/guide/components/intents-filters).

## Libraries

DataMesh have published a library to Maven Central which wraps the Satellite API. This is the recommended method of interacting with the Fusion Satellite API.

* Library on Maven Central [fusion-sdk](https://search.maven.org/artifact/com.datameshgroup.fusion/fusion-sdk)
* Demo application which utilises the library [fusionsatellite-sdk-android-demo](https://github.com/datameshgroup/fusionsatellite-sdk-android-demo)
* Library source code [fusionsatellite-sdk-java](https://github.com/datameshgroup/fusionsatellite-sdk-java)

### How to include the library

`implementation "com.datameshgroup.fusion:fusion-sdk:1.1.0"`

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

## Sending messages 

The Satellite API utilises an Android intent with request/response objects based on the Nexo `SaleToPOIRequest` and `SaleToPOIResponse`

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

> SaleToPOIRequest

```json
{
  "SaleToPOIRequest": {
    "MessageHeader":{...},
    "PaymentRequest":{...}
  }
}
```

> SaleToPOIResponse

```json
{
  "SaleToPOIResponse": {
    "MessageHeader":{...},
    "LoginRequest":{...}
  }
}
```

All messages use JSON format with UTF-8 encoding. 

Supported primitive data elements are:

1. **String** text string of variable length
1. **Boolean** true or false
1. **Number** defined in this document as either `integer` or `decimal`. For all number fields the Sale System _MUST_ remove the digits equal to zero on left and the right of the value and any useless 
decimal point (eg. 00320.00 is expressed 320, and 56.10 is expressed 56.1). This simplifies parsing and MAC calculations.
1. **Null** optional types can be represented as null

<aside class="success">
Additional fields will be added to the message specification over time. To ensure forwards compatibility 
the Sale System must ignore when extra objects and fields are present in response messages. 
</aside>

The base of every message is the `SaleToPOIRequest` object for requests, and `SaleToPOIResponse` object for responses. 

The `SaleToPOIRequest` and `SaleToPOIResponse` contain two objects: 

1. A [MessageHeader](#messageheader) object.
1. A [Payload](#payload) object of variable types.

### MessageHeader

> MessageHeader

```json
"MessageHeader":{
  "MessageClass":"",
  "MessageCategory":"",
  "MessageType":"",
  "ServiceID":""
}
```

A `MessageHeader` is included with each request and response. It defines the protocol and message type.

Attribute                             |Requ.| Format | Description |
-----------------                     |----| ------ | ----------- |
[MessageClass](#data-dictionary-messageclass)         | ✔ | String | Informs the receiver of the class of message. Possible values are "Service", "Device", or "Event"
[MessageCategory](#data-dictionary-messagecategory)   | ✔ | String | Indicates the category of message. Possible values are "CardAcquisition", "Display", "Login", "Logout", "Payment" 
[MessageType](#data-dictionary-messagetype)           | ✔ | String | Type of message. Possible values are "Request", "Response", or "Notification"
[ServiceID](#data-dictionary-serviceid)               | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](#data-dictionary-serviceid).

 
### Payload

An object which defines fields for the request/response. The object name depends on the [MessageCategory](#data-dictionary-messagecategory) defined in the `MessageHeader`

e.g. a payment will include a `PaymentRequest`/`PaymentResponse`.

The [Satellite API Reference](#satellite-api-reference) outlines the expected payload for each supported request.  


<!-- 
## Perform a purchase

To perform a purchase the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).


- If a login hasn't already been sent for the session, send a login request as detailed in [login request](#cloud-api-reference-methods-login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](#data-dictionary-serviceid) in the result matches the request
  - Record the [POISerialNumber](#data-dictionary-poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](#cloud-api-reference-methods-payment) 
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "Normal"
  - Set the purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount)
  - Set [SaleTransactionID](#data-dictionary-saletransactionid) to a unique value for the sale on this Sale System
  - Populate the [SaleItem](#data-dictionary-saleitem) array with the product basket for the transaction 
- If configured in [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities), handle any [display](#cloud-api-reference-methods-display), [print](#cloud-api-reference-methods-print), and [input](#cloud-api-reference-methods-input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](#data-dictionary-serviceid) in the result matches the request
  - Check [Response.Result](#data-dictionary-result) for the transaction result 
  - If [Response.Result](#data-dictionary-result) is "Success", record the following to enable future matched refunds:
    - [SaleID](#data-dictionary-saleid)
	- [POIID](#data-dictionary-poiid)
	- [POITransactionID](#data-dictionary-poitransactionid)
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](#surchargeamount)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](#cloud-api-reference-error-handling)


## Perform a refund

To perform a refund the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).

In most cases the Sale System should attempt to 
//

- If a login hasn't already been sent for the session, send a login request as detailed in [login request](#cloud-api-reference-methods-login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](#data-dictionary-serviceid) in the result matches the request
  - Record the [POISerialNumber](#data-dictionary-poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](#cloud-api-reference-methods-payment) 
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "Refund"
  - Set the refund amount in [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount)
  - Set [SaleTransactionID](#data-dictionary-saletransactionid) to a unique value for the sale on this Sale System
  - If refunding a previous purchase, set the following fields in [PaymentTransaction.OriginalPOITransaction](#data-dictionary-originalpoitransaction)
    - Set [SaleID](#data-dictionary-saleid) to the [SaleID](#data-dictionary-saleid) of the original purchase payment request 
	- Set [POIID](#data-dictionary-poiid) to the [POIID](#data-dictionary-poiid) of the original purchase payment request 
	- Set [POITransactionID](#data-dictionary-poitransactionid) to the value returned in [POIData.POITransactionID](#data-dictionary-poitransactionid) of the original purchase payment response 
    - The product basket is not required for refunds
- If configured in [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities), handle any [display](#cloud-api-reference-methods-display), [print](#cloud-api-reference-methods-print), and [input](#cloud-api-reference-methods-input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](#data-dictionary-serviceid) in the result matches the request
  - Check [Response.Result](#data-dictionary-result) for the transaction result 
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](#cloud-api-reference-error-handling)

-->

## Methods


### Payment 

The payment message is used to perform purchase, purchase + cash out, cash out only, refund, pre-authorisation, and completion requests. 


#### Payment request

> Payment request

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
         }
      }
   }
}
```


**MessageHeader**

<div style="width:180px">Attribute</div>  |Requ.| Format | Description |
-----------------                         |----| ------ | ----------- |
[MessageClass](#data-dictionary-messageclass)             | ✔ | String | "Service"
[MessageCategory](#data-dictionary-messagecategory)       | ✔ | String | "Payment"
[MessageType](#data-dictionary-messagetype)               | ✔ | String | "Request"
[ServiceID](#data-dictionary-serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](#data-dictionary-serviceid).

**PaymentRequest**

<div style="width:200px">Attribute</div>     |Requ.| Format | Description |
-----------------                            |----| ------ | ----------- |
**SaleData**                                 | ✔ | Object | Sale System information attached to this payment
 [OperatorID](#data-dictionary-operatorid)                   |   | String | Only required if different from Login Request
 [OperatorLanguage](#operatorlanguage)       |   | String | Set to "en"
 [ShiftNumber](#data-dictionary-shiftnumber)                 |   | String | Only required if different from Login Request
 [SaleReferenceID](#data-dictionary-salereferenceid)         |  | String | Mandatory for pre-authorisation and completion, otherwise optional. See [SaleReferenceID](#data-dictionary-salereferenceid)
 [TokenRequestedType](#data-dictionary-tokenrequestedtype)   |  | String | If present, indicates which type of token should be created for this payment. See [TokenRequestedType](#data-dictionary-tokenrequestedtype)
 **SaleTransactionID**                       | ✔ | Object |
  [TransactionID](#data-dictionary-transactionid)            | ✔ | String | Unique reference for this sale ticket. Not necessarily unique per payment request; for example a sale with split payments will have a number of payments with the same [TransactionID](#data-dictionary-transactionid)
  [TimeStamp](#data-dictionary-timestamp)                    | ✔ | String | Time of initiating the payment request on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   
 **SaleTerminalData**                        |  | Object | Define Sale System configuration. Only include if elements within have different values to those in Login Request
  [TerminalEnvironment](#data-dictionary-terminalenvironment)| | String | "Attended", "SemiAttended", or "Unattended"
  [SaleCapabilities](#data-dictionary-salecapabilities)      | | Array  | Advises the POI System of the Sale System capabilities. See [SaleCapabilities](#data-dictionary-salecapabilities) 
  [TotalsGroupId](#data-dictionary-totalsgroupid)            |  | String | Groups transactions in a login session
**PaymentTransaction**                       | ✔ | Object | 
 **AmountsReq**                               | ✔ | Object | Object which contains the various components which make up the payment amount
  [Currency](#currency)                      | ✔ | String | Three character currency code. Set to "AUD"
  [RequestedAmount](#requestedamount)        | ✔ | Decimal| The requested amount for the transaction sale items, including cash back and tip requested
  [CashBackAmount](#cashbackamount)          |  | Decimal | The Cash back amount. Only if cash back is included in the transaction by the Sale System
  [TipAmount](#tipamount)                    |  | Decimal | The Tip amount. Only if tip is included in the transaction
  [PaidAmount](#paidamount)                  |  | Decimal | Sum of the amount of sale items – `RequestedAmount`. Present only if an amount has already been paid in the case of a split payment.
  [MaximumCashBackAmount](#maximumcashbackamount)|  | Decimal | Available if `CashBackAmount` is not present. If present, the POI Terminal prompts for the cash back amount up to a maximum of `MaximumCashBackAmount`
  [MinimumSplitAmount](#minimumsplitamount)  |   | Decimal | Present only if the POI Terminal can process an amount < `RequestedAmount` as a split amount. Limits the minimum split amount allowed.
 **[OriginalPOITransaction](#data-dictionary-originalpoitransaction)** |  | Object | Identifies a previous POI transaction. Mandatory for Refund and Completion. See [OriginalPOITransaction](#data-dictionary-originalpoitransaction)
  [SaleID](#data-dictionary-saleid)                          | ✔ | String | [SaleID](#data-dictionary-saleid) which performed the original transaction
  [POIID](#data-dictionary-poiid)                            | ✔ | String | [POIID](#data-dictionary-poiid) which performed the original transaction
  **POITransactionID**                       | ✔ | Object | 
   [TransactionID](#data-dictionary-transactionid)           | ✔ | String | `TransactionID` from the original transaction
   [TimeStamp](#data-dictionary-timestamp)                   | ✔ | String | `TimeStamp` from the original transaction
  [ReuseCardDataFlag](#reusecarddataflag)    |  | Boolean| If 'true' the POI Terminal will retrieve the card data from file based on the `PaymentToken` included in the request. Otherwise the POI Terminal will read the same card again.
  [ApprovalCode](#approvalcode)              |  | String | Present if a referral code is obtained from an Acquirer
  [LastTransactionFlag](#lasttransactionflag)| ✔ | Boolean| Set to true to process the Last Transaction with a referral code
 **TransactionConditions**                   |  | Object | Optional transaction configuration. Present only if any of the JSON elements within are present.
  [AllowedPaymentBrands](#data-dictionary-allowedpaymentbrands)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrands](#data-dictionary-allowedpaymentbrands)
  [AcquirerID](#data-dictionary-paymenttransaction.transactionconditions.acquirerid) |  | Array  | Used to restrict the payment to specified acquirers. See [AcquirerID](#data-dictionary-paymenttransaction.transactionconditions.acquirerid)
  [DebitPreferredFlag](#debitpreferredflag)  |  | Boolean| If present, debit processing is preferred to credit processing.
  [ForceOnlineFlag](#data-dictionary-forceonlineflag)        |  | Boolean| If 'true' the transaction will only be processed in online mode, and will fail if there is no response from the Acquirer.
  [MerchantCategoryCode](#data-dictionary-merchantcategorycode)|  | String | If present, overrides the MCC used for processing the transaction if allowed. Refer to ISO 18245 for available codes.
 **[SaleItem](#data-dictionary-saleitem)**                   | ✔ | Array  | Array of [SaleItem](#data-dictionary-saleitem) objects which represent the product basket attached to this transaction. See [SaleItem](#data-dictionary-saleitem) for examples.
  [ItemID](#data-dictionary-itemid)                          | ✔ | Integer | A unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
  [ProductCode](#data-dictionary-productcode)                | ✔ | String | A unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
  [EanUpc](#data-dictionary-eanupc)                          |  | String | A standard unique identifier for the product. Either the UPC, EAN, or ISBN. Required for products with a UPC, EAN, or ISBN
  [UnitOfMeasure](#data-dictionary-unitofmeasure)            | ✔ | String | Unit of measure of the `Quantity`. If this item has no unit of measure, set to "Other"
  [Quantity](#data-dictionary-quantity)                      | ✔ | Decimal| Sale item quantity based on `UnitOfMeasure`.
  [UnitPrice](#data-dictionary-unitprice)                    | ✔ | Decimal| Price per sale item unit. Present if `Quantity` is included.
  [ItemAmount](#data-dictionary-itemamount)                  | ✔ | Decimal| Total amount of the sale item
  [TaxCode](#data-dictionary-taxcode)                        |  | String | Type of tax associated with the sale item. Default = "GST"
  [SaleChannel](#data-dictionary-salechannel)                |  | String | Commercial or distribution channel of the sale item. Default = "Unknown"
  [ProductLabel](#data-dictionary-productlabel)              | ✔ | String | a short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
  [AdditionalProductInfo](#data-dictionary-additionalproductinfo)|  | String | Additional information, or more detailed description of the product item. 
  [ParentItemID](#parentitemid)                              |  | Integer | *Required* if this item is a 'modifier' or sub-item. Contains the [ItemID](#data-dictionary-itemid) of the parent `SaleItem`
  [CostBase](#costbase)                                      |  | Decimal| Cost of the product to the merchant per unit
  [Discount](#discount)                                      |  | Decimal| If applied, the amount this sale item was discounted by
  [Categories](#data-dictionary-categories)                  |  | Array  | Array of categories. Top level "main" category at categories[0]. See [Categories](#data-dictionary-categories) for more information.
  [Brand](#brand)                                            |  | String | Brand name - typically visible on the product packaging or label
  [QuantityInStock](#data-dictionary-quantityinstock)        |  | Decimal| Remaining number of this item in stock in same unit of measure as `Quantity`
  [Tags](#sale-item-tags)                                    |  | Array  | String array with descriptive tags for the product
  [Restricted](#restricted)                                  |  | Boolean| `true` if this is a restricted item, `false` otherwise. Defaults to `false` when field is null.
  [PageURL](#productpageurl)                                 |  | String | URL link to the sale items product page
  [ImageURLs](#productimageurls)                             |  | Array | String array of images URLs for this sale item
  [Style](#style)                                            |  | String | Style of the sale item
  [Size](#size)                                              |  | String | Size of the sale item
  [Colour](#colour)                                          |  | String | Colour of the sale item
  [Weight](#weight)                                          |  | Decimal | Sale item weight, based on `WeightUnitOfMeasure`
  [WeightUnitOfMeasure](#data-dictionary-unitofmeasure)      |  | String | Unit of measure of the `Weight`. 
 **PaymentData**                             | ✔ | Object | Object representing the payment method. Present only if any of the JSON elements within are present.
  [PaymentType](#data-dictionary-paymenttype)                | ✔ | String | Defaults to "Normal". Indicates the type of payment to process. "Normal", "Refund", or "CashAdvance". See [PaymentType](#data-dictionary-paymenttype)
  **[PaymentInstrumentData](#data-dictionary-paymentinstrumentdata)** |  | Object | Object with represents card details for token or manually enter card details. See  for object structure


#### Payment response

> Payment response

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


**MessageHeader**

<div style="width:180px">Attribute</div>     |Requ.| Format | Description |
-----------------                            |----| ------ | ----------- |
[MessageClass](#data-dictionary-messageclass)                | ✔ | String | "Service"
[MessageCategory](#data-dictionary-messagecategory)          | ✔ | String | "Payment"
[MessageType](#data-dictionary-messagetype)                  | ✔ | String | "Response"
[ServiceID](#data-dictionary-serviceid)                      | ✔ | String | Mirrored from the request

**PaymentResponse**

<div style="width:200px">Attribute</div>     |Requ.| Format | Description |
-----------------                            |----| ------ | ----------- |
**Response**                                 | ✔ | Object | Object indicating the result of the payment
 [Result](#data-dictionary-result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](#data-dictionary-errorcondition)           |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](#data-dictionary-errorcondition) for more information on possible values.
 [AdditionalResponse](#data-dictionary-additionalresponse)   |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](#data-dictionary-additionalresponse) for more information on possible values. 
**SaleData**                                 | ✔ | Object | 
 **SaleTransactionID**                       | ✔ | Object | 
  [TransactionID](#data-dictionary-transactionid)            | ✔ | String | Mirrored from the request
  [TimeStamp](#data-dictionary-timestamp)                    | ✔ | String | Mirrored from the request
 [SaleReferenceID](#data-dictionary-salereferenceid)         |  | String | Mirrored from the request
**POIData**                                  | ✔ | Object | 
 **POITransactionID**                        | ✔ | Object | 
  [TransactionID](#data-dictionary-transactionid)            | ✔ | String | A unique transaction id from the POI system
  [TimeStamp](#data-dictionary-timestamp)                    | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 [POIReconciliationID](#data-dictionary-poireconciliationid) |  | String | Present if `Result` is "Success" or "Partial". See [POIReconciliationID](#data-dictionary-poireconciliationid)
**PaymentResult**                            |  | Object | Object related to a processed payment
 [PaymentType](#data-dictionary-paymenttype)                 |  | String | Mirrored from the request
 **PaymentInstrumentData**                   |  | Object 
  [PaymentInstrumentType](#data-dictionary-paymentinstrumenttype) |  | String | "Card" or "Mobile"
  **CardData**                               |  | Object
   [EntryMode](#data-dictionary-entrymode)                   | ✔ | String | Indicates how the card was presented. See [EntryMode](#data-dictionary-entrymode)
   [PaymentBrand](#data-dictionary-paymentbrand)             | ✔ | String | Indicates the card type used. See [PaymentBrand](#data-dictionary-paymentbrand)
   [MaskedPAN](#data-dictionary-maskedpan)                   | ✔ | String | PAN masked with dots, first 6 and last 4 digits visible
   [Account](#data-dictionary-account)                       |  | String | Present if `EntryMode` is "MagStripe", "ICC", or "Tapped". Indicates the card account used. See [Account](#data-dictionary-account)
   **PaymentToken**                          |  | Object | Object representing a token. Only present if token was requested
    [TokenRequestedType](#data-dictionary-tokenrequestedtype)| ✔ | String | Mirrored from the request
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
  [AcquirerID](#data-dictionary-paymentacquirerdata.acquirerid) | ✔ | String | The ID of the acquirer which processed the transaction
  [MerchantID](#merchantid)                  | ✔ | String | The acquirer merchant ID (MID)
  [AcquirerPOIID](#acquirerPOIID)            | ✔ | String | The acquirer terminal ID (TID)
  **AcquirerTransactionID**                  | ✔ | Object | 
   [TransactionID](#data-dictionary-transactionid)           | ✔ | String | The acquirer transaction ID
   [TimeStamp](#data-dictionary-timestamp)                   | ✔ | String | Timestamp from the acquirer, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
  [ApprovalCode](#approvalcode)              | ✔ | String | The Acquirer Approval Code. Also referred to as the Authentication Code
  [ResponseCode](#responsecode)              | ✔ | String | The Acquirer Response Code. Also referred as the PINPad response code
  [STAN](#stan)                              |  | String | The Acquirer STAN if available
  [RRN](#rrn)                                |  | String | The Acquirer RRN if available
  [HostReconciliationID](#hostreconciliationid)|✔| String | Identifier of a reconciliation period with the acquirer. This normally has a date and time component in it
 [AllowedProductCodes](#allowedproductcodes)  |  | Array | Present if `ErrorCondition` is "PaymentRestriction". Consists of a list of product codes corresponding to products that are purchasable with the given card. Items that exist in the basket but do not belong to this list corresponds to restricted items
 **PaymentReceipt**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
  [DocumentQualifier](#documentqualifier)     | ✔ | String | "CashierReceipt" for a merchant receipt, otherwise "CustomerReceipt"
  [RequiredSignatureFlag](#requiredsignatureflag) | ✔|Boolean| If true, the card holder signature is required on the merchant CashierReceipt.
  **OutputContent**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
   [OutputFormat](#data-dictionary-outputformat)              | ✔ | String | "XHTML"  
   [OutputXHTML](#data-dictionary-outputxhtml)                | ✔ | String | The payment receipt in XHTML format but coded in BASE64 












### Transaction status 

A transaction status request can be used to obtain the status of a previous transaction. Required for error handling. 

#### Transaction status request

> Transaction status request

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

**MessageHeader**

<div style="width:180px">Attribute</div>  |Requ.| Format | Description |
-----------------                         |----| ------ | ----------- |
[MessageClass](#data-dictionary-messageclass)             | ✔ | String | "Service"
[MessageCategory](#data-dictionary-messagecategory)       | ✔ | String | "TransactionStatus"
[MessageType](#data-dictionary-messagetype)               | ✔ | String | "Request"
[ServiceID](#data-dictionary-serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](#data-dictionary-serviceid).

**TransactionStatusRequest**

<div style="width:180px">Attribute</div>      |Requ.| Format  | Description |
-----------------                             |----| ------ | ----------- |
*MessageReference*                            |    | Object | Identification of a previous POI transaction. Present if it contains any data. 
 [MessageCategory](#data-dictionary-messagecategory)          |    | String | "Payment"
 [ServiceID](#data-dictionary-serviceid)                      |    | String | The [ServiceID](#data-dictionary-serviceid) of the transaction to retrieve the status of. If not included the last payment status is returned.


#### Transaction status response

> Transaction status response

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

**MessageHeader**

<div style="width:180px">Attribute</div>  |Requ.| Format | Description |
-----------------                         |----| ------ | ----------- |
[MessageClass](#data-dictionary-messageclass)             | ✔ | String | "Service"
[MessageCategory](#data-dictionary-messagecategory)       | ✔ | String | "TransactionStatus"
[MessageType](#data-dictionary-messagetype)               | ✔ | String | "Response"
[ServiceID](#data-dictionary-serviceid)                   | ✔ | String | Mirrored from request

**TransactionStatusResponse**

<div style="width:180px">Attribute</div>      |Requ.| Format  | Description |
-----------------                             |----| ------ | ----------- |
*Response*                                    | ✔ | Object | Object indicating the result of the payment
 [Result](#data-dictionary-result)                            | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](#data-dictionary-errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](#data-dictionary-errorcondition) for more information on possible values.
 [AdditionalResponse](#data-dictionary-additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](#data-dictionary-additionalresponse) for more information on possible values. 
*MessageReference*                            |  | Object | Identification of a previous POI transaction. Present if `Result` is "Success", or `Result` is "Failure" and `ErrorCondition` is "InProgress"
 [MessageCategory](#data-dictionary-messagecategory)          | ✔ | String | Mirrored from request
 [ServiceID](#data-dictionary-serviceid)                      | ✔ | String | Mirrored from request, or `ServiceID` of last transaction if not present in request.
*RepeatedMessageResponse*                     |  | Object | Present if `Result` is "Success"
 *MessageHeader*                              | ✔ | Object | `MessageHeader` of the requested payment
 *PaymentResponse*                            | ✔ | Object | `PaymentResponse` of the requested payment