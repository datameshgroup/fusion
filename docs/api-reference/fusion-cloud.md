---
sidebar_position: 2
---

# Fusion Cloud

The Fusion Cloud API allows the Sale System to communicate with a POI terminal via a Websocket connected to the DataMesh Unify switch. 

## Reference code  

| <div style={{width:'180px'}}>Development Language</div> | Description | Location |
:-----------------:                        | -----------------                        | ----------- |
.Net | .Net NuGet package | on [Nuget](https://www.nuget.org/packages/DataMeshGroup.Fusion.FusionClient/) |
| | Source Code | on [GitHub](https://github.com/datameshgroup/sdk-dotnet) |
| | Demo Application implementing the sdk | on [GitHub](https://github.com/datameshgroup/sdk-dotnet-purchasedemo) |
Java | Source Code | on [GitHub](https://github.com/datameshgroup/fusioncloud-sdk-java) | 
| | Library | on [Maven Central](https://central.sonatype.com/artifact/com.datameshgroup.fusion/fusion-cloud) |
| | Demo Application implementing the sdk | on [GitHub](https://github.com/datameshgroup/fusioncloud-sdk-java-demo) |
| | Android Demo Application implementing the sdk | on [GitHub](https://github.com/datameshgroup/fusioncloud-sdk-android-demo) |
Swift (for iOS) | Source Code | on [GitHub](https://github.com/datameshgroup/fusioncloud-sdk-ios)
| | Demo Application implementing the sdk | on [GitHub](https://github.com/datameshgroup/fusioncloud-sdk-ios-demo) |

## Security requirements

Unify utilises secure websockets for communication between Sale System and POI Server.

- The Sale System and merchant environment must support outgoing TCP connections to `*.datameshgroup.io:443`, `*.datameshgroup.io:4000`, and `*.datameshgroup.io:5000` for both the terminal and Sale System
- As a cloud service, Unify may run on several IP addresses. 
  - The Sale System must always use the DNS endpoints provided by DataMesh and never limit connectivity to a specific IP address
- The Sale System websocket connection must use TLS v1.2 or v1.3 with the SNI extension and one of the following ciphers:
  - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (TLS v1.2)
  - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (TLS v1.2)
  - TLS_AES_128_GCM_SHA256 (TLS v1.3)
  - TLS_CHACHA20_POLY1305_SHA256 (TLS v1.3)
  - TLS_AES_256_GCM_SHA384 (TLS v1.3)
- The Sale System must ensure the connection to Unify is trusted by validating the server-side certificate chain
  - Unify utilises a self-signed root CA provided by DataMesh which can be downloaded from [here](files/rootca.datameshgroup.io.zip)
  - Intermediate certificates in the chain will be provided by the TLS session
  - Contact [integrations@datameshgroup.com](mailto:integrations@datameshgroup.com) for alternative connection methods if the supporting the DataMesh root CA is unmanageable (for example, in a browser-based POS)
  - If certificate validation fails the Sale System must display an error and drop the connection.
- The Sale System must resolve the DNS address before each connection attempt, and never hard code IP addresses
- The Sale System should manage SSL certificate revocation lists and ensure OS security updates are applied
- The Sale System should store the [SaleID](/docs/api-reference/data-model#saleid), [POIID](/docs/api-reference/data-model#poiid), and [KEK](/docs/api-reference/data-model#kek) in a secure location. These values are used to identify the Sale System and authenticate the [SecurityTrailer](#securitytrailer)

<!--  - Unify utilises one of the root CA's provided by [Sectigo](https://sectigo.com/resource-library/sectigo-root-intermediate-certificate-files) and [Digicert](https://www.digicert.com/kb/digicert-root-certificates.htm). The Sale System must ensure all certificate authorities from these sources are loaded into the certificate store used to validate the server. 
  - A full list of ca files can be downloaded from [here](files/root-ca-list.zip). -->


:::tip
Over time, Data Mesh may require the Sale System to update the TLS requirements provided above if a security risk is identified. In this situation DataMesh will provide the new requirements and allow a reasonable amount of time to allow the Sale System to meet the new requirements. 
:::

## Endpoints

<!--
All endpoints are on port 443 and valid for secure websocket connections.
-->

Production environment

`wss://nexo.datameshgroup.io:5000`

<!--
`wss://nexo.aus.datameshgroup.io/nexocloudpos`
-->

Test environment

`wss://www.cloudposintegration.io/nexouat1`

<!--
`wss://nexo.aus.datameshgroup.io/nexocloudpos`


`wss://nexo.nonprod.aus.datameshgroup.io/nexocloudpos`
-->


## Message format

<details>

<summary>
SaleToPOIRequest
</summary>

<p>

```json
{
  "SaleToPOIRequest": {
    "MessageHeader":{...},
    "PaymentRequest":{...},
    "SecurityTrailer":{...}
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
    "PaymentResponse":{...},
    "SecurityTrailer":{...}
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

The `SaleToPOIRequest` and `SaleToPOIResponse` contain three objects: 

1. A [MessageHeader](#messageheader) object.
1. A [Payload](#payload) object of variable types.
1. A [SecurityTrailer](#securitytrailer) object. 

### MessageHeader

<details>

<summary>
MessageHeader
</summary>

<p>

```json
"MessageHeader":{
  "ProtocolVersion":"3.1-dmg",
  "MessageClass":"",
  "MessageCategory":"",
  "MessageType":"",
  "ServiceID":"",
  "SaleID":"",
  "POIID":""
}
```
</p>
</details>

A `MessageHeader` is included with each request and response. It defines the protocol, message type, sale and POI id.


<div style={{width:'240px'}}>Attributes</div>                             |Requ.| Format | Description |
-----------------                     |:----:| ------ | ----------- |
[ProtocolVersion](/docs/api-reference/data-model#protocolversion)   | ✔ | String | Version of the Sale to POI protocol specifications. Set to "3.1-dmg". Present when `MessageCategory` is "Login" otherwise absent.
[MessageClass](/docs/api-reference/data-model#messageclass)         | ✔ | String | Informs the receiver of the class of message. Possible values are "Service", "Device", or "Event"
[MessageCategory](/docs/api-reference/data-model#messagecategory)   | ✔ | String | Indicates the category of message. Possible values are "CardAcquisition", "Display", "Login", "Logout", "Payment" 
[MessageType](/docs/api-reference/data-model#messagetype)           | ✔ | String | Type of message. Possible values are "Request", "Response", or "Notification"
[ServiceID](/docs/api-reference/data-model#serviceid)               | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                     | ✔ | String | Uniquely identifies the Sale System. The [SaleID](/docs/api-reference/data-model#saleid) is provided by DataMesh, and must match the SaleID configured in Unify.
[POIID](/docs/api-reference/data-model#poiid)                       | ✔ | String | Uniquely identifies the POI Terminal. The [POIID](/docs/api-reference/data-model#poiid) is provided by DataMesh, and must match the POIID configured in Unify. For Sale Systems that do not need a POI Terminal, the value must be "POI Server"
| |  |  | Only in the Login request after a successful [QR POS Pairing](/docs/getting-started#qr-pos-pairing), this field will contain the PairingPOIID value from the [pairing QR code data](/docs/getting-started#pairing-qr-code)

 
### Payload

An object which defines fields for the request/response. The object name depends on the [MessageCategory](/docs/api-reference/data-model#messagecategory) defined in the `MessageHeader`

e.g. a login will include `LoginRequest`/`LoginResponse`, and a payment will include a `PaymentRequest`/`PaymentResponse`.

The *Cloud API Reference* outlines the expected payload for each supported request.  

### SecurityTrailer

<details>

<summary>
SecurityTrailer
</summary>

<p>

```json
"SecurityTrailer":{
  "ContentType":"id-ctauthData",
  "AuthenticatedData":{
   "Version":"v0",
 "Recipient":{
   "KEK":{
  "Version":"v4",
  "KEKIdentifier":{
    "KeyIdentifier":"SpecV2TestMACKey",
    "KeyVersion":"20191122164326.594"
  },
  "KeyEncryptionAlgorithm":{
    "Algorithm":"des-ede3-cbc"
  },
  "EncryptedKey":"834EAB305DD18724B9ADF361FC698CE0"
   },
   "MACAlgorithm":{
  "Algorithm":"id-retail-cbc-mac-sha-256"
   },
   "EncapsulatedContent":{
  "ContentType":"iddata"
   },
   "MAC":"C5142F4DB828AA1C"
 }
  }
}
```
</p>
</details>

A `SecurityTrailer` object is included with each request and response. 

Unify authenticates requests from the Sale System by examining the `SecurityTrailer`, along with the [SaleID](/docs/api-reference/data-model#saleid), [POIID](/docs/api-reference/data-model#poiid), and `CertificationCode`

Session Keys are used to generate/verify a Message Authentication Code (MAC) to prove the authenticity of transactions. They are also used to protect Sensitive Card Data if sent from the Sale System. Session keys must change for every message.


**SecurityTrailer**

| <div style={{width:'180px'}}>Attribute</div> |Requ.| Format | Description |
-----------------                          |:----:| ------ | ----------- |
[ContentType](#contenttype)                | ✔ | String | Set to "id-ctauthData"
*AuthenticatedData*                        | ✔ | Object |  
 [Version](#version)                       | ✔ | String | Set to "v0"
 *Recipient*                               | ✔ | Object | 
  *KEK*                                    | ✔ | Object | 
   [Version](#version)                     | ✔ | String | Set to "v4"
   *KEKIdentifier*                         | ✔ | Object |
    [KeyIdentifier](/docs/api-reference/data-model#keyidentifier)        | ✔ | String | "SpecV2TestMACKey" for test environment, and "SpecV2ProdMACKey" for production
    [KeyVersion](/docs/api-reference/data-model#keyversion)              | ✔ | String | An incrementing value. Either a counter or date formatted as YYYYMMDDHHmmss.mmm. See [KeyVersion](/docs/api-reference/data-model#keyversion)
   *KeyEncryptionAlgorithm*                | ✔ | Object | 
    [Algorithm](/docs/api-reference/data-model#algorithm)                | ✔ | String | Set to "des-ede3-cbc". 
   [EncryptedKey](/docs/api-reference/data-model#encryptedkey)           | ✔ | String | A double length 3DES key. See [EncryptedKey](/docs/api-reference/data-model#encryptedkey)
  *MACAlgorithm*                           | ✔ | Object | 
   [Algorithm](/docs/api-reference/data-model#algorithm)                 | ✔ | String | Set to "id-retail-cbc-mac-sha-256"
   *EncapsulatedContent*                   | ✔ | Object | 
    [ContentType](#contenttype)            | ✔ | String | Set to "iddata"
  [MAC](/docs/api-reference/data-model#mac)                              | ✔ | String | MAC of message content. See [MAC](/docs/api-reference/data-model#mac)


:::info
For brevity the <code>SecurityTrailer</code> has been excluded from examples.
:::

## Perform a purchase

To perform a purchase the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).


- If a login hasn't already been sent for the session, send a login request as detailed in [login request](#login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Record the [POISerialNumber](/docs/api-reference/data-model#poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](#payment) 
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set the purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid) to a unique value for the sale on this Sale System
  - Populate the [SaleItem](/docs/api-reference/data-model#saleitem) array with the product basket for the transaction 
- If configured in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities), handle any [display](#display), [print](#print), and [input](#input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
  - If [Response.Result](/docs/api-reference/data-model#result) is "Success", record the following to enable future matched refunds: [SaleID](/docs/api-reference/data-model#saleid), [POIID](/docs/api-reference/data-model#poiid), and [POITransactionID](/docs/api-reference/data-model#poitransactionid)
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - If the Sale System is handling tipping or surcharge, check the [PaymentResult.AmountsResp.TipAmount](/docs/api-reference/data-model#tipamount), and [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](#error-handling)


## Perform a refund

<!-- TODO need to add support here for matched refunds -->

To perform a refund the Sale System will need to implement requests, and handle responses outlined in the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle).

If refunding a previous purchase, the Sale System should include details of the original purchase. 

- If a login hasn't already been sent for the session, send a login request as detailed in [login request](#login) 
  - Ensure "PrinterReceipt" is included in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) if payment receipts are to be redirected to the Sale System
- Await the a login response and
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Record the [POISerialNumber](/docs/api-reference/data-model#poiserialnumber) to be sent in subsequent login requests
- Send a payment request, including all required fields, as detailed in [payment request](#payment) 
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Refund"
  - Set the refund amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - Set [SaleTransactionID](/docs/api-reference/data-model#saletransactionid) to a unique value for the sale on this Sale System
  - If refunding a previous purchase, set the following fields in [PaymentTransaction.OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction)
    - Set [SaleID](/docs/api-reference/data-model#saleid) to the [SaleID](/docs/api-reference/data-model#saleid) of the original purchase payment request 
	- Set [POIID](/docs/api-reference/data-model#poiid) to the [POIID](/docs/api-reference/data-model#poiid) of the original purchase payment request 
	- Set [POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) of the original purchase payment response 
    - The product basket is not required for refunds
- If configured in [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities), handle any [display](#display), [print](#print), and [input](#input) events the POI System sends
  - The expected user interface handling is outlined in [user interface](#user-interface)
  - The expected payment receipt handling is outlined in [receipt printing](#receipt-printing)
- Await the payment response 
  - Ensure the [ServiceID](/docs/api-reference/data-model#serviceid) in the result matches the request
  - Check [Response.Result](/docs/api-reference/data-model#result) for the transaction result 
  - Check [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) (it may not equal the `RequestedAmount` in the payment request)
  - Print the receipt contained in `PaymentReceipt`
- Implement error handling outlined in [error handling](#error-handling)

## Sample code for Performing a Purchase or Refund

Please refer to the methods in the files listed below to view sample code handling on how to perform a payment/refund.  

Development Language  | Method Name  | GitHub File | GitHub Repository |
:-----------------:                        | :-----------------:                        | :-----------: |  :-----------------:                        |
C# .Net | *DoPayment* | [MainWindow.xaml.cs](https://github.com/datameshgroup/sdk-dotnet-testpos/blob/master/SimplePOS/MainWindow.xaml.cs) | [sdk-dotnet-testpos](https://github.com/datameshgroup/sdk-dotnet-testpos) |
Java | *doPayment* | [FusionClientDemo.java](https://github.com/datameshgroup/fusioncloud-sdk-java-demo/blob/master/fusion-client-demo/src/main/java/com/dmg/fusion/FusionClientDemo.java) | [fusioncloud-sdk-java-demo](https://github.com/datameshgroup/fusioncloud-sdk-java-demo) |
Swift | *doPayment* | [ViewController.swift](https://github.com/datameshgroup/fusioncloud-sdk-ios-demo/blob/master/TestAppDM/ViewController.swift) | [fusioncloud-sdk-ios-demo](https://github.com/datameshgroup/fusioncloud-sdk-ios-demo) |

## Methods

### Login 

The Sale System sends a NEXO Login request when it is ready to pair with a POI terminal and 
before any Reconciliation Request. The Sale System can pair with multiple POI terminals by 
sending another NEXO Login request.

#### Login request

<details>

<summary>
Login request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "ProtocolVersion":"3.1-dmg",
         "MessageClass":"Service",
         "MessageCategory":"Login",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "LoginRequest":{
         "DateTime":"xxx",
         "SaleSoftware":{
            "ProviderIdentification":"xxx",
            "ApplicationName":"xxx",
            "SoftwareVersion":"xxx",
            "CertificationCode":"xxx"
         },
         "SaleTerminalData":{
            "TerminalEnvironment":"xxx",
            "SaleCapabilities":[
               "xxx",
               "xxx",
               "xxx"
            ],
            "TotalsGroupID":"xxx"
         },
         "OperatorLanguage":"en",
         "OperatorID":"xxx",
         "ShiftNumber":"xxx",
         "POISerialNumber":"xxx",
         "Pairing": "true or false"
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[ProtocolVersion](/docs/api-reference/data-model#protocolversion)       | ✔ | String | "3.1-dmg"       
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Login"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Uniquely identifies the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal
| |  |  | Only in the Login request after a successful [QR POS Pairing](/docs/getting-started#qr-pos-pairing), this field will contain the PairingPOIID value from the [pairing QR code data](/docs/getting-started#pairing-qr-code)

**LoginRequest**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----: | ------ | ----------- |
[DateTime](/docs/api-reference/data-model#datetime)                        | ✔ | String | Current Sale System time, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   
**SaleSoftware**                            | ✔ | Object | Object containing Sale System identification
 [ProviderIdentification](/docs/api-reference/data-model#provideridentification)| ✔ | String | The name of the company supplying the Sale System. Provided by DataMesh.
 [ApplicationName](/docs/api-reference/data-model#applicationname)          | ✔ | String | The name of the Sale System application. Provided by DataMesh.
 [SoftwareVersion](/docs/api-reference/data-model#softwareversion)          | ✔ | String | The software version of the Sale System. Must be the software version of the current build. 
 [CertificationCode](/docs/api-reference/data-model#certificationcode)      | ✔ | String | Certification code for this Sale System. Provided by DataMesh.
**SaleTerminalData**                          | ✔ | Object | Object containing Sale System configuration 
 [TerminalEnvironment](/docs/api-reference/data-model#terminalenvironment)  | ✔ | String | "Attended", "SemiAttended", or "Unattended"
 [SaleCapabilities](/docs/api-reference/data-model#salecapabilities)        | ✔ | Array | Advises the POI System of the Sale System capabilities. See [SaleCapabilities](/docs/api-reference/data-model#salecapabilities) 
 [TotalsGroupId](/docs/api-reference/data-model#totalsgroupid)              |  | String | Groups transactions in a login session
[OperatorLanguage](#operatorlanguage)         |   | String | Operator language. Set to 'en'
[OperatorId](/docs/api-reference/data-model#operatorid)                     |  | String | Groups transactions under this operator id
[ShiftNumber](/docs/api-reference/data-model#shiftnumber)                   |  | String | Groups transactions under this shift number
[POISerialNumber](/docs/api-reference/data-model#poiserialnumber)           |  | String | The POISerialNumber from the last login response, or absent if this is the first login 
Pairing           |  | Boolean| True if the POI ID in the MessageHeader is the PairingPOIID value from the [pairing QR code data](/docs/getting-started#pairing-qr-code) for the [QR POS Pairing](/docs/getting-started#qr-pos-pairing)

#### Login response

<details>

<summary>
Login response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "ProtocolVersion":"3.1-dmg",
         "MessageClass":"Service",
         "MessageCategory":"Login",
         "MessageType":"Response",
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "LoginResponse":{
         "Response":{
            "Result":"xxx",
            "ErrorCondition":"xxx",
            "AdditionalResponse":"xxx"
         },
         "POISystemData":{
            "DateTime":"xxx",
            "POISoftware":{
               "ProviderIdentification":"xxx",
               "ApplicationName":"xxx",
               "SoftwareVersion":"xxx"
            },
            "POITerminalData":{
               "TerminalEnvironment":"xxx",
               "POICapabilities":[
                  "xxx",
                  "xxx",
                  "xxx"
               ],
               "POIProfile":{
                  "GenericProfile":"Custom"
               },
               "POISerialNumber":"xxx"
            },
            "POIStatus":{
               "GlobalStatus":"xxx",
               "PEDOKFlag":"true or false",
               "CardReaderOKFlag":"true or false",
               "PrinterStatus":"xxx",
               "CommunicationOKFlag":"true or false",
               "FraudPreventionFlag":"true or false"
            },
            "TokenRequestStatus":"true or false"
         }
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[ProtocolVersion](/docs/api-reference/data-model#protocolversion)       | ✔ | String | "3.1-dmg"       
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Login"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from the request
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from the request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from the request

**LoginResponse**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            | :--------: | ------ | ----------- |
**Response**                                 | ✔ | Object | Object indicating the result of the login
 [Result](/docs/api-reference/data-model#result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |    | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |    | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
**POISystemData**                            |    | Object | Only present when `Result` is "Success"
 [DateTime](/docs/api-reference/data-model#datetime)                       | ✔ | String | Time on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   
 [TokenRequestStatus](#tokenrequeststatus)   | ✔ | Boolean| True if POI tokenisation of PANs is available and usable
 **POITerminalData**                         | ✔ | Object | Object representing the POI Terminal 
  [TerminalEnvironment](/docs/api-reference/data-model#terminalenvironment)| ✔ | String | Mirrored from the request
  [POICapabilities](#poicapabilities)        | ✔ | Array  | An array of strings which reflect the hardware capabilities of the POI Terminal. "MagStripe", "ICC", and "EMVContactless" 
  [GenericProfile](#genericprofile)          | ✔ | String | Set to "Custom"
  [POISerialNumber](/docs/api-reference/data-model#poiserialnumber)        | ✔ | String | If POIID is "POI Server", then a virtual POI Terminal Serial Number. Otherwise the serial number of the POI Terminal
 **POIStatus**                               | ✔ | String | Object representing the current status of the POI Terminal
  [GlobalStatus](#globalstatus)              | ✔ | String | The current status of the POI Terminal. "OK" when the terminal is available. "Maintenance" if unavailable due to maintenance processing. "Unreachable" if unreachable or not responding
  [SecurityOKFlag](#securityokflag)          | ✔ | Boolean| True if the security module is present 
  [PEDOKFlag](#pedokflag)                    | ✔ | Boolean| True if PED is available and usable for PIN entry
  [CardReaderOKFlag](#cardreaderokflag)      | ✔ | Boolean| True if card reader is available and usable
  [PrinterStatus](#printerstatus)            | ✔ | String | Indicates terminal printer status. Possible values are "OK", "PaperLow", "NoPaper", "PaperJam", "OutOfOrder" 
  [CommunicationOKFlag](#communicationokflag)| ✔ | Boolean| True if terminal's communication is available and usable
  [FraudPreventionFlag](#fraudpreventionflag)| ✔ | Boolean| True if the POI detects possible fraud



### Logout 

Logging out is optional.

If sent, it tells the POI system that it won’t send new transactions to the POI Terminal 
and unpairs the Sale Terminal from the POI Terminal. Any further transactions to that POI Terminal 
will be rejected by the POI System until the next Login.

The Sale System may send multiple Login requests without a Logout request.

#### Logout request

<details>

<summary>
Logout request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"Logout",
         "MessageType":"Request",
         "ServiceID":"xxxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "LogoutRequest":{
         "MaintenanceAllowed":"true or false"
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Logout"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Uniquely identifies the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**LogoutRequest**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |----| ------ | ----------- |
[MaintenanceAllowed](/docs/api-reference/data-model#maintenanceallowed)    |  | Boolean| Indicates if the POI Terminal can enter maintenance mode. Default to true if not present.    

#### Logout response

<details>

<summary>
Logout response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"Logout",
         "MessageType":"Response",
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "LogoutResponse":{
         "Response":"xxx",
         "ErrorCondition":"xxx",
         "AdditionalResponse":"xxx xxxx xxxx xxxx xxxx"
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Logout"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Uniquely identifies the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**LogoutResponse**

<div style={{width:'240px'}}>Attributes</div>     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
**Response**                                 | ✔ | Object | Object which represents the result of the response
 [Result](/docs/api-reference/data-model#result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |  | String | Indicates the reason an error occurred. Only present when result is "Failure". Possible values are "MessageFormat", "Busy", "DeviceOut", "UnavailableService" and others. Note the Sale System should handle error conditions outside the ones documented in this specification.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |  | String | Provides additional error information. Only present when result is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information of possible values. 


### Payment 

The payment message is used to perform purchase, purchase + cash out, cash out only, and refund requests. 


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
               "AllowedPaymentBrand":[
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
      },
      "SecurityTrailer":{...}
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
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Uniquely identifies the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

##### **PaymentRequest**

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
  [TerminalEnvironment](/docs/api-reference/data-model#terminalenvironment)|  | String | "Attended", "SemiAttended", or "Unattended"
  [SaleCapabilities](/docs/api-reference/data-model#salecapabilities)      |  | Array  | Advises the POI System of the Sale System capabilities. See [SaleCapabilities](/docs/api-reference/data-model#salecapabilities) 
  [TotalsGroupId](/docs/api-reference/data-model#totalsgroupid)            |  | String | Groups transactions in a login session
**PaymentTransaction**                       | ✔ | Object | 
 **AmountsReq**                               | ✔ | Object | Object which contains the various components which make up the payment amount
  [Currency](#currency)                      | ✔ | String | Three character currency code. Set to "AUD"
  [RequestedAmount](#requestedamount)        | ✔ | Decimal| The requested amount for the transaction sale items, including cash back and tip requested
  [CashBackAmount](#cashbackamount)          |  | Decimal | The Cash back amount. Only if cash back is included in the transaction by the Sale System
  [TipAmount](#tipamount)                    |  | Decimal | The Tip amount. Only if tip is included in the transaction.  Setting TipAmount to 0 will display the Tip Entry screen in the POI Terminal.  Do not set TipAmount to 0 if you don't want the Tip Entry screen to be displayed in the POI terminal.
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
  [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand)
  [AcquirerID](/docs/api-reference/data-model#paymenttransaction.transactionconditions.acquirerid) |  | Array  | Used to restrict the payment to specified acquirers. See [AcquirerID](/docs/api-reference/data-model#paymenttransaction.transactionconditions.acquirerid)
  [DebitPreferredFlag](#debitpreferredflag)  |  | Boolean| If present, debit processing is preferred to credit processing.
  [ForceOnlineFlag](/docs/api-reference/data-model#forceonlineflag)        |  | Boolean| If 'true' the transaction will only be processed in online mode, and will fail if there is no response from the Acquirer.
  [MerchantCategoryCode](/docs/api-reference/data-model#merchantcategorycode)|  | String | If present, overrides the MCC used for processing the transaction if allowed. Refer to ISO 18245 for available codes.
 **[SaleItem](/docs/api-reference/data-model#saleitem)**                   | ✔ | Array  | Array of [SaleItem](/docs/api-reference/data-model#s) objects which represent the product basket attached to this transaction. See [SaleItem](/docs/api-reference/data-model#saleitem) for examples.
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
  [PaymentType](/docs/api-reference/data-model#paymenttype)                | ✔ | String | Defaults to "Normal". Indicates the type of payment to process. "Normal", "Refund", or "CashAdvance". See [PaymentType](/docs/api-reference/data-model#paymenttype)  
  [PaymentInstrumentData](/docs/api-reference/data-model#paymentinstrumentdata) |   | Object | Object with represents card details for token or manually enter card details. See  for object structure.  
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
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
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
                  "PaymentBrandID":"xxx",
                  "PaymentBrandLabel":"xxx",
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
      },
      "SecurityTrailer":{...}
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
[SaleID](/docs/api-reference/data-model#saleid)                            | ✔ | String | Mirrored from the request
[POIID](/docs/api-reference/data-model#poiid)                              | ✔ | String | Mirrored from the request

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
&emsp;&emsp;&emsp;[PaymentBrand](/docs/api-reference/data-model#paymentbrand)             | ✔ | [String(1,128)](#data-format) | Deprecated. Use [PaymentBrandId](/docs/api-reference/data-model#paymentbrandid)
&emsp;&emsp;&emsp;[PaymentBrandId](/docs/api-reference/data-model#paymentbrandid)         | ✔ | [String(4,4)](#data-format)   | Indicates the payment type used. 
&emsp;&emsp;&emsp;[PaymentBrandLabel](/docs/api-reference/data-model#paymentbrandlabel)   | ✔ | [String(0,256)](#data-format) | Descriptive label of the payment type used.
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


### Display 

During a payment, the POI System will send status and error display requests to the Sale System, which enables the Sale System to inform the cashier of the current transaction status.

Follow the [user interface](#user-interface) guide for details on how to implement the required UI to handle display and input requests.

#### Display request

<details>

<summary>
Display request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Display",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "DisplayRequest":{
         "DisplayOutput":{
            "ResponseRequiredFlag":false,
            "Device":"CashierDisplay",
            "InfoQualify":"xxx",
            "OutputContent":{
               "OutputFormat":"Text",
               "OutputText":{
                  "Text":"xxx"
               }
            }
         }
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Display"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from payment
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment

**DisplayRequest**

<div style={{width:'240px'}}>Attributes</div>                  |Requ.| Format | Description |
-----------------                                         |:----:| ------ | ----------- |
**DisplayOutput**                                         | ✔ | Object | Object which represents the display 
 [ResponseRequiredFlag](/docs/api-reference/data-model#responserequiredflag)|  | Boolean | Indicates if the POI System requires a `DisplayResponse` to be sent for this `DisplayRequest`
 [Device](#device)                                        | ✔ | String | "CashierDisplay"
 [InfoQualify](/docs/api-reference/data-model#infoqualify)              | ✔ | String | "Status" or "Error". See [InfoQualify](/docs/api-reference/data-model#infoqualify)
 [OutputFormat](/docs/api-reference/data-model#outputformat)            | ✔ | String | "Text"
 [Text](#text)                                            | ✔ | String | Single line of text to display

#### Display response

<details>

<summary>
Display response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Display",
         "MessageType":"Response",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "DisplayResponse":{
         "OutputResult":[
            {
               "Device":"xxx",
               "InfoQualify":"xxx",
               "Response":{
                  "Result":"xxx",
                  "ErrorCondition":"xxx",
                  "AdditionalResponse":"xxx"
               }
            }
         ]
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>
 
The Sale System is expected to send a `DisplayResponse` if one or more displays in `DisplayOutput` have [ResponseRequiredFlag](/docs/api-reference/data-model#responserequiredflag) set to true.


**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Display"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from display request
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from display request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from display request

**DisplayResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format | Description |
-----------------                             |:----:| ------ | ----------- |
*OutputResult*                                | ✔ | Object | Response for Device/InfoQualify pair where corresponding `ResponseRequiredFlag` in the `DisplayRequest` is set to true.
 [Device](#device)                            | ✔ | String | Mirrored from display request
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | Mirrored from display request
 [Result](/docs/api-reference/data-model#result)                            | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 




### Input

:::warning
The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.
:::


During a payment, the POI System will input requests to the Sale System if cashier interaction is required (e.g. signature approved yes/no)

Follow the [user interface](#user-interface) guide for details on how to implement the required UI to handle display and input requests.
 
#### Input request

<details>

<summary>
Input request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Input",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "InputRequest":{
         "DisplayOutput":{
            "Device":"CashierDisplay",
            "InfoQualify":"POIReplication",
            "OutputContent":{
               "OutputFormat":"Text",
               "OutputText":{
                  "Text":"xxx"
               }
            },
            "MenuEntry":[
               {
                  "OutputFormat":"Text",
                  "OutputText":{
                     "Text":"xxx"
                  }
               }
            ]
         },
         "InputData":{
            "Device":"CashierInput",
            "InfoQualify":"xxx",
            "InputCommand":"xxx",
            "MaxInputTime":"xxx",
            "MinLength":"xxx",
            "MaxLength":"xxx",
            "MaskCharactersFlag":"true or false"
         }
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Input"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from payment request
[DeviceID](#deviceid)                     | ✔ | String | Unique message identifier
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment request

**InputRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
**DisplayOutput**                             |  | Object | Information to display and the way to process the display.
 [Device](#device)                            | ✔ | String | "CashierDisplay"
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | "POIReplication". See [InfoQualify](/docs/api-reference/data-model#infoqualify)
 **OutputContent**                            | ✔ | Object | 
  [OutputFormat](/docs/api-reference/data-model#outputformat)               | ✔ | String | "Text"
  **OutputText**                              | ✔ | Object | Wrapper for text content
   [Text](#text)                              | ✔ | String | Single line of text. e.g. "Signature Ok?", "Merchant Password", "Select Account Type"
 **MenuEntry**                                |  | Array  | Conditional. Array of items to be presented as a menu. Only present if [InputCommand](/docs/api-reference/data-model#inputcommand) = "GetMenuEntry"
  [OutputFormat](/docs/api-reference/data-model#outputformat)               | ✔ | String | "Text"
  [Text](#text)                               | ✔ | String | One of the selection String items for the cashier to select from. For example: "Savings", "Cheque" and "Credit" for an account type selection.
**InputData**                                 | ✔ | Object | Information related to an `Input` request
 [Device](#device)                            | ✔ | String | "CashierInput"
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | "Input" or "CustomerAssistance". See [InfoQualify](/docs/api-reference/data-model#infoqualify)
 [InputCommand](/docs/api-reference/data-model#inputcommand)                | ✔ | String | "GetConfirmation", "Password", "TextString", "DigitString", "DecimalString", or "GetMenuEntry". See [InputCommand](/docs/api-reference/data-model#inputcommand)
 [MaxInputTime](#maxinputtime)                |  | Number | The maximum number of seconds allowed for providing input.  Note the Sale Terminal needs to abort the Input process if it receives a DisplayRequest or InputRequest whilst waiting on input from the Cashier.
 [MinLength](#minlength)                      |  | Number | The minimum number of characters allowed for entry. Present if [InputCommand](/docs/api-reference/data-model#inputcommand) = "Password", "TextString", "DigitString", or "DecimalString"
 [MaxLength](#maxlength)                      |  | Number | The maximum number of characters allowed for entry. Present if [InputCommand](/docs/api-reference/data-model#inputcommand) = "Password", "TextString", "DigitString", or "DecimalString"
 [MaskCharactersFlag](#maskcharactersflag)    |  | Boolean| If true, input should be masked with '*'. Present if [InputCommand](/docs/api-reference/data-model#inputcommand) = "Password"

#### Input response

<details>

<summary>
Input response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Input",
         "MessageType":"Response",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "InputResponse":{
         "OutputResult":{
            "Device":"CashierDisplay",
            "InfoQualify":"POIReplication",
            "Response":{
               "Result":"xxx",
               "ErrorCondition":"xxx",
               "AdditionalResponse":"xxx"
            }
         },
         "InputResult":{
            "Device":"CashierInput",
            "InfoQualify":"xxx",
            "Response":{
               "Result":"xxx",
               "ErrorCondition":"xxx",
               "AdditionalResponse":"xxx"
            },
            "Input":{
               "InputCommand":"xxx",
               "ConfirmedFlag":"true or false",
               "Password":"xxx",
               "MenuEntryNumber":"xxx"
            }
         }
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Input"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid    )               | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[DeviceID](#deviceid)                     | ✔ | String | Mirrored from input request
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from input request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from input request

**InputResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*OutputResult*                                |    | Object | Present if `DisplayOutput` is present in the request
 [Device](#device)                            | ✔ | String | Mirrored from input request
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | Mirrored from input request
 *Response*                                   | ✔ | Object | 
  [Result](/docs/api-reference/data-model#result)                           | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
  [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |    | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
  [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |    | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
*InputResult*                                 | ✔ | Object | Information related to the result the input 
 [Device](#device)                            | ✔ | String | Mirrored from input request
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | Mirrored from input request
 *Response*                                   | ✔ | Object | 
  [Result](/docs/api-reference/data-model#result)                           | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
  [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |    | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
  [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |    | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
 *Input*                                      | ✔ | Object | 
  [InputCommand](/docs/api-reference/data-model#inputcommand)               |    | String | Mirrored from input request
  [ConfirmedFlag](#confirmedflag)             |    | Boolean| Result of GetConfirmation input request. Present if [InputCommand](/docs/api-reference/data-model#inputcommand) = "GetConfirmation"
  [Password](#password)                       |    | String | Password entered by the Cashier. Mandatory, if [InputCommand](/docs/api-reference/data-model#inputcommand) is "Password". Not allowed, otherwise
  [MenuEntryNumber](#menuentrynumber)         |    | Number | A number from 1 to n, when n is total number of objects in `MenuEntry` of `InputRequest`. Mandatory, if [InputCommand](/docs/api-reference/data-model#inputcommand) is "GetMenuEntry". Not allowed, otherwise
  [TextInput](#textinput)                     |    | String | Value entered by the Cashier. Mandatory, if [InputCommand](/docs/api-reference/data-model#inputcommand) is "TextString" or "DecimalString". Not allowed, otherwise
  [DigitInput](#digitinput)                   |    | String | Value entered by the Cashier. Mandatory, if [InputCommand](/docs/api-reference/data-model#inputcommand) is "DigitInput". Not allowed, otherwise


### Print

During a payment, the POI System may send print requests to the Sale System if a receipt is to be printed before the payment response can be finalised (e.g. when a signature is required).

In this case the Sale System should examine the properties in the print request and print the receipt accordingly. 

The final payment receipt, which is to be included in the Sale receipt, is returned in the payment response.

 
#### Print request

<details>

<summary>
Print request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Print",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "PrintRequest":{
         "PrintOutput":{
            "DocumentQualifier":"CashierReceipt",
            "IntegratedPrintFlag":false,
			"RequiredSignatureFlag":true,
            "OutputContent":{
               "OutputFormat":"XHTML",
               "OutputXHTML":"xxxx"
            },
		},	
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Print"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | Mirrored from payment request
[DeviceID](#deviceid)                     | ✔ | String | Unique message identifier
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment request

**PrintRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
 **PrintOutput**                              | ✔ | Object | 
  [DocumentQualifier](#documentqualifier)     | ✔ | String | "CashierReceipt" for a merchant receipt, otherwise "SaleReceipt"
  [IntegratedPrintFlag](#integratedprintflag) |  |Boolean| True if the receipt should be included with the Sale receipt, false if the receipt should be printed now and paper cut (e.g. for a signature receipt)
  [RequiredSignatureFlag](#requiredsignatureflag) | ✔|Boolean| If true, the card holder signature is required on the merchant CashierReceipt.
  **OutputContent**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
   [OutputFormat](/docs/api-reference/data-model#outputformat)              | ✔ | String | "XHTML"  
   [OutputXHTML](/docs/api-reference/data-model#outputxhtml)                | ✔ | String | The payment receipt in XHTML format but coded in BASE64 


#### Print response

<details>

<summary>
Print response
</summary>

<p>

```json
{
   "SaleToPOIResponse":{
      "MessageHeader":{
         "MessageClass":"Device",
         "MessageCategory":"Print",
         "MessageType":"Response",
         "ServiceID":"xxx",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "PrintResponse":{
	     "DocumentQualifier":"CashierReceipt",
         "Response":{
            "Result":"xxx",
            "ErrorCondition":"xxx",
            "AdditionalResponse":"xxx"
         },
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Device"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Print"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[ServiceID](/docs/api-reference/data-model#serviceid    )               | ✔ | String | Mirrored from print request 
[DeviceID](#deviceid)                     | ✔ | String | Mirrored from print request
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from print request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from print request

**PrintResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
[DocumentQualifier](#documentqualifier)       | ✔ | String | Mirrored from print request
 *Response*                                   | ✔ | Object | 
  [Result](/docs/api-reference/data-model#result)                           | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
  [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |    | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
  [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |    | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 



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
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxxx"
      },
      "TransactionStatusRequest":{
         "MessageReference":{
            "MessageCategory":"xxx",
            "ServiceID":"xxx",
            "SaleID":"xxx",
            "POIID":"xxx"
         }
      },
      "SecurityTrailer":{...}
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
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Uniquely identifies the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**TransactionStatusRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*MessageReference*                            |    | Object | Identification of a previous POI transaction. Present if it contains any data. 
 [MessageCategory](/docs/api-reference/data-model#messagecategory)          |    | String | "Payment"
 [ServiceID](/docs/api-reference/data-model#serviceid)                      |    | String | The [ServiceID](/docs/api-reference/data-model#serviceid) of the transaction to retrieve the status of. If not included the last payment status is returned.
 [SaleID](/docs/api-reference/data-model#saleid)                            |    | String | The [SaleID](/docs/api-reference/data-model#saleid) of the transaction to retrieve the status of. Only required if different from the [SaleID](/docs/api-reference/data-model#saleid) provided in the `MessageHeader`
 [POIID](/docs/api-reference/data-model#poiid)                              |    | String | The [POIID](/docs/api-reference/data-model#poiid) of the transaction to retrieve the status of. Only required if different from the [POIID](/docs/api-reference/data-model#poiid) provided in the `MessageHeader`


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
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "TransactionStatusResponse":{
         "Response":{
            "Result":"xxx",
            "ErrorCondition":"xxx",
            "AdditionalResponse":"xxx"
         },
         "MessageReference":{
            "MessageCategory":"xxx",
            "ServiceID":"xxx",
            "SaleID":"xxx",
            "POIID":"xxx"
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
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from request

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
 [SaleID](/docs/api-reference/data-model#saleid)                            |  | String | Mirrored from request, but only if present in the request
 [POIID](/docs/api-reference/data-model#poiid)                              |  | String | Mirrored from request, but only if present in the request
*RepeatedMessageResponse*                     |  | Object | Present if `Result` is "Success"
 *MessageHeader*                              | ✔ | Object | `MessageHeader` of the requested payment
 *PaymentResponse*                            | ✔ | Object | `PaymentResponse` of the requested payment


### Abort transaction

The Sale System can send an `abort transaction` message to request cancellation of the in-progress transaction. 

:::tip
Cancel transaction is a "request to cancel". Cancellation of the transaction is not guaranteed. There are a number of instances where cancellation is not possible (for example, when the payment has already completed). 

After sending a cancel transaction request, the Sale System should <b>always</b> wait for the payment/card acquisition response and validate the success of the sale by checking the `Result` property.
:::



#### Abort transaction request

<details>

<summary>
Abort transaction request
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Service",
         "MessageCategory":"Abort",
         "MessageType":"Request",
         "ServiceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "AbortRequest":{
         "MessageReference":{
            "MessageCategory":"xxx",
            "ServiceID":"xxxx",
            "SaleID":"xxx",
            "POIID":"xxx"
         },
         "AbortReason":"xxx"
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Abort"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Unique identifier for the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**AbortRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*MessageReference*                            | ✔ | Object | Identification of a POI transaction
 [MessageCategory](/docs/api-reference/data-model#messagecategory)          | ✔ | String | "Payment" or "CardAcquisition"
 [ServiceID](/docs/api-reference/data-model#serviceid)                      | ✔ | String | The [ServiceID](/docs/api-reference/data-model#serviceid) of the transaction to cancel
 [SaleID](/docs/api-reference/data-model#saleid)                            |  | String | The [SaleID](/docs/api-reference/data-model#saleid) of the transaction to cancel. Only required if different from the [SaleID](/docs/api-reference/data-model#saleid) provided in the `MessageHeader`
 [POIID](/docs/api-reference/data-model#poiid)                              |  | String | The [POIID](/docs/api-reference/data-model#poiid) of the transaction to cancel. Only required if different from the [POIID](/docs/api-reference/data-model#poiid) provided in the `MessageHeader`
[AbortReason](#abortreason)                   | ✔ | String | Any text describing the reason for cancelling the transaction. For example, "User Cancel"


#### Abort transaction response

Once an abort transaction request has been sent, please continue to wait for the payment response.

If the transaction is successfully aborted, a payment response is returned with `Result` = "Failure" and `ErrorCondition` = "Aborted".

If the transaction cannot be aborted, a normal payment response (`Result` = "Success") is sent back in time.

However, if the abort transaction request message contains an invalid data (e.g. message format error) or if the referenced transaction cannot be not found (e.g. due to an incorrect ServiceID value), an Event Notification will be returned. 

<details>

<summary>
Abort transaction response
</summary>

<p>

```json
{
   "SaleToPOIRequest":{
      "MessageHeader":{
         "MessageClass":"Event",
         "MessageCategory":"Event",
         "MessageType":"Notification",
         "DeviceID":"xxx",
         "SaleID":"xxx",
         "POIID":"xxx"
      },
      "EventNotification":{
         "TimeStamp":"xxx",
         "EventToNotify":"xxx",
         "EventDetails":"xxx"
      },
      "SecurityTrailer":{...}
   }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Event"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Event"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Notification"
[DeviceID](#deviceid)                     | ✔ | String | Unique message identifier
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment request

**EventNotification**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
 [TimeStamp](/docs/api-reference/data-model#timestamp)                      | ✔ | String | Time of the event on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 [EventToNotify](/docs/api-reference/data-model#eventtonotify)              | ✔ | String | "Reject" if the abort request cannot be accepted (e.g. message format error, `ServiceId` not found). "CompletedMessage" if payment has already completed.
 [EventDetails](/docs/api-reference/data-model#eventdetails)                | ✔ | String | Extra detail on the reason for the event


### Reconciliation

#### Reconciliation request

<details>

<summary>
Reconciliation request
</summary>

<p>

```json
{
  "SaleToPOIRequest":{
    "MessageHeader":{
      "MessageClass":"Service",
      "MessageCategory":"Reconciliation",
      "MessageType":"Request",
      "ServiceID":"xxxx",
      "SaleID":"xxx",
      "POIID":"xxx"
    },
    "ReconciliationRequest":{
      "ReconciliationType":"xxx",
      "POIReconciliationID":"xxx"
    },
    "SecurityTrailer":{...}
  }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Reconciliation"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Unique identifier for the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**ReconciliationRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
[ReconciliationType](#reconciliationtype)     | ✔ | String | "SaleReconciliation" to close the current period, "PreviousReconciliation" to request the result of a previous reconciliation
[POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)   |   | String | Present if ReconciliationType is "PreviousReconciliation". See [POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)


#### Reconciliation response

<details>

<summary>
Reconciliation response
</summary>

<p>

```json
{
  "SaleToPOIResponse":{
    "MessageHeader":{
      "MessageClass":"Service",
      "MessageCategory":"Reconciliation",
      "MessageType":"Response",
      "ServiceID":"xxx",
      "SaleID":"xxx",
      "POIID":"xxx"
    },
    "ReconciliationResponse":{
      "Response":{
        "Result":"xxx",
        "ErrorCondition":"xxx",
        "AdditionalResponse":"xxx"
      },
      "ReconciliationType":"xxx",
      "POIReconciliationID":"xxx",
      "TransactionTotals":[
        {
          "PaymentInstrumentType":"xxx",
          "CardBrand":"xxx",
          "OperatorID":"xxx",
          "ShiftNumber":"xxx",
          "TotalsGroupID":"xxx",
          "PaymentCurrency":"AUD",
          "PaymentTotals":[
            {
              "TransactionType":"xxx",
              "TransactionCount":"xxx",
              "TransactionAmount":"0.00",
			  "TipAmount":"0.00",
			  "SurchargeAmount":"0.00"
            }
          ]
        }
      ]
    },
    "SecurityTrailer":{...}
  }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "Reconciliation"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[DeviceID](#deviceid)                     | ✔ | String | Unique message identifier
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment request

**ReconciliationResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*Response*                                    | ✔ | Object | Object indicating the result of the login
 [Result](/docs/api-reference/data-model#result)                            | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
[ReconciliationType](#reconciliationtype)     | ✔ | String | Mirrored from request
[POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)   |  | String | Present if `Result` is "Success". The `ReconciliationID` of the period requested
*TransactionTotals*                           |  | Array | Present if `Result` is "Success". An array of totals grouped by card brand, then operator, then shift, then TotalsGroupID, then payment currency.
 [PaymentInstrumentType](/docs/api-reference/data-model#paymentinstrumenttype)| ✔ | String | "Card" (card payment) or "Mobile" (phone/QR code payments)
 [CardBrand](/docs/api-reference/data-model#cardbrand)                      |  | String | A card brand used during this reconciliation period 
 [OperatorID](/docs/api-reference/data-model#operatorid)                    |  | String | An operator id used during this reconciliation period
 [ShiftNumber](/docs/api-reference/data-model#shiftnumber)                  |  | String | A shift number used during the reconciliation period
 [TotalsGroupID](/docs/api-reference/data-model#totalsgroupid)              |  | String | A custom grouping of transactions as defined by the Sale System
 [PaymentCurrency](/docs/api-reference/data-model#paymentcurrency)          |  | String | "AUD"
 *PaymentTotals*                              |  | Array | An array [0..10] of totals grouped by transaction payment type. Present if both `TransactionCount` and `TransactionAmount` are not equal to zero
  [TransactionType](/docs/api-reference/data-model#transactiontype)         |  | String | Transaction type for this payment. See [TransactionType](/docs/api-reference/data-model#transactiontype)
  [TransactionCount](#transactioncount)       |  | String | The number of transactions for the transaction type for the current grouping of transactions
  [TransactionAmount](#transactionamount)     |  | Number | The total amount of transactions for the transaction type for the current grouping of transactions
 

### Card acquisition

The card acquisition request allows the Sale System to tokenise a card which can be used in future payment requests.

#### Card acquisition request

<details>

<summary>
Card acquisition request
</summary>

<p>

```json
{
  "SaleToPOIRequest": {
    "MessageHeader": {
      "MessageClass": "Service",
      "MessageCategory": "CardAcquisition",
      "MessageType": "Request",
      "ServiceID": "xxx",
      "SaleID": "xxx",
      "POIID": "xxx"
    },
    "CardAcquisitionRequest": {
      "SaleData": {
        "OperatorID": "xxx",
        "OperatorLanguage": "en",
        "ShiftNumber": "xxx",
        "CustomerLanguage": "en",
        "SaleTransactionID": {
          "TransactionID": "xxx",
          "TimeStamp": "xxx"
        },
        "SaleTerminalData": {
          "TerminalEnvironment": "xxx",
          "SaleCapabilities": ["xxx", "xxx", "xxx", …]
        },
        "TokenRequestedType": "Customer",
      },
      "CardAcquisitionTransaction": {
        "AllowedPaymentBrand": ["xxx", "xxx", "xxx", …],
        "ForceEntryMode": "xxx"
      }
    },
    "SecurityTrailer": { ... }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "CardAcquisition"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Request"
[ServiceID](/docs/api-reference/data-model#serviceid)                   | ✔ | String | A unique value which will be mirrored in the response. See [ServiceID](/docs/api-reference/data-model#serviceid).
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Unique identifier for the Sale System
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Uniquely identifies the POI Terminal

**CardAcquisitionRequest**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*SaleData*                                    | ✔ | Object | Object Sale System information attached to this payment
 [OperatorID](/docs/api-reference/data-model#operatorid)                    |  | String | Only required if different from Login Request
 [OperatorLanguage](#operatorlanguage)        |  | String | Set to "en"
 [ShiftNumber](/docs/api-reference/data-model#shiftnumber)                  |  | String | Only required if different from Login Request
 [CustomerLanguage](#customerlanguage)        |  | String | Set to "en" for English
 [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype)    | ✔ | String | "Customer"
 *SaleTransactionID*                          |  | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)             | ✔ | String | Unique reference for this sale ticket
  [TimeStamp](/docs/api-reference/data-model#timestamp)                     | ✔ | String | Time of initiating the request on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   
 *SaleTerminalData*                           |  | Object | Define Sale System configuration. Only include if elements within have different values to those in Login Request
  [TerminalEnvironment](/docs/api-reference/data-model#terminalenvironment) |  | String | "Attended", "SemiAttended", or "Unattended"
  [SaleCapabilities](/docs/api-reference/data-model#salecapabilities)       |  | Array  | Advises the POI System of the Sale System capabilities. See [SaleCapabilities](/docs/api-reference/data-model#salecapabilities) 
*CardAcquisitionTransaction*                  |  | Object | Present if any of the JSON elements within are present
  [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand)
  [ForceEntryMode](/docs/api-reference/data-model#forceentrymode)           |  | String| If present, restricts card presentment to the specified type. See [ForceEntryMode](/docs/api-reference/data-model#forceentrymode)

#### Card acquisition response

<details>

<summary>
Card acquisition response
</summary>

<p>

```json
{
  "SaleToPOIResponse": {
    "MessageHeader": {
      "MessageClass": "Service",
      "MessageCategory": "CardAcquisition",
      "MessageType": "Response",
      "ServiceID": "xxx",
      "SaleID": "xxx",
      "POIID": "xxx"
    },
    "CardAcquisitionResponse": {
      "Response": {
        "Result": "xxx",
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
      },
      "PaymentInstrumentData": {
        "PaymentInstrumentType": "xxx",
          "CardData": {
            "MaskedPAN": "xxxxxx......xxxx",
            "EntryMode": "xxx"
          },
          "PaymentToken":  {
            "TokenRequestedType": "xxx",
            "TokenValue": "xxx",
            "ExpiryDateTime": "xxx"
          }
        }
      },
      "SecurityTrailer": {...}
    }
}
```
</p>
</details>

**MessageHeader**

<div style={{width:'240px'}}>Attributes</div>  |Requ.| Format | Description |
-----------------                         |:----:| ------ | ----------- |
[MessageClass](/docs/api-reference/data-model#messageclass)             | ✔ | String | "Service"
[MessageCategory](/docs/api-reference/data-model#messagecategory)       | ✔ | String | "CardAcquisition"
[MessageType](/docs/api-reference/data-model#messagetype)               | ✔ | String | "Response"
[DeviceID](#deviceid)                     | ✔ | String | Unique message identifier
[SaleID](/docs/api-reference/data-model#saleid)                         | ✔ | String | Mirrored from payment request
[POIID](/docs/api-reference/data-model#poiid)                           | ✔ | String | Mirrored from payment request

**CardAcquisitionResponse**

<div style={{width:'240px'}}>Attributes</div>      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
**Response**                                    | ✔ | Object | Object indicating the result of the login
 [Result](/docs/api-reference/data-model#result)                            | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 
**SaleData**                                 | ✔ | Object | 
 **SaleTransactionID**                       | ✔ | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | Mirrored from the request
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Mirrored from the request
 [SaleReferenceID](/docs/api-reference/data-model#salereferenceid)         |  | String | Mirrored from the request
**POIData**                                  | ✔ | Object | 
 **POITransactionID**                        | ✔ | Object | 
  [TransactionID](/docs/api-reference/data-model#transactionid)            | ✔ | String | A unique transaction id from the POI system
  [TimeStamp](/docs/api-reference/data-model#timestamp)                    | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 **[PaymentInstrumentData](/docs/api-reference/data-model#paymentinstrumentdata)** |  | Object | Object with represents card details for token or manually enter card details. 
[PaymentInstrumentType](/docs/api-reference/data-model#paymentinstrumenttype)|  | String | Defaults to "Card". Indicates the card source for the payment. See [PaymentInstrumentType](/docs/api-reference/data-model#paymentinstrumenttype)
**CardData**                               |  | Object | 
 [EntryMode](/docs/api-reference/data-model#entrymode)                   |  | String | Only present if `PaymentInstrumentType` is "Card". "File" if a Payment Token is used, and "Keyed" for a Card Not Present transaction. 
 [MaskedPAN](/docs/api-reference/data-model#maskedpan)                   | ✔ | String | PAN masked with dots, first 6 and last 4 digits visible
 **PaymentToken**                          | ✔ | Object | Only present if [EntryMode](/docs/api-reference/data-model#entrymode) is "File". Object with identifies the payment token. 
  [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype)| ✔ | String | "Transaction" or "Customer". Must match the type of token recorded in the POI System.
  [TokenValue](#tokenvalue)                | ✔ | String | Token previously returned from the POI System in the payment, or card acquisition response 
 
## Error handling

When the Sale System sends a request, it will receive a matching response. For example, if the Sale System sends a [payment request](#payment_request) it will receive a [payment response](#payment-response).

The Sale System should verify the result of the transaction by checking the [Response.Result](/docs/api-reference/data-model#result) field in the response.

- If the [Response.Result](/docs/api-reference/data-model#result) is "Success", the payment transaction was successful.
- If the [Response.Result](/docs/api-reference/data-model#result) is "Failure", the payment transaction failed.  The Sale System may check for any errors specified in the [Response.ErrorCondition](/docs/api-reference/data-model#errorcondition) field in the same response message and handle the error accordingly.

In the event the Sale System does not receive a response (for example, due to network error, timeout, or any other unexpected error) it must enter error handling.

Error handling due to network error, timeout, or any other unexpected error is outlined in the diagram below. 

1. Cashier initiates a payment.
1. Sale System sets txn_in_progress flag in local persistent storage.
1. Sale System sends a [payment request](#payment).  The timeout period for waiting for a response is 60 seconds.  This should reset every time a response (for example, [display request](#display)) is received.
1. Sale System saves message reference details in local persistent storage.
1. Network error/timeout/any other unexpected error occurs.
1. Sale System awaits Internet availability.
1. Sale System enters error handling:
    1. Sale System sends an [abort transaction request](#abort-transaction).
       - Sale System must set the `AbortRequest.AbortReason` field to describe the reason for cancelling the transaction.
        
        `AbortRequest.AbortReason` value      | Description |
        :-----------------:                             | :-----------: |
        Network Error |  Network related error occured.  |
        Timeout | No response from the host after the timeout period. |
        Message Format Error | An error occured while converting a message. |
        Invalid Data | An invalid data was received. |
        Other Exception | An unwanted exception has occured. |
    1. For a maximum of 90 seconds, the Sale System should perform the below in a loop:
        1. Sale System sends a [transaction status request](#transaction-status-request) and awaits a [transaction status response](#transaction-status-response)
        1. Sale System handles the transaction status response:

        `Response.Result` value      | `Response.ErrorCondition` value| Description |
        :-----------------:                             | :-----------: | :-----------: |
        Success | | The transaction was successful. |
         | | The transaction result will be contained in `RepeatedMessageResponse`. | 
         | | The `RepeatedMessageResponse` will contain the [payment response](#payment-response). |  
        Failure | "InProgress" |  The Terminal is still processing the payment. |
         | | The Sale System should wait for 5 seconds and send a [transaction status request](#transaction_status_request) again. |
        Failure | any other value aside from "InProgress" | The payment failed. |
         | | The Sale System can exit the loop. |

    1. If the Sale System is unable retrieve a result within 90 seconds:
        - Sale System must display UI to ask Cashier to check the transaction history in the POI terminal.
        - Cashier confirms in the Sale System whether the payment transaction succeeded or failed basing on the transaction record in the transaction history in the POI terminal.
    1. Sale System clears the message reference details in the local persistent storage.
    1. Sale System clears the txn_in_progress flag in the local persistent storage.
1. Sale System proceeds with its successful/failed transaction processing, depending on the transaction result.

![](/img/payment-error-handling.png)


**Power failure handling**

The Sale System can handle a power failure by checking a local transaction status on start up.

1. Cashier initiates a payment.
1. Sale System sets txn_in_progress flag in local persistent storage.
1. Sale System sends a [payment request](#payment)
1. Sale System saves message reference details in local persistent storage.
1. Sale System power failure occurs.
1. Sale System start up after power failure.
1. Sale System checks if txn_in_progress flag is set. If so, access and use message reference details and enter error handling.
   1. Sale System sends an [abort transaction request](#abort-transaction).
        - Sale System must set the `AbortRequest.AbortReason` field to "Power Failure".
   1. For a maximum of 90 seconds, Sale System enters loop to check transaction status.
   1. If the Sale System is unable retrieve a result within 90 seconds:
        - Sale System must display UI to ask Cashier to check the transaction history in the POI terminal.
        - Cashier confirms in the Sale System whether the payment transaction succeeded or failed basing on the transaction record in the transaction history in the POI terminal.
   1. Sale System clears the message reference details in the local persistent storage.
   1. Sale System clears the txn_in_progress flag in the local persistent storage.
1. Sale System proceeds with its successful/failed transaction processing, depending on the transaction result.

![](/img/payment-error-handling-power-failure.png)