---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting started

:::info
 - *Sale System* - point of sale application
 - *POI Terminal* - the DataMesh payments terminal (PINpad)
:::


The steps outlined below will guide you through creating a dev account, scoping your Sale System requirements based on the DataMesh functionality, coding and testing your integration, getting accredited with DataMesh, and finally deploying your solution into production.

1. [Create a test account](#create-a-test-account)
1. [Determine your integration type](#determine-your-integration-type)
1. [Design your integration](#design-your-integration)
1. [Code your POS integration](./category/api-reference/)
1. [POS accreditation](./testing)
1. [Production deployment](./production)

## Create a test account

All DataMesh integrations require a physical DataMesh terminal. Depending on the [integration type](#determine-your-integration-type) DataMesh may also need to allocate Sale System credentials.

When requesting a development terminal and account, let us know:
 - Which integration type(s) you plan on working with
 - If you plan of supporting multiple Sale Systems connected to the same terminal, or multiple terminals connected to one Sale System.

:::info
You can request a terminal and a development account via [integrations@datameshgroup.com](mailto:integrations@datameshgroup.com)
:::

## Determine your integration type

DataMesh provides a variety of options to help you design your integration depending on your Sale System type.

Sale System Type  | Fusion App |  Fusion Satellite | Fusion Cloud |
-----------------                         | :----:  | :------: | :------: |
Windows-based POS where it's possible to install the DataMesh middleware<br />on the same PC where the POS application is running on | ✔ |   |   |  
POS on Pinpad/POI Terminal |   | ✔ |   |  
Other POS type including Legacy POS/On-Premises POS/Traditional POS and POS on Mobile (iOS/Android) device |   |   | ✔ |  


### [Fusion App](./api-reference/fusion-app)

Fusion App is a DataMesh middleware that is installed in the PC as the Sale System.

Fusion App wraps the Fusion Cloud API and handles many of the interactions between the Sale System and the POI terminal (web socket, security, pairing, error handling, UI etc).

There are two ways on how the Fusion App communicates with the POI terminal:
- Cloud - Fusion App communicates with the POI terminal via a Websocket connected to the DataMesh Unify switch.

![](/img/POS-fusion-app.png)

- USB Connection
  - Base USB Connection - Fusion App communicates with the POI terminal through a USB cable connected to the POI terminal’s Base/Dock device.  The POI terminal must be paired with its Base/Dock device.
  - Terminal USB Connection - Fusion App communicates with the POI terminal through a USB cable connected directly to the POI terminal.

![](/img/POS-fusion-app-usb.png)

There are two methods for processing a payment using Fusion App: 

- Events mode - the Sale System sends a HTTP POST to a local endpoint, and if valid receives 202 ACCEPTED. The Sale System polls Fusion App, processing events received until the payment response is returned. 
- Blocking - the Sale System sends a HTTP POST to a local endpoint, and waits for a response. If successful (200 OK) the response will contain the payment response details.

In both methods, in case of an error (timeout, system crash etc), the Sale System sends a HTTP GET request to request the status of the payment.

:::tip 
Where possible, DataMesh recommends implementing events mode.
::: 

#### Fusion App payment lifecycle (events mode)

1. Merchant launches the Sale System.
1. Merchant initiates a payment.
1. Sale system generates a unique `SessionID` as a UUIDv4 and constructs a [payment request](./api-reference/data-model#payment-request) object.
1. Sale System POSTs the [payment request](./api-reference/data-model#payment-request) for the `SessionID` to Fusion App's local HTTP end point for payments and waits for a response.
1. If the request is valid, Fusion App will respond with 202 ACCEPTED and start processing the payment.
1. Sale System GETs and processes each event until a PaymentResponse is received
1. Merchant closes the Sale System.
   - If the Sale System doesn't receive a payment response (timeout, system crash etc) from Fusion App it needs to enter error handling by calling (GET /payments/\{\{*SessionId*\}\})

![](/img/payment-lifecycle-fusion-app-events.png)


#### Fusion App payment lifecycle (blocking mode)

1. Merchant launches the Sale System.
1. Merchant initiates a payment.
1. Sale system generates a unique `SessionID` as a UUIDv4 and constructs a [payment request](./api-reference/data-model#payment-request) object.
1. Sale System POSTs the [payment request](./api-reference/data-model#payment-request) for the `SessionID` to Fusion App's local HTTP end point for payments and waits for a response.
1. Fusion App does all the necessary payment processing.
1. Sale System receives a payment response.
1. Merchant closes the Sale System.
   - If the Sale System doesn't receive a payment response (timeout, system crash etc) from Fusion App it needs to enter error handling by calling (GET /payments/\{\{*SessionId*\}\})

![](/img/payment-lifecycle-fusion-app.png)

###  [Fusion Satellite](./api-reference/fusion-satellite)

The Fusion Satellite API allows a Sale System running on the POI terminal to communicate with the DataMesh Satellite payment application on the same POI terminal using inter-app communication with [Android intents](https://developer.android.com/guide/components/intents-filters).

![](/img/POS-fusion-satellite.png)

#### Fusion Satellite payment lifecycle

1. Merchant launches the Sale System on the POI Terminal.
1. Merchant initiates a payment.
1. Sale system constructs a [payment request](./api-reference/data-model#payment-request) object.
1. Sale System calls Satellite via startActivityForResult() and waits for a response.
1. Satellite does all the necessary payment processing.
1. Sale System receives a payment response.
1. Merchant closes the Sale System.

![](/img/payment-lifecycle-fusion-satellite.png)


### [Fusion Cloud](./api-reference/fusion-cloud)

The Fusion Cloud API allows the Sale System to communicate with a POI terminal via a Websocket connected to the DataMesh Unify switch. 

![](/img/POS-fusion-cloud-mobile.png)

#### Fusion Cloud payment lifecycle

1. Merchant launches the Sale System.
1. Sale System opens the websocket connection.
1. Sale System has the option to link with a POI Terminal by performing a [login request](/docs/api-reference/fusion-cloud#login-request) either: 
  1. When the Sale System launches or
  1. Before the first payment request is sent
1. Sale System receives a successful login response.
1. Merchant initiates a payment.
1. Sale System sets txn_in_progress flag in local persistent storage. (This is will be used for [error handling](/docs/api-reference/fusion-cloud#error-handling).)
1. Sale System sends a [payment request](/docs/api-reference/fusion-cloud#payment).
1. Sale System saves message reference details in local persistent storage.  (This is will be used for [error handling](/docs/api-reference/fusion-cloud#error-handling).)
1. Sale System handles [display requests](/docs/api-reference/fusion-cloud#display), [print requests](/docs/api-reference/fusion-cloud#print), and [input requests](/docs/api-reference/fusion-cloud#input)
1. Sale System receives a payment response.
1. Sale System clears the message reference details in the local persistent storage.
1. Sale System clears the txn_in_progress flag in the local persistent storage.
1. Merchant closes the Sale System.
1. Sale System can optionally send a [logout request](/docs/api-reference/fusion-cloud#logout).
1. Sale System closes the websocket.

![](/img/payment-lifecycle-fusion-cloud.png)

### Mandatory features checklist

The table below provides an overview of the mandatory integration requirements which are required for your selected integration type.

Integration Requirement  | Fusion App   | Fusion Satellite   | Fusion Cloud |
-----------------                         | :----:  | :------: | :------: |
Implement the payment lifecycle ([Fusion App](#fusion-app-payment-lifecycle-events-mode), [Fusion Satellite](#fusion-satellite-payment-lifecycle), [Fusion Cloud](#fusion-cloud-payment-lifecycle))             | ✔ | ✔ | ✔ |
Support for *purchase* and *refund* [payment types](#payment-types) | ✔ | ✔ | ✔ |
Support for [Fusion Fuel API](/docs/api-reference/fusion-api-fuel-extension) (for Sale Systems which support fuel payments) | ✔ |   | ✔ |
Support for [Fusion Stored Value API](/docs/api-reference/fusion-api-stored-value-extension) | ✔ |   | ✔ |
Include [product data](#product-data) in each payment request| ✔ | ✔ | ✔ |
Support for TLS and other [security requirements](/docs/api-reference/fusion-cloud#security-requirements) |   | ✔ | ✔ |
Additional fields will be added to the message specification over time.<br />To ensure forwards compatibility the Sale System must ignore when extra objects and fields are present in response messages.<br />This includes valid MAC handling in the SecurityTrailer.|   |   | ✔ |
Implement [Sale System settings](#sale-system-settings) requirements |   |   | ✔ |
Implement [Payments user interface](#payment-user-interface) which handles the `Initial UI`, `Final UI`, `Display UI`, and `Cancelling a Sale in Progress` |   |  | ✔ |
Handle error scenarios as outlined in [error handling](#error-handling) |   | ✔ | ✔ |
Ensure Sale System provides a unique [payment identification](#payment-identification) | ✔ | ✔ | ✔ |
Pass the accreditation [test script](./testing) | ✔ | ✔ | ✔ |

## Design your integration

Before development commences, you should familiarise yourself with the DataMesh payment platform, including the mandatory and optional features available. 

This will enable you to scope the development work required to complete the DataMesh integration with your Sale System.

You should refer to the accreditation [test script](./testing) as a guide to ensure that the Sale System has successfully implemented the mandatory integration requirements for your integration type.

The list of mandatory requirements are listed in the [Mandatory Features Checklist](#mandatory-features-checklist) section.

Depending on your Sale System design, other features may be required.

**Other features available**

- Sale System [receipt printing](#receipt-printing)
- Payments [user interface](#payment-user-interface) for all displays and inputs
- [Cash out](#cash-out)
- [Settlement](#settlement)
- [Tokenisation](#tokenisation)
- [Tipping](#tipping)
- [Dynamic surcharge](#dynamic-surcharge)
- [Pre-authorisation / completion](#pre-authorisation--completion)

:::tip
For help on scoping your development work, or to discuss integration requirements, please contact the DataMesh integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a>
:::

<!--
### Terminal linking

The POS (Sale System) communicates with a POI terminal using both a [SaleID](/docs/api-reference/data-model#saleid) and [KEK](/docs/api-reference/data-model#kek) (which identifies the Sale System) and [POIID](/docs/api-reference/data-model#poiid) (which identifies the terminal).

Before a payment is processed, the Sale System must be 'linked' to a POI terminal by sending a [login](/docs/api-reference/fusion-cloud#login) request. 

It is possible for a Sale System to 'link' with multiple POI terminals, and for each POI terminal to be 'linked' to multiple Sale Systems. In this 
instance the Sale System should record multiple [POIID](/docs/api-reference/data-model#poiid) values and enable the operator to select the desired POI terminal as part of the payment flow.

:::tip
The Sale System must store the <code>KEK</code> in a secure location. 
:::
-->

### Sale System settings

:::success
Sale System settings are only required for the [Fusion Cloud](#fusion-cloud) integration type. If you are using **Fusion App** or **Fusion Satellite** you can skip this section.
:::

The Sale System must support configuration of settings to identify the Sale System to DataMesh, and to pair a POI Terminal to a Sale System.

#### Static Sale System settings

Static Sale System settings are provided by DataMesh and are linked to the build of the Sale System. i.e. they will be the same for all merchants using the Sale System build.

These settings can be contained in a database or configuration file editable by a Sale System engineer, or hard coded into the Sale System build. 

Regardless of where they are stored, the Sale System must ensure the cashier or merchant is never required to configure the static settings, as they will not be aware of the required values. 

DataMesh will provide two sets of static settings; one set for the test environment, and one set for production. It is the responsibility of the Sale System to ensure the correct values 
are included in a test or production build. 

The static Sale System settings are

Attribute |Requ.| Format | Description |
-----------------                        |----| ------ | ----------- |
[ProviderIdentification](/docs/api-reference/data-model#provideridentification)| ✔ | String | The name of the company supplying the Sale System. Provided by DataMesh. Sent in the login request.
[ApplicationName](/docs/api-reference/data-model#applicationname)          | ✔ | String | The name of the Sale System application. Provided by DataMesh. Sent in the login request.
[SoftwareVersion](/docs/api-reference/data-model#softwareversion)          | ✔ | String | Must indicate the software version of the current Sale System build. Sent in the login request.
[CertificationCode](/docs/api-reference/data-model#certificationcode)      | ✔ | String | Certification code for this Sale System. Provided by DataMesh. Sent in the login request.


#### Cashier configurable settings

The [SaleID](/docs/api-reference/data-model#saleid), [KEK](/docs/api-reference/data-model#kek), and [POIID](/docs/api-reference/data-model#poiid) are cashier configurable settings which may be different for each lane. These fields authenticate a Sale System, and pair a Sale System to a POI terminal. 

:::tip
DataMesh offers **[QR code pairing](#qr-code-pairing)** to simplify entry of the SaleID, POIID, and KEK. The Sale System should still support manual entry of the SaleID, POIID, and KEK as a fallback for when QR POS pairing is not possible.
:::

The Sale System must ensure there is a user interface accessible by the cashier which enables these settings to be configured.

The [SaleID](/docs/api-reference/data-model#saleid) and [POIID](/docs/api-reference/data-model#poiid) should be visible to the cashier. The [KEK](/docs/api-reference/data-model#kek) should be masked after entry by the cashier. 

If the Sale System is to support many-to-one configuration (i.e. one Sale System linked to many POI terminals) it should support the entry of [SaleID](/docs/api-reference/data-model#saleid) and [KEK](/docs/api-reference/data-model#kek) to identify the  Sale System lane, and a [POIID](/docs/api-reference/data-model#poiid) for each POI terminal linked.

*Example setting UI*

![](/img/settings-ui.png)



#### QR code pairing

**QR code pairing** enables configuration of the configurable settings (i.e. SaleID, POIID, and KEK) without requiring manual entry by the cashier.

How this works: 

1. Sale System generates a pairing QR code which contains pairing credentials, and displays it on the Sale System screen.
2. The QR code is scanned by the POI Terminal.
3. The Sale System sends a pairing login request and saves the POIID returned by DataMesh, along with the SaleID and KEK generated by the POS.

:::tip

Sale System settings are only required for the Fusion Cloud integration type. 

Fusion App already supports **QR code pairing** out-of-the-box.

:::


##### Step 1 - generate a pairing QR code
 
The pairing QR code:
 - will represent the pairing data JSON. 
 - will be version 8 binary format (max length: 152) with Medium ECC.

To minimise the size of the data in the QR code, a abbreviated JSON fields format is used.  

| JSON property | Name                                            | Format                                                                      |
| ------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| s             | [SaleID](/docs/api-reference/data-model#saleid) | String. Random UUID v4. 8-4-4-4-12 format.                                  | 
| p             | PairingPOIIDString.                             | String. Random UUID v4. 8-4-4-4-12 format.                                  | 
| k             | [KEK](/docs/api-reference/data-model#kek)       | String. Random. 48-character string populated with characters 0-9, and A-F. Please refer to the [sample KEK generation](#sample-kek-generation) |
| c             | [CertificationCode](/docs/api-reference/data-model#certificationcode) | String. Certification code provided by DataMesh.      |
| n             | POSName                                         | String. POS display name with at most 30 characters. This can be the Work Station name or any name that you prefer. Name displayed on the report and on the Satellite app (e.g. during a POS payment transaction). |
| v             | Version                                         | Numeric. Pairing version code. Set to 1.                                    |


###### Sample Pairing QR Code Data
```
{
	"s": "09c04710-265f-4094-88ee-a981794127f8",
	"p": "a2381e7c-1303-44de-ac3b-5fe68a0d973d",
	"k": "86BB447CE6D1C56E33C2717BE03EED579B2EAB7EC9465817",
	"c": *replace with data provided by DataMesh*,
	"n": "WorkStation 001",
	"v": 1
}
```


###### Sample KEK Generation
```
string chars = "0123456789ABCDEF";
string result = "";
Random random = new();
for (int i = 0; i < 48; i++)
{
  result += chars[random.Next(chars.Length)];
}
Console.WriteLine("KEK = " + result); 

//Sample output 
KEK = 86BB447CE6D1C56E33C2717BE03EED579B2EAB7EC9465817
```

##### Reference code  

| Development Language | Description | Location |
:-----------------:                        | -----------------                        | ----------- |
.Net | .Net NuGet package | on [Nuget](https://www.nuget.org/packages/DataMeshGroup.Fusion.Pairing.WinForms) |
| | Source Code | on [GitHub](https://github.com/datameshgroup/fusioncloud-pairing-dotnet-winforms) |
| | Demo Application using the Pairing NuGet package | on [GitHub](https://github.com/datameshgroup/sdk-dotnet-testpos) |

##### Step 2: Scanning the QR code on the POI Terminal

Use these [instructions](/docs/appendix#qr-code-pairing) to scan the pairing QR code on the POI Terminal.

##### Step 3: LoginRequest after pairing

Once the QR code has been scanned on the POI Terminal, the Sale System must send a pairing LoginRequest:

- Build a standard [login request](/docs/api-reference/data-model#login-request)
- Set [MessageHeader.SaleID](/docs/api-reference/fusion-cloud#messageheader) to the [pairing QR code](#pairing-qr-code) SaleID value
- Only for this specific request, set [MessageHeader.POIID](/docs/api-reference/fusion-cloud#messageheader) to the [pairing QR code](#pairing-qr-code) PairingPOIID value
- Set [LoginRequest.SaleSoftware.CertificationCode](/docs/api-reference/data-model#login-request) to the [pairing QR code](#pairing-qr-code) CertificationCode value
- Set [LoginRequest.Pairing](/docs/api-reference/data-model#login-request) to true

On successful [login response](/docs/api-reference/data-model#login-response), the Sale System should record: 

- MessageHeader.POIID from the *response* (this will be different from the MessageHeader.POIID in the request)
- SaleID from the pairing QR Code SaleID value
- KEK from the pairing QR Code KEK value

:::info
The stored Sale ID, POI ID (from the Login response), and KEK values will be used in the succeeding request messages (including the actual LoginRequest prior to a PaymentRequest).
:::

##### Unpairing from Terminal
Once the Sales System has been paired with a terminal, the Sale System must provide an option to unpair the Sale Sytem from the terminal.  This option will clear the previously stored POI ID value.  

:::info
The Sale System may use the previously stored Sale ID and KEK values when generating the next pairing QR code.
:::

![](/img/pair-with-pos.png)

##### Sample Terminal-to-POS Pairing Dialog  

![](/img/pair-with-pos-qr-code-dialog.png)

##### Sample screen display when [LoginRequest after pairing](#loginrequest-after-pairing) is successful

![](/img/pair-with-pos-qr-code-dialog-pairing-successful.png)

##### Sample screen display when no terminal is paired with the Sale System

![](/img/pair-with-pos-not-paired.png)

##### Sample screen display when a terminal has been paired successfully with the Sale System

![](/img/pair-with-pos-paired.png)


### Payment types

Supported [payment](/docs/api-reference/fusion-cloud#payment) types are:

- Purchase
- Cash-Out
- Purchase with Cash-Out
- Refund
- Pre-authorisation
- Pre-authorisation cancel
- Completion

<!--
- Pre-authorisation top-up
- Pre-authorisation extend
-->

The Sale System indicates the payment type in the payment request with the [PaymentType](/docs/api-reference/data-model#paymenttype) field.

Supported gift card types are: 

- Activation
- Deactivation



### Payment identification 

#### Sale & payment identification 

- In the Fusion API, a **sale** is a transaction between a buyer and a seller, in which goods or services are exchanged for payment.
- Each **sale** can be pair for by one or more **payment** requests.  
- Each **payment** request and response message is identified by a `TransactionIdentification` object which contains following the fields: 
  - [TransactionID](/docs/api-reference/data-model#transactionid)
  - [TimeStamp](/docs/api-reference/data-model#timestamp)


<table>
	<thead>
		<tr>
			<th>Message</th>
			<th>`TransactionIdentification` field</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Payment Request</td>
      <td>[SaleData.SaleTransactionID](/docs/api-reference/data-model#saletransactionid)</td>
      <td>
        <ul>
          <li>Must uniquely identify a sale</li>
          <li>The Sale System must ensure that the [SaleData.SaleTransactionID](/docs/api-reference/data-model#saletransactionid) for each **sale** for a given [SaleID](/docs/api-reference/data-model#saleid) is unique.</li>
          <li>A sale can have multiple payment requests (for example, in the case of split payments, where one sale is paid with multiple payments).</li>
          <li>The <a href="/docs/api-reference/data-model#saletransactionid">SaleTransactionID</a> is the same for each payment request sent for the same sale and from the same <a href="/docs/api-reference/data-model#saleid">SaleID</a></li>
          <li></li>
        </ul>
      </td>
		</tr>
		<tr>
			<td>Payment Response</td>
      <td>[SaleData.POITransactionID](/docs/api-reference/data-model#poitransactionid)</td>
      <td>
        <ul>
          <li>This uniquely identifies a specific payment</li>
          <li>The POI System will ensure the [SaleData.POITransactionID](/docs/api-reference/data-model#poitransactionid) uniquely identifies a **payment** for a given [POIID](/docs/api-reference/data-model#poiid).</li>
          <li>A sale can have multiple payment responses (for example, in the case of split payments, where one sale is paid with multiple payments).</li>
          <li>The <a href="/docs/api-reference/data-model#poitransactionid">POITransactionID</a> returned in each payment response is guaranteed to be unique (even for the same sale) for a given <a href="/docs/api-reference/data-model#poiid">POIID</a>.</li>
        </ul>
      </td>
		</tr>
	</tbody>
</table>

#### Request/response identification

- The [ServiceID](/docs/api-reference/data-model#serviceid) field uniquely identifies a specific transaction request in a sale.
- Each transaction request and response message are linked via the [ServiceID](/docs/api-reference/data-model#serviceid) field.  
- When processing a response message, the Sale System should verify that the [ServiceID](/docs/api-reference/data-model#serviceid) in the payment response or transaction status response message matches the exact [ServiceID](/docs/api-reference/data-model#serviceid) value in the payment request message before processing the response message.
- The [ServiceID](/docs/api-reference/data-model#serviceid) is also used by the Sale System in the [abort transaction request](/docs/api-reference/fusion-cloud#abort-transaction) to cancel a specific payment transaction.  This means that the exact [ServiceID](/docs/api-reference/data-model#serviceid) value in the payment request must be provided as the [ServiceID](/docs/api-reference/data-model#serviceid) in the  [abort transaction request](/docs/api-reference/fusion-cloud#abort-transaction) when attempting to cancel that specific payment request.

![](/img/payment-identification.png)


### Receipt printing

The POI Terminal will produce payment receipts which must be printed as a part of the transaction flow.

Some terminals have a built-in printer which can handle receipt printing. However, in order to support terminals without a built-in printer and improve the customer experience the Sale System should also handle printing receipts produced by the POI Terminal.

To enable printing receipts from the Sale System, include "PrinterReceipt" in the list of available [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) when sending the [LoginRequest](/docs/api-reference/fusion-cloud#login). 

:::info
The Sale System must print the receipt as formatted by DataMesh and not create a custom formatted receipt.
:::

Receipts may be delivered to the Sale System using two methods

- **PrintReceipt request** - One or more PrintReceipt requests may fire during the sale
- **Payment response** - A customer receipt is returned in the payment response in [OutputContent.OutputXHTML](/docs/api-reference/data-model#outputxhtml) formatted as the format defined in [OutputContent.OutputFormat](/docs/api-reference/data-model#outputformat)


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

:::success
The payment user interface settings are only required for the [Fusion Cloud](#fusion-cloud) integration type. If you are using **Fusion App** or **Fusion Satellite** you can skip this section.
:::


:::info
The Sale System should implement <code>Initial UI</code>, <code>Final UI</code>, <code>Display UI</code> and the ability to <code>cancel a sale in progress</code>. 

The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.
:::


If capable, the Sale System should present UI to the cashier for the duration of a payment. The content of the UI is set by the [input](/docs/api-reference/fusion-cloud#input) and [display](/docs/api-reference/fusion-cloud#display) request messages sent from the POI System.

In the examples presented below the UI is contained in a modal shadow box. This is an example to help illustrate how this UI may be implemented. The Sale System should implement this UI in a way that fits the look and feel of the rest of the system.

The Sale System must not block communication with the POI System when displaying the payments UI. The POI System may send a display or input request, followed by another display or input request, or the payment response. For example, the POI System may send a "SELECT ACCOUNT" display, followed by a "PROCESSING" display when the card holder selects their account on the POI terminal. The POI System may send a "SIGNATURE APPROVED" input request, followed by a "TIMEOUT" display and payment response, if the cashier doesn't approve the signature in time.

To enable display and input handling on the Sale System, [SaleTerminalData.SaleCapabilities](/docs/api-reference/data-model#salecapabilities) in the [login](/docs/api-reference/fusion-cloud#login) request contains "CashierStatus", "CashierError", "CashierInput", and "CustomerAssistance".

:::tip
The DataMesh Nexo API is event based. The Sale System sends a payment request, handles events as they are received, and eventually receives a payment response.
:::

#### Initial UI

The Sale System should immediately display an initial UI after sending a [payment](/docs/api-reference/fusion-cloud#payment) request which informs the cashier the payment is in progress. This UI is required to handle instances where the first display/input message from the POI System is not present, or delayed.

This UI should also enable the cashier to request a cancellation of the transaction.

*Example*

![](/img/dialog-initial-ui.png)

#### Display UI




<details>
  <summary>Display request</summary>
  <div>

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

  </div>
</details>




The POI system will send zero or more [display request](/docs/api-reference/fusion-cloud#display) messages to the Sale System during a transaction. The Sale System should display these messages and continue to wait for the payment response.

- Each display request will contain at least 1 line of text.
- Each line of text will be up to 40 characters wide.
- The POI System should display the text centred.
- The POI System should include the option to cancel the transaction.
- The POI System should display an "in progress" indicator to the cashier.
- The POI System may optionally colour the display text based on the [InfoQualify](/docs/api-reference/data-model#infoqualify) field set as "Error" or "Status"

*Example*

![](/img/dialog-display.png)

#### Input UI

:::warning
The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.
:::

The POI system will send zero or more [input request](/docs/api-reference/fusion-cloud#input) messages to the Sale System during a transaction. The Sale System should display these input requests, allow the cashier the option to answer the input request, and continue to wait for the payment response. The Sale System should not block on an input request, as the POI System may continue with the transaction before the Sale System has sent an input response.


- There are six types of input request. The [InputCommand](/docs/api-reference/data-model#inputcommand) indicates which input request type the Sale System should present:
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

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "GetAnyKey" indicates the Sale System should wait for any key press. This is most often used to display a request which the cashier must acknowledge to continue.

*Example*

![](/img/dialog-input-getanykey.png)

**Input - GetConfirmation**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "GetConfirmation" indicates the Sale System should present a yes/no option to the cashier. The response to this request is boolean true/false.

:::info
The option for the cashier to 'Cancel' is optional on the <code>GetConfirmation</code> input UI.
:::

*Example*

![](/img/dialog-input-getconfirmation.png)

**Input - Password**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "Password" indicates the Sale System should allow the user to enter text of any format as a password. 

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

The [MaskCharactersFlag](#maskcharactersflag) field indicates if the Sale System should mask the cashier input on screen.

*Example*

![](/img/dialog-input-getpassword.png)

**Input - TextString**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "TextString" indicates the Sale System should allow the user to enter text of any format. 

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-textstring.png)

**Input - DigitString**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "DigitString" indicates the Sale System should allow the user to enter a string of digits only.

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-digitstring.png)

**Input - DecimalString**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "DigitString" indicates the Sale System should allow the user to enter a string of digits with a decimal point (e.g. an amount)

The Sale System should ensure cashier input conforms to [MinLength](#minlength) and/or [MaxLength](#maxlength) fields if they are present and display an informational error if it does not.

*Example*

![](/img/dialog-input-decimalstring.png)

**Input - GetMenuEntry**

An [InputCommand](/docs/api-reference/data-model#inputcommand) of "GetMenuEntry" indicates the Sale System should allow the cashier to select one of a number of options available.

The number of available options will be 1..n. The `MenuEntry` object contains the options to be displayed.

*Example*

![](/img/dialog-input-getmenuentry.png)


#### Final UI

The Sale System should display a final UI after the response has been received to inform the cashier of the transaction result. 

This UI is constructed using the [Result](/docs/api-reference/data-model#result), [ErrorCondition](/docs/api-reference/data-model#errorcondition), and [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) fields of the `Response` object.

*Result="Success" Example*

![](/img/dialog-final-ui-success.png)

*Result="Failure" Example*

![](/img/dialog-final-ui-failure.png)

#### Cancelling a sale in progress

Whilst a payment is in progress the Sale System should present UI to the cashier which enables them to request a cancellation of the payment. 

If the cashier initiates a payment cancellation, the Sale System sends an [abort transaction request](/docs/api-reference/fusion-cloud#abort-transaction) (with `AbortRequest.AbortReason` field set to "User Cancel").  Then, the Sale System continues to wait for the payment response. 

The Sale System may allow the cashier to continue to request cancellation of the payment until a payment result has been received.

:::tip
There are a number of instances where the Terminal may be unable to cancel a payment in progress upon receiving a <a href="#abort-transaction">abort transaction request</a>. The Sale System must <b>always</b> await a payment response after sending an abort transaction request.  If no response is received or an error has occurred before a response is received, the Sale System must peform <a href="/docs/api-reference/fusion-cloud#error-handling">error handling</a>.
:::

![](/img/payment-cancellation.png)


### Product data

:::success
Product data is mandatory for all requests. 
:::

The Sale System must include product information about the sale items attached to each purchase request. 

It can accomplish this by including an array of [SaleItem](/docs/api-reference/data-model#saleitem) objects in the `PaymentRequest`.

Each [SaleItem](/docs/api-reference/data-model#saleitem) record contains the following mandatory fields: 

- **ItemID** a unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
- **ProductCode** - a unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
- **ItemAmount** - total amount of the sale item.
- **ProductLabel** - a short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
- **Quantity** - item unit quantity
- **UnitOfMeasure** - unit of measure of the `Quantity`. See [UnitOfMeasure](/docs/api-reference/data-model#unitofmeasure)
- **UnitPrice** - price per item unit. 

See [SaleItem](/docs/api-reference/data-model#saleitem) for all available fields and examples. 

:::tip
Including all available product information in each payment request will improve the merchant experiance. See <a href="/docs/api-reference/data-model#saleitem">SaleItem</a> for a full list of available fields. 
:::

### Refunds

Refund is paying back the customer the amount corresponding to some or all of the goods/services that the customer previously availed. The total refund amount must include any surcharge amount applied to the specific goods/services in the original sale transaction. 

Types of Refund:

- [Matched refund](./getting-started#matched-refund)

- [Unmatched refund](./getting-started#unmatched-refund)

More details about the [refund implementation](/docs/api-reference/data-model#saleitem-refunds).

#### Matched refund

- A matched refund is paired with an original purchase. 
- The Sale System must specify the [POITransactionID](/docs/api-reference/data-model#poitransactionid) from the original payment response message in the [OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction) field of the refund payment request message.
- When [dynamic surcharge](./getting-started#dynamic-surcharge) is enabled: 
  - The matched refund should include the surcharged amount.
  - The total amount must be equal to the original purchase amount + dynamic surcharge amount.
- When [dynamic surcharge](./getting-started#dynamic-surcharge) is "NOT" enabled: 
 - The total amount must be equal to the original purchase amount.

#### Unmatched refund
- An unmatched refund is not paired with an original purchase.
- Unmatched refunds don't have any extra requirements/restrictions.
- When [dynamic surcharge](./getting-started#dynamic-surcharge) is enabled:
 - The total amount must be equal to the purchase amount to be refunded + portion of the surcharge amount, which corresponds to the purchase amount to be refunded.

 :::warning
Currently, both Matched and Unmatched refunds involve POI Terminal and card interaction.
:::

 ![](/img/payment-refund.png)

### Cash out

The Sale System can optionally support cash out payments on the POI Terminal. There are two cash out methods supported based on where the cash out amount is entered; cash out on Sale System, and cash out on POI Terminal. 

#### Cash out on Sale System

When perfoming cash out on the Sale System, the cash out amount is entered by the cashier on the Sale System before the purchase is sent. 

A cash out sale can be cash out only, or cash out + purchase. 

- Cash out only (no sale items are included)
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "CashAdvance"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to the cash out amount 
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) to the cash out amount 
- Purchase plus cash out (sale items are included)
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to the value of the sale items, plus the cash out amount 
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) to the cash out amount 

<!---
#### Cash out on POI Terminal

When performing cash out on the POI Terminal, the Sale System sends the payment request to the POI Terminal without a cash out amount. The POI Terminal gives the option for the card holder to enter a cash out amount. The payment response will contain any cash out amount entered by the card holder.

A cash out sale can be cash out only, or cash out + purchase. 

- Cash out only (no sale items are included)
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "CashAdvance"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to 0
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) to 0
  - Set [PaymentTransaction.AmountsReq.MaximumCashBackAmount](/docs/api-reference/data-model#maximumcashbackamount) to the maximum about the terminal should allow the card holder to enter 
  - The [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) field in the payment response will reflect the cash back amount entered by the card holder
  - The [PaymentTransaction.AmountsReq.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) field in the payment response will include the cash back amount entered by the card holder  
- Purchase plus cash out (sale items are included)
  - Set [PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Normal"
  - Set [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to the value of the sale items
  - Set [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) to 0
  - Set [PaymentTransaction.AmountsReq.MaximumCashBackAmount](/docs/api-reference/data-model#maximumcashbackamount) to the maximum about the terminal should allow the card holder to enter 
  - The [PaymentTransaction.AmountsReq.CashBackAmount](/docs/api-reference/data-model#cashbackamount) field in the payment response will reflect the cash back amount entered by the card holder
  - The [PaymentTransaction.AmountsReq.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) field in the payment response will include the cash back amount entered by the card holder
-->

### Pre-authorisation / completion 

The pre-authorisation payment flow allows the Sale System to reserve funds on a customer's card, enabling the payment to be completed at a later time.

:::info
Pre-auth / completion have specific requirements. Talk to the DataMesh integrations team before implementing. 
:::

#### Pre-authorisation

:::success
A pre-authorisation must be followed by a completion or pre-authorisation cancel. 
:::

The pre-authorisation allows the Sale System to reserve funds on a customers card, enabling the payment to be completed at a later time.

To perform a pre-authorisation:

- Construct a [payment request](/docs/api-reference/fusion-cloud#payment)
- Set [PaymentRequest.PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "FirstReservation"
- Set [PaymentRequest.PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to the amount to reserve 
- Set [PaymentRequest.SaleData.SaleReferenceID](/docs/api-reference/data-model#salereferenceid) to a unique [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). Note this value must be included in the matching completion.
- Set [PaymentRequest.SaleData.TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype) in the payment request to "Customer".
-  Populate SaleItem[] with the products

On pre-authorisation response, the POS must record: 

- [PaymentRequest.SaleData.SaleReferenceID](/docs/api-reference/data-model#salereferenceid) from the request
- [PaymentResponse.POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) from the response
- [PaymentResponse.PaymentResult.AmountsResp.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) from the response (the reserved amount)
- [PaymentResponse.PaymentInstrumentData.CardData.PaymentToken.TokenValue](/docs/api-reference/data-model#paymenttoken) from the response


#### Completion

:::success
A `RequestedAmount` of a completion must be equal, or less than pre-authorisation `AuthorizedAmount`.
:::

Completion captures payment of the amount previously reserved through pre-authorisation.

To perform a completion:

- Construct a [payment request](/docs/api-reference/fusion-cloud#payment)
- Set [PaymentRequest.PaymentData.PaymentType](/docs/api-reference/data-model#paymenttype) to "Completion"
- Set [PaymentRequest.PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) the completion amount. Must be less than or equal to `AuthorizedAmount` from the pre-authorisation
- Set [PaymentRequest.SaleData.SaleReferenceID](/docs/api-reference/data-model#salereferenceid) to the same `SaleReferenceID` as used in the pre-authoristaion request
- Set [PaymentRequest.PaymentTransaction.OriginalPOITransaction.POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [PaymentResponse.POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) from the original pre-authorisation response
- Set [PaymentRequest.PaymentInstrumentData.CardData.EntryMode](/docs/api-reference/data-model#entrymode) to "File"
- Set [PaymentRequest.PaymentInstrumentData.CardData.PaymentToken.TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype) to "Customer"
- Set [PaymentRequest.PaymentInstrumentData.CardData.PaymentToken.TokenValue](/docs/api-reference/data-model#paymenttoken) to the value returned in [PaymentResponse.PaymentInstrumentData.CardData.PaymentToken.TokenValue](/docs/api-reference/data-model#paymenttoken) from the original pre-authorisation response



#### Pre-authorisation cancel

A successful pre-authorisation must be either completed, or cancelled. To cancel a pre-authorisation, the Sale System sends a `ReversalRequest`.

To perform a pre-authorisation cancel:

- Construct a [reversal request](/docs/api-reference/fusion-cloud#voidreversal)
- Set [ReversalRequest.OriginalPOITransaction.POITransactionID](/docs/api-reference/data-model#poitransactionid) to the value returned in [PaymentResponse.POIData.POITransactionID](/docs/api-reference/data-model#poitransactionid) from the original pre-authorisation response
- Set [ReversalRequest.SaleData.SaleReferenceID](/docs/api-reference/data-model#salereferenceid) to the same `SaleReferenceID` as used in the pre-authoristaion request
- Set `ReversalReason` to `"MerchantCancel"`.



### Settlement

The Sale System can reconcile with the POI System periodically but should normally be once a day as it affects settlements with acquirers.

Use the [Reconciliation](/docs/api-reference/fusion-cloud#reconciliation) request to initiate a settlement.

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

To tokenise a card as part of a [payment](/docs/api-reference/fusion-cloud#payment), set [SaleData.TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype) in the payment request to "Transaction" or "Customer".

When [SaleData.TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype) is set, the token will be returned as part of the payment response in [PaymentResult.PaymentInstrumentData.CardData.PaymentToken](/docs/api-reference/data-model#paymenttoken).


#### Tokenise a card without payment 

The [card acquisition](/docs/api-reference/fusion-cloud#card-acquisition) request allows the Sale System to tokenise a card which can be used in future payment requests.


<!-- TODO - need to validate how this works

#### Use a token for a payment 

To perform a [payment](/docs/api-reference/fusion-cloud#payment) request using a token: 

- Populate [PaymentTransaction.OriginalPOITransaction](/docs/api-reference/data-model#originalpoitransaction) with details of the sale used to acquire the token
- Set [PaymentTransaction.OriginalPOITransaction.ReuseCardDataFlag](#reusecarddataflag) to true
- Populate values in the `PaymentTransaction.PaymentData.PaymentInstrumentData.CardData.PaymentToken` object 
  - [TokenRequestedType](/docs/api-reference/data-model#tokenrequestedtype) - "Transaction" or "Customer". Must match the type of token recorded in the POI System.
  - [TokenValue](#tokenvalue) - Token previously returned from the POI System in the payment, or card acquisition response 

-->

### Partial payments

:::info
Partial payments are only supported in selected payment scenarios and requires the "PartialPayment" feature to be enabled in the terminal configuration. Contact the DataMesh [integrations team](mailto:integrations@datameshgroup.com) before implementing partial payments.
:::

When the "PartialPayment" feature is enabled, the POI Terminal may approve a purchase for less than the [RequestedAmount](/docs/api-reference/data-model#requestedamount) passed in by the Sale System. 

This feature can be used in conjunction with [split payments](#split-payments) to accept loyalty and stored value card payments where the value available on the card may be less than the total [RequestedAmount](/docs/api-reference/data-model#requestedamount).

**Handling a partial payment**

- Ensure the "PartialPayment" feature has been enabled on the POI Terminal
- Send a [payment request](/docs/api-reference/fusion-cloud#paymentrequest), including all required fields
  - Set the maximum payable purchase amount in [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount)
- Await the payment response and check [Response.Result](/docs/api-reference/data-model#result) for the transaction result.
- If [Response.Result](/docs/api-reference/data-model#result) is "Partial" the payment has been approved for an amount less than the the [RequestedAmount](/docs/api-reference/data-model#requestedamount)
  - [PaymentResponse.Response.Result](/docs/api-reference/data-model#result) will be "Partial"
  - [PaymentResult.AmountsResp.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) will reflect the full authorized amount (including all fees, tips, and surcharges)
  - [PaymentResult.AmountsResp.PartialAuthorizedAmount](/docs/api-reference/data-model#partialauthorizedamount) will reflect the amount of [RequestedAmount](/docs/api-reference/data-model#requestedamount) which has been authorised.
- Reduce the sale amount owing by [PartialAuthorizedAmount](/docs/api-reference/data-model#partialauthorizedamount) and offer the customer a way to provide further payment. 
  - If the remaining amount is to be paid using the POI Terminal, follow the steps outlined in [split payments](#split-payments) 


**Example**

- Sale System sends payment request of $100.00 to DataMesh
  - [PaymentTransaction.AmountsReq.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) = $100.00
- DataMesh terminal calculates an added surcharge of $1.00 and adds it to the total amount
- Cardholder presents a stored value card with $42 available
- DataMesh POI Terminal completes the payment for $42 and returns a response to the POS
  - [PaymentResponse.Response.Result](/docs/api-reference/data-model#result) is "Partial"
  - [PaymentResult.AmountsResp.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) is $42.00
  - [PaymentResult.AmountsResp.PartialAuthorizedAmount](/docs/api-reference/data-model#partialauthorizedamount) is $41.00
  - [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount) is $1.00
- Sale System reduces the outstanding amount by $41.00 and offers the cardholder the option to pay the remaining $59.00




### Split payments

To perform a split payment, the Sale System should send multiple [payment](/docs/api-reference/fusion-cloud#payment) requests, one for each split. 

Split is allowed when [PaymentType](/docs/api-reference/data-model#paymenttype) is "Normal".

The following data elements should be set by the Sale System for a split payment in a [payment](/docs/api-reference/fusion-cloud#payment) request:

- All split payments which are part of the same sale should include the same [SaleData.SaleTransactionID](/docs/api-reference/data-model#saletransactionid). 
- [PaymentTransaction.SaleItem](/docs/api-reference/data-model#saleitem) array, which may reflect
  - Just the items involved in that payment, in the case of a split basket.
  - All the items in the sale, in the case the sale is being split by amount. Note when splitting by amount the sum of the item amounts could more than the [RequestedAmount](/docs/api-reference/data-model#requestedamount).
- [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) set to the amount of the split payment
- [PaymentData.SplitPaymentFlag](/docs/api-reference/data-model#splitpaymentflag) set to true
- [PaymentTransaction.AmountsReq.MinimumSplitAmount](/docs/api-reference/data-model#minimumsplitamount) set to the minimum split amount 
- [PaymentTransaction.AmountsReq.PaidAmount](/docs/api-reference/data-model#paidamount) set to the total amount of previous split payment associated with this sale

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

An example, when splitting after a partial payment:
- A sale contains two items, "Product A" ($80) and "Product B" ($20)
- The card holder wishes to pay with a stored value card
- The cashier sends the payment request for $100, the basket contains both "Product A" and "Product B"
- The payment is partially approved for $40
- The Sale System reduces the outstanding amount by $40
- The cashier sends a second payment for $60, the basket contains both "Product A" and "Product B"

![](/img/payment-split-partial.png)

### Tipping

There are two tipping methods supported; tip on Sale System, and tip on POI Terminal. 

#### Tip on Sale System

When tipping on the Sale System the tip amount is entered by the cashier on the Sale System before the purchase is sent.

For example: 

1. Cashier prints a sale ticket for $100 and presents to the card holder
1. Card holder signs and writes a tip of $10
1. Cashier opens $100 sale on the Sale System, enters tip of $10 and initiates payment
1. Sale System sends a [payment request](/docs/api-reference/fusion-cloud#payment) request to the POI Terminal and sets
  - [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to $110 (sale amount + tip)
  - [PaymentTransaction.AmountsReq.TipAmount](/docs/api-reference/data-model#tipamount) to $10
1. POI Terminal processes a payment of $110 and includes tip amount on the payment receipt
1. POI Terminal approves payment and returns the result to the Sale System

:::warning
If the <a href="/docs/api-reference/data-model#tipamount">PaymentTransaction.AmountsReq.TipAmount</a> is set to 0 in the payment request, the Tip Entry screen will be displayed in the POI terminal.<br />Do not set <a href="/docs/api-reference/data-model#tipamount">PaymentTransaction.AmountsReq.TipAmount</a> to 0 if you don't want the Tip Entry screen to be displayed in the POI terminal.
:::

#### Tip on POI Terminal

When tipping on the POI Terminal, the Sale System sends the payment request to the POI Terminal without a tip. The POI Terminal gives the option for the card holder to enter a tip amount. The payment response will contain any tip entered by the card holder.

For example: 

1. Cashier opens $100 sale on the Sale System and initiates payment
1. Sale System sends a [payment request](/docs/api-reference/fusion-cloud#payment) request to the POI Terminal and sets
  - [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to $100 (sale amount + tip)
  - [PaymentTransaction.AmountsReq.TipAmount](/docs/api-reference/data-model#tipamount) to $0
1. POI Terminal presents UI to the card holder which allows them to enter a tip
1. Card holder enters tip amount of $10
1. POI Terminal processes a payment of $110 and includes tip amount on the payment receipt
1. POI Terminal approves payment and returns the result to the Sale System with 
  - [PaymentResult.AmountsResp.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) set to $110
  - [PaymentResult.AmountsResp.TipAmount](/docs/api-reference/data-model#tipamount) set to $10
1. The Sale System records the approved payment, and optionally records the tip amount of $10

:::tip
The amount returned in <a href="#authorizedamount">AuthorizedAmount</a> in the payment result may be differ from the <a href="/docs/api-reference/data-model#requestedamount">RequestedAmount</a> sent in the payment request
:::

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
1. Sale System sends a [payment request](/docs/api-reference/fusion-cloud#payment) request to the POI Terminal and sets [PaymentTransaction.AmountsReq.RequestedAmount](/docs/api-reference/data-model#requestedamount) to $100
1. Card holder presents their Amex card
1. POI Terminal calcualtes new total based on the card type and processes a payment of $101.90 
1. POI Terminal approves payment and returns the result to the Sale System with 
  - A receipt containing lines with the requested amount, surcharge percentage, surcharge amount, and new total amount
  - [PaymentResult.AmountsResp.AuthorizedAmount](/docs/api-reference/data-model#authorizedamount) set to $101.90
  - [PaymentResult.AmountsResp.SurchargeAmount](/docs/api-reference/data-model#surchargeamount) set to $1.90
1. The Sale System records the `AuthorizedAmount`, and optionally records the `SurchargeAmount` of $1.90

:::tip
The amount returned in <a href="#authorizedamount">AuthorizedAmount</a> in the payment result may be differ from the <a href="/docs/api-reference/data-model#requestedamount">RequestedAmount</a> sent in the payment request
:::

#### Merchant responsibilities

- Merchants are required to notify the cardholder that a surcharge will be applied. For example, by ensuring signage at the point of purchase
- The RBA surcharge framework indicates merchants should review the level of any surcharge applied at least once a year
- Any refund of a purchase with surcharge applied needs to include the full purchase + surcharge amount

<!-- 
### Pay at Table 
:::warning
TODO
:::
-->




### Error handling

When the Sale System sends a request, it will receive a matching response. For example, if the Sale System sends a [payment request](/docs/api-reference/fusion-cloud#payment), it will receive a [payment response](/docs/api-reference/fusion-cloud#payment-response).

However, in unusual scenarios wherein the Sale System sends a request but doesn't receive a corresponding response (for example, due to network error or timeout), the Sale System must enter an error handling loop.

More information about how to handle such scenario can be found in the [Error handling section of the Cloud API](/docs/api-reference/fusion-cloud#error-handling)




### Fuel API

The Fusion Fuel API is an extension to the Fusion Core API which adds support for current and future fuel payment types accepted by DataMesh. (e.g. FleetCard, Shell Card, MotorPass etc)

For more information see the [Fusion API Fuel Extension](/docs/api-reference/fusion-api-fuel-extension)


### Stored Value API

The Fusion Stored Value API is an extension to the Fusion Core API which adds support for gift card payments.

For more information see the [Fusion API Stored Value Extension](/docs/api-reference/fusion-api-stored-value-extension)




### Product level blocking (PLB)

PLB is a program that automatically prevents enhanced income management cards from being used to purchase restricted items (alcohol, gambling services, tobacco products, cash-like products etc).

PLB transaction example:

1. When constructing a [Payment Request](/docs/api-reference/data-model#payment-request), the Sale System sets the [PaymentRequest.PaymentTransaction.SaleItem[].Restricted](/docs/api-reference/data-model#saleitem) flag to `true` for each sale item classified as "restricted" under the PLB scheme. 
1. The cardholder presents their card on the POI Terminal. 
1. If the card presented is an enhanced income management card, and either the  Sale System has flagged sale items as `Restricted`, or no sale items were provided in the request, then the POI terminal declines the sale 
  1. PaymentResponse.AllowedProductCodes contains the `SaleItem.ProductCode` of items which were blocked
  1. [PaymentResponse.Response.Result](/docs/api-reference/data-model#result) will be set to `Failure`
  1. [PaymentResponse.Response.ErrorCondition](/docs/api-reference/data-model#errorcondition) will be set to `PaymentRestriction`
  1. [PaymentResponse.Response.AdditionalResponse](/docs/api-reference/data-model#additionalresponse) will contain "Restricted items" if the payment was declined due to restricted items, or "No Product Data" if the payment was declined due to no `SaleItem` data provided.




### Restricted payment brands

:::info
This feature is only available to select merchants. Please discussion with the [integrations team](mailto:integrations@datameshgroup.com) before implementing. 
:::

The Sale System can restrict the payment request to specified payment brands by configuring [PaymentRequest.PaymentTransaction.TransactionConditions.AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand). 

This can be used by the Sale System to implement business rules for restricted payment types per transaction. e.g. preventing the purchase of a gift card with another gift card, or preventing the use of loyalty cards when discounts have been provided. 

#### Payment request

The Sale System can configure the restricted payment brands behaviour in several ways: 
* Allowing all payment brands
* Specify allowed payment brands
* Specify allowed payment brand categories
* Specify allowed payment brands
* Specify allowed payment brand categories

:::tip
Where possible, the Sale System should specify payment brand **categories** instead of specific payment brands. This will ensure the expected behaviour continues once payment brands are added in the future. 
:::

**Allowing all payment brands**

The default behaviour by the POI Terminal is to accept all payment brands when [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand) is null or empty. 

*Example - allow all payment brands*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": []
      }
    }
  }
}
```

**Specify allowed payment brands**

To specify which payment brands to allow, add the supported [PaymentBrandId](/docs/api-reference/data-model#paymentbrandid) to [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrand).

When an allowed payment brand is specified, all other payment brands are blocked. 

*Example - block all payment brands except VISA Debit and VISA Credit*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "0004", "0005" ]
      }
    }
  }
}
```


**Specify allowed payment brand categories**

To specify which payment brand categories to allow, prefix `Category:` to a supported [PaymentBrandId](/docs/api-reference/data-model#paymentbrandid) category in [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand).

When an allowed payment brand category is specified, all other payment brands outside the category are blocked.

*Example - block all payment brands except card schemes*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "Category:Schemes" ]
      }
    }
  }
}
```

**Specify restricted payment brands** 

To specify which payment brands to restrict, prefix a `!` to the restricted [PaymentBrandId](/docs/api-reference/data-model#paymentbrandid) in [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand).

When a restricted payment brand is specified, all other payment brands are allowed. 

*Example - allow all payment brands except EFTPOS & Blackhawk*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "!0001", "!0600" ]
      }
    }
  }
}
```


**Specify restricted payment brand categories**

To specify which payment brand categories to restrict, prefix a `!Category:` to the restricted [PaymentBrandId](/docs/api-reference/data-model#paymentbrandid) category in [AllowedPaymentBrand](/docs/api-reference/data-model#allowedpaymentbrand).

When a restricted payment brand category is specified, all other payment brands outside the category are blocked.

*Example - allow all payment brands except gift cards and fuel cards*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "!Category:GiftCard", "!Category:Fuel" ]
      }
    }
  }
}
```

**Mixing allowed and restricted payment brands and categories**

:::tip 
The Sale System should take care when mixing allowed and restricted payment brands and categories
:::

Specifying a restricted payment brand category as well as a restricted payment brand is supported.

*Example - allow all payment brands except fuel cards, gift cards, and Flybuys.

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "!Category:Fuel", "!Category:GiftCard", "!0402" ]
      }
    }
  }
}
```

Mixing allowed and restricted payment brands and categories is not recommended as it can lead to unexpected behaviour. 

*Example - block all payment brands except fuel cards. The `!0001` entry will have no effect*

```json
{	
  "PaymentRequest": {
    "PaymentTransaction": {
      "TransactionConditions": {
        "AllowedPaymentBrand": [ "!0001", "Category:Fuel" ]
      }
    }
  }
}
```

#### Payment response 

If the cardholder presents a restricted payment brand, the POI Terminal will decline the payment request with the payment response set to:

- [PaymentResponse.Response.Result](/docs/api-reference/data-model#result) will be set to `Failure`
- [PaymentResponse.Response.ErrorCondition](/docs/api-reference/data-model#errorcondition) will be set to `PaymentRestriction`
- [PaymentResponse.Response.AdditionalResponse](/docs/api-reference/data-model#additionalresponse) will contain "Restricted payment brand"