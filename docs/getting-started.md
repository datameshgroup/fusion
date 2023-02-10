---
sidebar_position: 2
---

# Getting started

The steps outlined below will guide you through creating a dev account, scoping your Sale System requirements based on the DataMesh functionality, coding and testing your integration, getting accredited with DataMesh, and finally deploying your solution into production.

1. [Create a test account](#getting-started-create-a-test-account)
1. [Determine your integration type](#getting-started-determine-your-integration-type)
1. [Design your integration](#getting-started-design-your-integration)
1. [Code your POS integration](#cloud-api-reference)
1. [POS accreditation](#testing)
1. [Production deployment](#production)

## Create a test account

Integration into the DataMesh payment platform requires a DataMesh Satellite terminal, and a DataMesh Unify development account. 

After creating your development account, you will be provided the following settings which are associated with a Sale System version. These settings must be included in each login request.

Setting  | Description |
    -----------------                        | ----------------- |
`ProviderIdentification` | The name of the busniess which creates the Sale System. |
`ApplicationName` | The name of the Sale System. |
`CertificationCode` | A GUID which uniquly identifies the Sale System. |
`SoftwareVersion` | The internal build version of this Sale System. DataMesh must configure this value on Unify. |
	
When the Sale System accreditation is complete and the Sale System is ready for production deployment, DataMesh will provide production settings to be included with the production Sale System build.

Each Sale System lane is authenticated and authorised with a unique [SaleID](#data-dictionary-saleid) + [KEK](#data-dictionary-kek) combination.

Each POI Terminal is identified by a unique [POIID](#data-dictionary-poiid). 

DataMesh associates [SaleID](#data-dictionary-saleid) and [POIID](#data-dictionary-poiid) values on Unify to enforce access restrictions between specific Sale System lanes and terminals.

When requesting a development account, let us know if you plan on working with:

 - Multiple Sale System instances connected to the same terminal, or 
 - Multiple terminals connected to one Sale System. 
 
DataMesh will provide the correct number of [SaleID](#data-dictionary-saleid), [KEK](#data-dictionary-kek), and [POIID](#data-dictionary-poiid) values and terminals, and ensure the correct associations are implemented on Unify. 

*You can request a terminal and a development account via [integrations@datameshgroup.com](mailto:integrations@datameshgroup.com)*

## Determine your integration type

DataMesh provides a variety of options to help you design your integration depending on your Sale System type.

Sale System Type  | Fusion App |  Fusion Satellite | Fusion Cloud |
-----------------                         | :----:  | :------: | :------: |
Windows-based POS where it's possible to install the DataMesh middleware<br />on the same PC where the POS application is running on | ✔ |   |   |  
POS on Pinpad/POI Terminal |   | ✔ |   |  
Other POS type including Legacy POS/On-Premises POS/Traditional POS and POS on Mobile (iOS/Android) device |   |   | ✔ |  

**Fusion App**

The Fusion App is a DataMesh middleware that is installed in the same PC where the Sale System application is running on.  The Fusion App communicates with the POI terminal via a Websocket connected to the DataMesh Unify switch (Fusion Cloud API).  The Sale System sends a payment request and receives a payment result through the Fusion App's local HTTP end point for payments.  The Sale System does not need to handle the different scenarios that could occur during the actual payment processing after a payment request has been sent.  This is because the Fusion App already handles the full payment lifecycle (including all the necessary message handling and UI display) which is a mandatory requirement when either Fusion Cloud or Fusion Satellite is used.  If the Sale system doesn't receive a payment response from the Fusion App, the Sale system just needs to call a single error handling API to enter error recovery.

![](/img/POS-fusion-app.png)

**[Fusion Satellite](#satellite-api-reference)**

The Fusion Satellite API allows a Sale System running on the POI terminal to communicate with the DataMesh Satellite payment application on the same POI terminal using inter-app communication with [Android intents](https://developer.android.com/guide/components/intents-filters).

![](/img/POS-fusion-satellite.png)

**[Fusion Cloud](#cloud-api-reference)**

The Fusion Cloud API allows the Sale System to communicate with a POI terminal via a Websocket connected to the DataMesh Unify switch. 

![](/img/POS-fusion-cloud.png)

![](/img/POS-fusion-cloud-mobile.png)

### Mandatory Features Checklist

The table below provides an overview of the mandatory integration requirements which are required for your selected integration type.

Integration Requirement  | Fusion App   | Fusion Satellite   | Fusion Cloud |
-----------------                         | :----:  | :------: | :------: |
Implement the [payment lifecycle](#getting-started-design-your-integration-payment-lifecycle)             | ✔ | ✔ | ✔ |
Support for *purchase* and *refund* [payment types](#getting-started-design-your-integration-payment-types) | ✔ | ✔ | ✔ |
Include [product data](#getting-started-design-your-integration-product-data) in each payment request| ✔ | ✔ | ✔ |
Support for TLS and other [security requirements](#cloud-api-reference-security-requirements) |   | ✔ | ✔ |
Additional fields will be added to the message specification over time.<br />To ensure forwards compatibility the Sale System must ignore when extra objects and fields are present in response messages.<br />This includes valid MAC handling in the SecurityTrailer.|   | ✔ | ✔ |
Implement [Sale System settings](#getting-started-design-your-integration-sale-system-settings) requirements |   | ✔ | ✔ |
Implement [Payments user interface](#getting-started-design-your-integration-payment-user-interface) which handles the `Initial UI`, `Final UI`, `Display UI`, and `cancelling a sale in progress` |   | ✔ | ✔ |
Handle error scenarios as outlined in [error handling](#cloud-api-reference-error-handling) |   | ✔ | ✔ |
Ensure Sale System provides a unique [payment identification](#getting-started-design-your-integration-payment-identification) | ✔ | ✔ | ✔ |
Pass the accreditation [test script](#testing) | ✔ | ✔ | ✔ |

## Design your integration

<aside class="notice">
This section will make reference to methods and data structures documented in the <a href="#cloud-api-reference">Cloud API Reference</a>. 
</aside>

Before development commences, you should familiarise yourself with the DataMesh payment platform, including the mandatory and optional features available. 

This will enable you to scope the development work required to complete the DataMesh integration with your Sale System.

You should refer to the accreditation [test script](#testing) as a guide to ensure that the Sale System has successfully implemented the mandatory integration requirements for your integration type.

The list of mandatory requirements are listed in the [Mandatory Features Checklist](#getting-started-determine-your-integration-type-mandatory-features-checklist) section.

Depending on your Sale System design, other features may be required.

**Other features available**

- Sale System [receipt printing](#getting-started-design-your-integration-receipt-printing)
- Payments [user interface](#getting-started-design-your-integration-user-interface) for all displays and inputs
- [Cash out](#getting-started-design-your-integration-cash-out)
- [Settlement](#getting-started-design-your-integration-settlement)
- [Tokenisation](#getting-started-design-your-integration-tokenisation)
- [Tipping](#getting-started-design-your-integration-tipping)
- [Dynamic surcharge](#getting-started-design-your-integration-dynamic-surcharge)
- [Pre-authorisation / completion](#getting-started-design-your-integration-pre-auth-completion)

**APIs**

- Fusion App API

The Fusion App is a DataMesh middleware that is installed in the same PC where the Sale System application is running on. It communicates with the POI terminal via a Websocket connected to the DataMesh Unify switch (Fusion Cloud API). Requests and responses are sent and received through the Fusion App's local HTTP end points.

Once you have installed the Fusion App in your local PC, you should be able to access its Swagger API documentation at `http://localhost:4242/swagger` in your local PC.

*Contact the DataMesh Integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a> if you need the Fusion App installer or to discuss further about the Fusion App and its API.*


- [Fusion Satellite API](#satellite-api-reference)

The Fusion Satellite API allows a Sale System running on the POI terminal to communicate with the DataMesh Satellite payment application on the same POI terminal using inter-app communication with Android intents.

Description | Location | |
-----------------                        | ----------- | ----------- |
Library | on [Maven Central] (https://search.maven.org/artifact/com.datameshgroup.fusion/fusion-sdk) | |
Library | on [GitHub] (https://github.com/datameshgroup/fusionsatellite-sdk-java) | |
Demo Application utilising the library | on [GitHub] (https://github.com/datameshgroup/fusionsatellite-sdk-android-demo) | Tested on PAX (PAX 920) |
Another POS on Pinpad Demo Application | on [GitHub] (https://github.com/datameshgroup/pos-on-pinpad-demo) | Tested on PAX (PAX 920) and Ingenico (DX8000) |

- [Fusion Cloud API](#cloud-api-reference)

The Fusion Cloud API allows the Sale System to communicate with a POI terminal via a Websocket connected to the DataMesh Unify switch.

    <div style="width:200px">Development Language</div>  | Description | Location |
    :-----------------:                        | -----------------                        | ----------- |
    .Net | .Net NuGet package | on [Nuget] (https://www.nuget.org/packages/DataMeshGroup.Fusion.FusionClient/) |
     | Source Code | on [GitHub] (https://github.com/datameshgroup/sdk-dotnet) |
     | Demo Application implementing the sdk | on [GitHub] (https://github.com/datameshgroup/sdk-dotnet-purchasedemo) |
    Java | Source Code | on [GitHub] (https://github.com/datameshgroup/fusioncloud-sdk-java) | 
     | Demo Application implementing the sdk | on [GitHub] (https://github.com/datameshgroup/fusioncloud-sdk-java-demo) |
    Swift (for iOS) | Source Code | on [GitHub] (https://github.com/datameshgroup/fusioncloud-sdk-ios)
     | Demo Application implementing the sdk | on [GitHub] (https://github.com/datameshgroup/fusioncloud-sdk-ios-demo) |


<aside class="success">
For help on scoping your development work, or to discuss integration requirements, please contact the DataMesh integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a>
</aside>


### Payment lifecycle

The payment lifecycles, including the required API requests, are outlined in the diagrams below. 

- **Fusion App**

1. Merchant launches the Sale System.
1. Merchant initiates a payment.
1. Sale system generates a unique SessionID as a UUIDv4.  This is also referred to as the *payment-id*.
1. Sale system constructs a [payment request](#cloud-api-reference-methods-payment-payment-request-paymentrequest) object.
1. Sale System sends the [payment request](#cloud-api-reference-methods-payment-payment-request-paymentrequest) for the *payment-id* to the Fusion App's local HTTP end point for payments and waits for a response.
1. Fusion App does all the necessary payment processing.
1. Sale System receives a payment response.
1. Merchant closes the Sale System.

   - The unique *payment-id* is also used to initiate an abort request.
   - If the Sale system doesn't receive a payment response from the Fusion App, the Sale system just needs to call a single error handling API, which is (GET /payments/{*payment-id*}), to enter error recovery.

![](/img/payment-lifecycle-fusion-app.png)

- **Fusion Cloud and Fusion Satellite**

1. Merchant launches the Sale System.
1. Sale System opens the websocket connection.
1. Sale System has the option to [link](#terminal-linking) with a POI Terminal by performing a [login request](#cloud-api-reference-methods-login) either: 
  1. When the Sale System launches or
  1. Before the first payment request is sent
1. Sale System receives a successful login response.
1. Merchant initiates a payment.
1. Sale System sets txn_in_progress flag in local persistent storage. (This is will be used for [error handling](#cloud-api-reference-error-handling).)
1. Sale System sends a [payment request](#cloud-api-reference-methods-payment).
1. Sale System saves message reference details in local persistent storage.  (This is will be used for [error handling](#cloud-api-reference-error-handling).)
1. Sale System handles [display requests](#cloud-api-reference-methods-display), [print requests](#cloud-api-reference-methods-print), and [input requests](#cloud-api-reference-methods-input).
1. Sale System receives a payment response.
1. Sale System clears the message reference details in the local persistent storage.
1. Sale System clears the txn_in_progress flag in the local persistent storage.
1. Merchant closes the Sale System.
1. Sale System can optionally send a [logout request](#cloud-api-reference-methods-logout).
1. Sale System closes the websocket.

![](/img/payment-lifecycle-basic.png)

### Terminal linking

The POS (Sale System) communicates with a POI terminal using both a [SaleID](#data-dictionary-saleid) and [KEK](#data-dictionary-kek) (which identifies the Sale System) and [POIID](#data-dictionary-poiid) (which identifies the terminal).

Before a payment is processed, the Sale System must be 'linked' to a POI terminal by sending a [login](#cloud-api-reference-methods-login) request. 

It is possible for a Sale System to 'link' with multiple POI terminals, and for each POI terminal to be 'linked' to multiple Sale Systems. In this 
instance the Sale System should record multiple [POIID](#data-dictionary-poiid) values and enable the operator to select the desired POI terminal as part of the payment flow.

<aside class="success">
The Sale System must store the <code>KEK</code> in a secure location. 
</aside>


### Sale System settings

The Sale System must support configuration of both static Sale System settings, and cashier configurable settings.

#### Static Sale System settings

Static Sale System settings are provided by DataMesh and are linked to the build of the Sale System. i.e. they will be the same for all merchants using the Sale System build.

These settings can be contained in a database or configuration file editable by a Sale System engineer, or hard coded into the Sale System build. 

Regardless of where they are stored, the Sale System must ensure the cashier or merchant is never required to configure the static settings, as they will not be aware of the required values. 

DataMesh will provide two sets of static settings; one set for the test environment, and one set for production. It is the responsibility of the Sale System to ensure the correct values 
are included in a test or production build. 

The static Sale System settings are

Attribute |Requ.| Format | Description |
-----------------                        |----| ------ | ----------- |
[ProviderIdentification](#data-dictionary-provideridentification)| ✔ | String | The name of the company supplying the Sale System. Provided by DataMesh. Sent in the login request.
[ApplicationName](#data-dictionary-applicationname)          | ✔ | String | The name of the Sale System application. Provided by DataMesh. Sent in the login request.
[SoftwareVersion](#data-dictionary-softwareversion)          | ✔ | String | Must indicate the software version of the current Sale System build. Sent in the login request.
[CertificationCode](#data-dictionary-certificationcode)      | ✔ | String | Certification code for this Sale System. Provided by DataMesh. Sent in the login request.

#### Cashier configurable settings

The [SaleID](#data-dictionary-saleid), [KEK](#data-dictionary-kek), and [POIID](#data-dictionary-poiid) are cashier configurable settings which may be different for each lane.

The Sale System must ensure there is a user interface accessible by the cashier which enables these settings to be configured.

The [SaleID](#data-dictionary-saleid) and [POIID](#data-dictionary-poiid) should be visible to the cashier. The [KEK](#data-dictionary-kek) should be masked after entry by the cashier. 

If the Sale System is to support many-to-one configuration (i.e. one Sale System linked to many POI terminals) it should support the entry of [SaleID](#data-dictionary-saleid) and [KEK](#data-dictionary-kek) to identify the  Sale System lane, and a [POIID](#data-dictionary-poiid) for each POI terminal linked.

<aside class="success">
A "pairing" API request will be available in a future API release which will enable the delivery of <code>SaleID</code>, <code>POIID</code>, and <code>KEK</code> to the Sale System in place of the manual entry of these data fields. 
</aside>

*Example setting UI*

![](/img/settings-ui.png)


### Payment types

Supported [payment](#cloud-api-reference-methods-payment) types are:

- Purchase
- Cash-Out
- Purchase with Cash-Out
- Refund
- Pre-Authorisation (for Satellite API)
- Completion (for Satellite API)

<!--
- Pre-authorisation
- Pre-authorisation top-up
- Pre-authorisation cancel
- Pre-authorisation extend
-->

The Sale System indicates the payment type in the payment request with the [PaymentType](#data-dictionary-paymenttype) field.

### Payment identification 

A sale is a transaction between two or more parties, typically a buyer and a seller, in which goods or services are exchanged for payment.  
Each sale can have one or more transaction request and response messages.  
Each transaction request and response message is identified by a `TransactionIdentification` object which contains following the fields: 

- [TransactionID](#data-dictionary-transactionid)
- [TimeStamp](#data-dictionary-timestamp)

Message | `TransactionIdentification` field | Description |
:-----------------:                        | -----------------                        | ----------- |
Payment Request | [SaleData.SaleTransactionID](#data-dictionary-saletransactionid) | This uniquely identifies a single sale.|
 | |The Sale System must ensure that the [SaleData.SaleTransactionID](#data-dictionary-saletransactionid) for each **sale** for a given [SaleID](#data-dictionary-saleid) is unique. |
 | | A sale can have multiple payment requests (for example, in the case of split payments, where one sale is paid with multiple payments).  |
  | | The <a href="#data-dictionary-saletransactionid">SaleTransactionID</a> is the same for each payment request sent for the same sale and from the same <a href="#data-dictionary-saleid">SaleID</a>. |
Payment Response | [SaleData.POITransactionID](#data-dictionary-poitransactionid) | This uniquely identifies a specific payment. |
 | | The POI System will ensure the [SaleData.POITransactionID](#data-dictionary-poitransactionid) uniquely identifies a **payment** for a given [POIID](#data-dictionary-poiid). |
 | | A sale can have multiple payment responses (for example, in the case of split payments, where one sale is paid with multiple payments).  |
 | | The <a href="#data-dictionary-poitransactionid">POITransactionID</a> returned in each payment response is guaranteed to be unique (even for the same sale) for a given <a href="#data-dictionary-poiid">POIID</a>. |


The [ServiceID](#data-dictionary-serviceid) field uniquely identifies a specific payment transaction in a sale.

Each payment request and response message are linked via the [ServiceID](#data-dictionary-serviceid) field.  

When processing a response message, the Sale System should verify that the [ServiceID](#data-dictionary-serviceid) in the payment response or transaction status response message matches the exact [ServiceID](#data-dictionary-serviceid) value in the payment request message before processing the response message.

The [ServiceID](#data-dictionary-serviceid) is also used by the Sale System in the [abort transaction request](#cloud-api-reference-methods-abort-transaction) to cancel a specific payment transaction.  This means that the exact [ServiceID](#data-dictionary-serviceid) value in the payment request must be provided as the [ServiceID](#data-dictionary-serviceid) in the  [abort transaction request](#cloud-api-reference-methods-abort-transaction) when attempting to cancel that specific payment request.

![](/img/payment-identification.png)


### Receipt printing

The POI Terminal will produce payment receipts which must be printed as a part of the transaction flow.

Some terminals have a built-in printer which can handle receipt printing. However, in order to support terminals without a built-in printer and improve the customer experience the Sale System should also handle printing receipts produced by the POI Terminal.

To enable printing receipts from the Sale System, include "PrinterReceipt" in the list of available [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities) when sending the [LoginRequest](#cloud-api-reference-methods-login). 

<aside class="success">
The Sale System must print the receipt as formatted by DataMesh and not create a custom formatted receipt.
</aside>

Receipts may be delivered to the Sale System using two methods

- **PrintReceipt request** - One or more PrintReceipt requests may fire during the sale
- **Payment response** - A customer receipt is returned in the payment response in [OutputContent.OutputXHTML](#data-dictionary-outputxhtml) formatted as the format defined in [OutputContent.OutputFormat](#data-dictionary-outputformat)


It is recommended that the Sale System embed the customer payment receipt content in the customer sale receipt produced by the Sale System.

*Example receipt format*

<div style={{color:'black',background:'white',fontFamily:'monospace',width:200}}>
*** CUSTOMER COPY ***            <br />
DD/MM/YYYY hh:mm:ss              <br />
Merchant ID: XXXXXXXX            <br />
Terminal ID: XXXXXXXX            <br />
<br />
<b>Purchase Transaction</b>      <br />   
Amount:          $10.00          <br /> 
Tip:              $1.00          <br /> 
Surcharge 2.00%:  $0.22          <br />
-----------------------          <br /> 
Total Amount:    $11.22          <br />
<br /> 
VISA: 4xxxxxxxxxxxxxxx(T)        <br /> 
Credit Account                   <br />
<br />
<b>Approved</b>                  <br />
<br />
Reference: 0000 0000 0000        <br /> 
Auth Code: 000000                <br /> 
AID: A0000000000000000           <br />
ATC: 000X                        <br /> 
TVR: 000000000000                <br />
ARQC: XXXXXXXXXXXXXXXX           <br /> 
</div>

### Payment user interface

<aside class="warning">

The Sale System should implement <code>Initial UI</code>, <code>Final UI</code>, <code>Display UI</code> and the ability to <code>cancel a sale in progress</code>. 

The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.

</aside>


If capable, the Sale System should present UI to the cashier for the duration of a payment. The content of the UI is set by the [input](#cloud-api-reference-methods-input) and [display](#cloud-api-reference-methods-display) request messages sent from the POI System.

In the examples presented below the UI is contained in a modal shadow box. This is an example to help illustrate how this UI may be implemented. The Sale System should implement this UI in a way that fits the look and feel of the rest of the system.

The Sale System must not block communication with the POI System when displaying the payments UI. The POI System may send a display or input request, followed by another display or input request, or the payment response. For example, the POI System may send a "SELECT ACCOUNT" display, followed by a "PROCESSING" display when the card holder selects their account on the POI terminal. The POI System may send a "SIGNATURE APPROVED" input request, followed by a "TIMEOUT" display and payment response, if the cashier doesn't approve the signature in time.

To enable display and input handling on the Sale System, [SaleTerminalData.SaleCapabilities](#data-dictionary-salecapabilities) in the [login](#cloud-api-reference-methods-login) request contains "CashierStatus", "CashierError", "CashierInput", and "CustomerAssistance".

<aside class="success">
The DataMesh Nexo API is event based. The Sale System sends a payment request, handles events as they are received, and eventually receives a payment response.
</aside>

#### Initial UI

The Sale System should immediately display an initial UI after sending a [payment](#cloud-api-reference-methods-payment) request which informs the cashier the payment is in progress. This UI is required to handle instances where the first display/input message from the POI System is not present, or delayed.

This UI should also enable the cashier to request a cancellation of the transaction.

*Example*

![](/img/dialog-initial-ui.png)

#### Display UI

> Display request

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
            "InfoQualify":"Status",
            "OutputContent":{
               "OutputFormat":"Text",
               "OutputText":{
                  "Text":"LINE OF TEXT MAX 40 CHARACTERS"
               }
            }
         }
      },
      "SecurityTrailer":{...}
   }
}
```

The POI system will send zero or more [display request](#cloud-api-reference-methods-display) messages to the Sale System during a transaction. The Sale System should display these messages and continue to wait for the payment response.

- Each display request will contain at least 1 line of text.
- Each line of text will be up to 40 characters wide.
- The POI System should display the text centred.
- The POI System should include the option to cancel the transaction.
- The POI System should display an "in progress" indicator to the cashier.
- The POI System may optionally colour the display text based on the [InfoQualify](#data-dictionary-infoqualify) field set as "Error" or "Status"

*Example*

![](/img/dialog-display.png)

#### Input UI

<aside class="warning">
The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.
</aside>

The POI system will send zero or more [input request](#cloud-api-reference-methods-input) messages to the Sale System during a transaction. The Sale System should display these input requests, allow the cashier the option to answer the input request, and continue to wait for the payment response. The Sale System should not block on an input request, as the POI System may continue with the transaction before the Sale System has sent an input response.


- There are six types of input request. The [InputCommand](#data-dictionary-inputcommand) indicates which input request type the Sale System should present:
  - GetAnyKey - Wait for any key press. For example, to get confirmation from the cashier that a display has been read. 
  - GetConfirmation - Yes/No answer as in the case when prompting for "Signature OK?". The result of this command is boolean true/false.
  - Password - A merchant password as in the case during a refund transaction.
  - GetMenuEntry - A selection from a list of options. For example, assisting the card holder by selecting the account type: Savings, Cheque or Credit.
  - TextString - A text string.
  - DigitString - A string of digits.
  - DecimalString - A string of digits with a decimal point. 
- The input request has a single line of text, up to 40 characters wide.
- The POI System should display the text centred.
- The POI System should include the option to cancel the transaction.
- The [MinLength](#minlength) and [MaxLength](#maxlength) fields may be present for some input commands.
- The [MaxInputTime](#maxinputtime) field may be present which indicates the input timeout in seconds.


**Input - GetAnyKey**

An [InputCommand](#data-dictionary-inputcommand) of "GetAnyKey" indicates the Sale System should wait for any key press. This is most often used to display a request which the cashier must acknowledge to continue.

*Example*

![](/img/dialog-input-getanykey.png)

**Input - GetConfirmation**

An [InputCommand](#data-dictionary-inputcommand) of "GetConfirmation" indicates the Sale System should present a yes/no option to the cashier. The response to this request is boolean true/false.

<aside class="notice">
The option for the cashier to 'Cancel' is optional on the <code>GetConfirmation</code> input UI.
</aside>

*Example*

![](/img/dialog-input-getconfirmation.png)

**Input - Password**

An [InputCommand](#data-dictionary-inputcommand) of "Password" indicates the Sale System should allow the user to enter text of any format as a password. 

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

The [MaskCharactersFlag](#maskcharactersflag) field indicates if the Sale System should mask the cashier input on screen.

*Example*

![](/img/dialog-input-getpassword.png)

**Input - TextString**

An [InputCommand](#data-dictionary-inputcommand) of "TextString" indicates the Sale System should allow the user to enter text of any format. 

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-textstring.png)

**Input - DigitString**

An [InputCommand](#data-dictionary-inputcommand) of "DigitString" indicates the Sale System should allow the user to enter a string of digits only.

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-digitstring.png)

**Input - DecimalString**

An [InputCommand](#data-dictionary-inputcommand) of "DigitString" indicates the Sale System should allow the user to enter a string of digits with a decimal point (e.g. an amount)

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-decimalstring.png)

**Input - GetMenuEntry**

An [InputCommand](#data-dictionary-inputcommand) of "GetMenuEntry" indicates the Sale System should allow the cashier to select one of a number of options available.

The number of available options will be 1..n. The `MenuEntry` object contains the options to be displayed.

*Example*

![](/img/dialog-input-getmenuentry.png)


#### Final UI

The Sale System should display a final UI after the response has been received to inform the cashier of the transaction result. 

This UI is constructed using the [Result](#data-dictionary-result), [ErrorCondition](#data-dictionary-errorcondition), and [AdditionalResponse](#additionalresponse) fields of the `Response` object.

*Result="Success" Example*

![](/img/dialog-final-ui-success.png)

*Result="Failure" Example*

![](/img/dialog-final-ui-failure.png)

#### Cancelling a sale in progress

Whilst a payment is in progress the Sale System should present UI to the cashier which enables them to request a cancellation of the payment. 

If the cashier initiates a payment cancellation, the Sale System sends an [abort transaction request](#cloud-api-reference-methods-abort-transaction) (with `AbortRequest.AbortReason` field set to "User Cancel").  Then, the Sale System continues to wait for the payment response. 

The Sale System may allow the cashier to continue to request cancellation of the payment until a payment result has been received.

<aside class="success">
There are a number of instances where the Terminal may be unable to cancel a payment in progress upon receiving a <a href="#abort-transaction">abort transaction request</a>. The Sale System must <b>always</b> await a payment response after sending an abort transaction request.  If no response is received or an error has occurred before a response is received, the Sale System must peform <a href="#cloud-api-reference-error-handling">error handling</a>.
</aside>

![](/img/payment-cancellation.png)


### Product data

The Sale System must include product information about the sale items attached to each purchase request. 

It can accomplish this by including an array of [SaleItem](#data-dictionary-saleitem) objects in the `PaymentRequest`.

Each [SaleItem](#data-dictionary-saleitem) record contains the following mandatory fields: 

- **ItemID** a unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
- **ProductCode** - a unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
- **ItemAmount** - total amount of the sale item.
- **ProductLabel** - a short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
- **Quantity** - item unit quantity
- **UnitOfMeasure** - unit of measure of the `Quantity`. See [UnitOfMeasure](#data-dictionary-unitofmeasure)
- **UnitPrice** - price per item unit. 

See [SaleItem](#data-dictionary-saleitem) for all available fields and examples. 

<aside class="success">
Including all available product information in each payment request will improve the merchant experiance. See <a href="#data-dictionary-saleitem">SaleItem</a> for a full list of available fields. 
</aside>

### Refunds

Refund is paying back the customer the amount corresponding to some or all of the goods/services that the customer previously availed. The total refund amount must include any surcharge amount applied to the specific goods/services in the original sale transaction. 

Types of Refund:

- [Matched refund](#getting-started-design-your-integration-refunds-matched-refund)

- [Unmatched refund](#getting-started-design-your-integration-refunds-unmatched-refund)

More details about the [refund implementation](#data-dictionary-saleitem-refunds).

#### Matched refund

- A matched refund is paired with an original purchase. 
- The Sale System must specify the [POITransactionID](#data-dictionary-poitransactionid) from the original payment response message in the [OriginalPOITransaction](#data-dictionary-originalpoitransaction) field of the refund payment request message.
- When [dynamic surcharge](#getting-started-design-your-integration-dynamic-surcharge) is enabled: 
  - The matched refund should include the surcharged amount.
  - The total amount must be equal to the original purchase amount + dynamic surcharge amount.
- When [dynamic surcharge](#getting-started-design-your-integration-dynamic-surcharge) is "NOT" enabled: 
 - The total amount must be equal to the original purchase amount.

#### Unmatched refund
- An unmatched refund is not paired with an original purchase.
- Unmatched refunds don't have any extra requirements/restrictions.
- When [dynamic surcharge](#getting-started-design-your-integration-dynamic-surcharge) is enabled:
 - The total amount must be equal to the purchase amount to be refunded + portion of the surcharge amount, which corresponds to the purchase amount to be refunded.

 <aside class="warning">
Currently, both Matched and Unmatched refunds involve POI Terminal and card interaction.
</aside>

 ![](/img/payment-refund.png)

### Cash out

The Sale System can optionally support cash out payments on the POI Terminal. There are two cash out methods supported based on where the cash out amount is entered; cash out on Sale System, and cash out on POI Terminal. 

#### Cash out on Sale System

When perfoming cash out on the Sale System, the cash out amount is entered by the cashier on the Sale System before the purchase is sent. 

A cash out sale can be cash out only, or cash out + purchase. 

- Cash out only (no sale items are included)
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "CashAdvance"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) to the cash out amount 
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](#cashbackamount) to the cash out amount 
- Purchase plus cash out (sale items are included)
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "Normal"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) to the value of the sale items, plus the cash out amount 
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](#cashbackamount) to the cash out amount 

<!---
#### Cash out on POI Terminal

When performing cash out on the POI Terminal, the Sale System sends the payment request to the POI Terminal without a cash out amount. The POI Terminal gives the option for the card holder to enter a cash out amount. The payment response will contain any cash out amount entered by the card holder.

A cash out sale can be cash out only, or cash out + purchase. 

- Cash out only (no sale items are included)
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "CashAdvance"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](#data-dictionary-requestedamount) to 0
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](#data-dictionary-cashbackamount) to 0
  - Set [PaymentTransaction.AmountsReq.MaximumCashBackAmount](#data-dictionary-maximumcashbackamount) to the maximum about the terminal should allow the card holder to enter 
  - The [PaymentTransaction.AmountsReq.CashBackAmount](#data-dictionary-cashbackamount) field in the payment response will reflect the cash back amount entered by the card holder
  - The [PaymentTransaction.AmountsReq.AuthorizedAmount](#data-dictionary-authorizedamount) field in the payment response will include the cash back amount entered by the card holder  
- Purchase plus cash out (sale items are included)
  - Set [PaymentData.PaymentType](#data-dictionary-paymenttype) to "Normal"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](#data-dictionary-requestedamount) to the value of the sale items
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](#data-dictionary-cashbackamount) to 0
  - Set [PaymentTransaction.AmountsReq.MaximumCashBackAmount](#data-dictionary-maximumcashbackamount) to the maximum about the terminal should allow the card holder to enter 
  - The [PaymentTransaction.AmountsReq.CashBackAmount](#data-dictionary-cashbackamount) field in the payment response will reflect the cash back amount entered by the card holder
  - The [PaymentTransaction.AmountsReq.AuthorizedAmount](#data-dictionary-authorizedamount) field in the payment response will include the cash back amount entered by the card holder
-->

### Pre-auth / completion

The Sale System can optionally support pre-authorisation and completion payments on the POI Terminal.

<aside class="warning">
The Pre-authorisation and Completion transactions are currently available only for the Satellite API.
</aside>

#### Pre-authorisation

Pre-authorisation holds funds in reserve on a customers card and allows the payment to be completed at a later date.

To perform a pre-authorisation:

- Build a standard [payment request](#satellite-api-reference-methods-payment)
- Set [PaymentRequest.PaymentData.PaymentType](#data-dictionary-paymenttype) to "FirstReservation"
- Set [PaymentRequest.PaymentTransaction.AmountsReq.RequestedAmount](#data-dictionary-requestedamount) to the amount to reserve 
- Set [PaymentRequest.SaleData.SaleReferenceID](#data-dictionary-salereferenceid) to a unique [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)

On pre-authorisation response, the POS should record: 

- [PaymentRequest.SaleData.SaleReferenceID](#data-dictionary-salereferenceid) from the request
- [PaymentResponse.POIData.POITransactionID](#data-dictionary-poitransactionid) from the response
- [PaymentResponse.PaymentResult.AmountsResp.AuthorizedAmount](#data-dictionary-authorizedamount) from the response (the reserved amount)

#### Completion

Completion captures/settles payment of the amount previously reserved through pre-authorisation.

To perform a completion:

- Build a standard [payment request](#satellite-api-reference-methods-payment)
- Set [PaymentRequest.PaymentData.PaymentType](#data-dictionary-paymenttype) to "Completion"
- Set [PaymentRequest.PaymentTransaction.AmountsReq.RequestedAmount](#data-dictionary-requestedamount) the completion amount. Must be less than or equal to reserved amount
- Set [PaymentRequest.SaleData.SaleReferenceID](#data-dictionary-salereferenceid) to the same `SaleReferenceID` as used in the pre-authoristaion request
- Set [PaymentRequest.PaymentTransaction.OriginalPOITransaction.POITransactionID](#data-dictionary-poitransactionid) to the value returned in [PaymentResponse.POIData.POITransactionID](#data-dictionary-poitransactionid) from the original pre-authorisation response


### Settlement

The Sale System can reconcile with the POI System periodically but should normally be once a day as it affects settlements with acquirers.

Use the [Reconciliation](#cloud-api-reference-methods-reconciliation) request to initiate a settlement.

### Tokenisation

Cards can be pre-tokenised by the Sale System if required. This supports mobile apps, eCommerce and Sale System type systems.

Customer tokens are supported:

- **Customer** - token which is scoped to the customer. For example, if the same card is tokenised on two different POI Terminals owned by the merchant, the same token will be returned. A `Customer` token can be used to represent the card holder and perform operations for a longer period.


<!-- TODO - future version
Two types of token can be requested: 

- **Transaction** - token limited to the scope of a single transaction. For example, if the same card is tokenised twice on a POI Terminal, two different `Transaction` tokens would be returned. The `Transaction` token can be used to perform subsequent follow-up transactions, for example refunding or voiding a purchase.
- **Customer** - token which is scoped to the customer. For example, if the same card is tokenised on two different POI Terminals owned by the merchant, the same token will be returned. A `Customer` token can be used to represent the card holder and perform operations for a longer period.
-->


#### Tokenise a card used for a payment

To tokenise a card as part of a [payment](#cloud-api-reference-methods-payment), set [SaleData.TokenRequestedType](#data-dictionary-tokenrequestedtype) in the payment request to "Transaction" or "Customer".

When [SaleData.TokenRequestedType](#data-dictionary-tokenrequestedtype) is set, the token will be returned as part of the payment response in [PaymentResult.PaymentInstrumentData.CardData.PaymentToken](#data-dictionary-paymenttoken).


#### Tokenise a card without payment 

The [card acquisition](#cloud-api-reference-methods-card-acquisition) request allows the Sale System to tokenise a card which can be used in future payment requests.


<!-- TODO - need to validate how this works

#### Use a token for a payment 

To perform a [payment](#cloud-api-reference-methods-payment) request using a token: 

- Populate [PaymentTransaction.OriginalPOITransaction](#data-dictionary-originalpoitransaction) with details of the sale used to acquire the token
- Set [PaymentTransaction.OriginalPOITransaction.ReuseCardDataFlag](#reusecarddataflag) to true
- Populate values in the `PaymentTransaction.PaymentData.PaymentInstrumentData.CardData.PaymentToken` object 
  - [TokenRequestedType](#data-dictionary-tokenrequestedtype) - "Transaction" or "Customer". Must match the type of token recorded in the POI System.
  - [TokenValue](#tokenvalue) - Token previously returned from the POI System in the payment, or card acquisition response 

-->

### Split payments

To perform a split payment, the Sale System should send multiple [payment](#cloud-api-reference-methods-payment) requests, one for each split. 

Split is allowed when [PaymentType](#data-dictionary-paymenttype) is "Normal".

The following data elements should be set by the Sale System for a split payment in a [payment](#cloud-api-reference-methods-payment) request:

- All split payments which are part of the same sale should include the same [SaleData.SaleTransactionID](#data-dictionary-saletransactionid). 
- [PaymentTransaction.SaleItem](#data-dictionary-saleitem) array, which may reflect
  - Just the items involved in that payment, in the case of a split basket.
  - All the items in the sale, in the case the sale is being split by amount. Note when splitting by amount the sum of the item amounts could more than the [RequestedAmount](#requestedamount).
- [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) set to the amount of the split payment
- [PaymentData.SplitPaymentFlag] set to true
- [PaymentTransaction.AmountsReq.MinimumSplitAmount](#minimumsplitamount) set to the minimum split amount 
- [PaymentTransaction.AmountsReq.PaidAmount](#paidamount) set to the total amount of previous split payment associated with this sale

An example, when splitting by sale item:
- A sale contains two items, "Product A" ($80) and "Product B" ($20)
- The card holder wishes to pay for each item with a different card
- The cashier sends the first payment for $80, the basket contains "Product A"
- The cashier sends a second payment for $20, the basket contains "Product B"

An example, when splitting by amount:
- A sale contains two items, "Product A" ($80) and "Product B" ($20)
- The card holder wishes to split the sale equally between two cards
- The cashier sends the first payment for $50, the basket contains both "Product A" and "Product B"
- The cashier sends a second payment for $50, the basket contains both "Product A" and "Product B"

![](/img/payment-split.png)

### Tipping

There are two tipping methods supported; tip on Sale System, and tip on POI Terminal. 

#### Tip on Sale System

When tipping on the Sale System the tip amount is entered by the cashier on the Sale System before the purchase is sent.

For example: 

1. Cashier prints a sale ticket for $100 and presents to the card holder
1. Card holder signs and writes a tip of $10
1. Cashier opens $100 sale on the Sale System, enters tip of $10 and initiates payment
1. Sale System sends a [payment request](#cloud-api-reference-methods-payment) request to the POI Terminal and sets
  - [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) to $110 (sale amount + tip)
  - [PaymentTransaction.AmountsReq.TipAmount](#tipamount) to $10
1. POI Terminal processes a payment of $110 and includes tip amount on the payment receipt
1. POI Terminal approves payment and returns the result to the Sale System

<aside class="warning">
If the <a href="#tipamount">PaymentTransaction.AmountsReq.TipAmount</a> is set to 0 in the payment request, the Tip Entry screen will be displayed in the POI terminal.<br />Do not set <a href="#tipamount">PaymentTransaction.AmountsReq.TipAmount</a> to 0 if you don't want the Tip Entry screen to be displayed in the POI terminal.
</aside>

#### Tip on POI Terminal

When tipping on the POI Terminal, the Sale System sends the payment request to the POI Terminal without a tip. The POI Terminal gives the option for the card holder to enter a tip amount. The payment response will contain any tip entered by the card holder.

For example: 

1. Cashier opens $100 sale on the Sale System and initiates payment
1. Sale System sends a [payment request](#cloud-api-reference-methods-payment) request to the POI Terminal and sets
  - [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) to $100 (sale amount + tip)
  - [PaymentTransaction.AmountsReq.TipAmount](#tipamount) to $0
1. POI Terminal presents UI to the card holder which allows them to enter a tip
1. Card holder enters tip amount of $10
1. POI Terminal processes a payment of $110 and includes tip amount on the payment receipt
1. POI Terminal approves payment and returns the result to the Sale System with 
  - [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) set to $110
  - [PaymentResult.AmountsResp.TipAmount](#tipamount) set to $10
1. The Sale System records the approved payment, and optionally records the tip amount of $10

<aside class="success">
The amount returned in <a href="#authorizedamount">AuthorizedAmount</a> in the payment result may be differ from the <a href="#requestedamount">RequestedAmount</a> sent in the payment request
</aside>

### Dynamic surcharge

Dynamic surcharging allows the merchant to recover their 'cost of acceptance' by enabling the POI Terminal to automatically add a surcharge percentage to the purchase amount based on the card type presented by the customer.

A distinct percentage can be applied to the card types: 
- Visa / MasterCard credit
- Debit (EFTPOS or Visa or MasterCard)
- Amex / Diners

The dynamic surcharging settings are managed on Unify per merchant. In development, contact [DataMesh](mailto:integrations@datameshgroup.com) to configure dynamic surcharging on your development account.

Dynamic surcharge example:

1. Merchant enables dynamic surcharge on Unify for their terminal fleet and configures a 1.9% surcharge on Amex/Diners cards
1. Cashier opens $100 sale on the Sale System and initiates payment
1. Sale System sends a [payment request](#cloud-api-reference-methods-payment) request to the POI Terminal and sets [PaymentTransaction.AmountsReq.RequestedAmount](#requestedamount) to $100
1. Card holder presents their Amex card
1. POI Terminal calcualtes new total based on the card type and processes a payment of $101.90 
1. POI Terminal approves payment and returns the result to the Sale System with 
  - A receipt containing lines with the requested amount, surcharge percentage, surcharge amount, and new total amount
  - [PaymentResult.AmountsResp.AuthorizedAmount](#authorizedamount) set to $101.90
  - [PaymentResult.AmountsResp.SurchargeAmount](#surchargeamount) set to $1.90
1. The Sale System records the `AuthorizedAmount`, and optionally records the `SurchargeAmount` of $1.90

<aside class="success">
The amount returned in <a href="#authorizedamount">AuthorizedAmount</a> in the payment result may be differ from the <a href="#requestedamount">RequestedAmount</a> sent in the payment request
</aside>

#### Merchant responsibilities

- Merchants are required to notify the cardholder that a surcharge will be applied. For example, by ensuring signage at the point of purchase
- The RBA surcharge framework indicates merchants should review the level of any surcharge applied at least once a year
- Any refund of a purchase with surcharge applied needs to include the full purchase + surcharge amount

<!-- 
### Pay at Table 
<aside class="warning">TODO</aside>
-->

### Error handling

When the Sale System sends a request, it will receive a matching response. For example, if the Sale System sends a [payment request](#payment_request), it will receive a [payment response](#payment-response).

However, in unusual scenarios wherein the Sale System sends a request but doesn't receive a corresponding response (for example, due to network error or timeout), the Sale System must enter an error handling loop.

More information about how to handle such scenario can be found in the [Error handling section of the Cloud API](#cloud-api-reference-error-handling)