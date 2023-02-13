---
sidebar_position: 3
---

# Data dictionary

## Account

Indicates a card account. Note that the list of available account names may change over time. 

- Credit 
- Cheque 
- Savings
- Default

## AdditionalProductInfo

Additional information related to the product item

## AdditionalResponse

Provides extended response detail in the event of an error which may be used for analysis or diagnostics.  

:::tip
Error conditions may be added over time. To ensure forwards compatibility any error handling in the 
Sale System should allow for a "catch all" which handles currently undefined error conditions.
:::

The possible `AdditionalResponse` values are based on the value of [ErrorCondition](#data-dictionary-errorcondition)

When `ErrorCondition` is "MessageFormat"

- "Mandatory Data Element or Structure Absent: \<Absolute Data Name\>"
- "Unexpected Data Element Value: \<Absolute Data Name\> - \<Expected Value(s) or Reason\>"
- "\<Absolute Data Name\> Invalid Value \<Value\> for the Type \<Type\> [and Format \<Format\>]"
- "\<Absolute Data Name\> Value is not part of the Enumerated or Cluster Type \<Type\>" 
- "Repeated Message: \<ID Name\> - \<Value\>"
- "Empty Cluster: \<Absolute Data Name\>"
- "Unacceptable Value Combination: [ \<Absolute Data Name\> : \<Value\> ]*"

When `ErrorCondition` is "DeviceOut"

- "POI is Temporary Unavailable: \<Reason\>"
- "POI is Permanently Unavailable: \<Reason\>"
- "Security Alarm: \<Alarm\>"
  - Alarm = The type of alarm. e.g. "crypto key unknown"


When `ErrorCondition` is "LoggedOut"

- "\<SaleID\> Never Login Since Last \<Event\> at \<Time\>"

When `ErrorCondition` is "Busy"

- "POI \<Component\> Temporary Unavailable: \<Reason\>"
  - Component = "System" or "Terminal"
  - Reason = "Installation in progress", "Maintenance in progress", "Device busy"

- "POI Terminal Busy to Process another Request: \<Request\>"
  - Request = 'PaymentRequest', 'LoginRequest'

When `ErrorCondition` is "UnavailableService"

- "Sale Protocol Version \<Version\> Too Old. Version Implemented: \<Version\>"

When `ErrorCondition` is "Cancel"

- "User Cancellation during \<Status\>"
- "System Cancellation during \<Status\>"

When `ErrorCondition` is "Abort"

- "Service Aborted during \<Status\> - Reason: \<AbortReason\> - from: \<SaleID\> - MessageID: \<ServiceID\>"

When `ErrorCondition` is "InvalidCard"

- "No Card Entered after \<Time\> Seconds".
- "Invalid Card \<Reason\>"
  - Reason = "Card Expired", "Card not allowed", "Suspicion of fraud", etc.
- "Unknown Card \<BIN:val or AID:val\>


When `ErrorCondition` is "WrongPIN"

- "Wrong PIN \<RetryNumber\> Retries - Remaining \<RemainingRetries\>
  - Retries and RemainingRetries only if available.

When `ErrorCondition` is "UnreachableHost"

- "Host Unreachable: \<Reason\>"
- "No Host Answer: \<Reason\>"

When `ErrorCondition` is "Refusal"

- "Payment Refused by Acquirer: \<Acquirer\> Reason: \<Reason\> Code: \<Code\>"
- "Payment Refused Locally - Reason: \<Reason\>"

When `ErrorCondition` is "PaymentRestriction"

- "Restricted items"


## Algorithm

Defines the key algorithm. 

Set to "des-ede3-cbc"

The data encryption session key = [EncryptedKey](#data-dictionary-encryptedkey) is 3DES CBC encrypted by an agreed KEK 3DES key which should be unique per Sale Terminal or Sale System (To be agreed).

## AllowedPaymentBrands

Array of string.

Restricts payment to specific card brands included in the array. If not present, all supported cards are allowed.

Available values: 

- "VISA"
- "MasterCard",
- "American Express"
- "Diners Club"
- "JCB"
- "UnionPay"
- "CUP Debit"
- "Discover"
- "Card"

## ApplicationName

The name of the Sale System application.

DataMesh will provide a `ApplicationName` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `ApplicationName` to be included in the production build of the Sale System. 

## CardBrand

Available values:

- "VISA"
- "MasterCard",
- "American Express"
- "Diners Club"
- "JCB"
- "UnionPay"
- "CUP Debit"
- "Discover"
- "PayPal"
- "Card"


## Categories

`Categories` is a string array which represents the categories of a `SaleItem`

The main category is at the zero element.

For example: 

Example                         | Array
--------------------            | ----------------- 
SaleItem with a single category | `{ "categories": [ "Shirts" ] }`
SaleItem with a main and sub category | `{ "categories": [ "Food", "Mains" ] }`
SaleItem with multiple categories | `{ "categories": [ "Computers", "Accessories", "Keyboards" ] }`


## CertificationCode

Certification code for this Sale System.

DataMesh will provide a `CertificationCode` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `CertificationCode` to be included in the production build of the Sale System. 

## CustomFields
```json

{
  "PaymentRequest": {
    "CustomFields": [
        {
          "Key": "TransitData",
          "Type": "object",
          "Value": "{\"TransitData\":{\"DriverID\":123,\"OperatorID\":456,\"ContractID\":\"0f9653cc-a68b-11ed-afa1-0242ac120002\",\"VehicleID\":789,\"RouteVariant\":\"X\",\"TransactionLocation\":{\"Lattitude\":33.8688,\"Longitude\":151.2093},\"Trip\":{\"Boarding\":{\"StopID\":\"\",\"StopName\":\"\",\"ZoneID\":\"\"},\"Destination\":{\"StopID\":\"\",\"StopName\":\"\",\"ZoneID\":\"\"}},\"Ticket\":[{\"Type\":\"Adult\",\"Price\":1.1,\"ID\":\"9fe0e990-a68d-11ed-afa1-0242ac120002\"}]}}"
        }
      ]
  }
}

{
    "SaleItem": [
        {
            "CustomFields": [
              {
                "Key": "FuelProductCode",
                "Type": "integer",
                "Value": "21"
              },
              {
                "Key": "SomethingElse",
                "Type": "string",
                "Value": "Blah blah"
              },                
              {
                "Key": "AnArray",
                "Type": "array",
                "Value": "[\"1\",\"2\",\"3\"]"
              },    
              {
                "Key": "AnObject",
                "Type": "object",
                "Value": "{\"FuelProductCodes\": [21,22]}"
              }
            ]
        }
    ]
}
```

Array of key/type/value objects containing additional information.  

CustomFields are defined under the *PaymentRequest* (for additional Payment information) or *SaleItem* (for additional Sale Item information).

Field Name   | Type | Description |
-----------------  | ------ | ----------- |
Key                | String | Defines a unique name for the `Value`.              |
Type               | Enum   | The content of `Value` represented as a string. |
                   |        | Available values:                               |
                   |        |    - "integer": `Value` an integral number (represented as a string) |              
                   |        |    - "number": `Value` contains any numeric type. Either integer or floating point. (represented as a string)|
                   |        |    - "string": `Value` contains a string of characters |
                   |        |    - "array": `Value` contains a json array of string  |
                   |        |    - "object": `Value` contains a json object|
`Value`            | String | The value represented as a string |


## DateTime

Current Sale System time, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. This will be included in receipts. e.g. "2019-09-02T09:13:51.0+01:00" 


## EanUpc

a standard unique identifier for the product. Either the UPC, EAN, or ISBN. Required for products with a UPC, EAN, or ISBN


## EncryptedData

Encryption of content = "SensitiveCardData":{…} in canonical form (i.e. without white space). 

Prior to encryption, pad the content with 80h then as many 00h bytes so that the result is a multiple of 8 bytes. 

Encrypt the result. 

Present as a string in hex.

## EncryptedKey

A double length 3DES key (i.e. 16 bytes) that is a unique Data Encryption Key which must be changed every time new sensitive data is sent and is encrypted by the KEK using the [Algorithm](#data-dictionary-algorithm).

The key value is represented in hex (32 hex digits). For example: "F8131F320E499A1474A15B14F42F3E06".

## EntryMode

Indicates how a card was presented. 

Possible values: 

Label                | Description       
-------------------- | ----------------- 
"File"               | Mirrored from the payment request if a `PaymentToken` was used
"Keyed"              | Mirrored from the request if a card not present transaction
"Manual"             | PAN was manually keyed on the POI terminal
"Scanned"            | QR code was scanned by the POI terminal
"MagStripe"          | Card was swiped
"ICC"                | Card was inserted into the chip reader
"Tapped"             | Card was read with contactless reader
"Mobile"             | If a mobile phone was used to finalise the payment, for example, a mobile phone scanning a QR code

## ErrorCondition 

Providers extra detail in the event of an error which enables refinement of error processing by the sale software.

Error conditions may be added over time. To ensure forwards compatibility any error handling in the 
Sale System should allow for a "catch all" which handles currently undefined error conditions.

Possible values: 

Label                | Description       
-------------------- | ----------------- 
"Aborted"            | The Initiator of the request has sent an Abort message request, which was accepted and processed.
"Busy"               | The system is busy, try later
"Cancel"             | The user has aborted the transaction on the PED keyboard, for instance during PIN entering.
"DeviceOut"          | Device out of order
"InsertedCard"       | If the Input Device request a NotifyCardInputFlag and the card holder enters a card in the card reader without answers to the Input command, the POI abort the Input command processing, and answer a dedicated ErrorCondition value in the Input response message.
"InProgress"         | The transaction is still in progress and then the command cannot be processed
"LoggedOut"          | Not logged in
"MessageFormat"      | Error on the format of the message, AdditionalResponse shall contain the identification of the data, and the reason in clear text.
"NotAllowed"         | A service request is sent during a Service dialogue. A combination of services not possible to provide. During the CardReaderInit message processing, the user has entered a card which has to be protected by the POI, and cannot be processed with this device request from the external, and then the Sale System.
"NotFound"           | The transaction is not found (e.g. for a reversal or a repeat)
"PaymentRestriction" | Some sale items are not payable by the card proposed by the card holder.
"Refusal"            | The transaction is refused by the host or the rules associated to the card, and cannot be repeated.
"UnavailableDevice"  | The hardware is not available (absent, not configured...)
"UnavailableService" | The service is not available (not implemented, not configured, protocol version too old...)
"InvalidCard"        | The card entered by the card holder cannot be processed by the POI because this  card is not configured in the system
"UnreachableHost"    | Acquirer or any host is unreachable or has not answered to an online request, so is considered as temporary unavailable. Depending on the Sale context, the request could be repeated (to be compared with "Refusal").
"WrongPIN"           | The user has entered the PIN on the PED keyboard and the verification fails

## EventToNotify

* **Reject** - the request cannot be accepted. For example, message format error, mandatory fields missing, or payment/reversal transaction not found.
* **CompletedMessage** - if the Payment/Reversal has already been completed.

## EventDetails

When `EventToNotify` is "Reject"

- "Message not Found, last \<MessageCategory\> has ID \<ServiceID\>"
- "Mandatory Data Element or Structure Absent: \<Absolute Data Name\>"
- "General Parsing Error: \<Absolute Data Name\>"
- "Unexpected Data Element or Structure: \<Absolute Data Element\>"
- "Unexpected Data Element Value: \<Absolute Data Element\> - \<Expected value(s) or reason\>"
- "Repeated Message: ServiceID - \<Value\>"

When `EventToNotify` is "CompletedMessage"

- "Service Not Aborted - Reason: Completed – from: \<SaleID\> - MessageID: \<ServiceID\>"


## ForceEntryMode

Used to restrict card presentment to the specified type

**Keyed** - A Card Not Present transaction.
**Manual** - to enter manually into the POI terminal.
**Scanned** - for QR Code scanned by the POI terminal.
**MagStripe** - for card swipes.
**ICC** - for card insertions.
**Tapped** - if card taps.
**Mobile** - if a mobile phone is used to finalise the payment. For example, a mobile phone scanning a QR Code.


## ForceOnlineFlag

Boolean.

If 'true' the transaction will only be processed in online mode, and will fail if there is no response from the Acquirer.

## InfoQualify

Qualification of the information to sent to an output logical device, to display or print to the Cashier.

Label                | Description       
-------------------- | ----------------- 
Status               | The information is a new state on which the message sender is entering. For instance, during a payment, the POI could display to the Cashier that POI request an authorisation to the host acquirer.
Error                | The information is related to an error situation occurring on the message sender.
Display              | Standard display interface.
Input                | Merchant input is required.
POIReplication       | Information displayed on the Cardholder POI interface, replicated on the Cashier interface.
CustomerAssistance   | If card holder input is required but the merchant may assist by providing the input data via the CashierInput device.

:::tip
For all input types, the card holder input may also be provided on the POI terminal. 
:::

## InputCommand

Defines the input type required by the cashier.

Label                | Description       
-------------------- | ----------------- 
GetAnyKey            | Wait for any key press. For example, to get confirmation from the cashier that a display has been read. 
GetConfirmation      | Yes/No answer as in the case when prompting for "Signature OK?". The result of this command is boolean true/false.
Password             | A merchant password as in the case during a refund transaction.
GetMenuEntry         | A selection from a list of options. For example, assisting the card holder by selecting the account type: Savings, Cheque or Credit.
TextString           | A text string.
DigitString          | A string of digits.
DecimalString        | A string of digits with a decimal point. 


## ItemAmount

Total amount of the item

## ItemID

A unique identifier for the sale item within the context of this purchase. e.g. a 0..n integer which increments by one for each sale item.


## KeyIdentifier

Indicates the key type. Available values: 

- "SpecV2TestDATKey" for test environment
- "SpecV2ProdDATKey" for production environment

## KeyVersion

Contains either a counter or the creation date/time of the key formatted as "YYYYMMDDHHmmss.mmm" where:

- YYYY is the 4-digit year
- MM is the 2-digit month.
- DD is the 2-digit day.
- HH is the 2-digit hour from 00 to 23.
- mm is the 2-digit minute.
- ss is the 2-digit second.
- mmm is the 3-digit millisecond.

Any new value must be > any previous value sent


## MAC

The last 8 bytes in hex (i.e. 16 hex digits) from:

1. Concatenating the preceding data in canonical form (i.e. without white spaces and line feeds in key:value form: `"MessageHeader":{...},"LoginRequest":{...})`
1. Hashing the result using SHA256. The result of the SHA256 hash is 32 bytes.
1. Append 80h 00h 00h 00h 00h 00h 00h 00h to the hash. The result has 40 bytes.
1. 3DES CBC encrypt the result by the session Message Authentication Key.


## MaintenanceAllowed

Optional. If not present, it default to true.

* If set to true, it indicates that the POI Terminal may go into maintenance mode. For example, the POI Terminal can be upgraded.
* This does not restrict the POI Terminal but is treated as an advise. The POI Terminal may present a warning for example if set to false.

## MaskedPAN

First six digits of the PAN followed by dots followed by the last 4 digits of the PAN.

The total length of the string = PAN Length.

## MerchantCategoryCode

If present, overrides the MCC used for processing the transaction if allowed. Refer to ISO 18245 for available codes.


## MessageClass
 
Informs the receiver of the class of message. Available values: 

* **Service** - A transaction message pair initiated by the Sale System, and requested to the POI System
* **Device** - A device message pair
* **Event** - An unsolicited event notification by the POI System to the Sale System.

## MessageCategory

Category of message. Available values: 

Label                | Description       
-------------------- | ----------------- 
Abort                | Abort message request
Admin                | Admin request or response
BalanceInquiry       | Balance Inquiry request or response
CardAcquisition      | Card Acquisition request or response
Display              | Display message request or response
Event                | Event Notification message
Input                | Input message request or response
Login                | Login message request or response
Logout               | Logout message request or response
Payment              | Payment message request or response
Print                | Print message request or response
Reconciliation       | Reconciliation message request or response
TransactionStatus    | TransactionStatus message request or response


## MessageType

Type of message of the Sale to POI protocol. Available values: 

* Request
* Response
* Notification


## OperatorId

An optional value sent in the [Login Request](#cloud-api-reference-methods-login) for information only. Used to identify the cashier using the Sale Terminal during the session.

If present, totals in the [ReconciliationResponse](#cloud-api-reference-methods-reconciliation) will be grouped by this value. If not present, payment transactions that do not specify a `OperatorId` will not be grouped under a `OperatorId`.

Note that different cashiers may still transact during the same login session by setting an `OperatorId` per payment. 

## OriginalPOITransaction

An object which identifies a previous POI transaction. 

For a purchase, it instructs the POI System to use the payment card details from the original transaction if available. Note that the `RequestedAmount` must be <= the original transaction `RequestedAmount`.

For a refund or completion, indicates which original transaction this should be matched to. A refund or completion may occur on a different Sale System and POI Terminal to the original transaction.


## OutputFormat

Receipt format output. Always "XHTML"
  
## OutputXHTML  
  
The payment receipt in XHTML format, coded in BASE64.


## PaymentAcquirerData.AcquirerID

The ID of the acquirer which processed the transaction

Label                | Description       
-------------------- | ----------------- 
"560251"             | NAB

<!--
"560279"             | CBA
"560254"             | ANZ
"560192"             | Westpac
-->


## PaymentBrand

Identifies the payment brand used for a payment. 

:::info
Please note that this list may expand in the future as new payment types are added. 
:::

Available values:

- "VISA"
- "Mastercard"
- "American Express"
- "Diners Club"
- "JCB"
- "UnionPay"
- "CUP Debit"
- "Discover"
- "Debit"
- "AliPay"
- "WeChat Pay"
- "Card"

## PaymentCurrency

Three digit currency code as defined by [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)


## PaymentTransaction.TransactionConditions.AcquirerID

Restricts card processing to the specified acquirers only. If not present, all acquirers are supported.

Array of string.

Label                | Description       
-------------------- | ----------------- 
"560251"             | NAB

<!--
"560279"             | CBA
"560254"             | ANZ
"560192"             | Westpac
-->

## PaymentType

Indicates the type of payment to process. If not present in the payment request the value will default to "Normal". 

Fusion App and Cloud API - PaymentType available values: 

- "Normal" a purchase transaction or purchase with cash-out transaction
- "Refund" a refund transaction
- "CashAdvance" a cash-out only transaction

Satellite API - PaymentType available values: 

- "Normal" a purchase transaction or purchase with cash-out transaction
- "Refund" a refund
- "CashAdvance" a cash-out only transaction
- "FirstReservation" a pre-authorisation transaction
- "Completion" a completion transaction

## POIID 

Uniquely identifies the POI Terminal. This value is provided by DataMesh.

For Sale Systems that do not need a POI Terminal, the value must be "POI Server"


## POIReconciliationID

Identification of the reconciliation period between Sale and POI, to provide the transaction totals during this period.

Allows counting of transactions by both parties in the Sale to POI reconciliation.

Returned in a [payment response](#cloud-api-reference-payment-response) if [result](#data-dictionary-result) "Success" or "Partial".

In the Reconciliation request, when [ReconciliationType](#reconciliationtype) is "PreviousReconciliation", this field allows to request the reconciliation result of a previous period of transaction.


## POISerialNumber

This last POISerialNumber returned in an earlier login response. If this is the first login from the Sale System, this field is absent.


## POITransactionID

Unique identification of a POI transaction for a [POIID](#data-dictionary-poiid). 

Contains the following fields: 

Attribute |Requ.| Format | Description |
-----------------                        |----| ------ | ----------- |
[TransactionID](#data-dictionary-transactionid)          | ✔ | String | A unique transaction id from the POI system
[TimeStamp](#data-dictionary-timestamp)                  | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)


## ProductCode

a unique identifier for the product within the merchant. For example if two card holders purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.


## ProtocolVersion

Version of the Sale to POI protocol specifications. Set to "3.1-dmg" for the API outlined in this specification.

Label                | Description       
-------------------- | ----------------- 
"3.1"                | Nexo 3.1 compliant 
"3.1-dmg"            | Nexo 3.1 with additional fields added by DataMesh which are outside the Nexo standard (e.g. surcharge)


## ProviderIdentification

The name of the company supplying the Sale System. 

DataMesh will provide a `ProviderIdentification` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `ProviderIdentification` to be included in the production build of the Sale System. 


## PaymentInstrumentData


> PaymentInstrumentData object

```json 
{
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
```


Object with represents card details for token or manually enter card details. 

**PaymentInstrumentData**

Attribute   | Requ.  | Format | Description |
-----------------                          | ------ | ------ | ----------- |
[PaymentInstrumentType](#data-dictionary-paymentinstrumenttype)|  | String | Defaults to "Card". Indicates the card source for the payment. See [PaymentInstrumentType](#data-dictionary-paymentinstrumenttype)
**CardData**                               |  | Object | 
 [EntryMode](#data-dictionary-entrymode)                   |  | String | Only present if `PaymentInstrumentType` is "Card". "File" if a Payment Token is used, and "Keyed" for a Card Not Present transaction. 
 **ProtectedCardData**                     |  | Object | Only present if `EntryMode` is "Keyed"
  [ContentType](#contenttype)              | ✔ | String | Set to "id-envelopedData"
  **EnvelopedData**                        | ✔ | Object |  
   [Version](#version)                     | ✔ | String | Set to "v0"
    **Recipient**                          | ✔ | Object | 
     **KEK**                               | ✔ | Object | 
      [Version](#version)                  | ✔ | String | Set to "v4"
      **KEKIdentifier**                    | ✔ | Object |
       [KeyIdentifier](#data-dictionary-keyidentifier)     | ✔ | String | "SpecV2TestDATKey" for test environment, and "SpecV2ProdDATKey" for production
       [KeyVersion](#data-dictionary-keyversion)           | ✔ | String | An incrementing value. Either a counter or date formatted as YYYYMMDDHHmmss.mmm. See [KeyVersion](#data-dictionary-keyversion)
      **KeyEncryptionAlgorithm**           | ✔ | Object | 
       [Algorithm](#data-dictionary-algorithm)             | ✔ | String | Set to "des-ede3-cbc". 
      [EncryptedKey](#data-dictionary-encryptedkey)        | ✔ | String | A double length 3DES key. See [EncryptedKey](#data-dictionary-encryptedkey)
    **EncryptedContent**                   | ✔ | Object | 
     ContentType                           | ✔ | String | Set to "id-data"
     **ContentEncryptionAlgorithm**        | ✔ | Object | 
      Algorithm                            | ✔ | String | Set to "des-ede3-cbc"
      **Parameter**                        | ✔ | Object | 
      InitialisationVector                 | ✔ | String | An Initial Vector to use for the des-ede3-cbc encryption of the content = SensitiveCardData
     [EncryptedData](#data-dictionary-encrypteddata)       | ✔ | String | Encrypted data. See [EncryptedData](#data-dictionary-encrypteddata)
 **PaymentToken**                          | ✔ | Object | Only present if [EntryMode](#data-dictionary-entrymode) is "File". Object with identifies the payment token. 
  [TokenRequestedType](#data-dictionary-tokenrequestedtype)| ✔ | String | "Transaction" or "Customer". Must match the type of token recorded in the POI System.
  [TokenValue](#tokenvalue)                | ✔ | String | Token previously returned from the POI System in the payment, or card acquisition response 

:::caution
Never send the SensitiveCardData object in the clear. This represents the content to be encrypted and sent within the `ProtectedCardData` element
:::

**SensitiveCardData**

Attribute | Requ.  | Format | Description |
-----------------                        | ------ | ------ | ----------- |
[PAN](#pan)                              | ✔ | String | The full credit card number
[ExpiryDate](#expirydate)                | ✔ | String | The expiry date in "MMYY" format
[CCV](#ccv)                              |  | String | The 3 or 4 digit security code associated with the card 



## PaymentInstrumentType

Indicates the card source for the payment. If not present in the payment defaults to "Card". Available values:

- "Card" where the card source is defined by `EntryMode` and present in either `SensitiveCardData` or `PaymentToken`. If neither are present, then payment (card or mobile) is only accepted by the POI Terminal
- "Check" where the transaction is simply recorded
- "Cash" where the transaction is either recorded, or processed if the POI terminal has cash handling capabilities
- "Mobile" to restrict payment to Mobile only. For example, QR Code payment

## PaymentToken

An object representing a payment token. Consists of three fields: 

Attribute | Requ.  | Format | Description |
-----------------                        | ------ | ------ | ----------- |
[TokenRequestedType](#data-dictionary-tokenrequestedtype)| ✔ | String | Mirrored from the request
[TokenValue](#tokenvalue)                | ✔ | String | The value of the token
[ExpiryDateTime](#expirydatetime)        | ✔ | String | Expiry of the token, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)


## ProductLabel

Product name of a [SaleItem](#data-dictionary-saleitem).

The `ProductLabel` should contain a short, human readable, descriptive name of the product. 

For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 


## Quantity

Item unit quantity


## ResponseRequiredFlag

Boolean. 

True if the Sale System needs to respond to this `DisplayRequest` with a `DisplayResponse`. 

False if the Sale System does not need to send a `DisplayResponse`.


## Result

Indicates the result of the response. Available values: 

Label                | Description       
-------------------- | ----------------- 
Success              | Processing OK. Information related to the result of the processing is contained in other parts of the response message.
Failure              | Processing of the request fails for various reasons. Some further processing according to the type of requested service, the context of the process, and some additional precision about the failure notified in the ErrorCondition data element.
Partial              | The transaction has been processed successfully, but the success is not complete (e.g. only a partial amount is available for the payment, the format to be displayed is not supported and was replaced by a default format).


## ReversalReason

Reason for reversing a successful payment. 

Available values:

- "CustCancel"
- "MerchantCancel"
- "Malfunction"
- "Unable2Compl",
- "SignatureDeclined",
- "Unknown"

## SaleCapabilities

Advises the POI System of the Sale System capabilities and willingness to receive/send event messages. 

`SaleCapabilities` is an array of values containing a combination of the following:

* **CashierStatus**: POI Terminal changes of state are reported back to the Sale System. e.g.
  * "Waiting for Card Presentment"
  * "PIN Entry"
  * "Waiting for Host Authorisation"
  * "Signature Validation"
* **CashierError**: POI Terminal errors are reported back to the Sale System. e.g.
  * "Out of paper"
  * "Printer Error"
  * "Card Swipe Error"
* **CashierInput**: Allows the cashier to provide input from the Sale System. e.g.
  * "Signature OK?"
* **CustomerAssistance**: Allows the cashier to provide assistance to card holders by providing input at specific screens but card holders can still select on terminal. e.g.
  * "Account Selection (Cheque, Savings or Credit).
* **PrinterReceipt**: Redirects receipts to the Sale System instead of the POI Terminal.

## SaleID

Uniquely identifies the Sale System. This value is provided by DataMesh.


## SaleItem 

The `SaleItem` array defines the basket attached to this transaction. Each item is an object which defines a group of similar products in the basket.

The sum of the sale items could be more than <code>RequestedAmount</code> in case of split payment without split of the items (split basket).

:::tip
Please contact the DataMesh integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a> to discuss how to map the Sale System basket to the SaleItem array.
:::

### SaleItem fields

> Example sale item array

```json
"SaleItem":[
  {
    "ItemID":0,
    "ProductCode":"5000112576009",
    "EanUpc":"5000112576009",
    "UnitOfMeasure":"Other",
    "Quantity":"4",
    "UnitPrice":"1.95",
    "ItemAmount":"7.80",
    "ProductLabel":"Coca-Cola No Sugar 1.25L",
    "CostBase":"0.75",
    "Discount":"0.00",
	"Categories":["Drinks", "Soft Drink"],
    "Brand":"Coca-Cola",
    "QuantityInStock":"42"
  },
  {
    "ItemID":1,
    "ProductCode":"HHBY663",
    "EanUpc":"9310015241925",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"1.75",
    "ItemAmount":"1.75",
    "ProductLabel":"Doritos Corn Chips Cheese Supreme Share Pack 170g",
    "CostBase":"1.42",
    "Discount":"0.24",
	"Categories":["Snacks & Confectionery", "Chips"],
    "Brand":"Doritos",
    "QuantityInStock":"15"
  },   
  {
    "ItemID":2,
    "ProductCode":"HGY865",
    "UnitOfMeasure":"Litre",
    "Quantity":"54.25",
    "UnitPrice":"1.45",
    "ItemAmount":"78.66",
    "ProductLabel":"Fuel Unleaded 91",
    "Discount":"0.0",
    "Category":"Fuel"
  },  
  {
    "ItemID":3,
    "ProductCode":"XXVH776",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"54.00",
    "ItemAmount":"54.00",
    "ProductLabel":"Sirloin steak",
    "Categories":["Food", "Mains"]
  },
  {
    "ItemID":4,
    "ProductCode":"XXVH776.0",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "ItemAmount":"0",
    "ProductLabel":"Pepper sauce",
    "Categories":["Food", "Mains"]
  },  
  {
    "ItemID":5,
    "ProductCode":"XXVH776.1",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "ItemAmount":"0",
    "ProductLabel":"Side of fries",
    "Categories":["Food", "Sides"]
  },
  {
    "ItemID":6,
    "ProductCode":"24115522",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"79.95",
    "ItemAmount":"79.95",
    "ProductLabel":"NOLTE LS SHIRT",
    "CostBase":"40.00",
    "Discount":"0.00",
    "Categories":["Men", "Clothing", "Shirts"],
    "Brand":"ACADEMY BRAND",
    "QuantityInStock":"55",
	"PageURL":"https://myweb/24115522/Nolte-LS-Shirt.html",
	"ImageURLs":["https://myweb/productimages/24115522.jpg"],
	"Size":"XL",
	"Colour":"SLATE GREEN CHECK",
	"Weight":1000,
	"WeightUnitOfMeasure":"Gram"
  },
  {
    "ItemID":7,
    "ProductCode":"24390516",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"1650",
    "ItemAmount":"1650",
    "ProductLabel":"JIMMY CHOO LUIS 90 PUMP",
    "Categories":["Women","Shoes","Heels"],
    "Brand":"JIMMY CHOO",
    "QuantityInStock":"2",
	"PageURL":"https://website/24390516/Luis-90-Pump.html",
	"ImageURLs":["https://website/productimages/24390516.jpg"],
	"Size":"38 EU",
	"Colour":"BALLET PINK/CRYSTAL",
	"Weight":500,
	"WeightUnitOfMeasure":"Gram"
  }
]
```



Attribute   | Requ.  | Format | Description |
-----------------                          | ------ | ------ | ----------- |
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
[DiscountReason](#discount-reason)                         |  | String | Explains about the discount applied
[Categories](#data-dictionary-categories)                  |  | Array  | Array of categories. Top level "main" category at categories[0]. See [Categories](#data-dictionary-categories) for more information.
[Brand](#brand)                                            |  | String | Brand name - typically visible on the product packaging or label
[QuantityInStock](#data-dictionary-quantityinstock)        |  | Decimal| Remaining number of this item in stock in same unit of measure as `Quantity`
[Tags](#sale-item-tags)                                    |  | Array  | String array with descriptive tags for the product
[Restricted](#restricted)                                  |  | Boolean| `true` if this is a restricted item, `false` otherwise. Defaults to `false` when field is null.
[PageURL](#productpageurl)                                 |  | String | URL link to the sale items product page
[ImageURLs](#productimageurls)                             |  | Array | String array of images URLs for this sale item
[Style](#style)                                            |  | String | Style of the sale item
[Size](#size)                                            |  | String | Size of the sale item
[Colour](#colour)                                          |  | String | Colour of the sale item
[Weight](#weight)                                          |  | Decimal | Sale item weight, based on `WeightUnitOfMeasure`
[WeightUnitOfMeasure](#data-dictionary-unitofmeasure)      |  | String | Unit of measure of the `Weight`. 
[CustomFields](#data-dictionary-customfields)              |  | Array  | Array of key/type/value objects containing additional information which may be used for sale processing

### Sale items with a UPC/EAN/ISBN

> Example `SaleItem` with UPC

```json
"SaleItem":[
  {
    "ItemID":0,
    "ProductCode":"5000112576009",
    "EanUpc":"5000112576009",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"1.95",
    "ItemAmount":"1.95",
    "ProductLabel":"Coca-Cola No Sugar 1.25L"
  }
]
```

* Items which have a UPC/EAN/ISBN must include the UPC/EAN/ISBN in the [EanUpc](#data-dictionary-eanupc) field. 
* Both [ProductCode](#data-dictionary-productcode) and [EanUpc](#data-dictionary-eanupc) should be populated, even if they are the same value
* Other standard mandatory fields in sale item are still mandatory.

### Sale items with modifiers 

> Example `SaleItem` with modifiers

```json
"SaleItem":[
  {
    "ItemID":0,
    "ProductCode":"XXVH776",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"15.00",
    "ItemAmount":"15.00",
    "ProductLabel":"Big Kahuna Burger"
  },
  {
    "ItemID":1,
	"ParentItemID": 0,
    "ProductCode":"XXVH776-0",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
	"UnitPrice":"0",
    "ItemAmount":"0",
    "ProductLabel":"Extra pineapple"
  },  
  {
    "ItemID":2,
	"ParentItemID": 0,
    "ProductCode":"XXVH776-1",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
	"UnitPrice":"5",
    "ItemAmount":"5",
    "ProductLabel":"Side of fries"
  },
  {
    "ItemID":3,
    "ProductCode":"XXYU998",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"5.00",
    "ItemAmount":"5.00",
    "ProductLabel":"Tasty Beverage"
  },  
]
```

A sale system may represent sale items in the basket as a hierarchy of sale items and sub items, typically referred to as 'modifiers', or 'substitutions'. 

Examples of products with modifiers: 

* a "Big Kahuna Burger" could contain "Extra pineapple" or "Side of fries" as modifiers.
* a "Sirloin steak" could contain "Pepper sauce" or "Medium rare" as modifiers.
* a "Cappuccino" could contain "Sugar" or "Large" as modifiers.


If the Sale System basket contains sale items and modifiers: 

* Include both sale items and modifiers as `SaleItem` objects in the `SaleItem` array.
* For each modifier, set the `ParentItemID` field to the value of the parent sale item `ItemID`
* Set the `ItemAmount` to the value of the modifier, or set to zero if no value 
* The total amount of an item will be the sum of `ItemAmount` in the sale item, and all associated modifiers
* Modifiers may contain a unique `ProductCode` or share the same `ProductCode` as the parent sale item


Some sale Sale Systems do not record modifiers as individual items. For example, they are stored in a 'notes' or 'cooking instructions' field. In this case the additional notes should be included in the [AdditionalProductInfo](#data-dictionary-additionalproductinfo) field. 


### Item bundles

A Sale System may sell items which are bundled together. 

Examples of item "bundles":

* a "lunch special", containing a main, a dessert, and a drink
* a "Valentines day" bundle, containing flowers, and chocolates 
* a "mixed wine case", containing a selection of different wines 
* a "burger meal", containing burger, chips and a drink

The Sale System should populate the `SaleItem` array based on how the "bundle" is represented in the basket. 

If the "bundle" is represented as a unique product with a title and a price, include the "bundle" product as a `SaleItem`. Contents of the bundle can then be included either as "modifiers" associated with the bundle, or as a text description in the [AdditionalProductInfo](#data-dictionary-additionalproductinfo) field. 

If the "bundle" is a shortcut in the Sale System which has no value associated and is simply used to add multiple products to the basket, include each product as a `SaleItem`.

Any `SaleItem` discounts associated with the "item bundle" should be included in the `Discount` field.


### Discounts 

```json
"SaleItem":[
  {
    "ItemID":0,
    "ProductCode":"XXVH776",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
    "UnitPrice":"100.00",
    "ItemAmount":"80.00",
    "ProductLabel":"Shirt",
	"Discount": "20.00",
	"DiscountReason": "20% OFF SALE"
  },
  {
    "ItemID":1,
	"ParentItemID": 0,
    "ProductCode":"XXVH777",
    "UnitOfMeasure":"Other",
    "Quantity":"1",
	"UnitPrice":"0",
    "ItemAmount":"-10.00",
    "ProductLabel":"$10 voucher",
	"Discount": "10.00",
	"DiscountReason": "$10 voucher"	
  }
]
```

Discounts applied to the basket should be reflected by the `SaleItem` array based on how the Sale System handles discounts: 

* For discounts applied across the basket or to an individual item:
  * Set `UnitPrice` to the original item price
  * Update `ItemAmount` to reflect the discounted amount
  * Set `Discount` to reflect the discounted amount per item 
  * Set `DiscountReason` to the reason the item was discounted
* For a discount or voucher applied as a sale item:
  * Set `UnitPrice` to `0`
  * Include a `SaleItem` with a negative `ItemAmount` 
  * Set `Discount` to the discount value 
  * Set `DiscountReason` to the reason for the discount
  
### Refunds 

If the sale items are known for a refund, they should be represented in the `SaleItem` array, otherwise the `SaleItem` array can be left empty.

For example, if a customer purchases three pairs of shoes, and returns one pair:

* If the Sale System records the returned item, it should include that item in the `SaleItem` array with the refund 
* If the Sale System does not record the returned item, but is able to match to the original purchase, it should populate the `SaleItem` array with the items from the orignial purchase. 
* If the Sale System does not record the return item, and is unable to match to the original purchase, the `SaleItem` array can be left empty
  
Refund `SaleItem` objects are represented the same as purchase `SaleItem` objects.

For example:

* The fields marked as mandatory are still mandatory  
* Each `ItemAmount` is a positive amount which reflects the amount being refunded
* The `Quantity` reflects the number of the sale item being refunded

## SaleChannel

Commercial or distribution channel of the item. Default = "Unknown"

## SaleReferenceID

Mandatory for pre-authorisation and completion, otherwise optional.

A globally unique value, used to link a related series of transactions. 

For example, a pre-authorisation, followed by a pre-authorisation top-up, and then a completion all require the same `SaleReferenceID` in the request.

The Sale System must ensure the `SaleReferenceID` is unique across all [SaleID](#data-dictionary-saleid)'s and [POIID](#data-dictionary-poiid)'s across the merchant. If Sale Systems are not synchronised, it is recommended that this value should be a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) to ensure uniqueness.


## SaleTransactionID

Identification of a transaction for a given [SaleId](#data-dictionary-saleid). 

Contains the following fields: 

Attribute |Requ.| Format | Description |
-----------------                        |----| ------ | ----------- |
[TransactionID](#data-dictionary-transactionid)            | ✔ | String | Unique reference for this sale ticket. Not necessarily unique per payment request; for example a sale with split payments will have a number of payments with the same [TransactionID](#data-dictionary-transactionid)
[TimeStamp](#data-dictionary-timestamp)                    | ✔ | String | Time of initiating the payment request on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   



## ShiftNumber

An optional value sent in the [Login Request](#cloud-api-reference-methods-login) for information only. Used to identify the shift that drives the Sale Terminal during the session.

If present, totals in the [ReconciliationResponse](#cloud-api-reference-methods-reconciliation) will be grouped by this value. If not present, payment transactions that do not specify a `ShiftNumber` will not be grouped under a `ShiftNumber`.

Note that different shifts may still occur during the same login session by setting a `ShiftNumber` per payment. 


## ServiceID

The `ServiceID` is a text string between 1 and 10 characters long, which must uniquely identify a transaction between a Sale System and a POI Terminal over a short time period (e.g. one day). 

The `ServiceID` of the message response is mirrored from the `ServiceID` in the message request. This allows for duplicate message checks. 

The POI System will validate that the `ServiceID` is different from the previous request. The Sale System should validate that the `ServiceID` in the response matches the `ServiceID` sent in the request.

The `ServiceID` is used to identify a transaction to retrieve in a [transaction status](#cloud-api-reference-methods-transaction-status) request. 

## SoftwareVersion

The software version of the Sale System.

Must be the software version of the current Sale System build. 

## SplitPaymentFlag

Indicates if a payment is a split payment. Default to false. 

## TaxCode

Type of tax associated with the item. Default = "GST"


## TotalsGroupId

Groups transactions in a login session. 

This can be used for reconciliation purposes and may span a single day or different periods.

If not present, payment transactions will remain ungrouped. 

## TransactionType

Type of transaction for which totals are grouped.


Label                | Description       
-------------------- | ----------------- 
Debit                | Payment Debit transactions (e.g. if `PaymentType` is "Normal")
Credit               | Payment Credit transactions (e.g. if `PaymentType` is "Refund")
CashAdvance          | Cash-out payment types or cash components of a Normal payment type
ReverseDebit         | Payment Reversal Debit transactions
ReverseCredit        | Payment Reversal Credit transactions
OneTimeReservation   | Outstanding one-time pre-authorisation transactions, i.e. between pre-authorisation and completion
CompletedDeffered    | One-time Pre-authorisation transactions which have been completed by the completion.
FirstReservation     | Initial pre-authorisation payment types
UpdateReservation    | Updated pre-authorisation payment types
CompletedReservation | Pre-authorisation transactions which have been completed by the completion 
Declined             | Transactions which has not been approved (`Result` = "Failure" and `ErrorCondition` = "Refusal").
Failed               | Transactions which have not successfully completed (`Result` = "Failure" and `ErrorCondition` not equal to "Refusal").



## TerminalEnvironment

Available values:

* **Attended** - a cashier interface is present
* **SemiAttended** - a cashier is present but not interfaced
* **Unattended** - no cashier is present


## TimeStamp

Date and time of a transaction for the Sale System, the POI System or the Acquirer. 

Formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601). e.g. "2019-09-02T09:13:51.0+01:00"

Used to ensure the uniqueness of a transaction for Sale System, the POI System or the Acquirer, or indicates the time when the event occurs in the `EventNotification` message.
 

## TokenRequestedType

The `TokenRequestedType` is an optional field per transaction. Indicates if a token should be created for this sale, and if so which type of token. 

* If not present no token is created
* If set to "Transaction" a token is created which is only valid for the transaction. For example to process a subsequent Refund or Void/Reversal.
* If set to "Customer" a token is created which represents the PAN, and can be used to represent the card holder for a longer period.

:::caution
If a `Payment` is requested using a PaymentToken of the same TokenRequestedType and this JSON element is present, the existing Token is replaced. This can affect other Sale Terminals, so use with caution.
:::


## TransactionID

String.

Used to identify a transaction on the Sale System or POI System.


## UnitOfMeasure

Unit of measure of the [Quantity](#data-dictionary-quantity)

Available values: 

- Case
- Foot
- UKGallon
- USGallon
- Gram
- Inch
- Kilogram
- Pound
- Meter
- Centimetre
- Litre
- Centilitre
- Ounce
- Quart
- Pint
- Mile
- Kilometre
- Yard
- Other

## UnitPrice

Price per item unit