---
sidebar_position: 1
---

# Fusion App

Fusion App is a DataMesh middleware that is installed in the PC as the Sale System. 

Fusion App wraps the Fusion Cloud API and handles many of the interactions between the Sale System and the POI terminal (web socket, security, pairing, error handling, UI etc).

To initiate a payment, the Sale System sends a HTTP POST to a local endpoint, and waits for a response. 

In case of an error (timeout, system crash etc), the Sale System sends a HTTP GET request to request the status of the payment.

## Getting started with Fusion App

### Install Fusion App

- Contact the DataMesh Integrations team (integrations@datameshgroup.com) and request the latest Fusion App installer
- Run the installer and select the _Development_ install type

  ![](/img/fusion-app-install-1.png)

- Wait for the installation to complete and click _Finish_

  ![](/img/fusion-app-install-2.png)

### Configure Fusion App

- Launch Fusion App from the icon in the system tray. 

  ![](/img/fusion-app-icon.png)

- Configure Fusion App with the SaleID, POIID, and KEK provided by DataMesh and click _Apply_.

  ![](/img/fusion-app-settings.png)

- Fusion App will complete a login to validate the SaleID, POIID, and KEK.

  ![](/img/fusion-app-login.png)

- The _Util_ tab will allow you to access log files and perform a login. DataMesh may ask for log files to diagnose issues during development. 

  ![](/img/fusion-app-util.png)

### Send your first payment request

- Download and install [Postman](https://www.postman.com/downloads)
- Import the Fusion App postman script:
  - In Postman, select Menu(☰) → File → Import...
  - Browse to `%PROGRAMFILES(X86)%\DataMeshGroup\FusionApp\FusionApp.postman_collection.json` and import
- Select Collections → Payment, and click _Send_

![](/img/fusion-app-postman.png)


### Next steps

- Ensure you've read [Getting Started](../getting-started) and scoped your integration requirements
- Read [Perform a purchase](#perform-a-purchase) and [Perform a refund](#perform-a-refund) and implement this functionality in your Sale System
- Implement other required features based on this API specification
- On the PC you've installed Fusion App, you can also view the locally installed [Swagger docs](http://localhost:4242/swagger)

## Perform a purchase

To perform a purchase the Sale System will need to POST a [Payment request](/docs/api-reference/data-model#payment-request) JSON payload to the `http://localhost:4242/fusion/v1/payments`) endpoint.

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

## Perform a refund

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


## Methods

### Login 

The `Login` endpoint is a useful method for validating connectivity with DataMesh without sending a financial request. The Sale System is not required to implement this functionality. 

** Endpoint **
`POST http://localhost:4242/fusion/v1/login/{{SessionId}}`

** Query Parameters **

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |


** Headers **

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

** Request Body **

Empty.

** Response Body **

A JSON payload based on [Login response](/docs/api-reference/data-model#login-response)

<details><summary>Login response</summary>
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

** Response HTTP Status Codes **

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `LoginResponse.Response.Result` for the result of the login request |
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and try again.
5xx  | Error       | Fusion App was unable to process the request. Try again.



### Payments

The `Payments` endpoint is used to perform purchase, purchase + cash out, cash out only, and refund requests. 

** Endpoint **
`POST http://localhost:4242/fusion/v1/payments/{{SessionId}}`

** Query Parameters **

Parameter          | Value                                                  | 
------------------ | ------------------------------------------------------ |
SessionId          | A globally unique UUIDv4 which identifies this request |

** Headers **

Parameter          | Value                                    | 
------------------ | ---------------------------------------- |
Content-Type       | application/json                         |
Accept             | application/json                         |
X-Application-Name | The name of your Sale System             |
X-Software-Version | The software version of your Sale System |

** Request Body **

A JSON payload based on [Payment request](/docs/api-reference/data-model#payment-request)

<details><summary>Payment request</summary>
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

** Response Body **

A JSON payload based on [Payment response](/docs/api-reference/data-model#payment-response)

<details><summary>Payment response</summary>
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

** Response HTTP Status Codes **

Code | Description | Required action  | 
---- | ----------- | ----------------- |
200  | OK          | Fusion App processed the request. Check `PaymentResponse.Response.Result` for the result of the payment request |
4xx  | Bad Request | Fusion App was unable to process the request. Check the required headers and request body and try again.
5xx  | Error       | Fusion App was unable to process the request. The Sale System should perform [error handling](#error-handling) to retreive the payment result.

 
## Error handling

When the Sale System POSTs [payment request](#payment_request) it will receive a [payment response](#payment-response).

The Sale System should verify the result of the transaction by checking the [Response.Result](/docs/api-reference/data-model#result) field in the response.

- If the [Response.Result](/docs/api-reference/data-model#result) is "Success", the payment transaction was successful.
- If the [Response.Result](/docs/api-reference/data-model#result) is "Failure", the payment transaction failed.  The Sale System may check for any errors specified in the [Response.ErrorCondition](/docs/api-reference/data-model#errorcondition) field in the same response message and handle the error accordingly.

In the event the Sale System does not receive a response (for example, due to network error, timeout, or any other unexpected error) it must enter error handling.

To perform error handling the Sale System should send a `GET` request to the [payments](#payments) endpoint using the `SessionId` of the failed request. Fusion App will return a [payment response](#payment-response) containing the result of the payment. 