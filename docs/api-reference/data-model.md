---
sidebar_position: 3
---

# Data model

Definition of request, response messages and properties used by the Fusion API's.

## Request/response messages

### Login 

The Sale System sends a Login request when it is ready to pair with a POI terminal. 
The Sale System can pair with multiple POI terminals by sending multiple Login requests.

#### Login request

<details><summary>Login request</summary>
<p>

```json
{
	"LoginRequest": {
		"DateTime": "xxx",
		"SaleSoftware": {
			"ProviderIdentification": "xxx",
			"ApplicationName": "xxx",
			"SoftwareVersion": "xxx",
			"CertificationCode": "xxx"
		},
		"SaleTerminalData": {
			"TerminalEnvironment": "xxx",
			"SaleCapabilities": [
				"xxx",
				"xxx",
				"xxx"
			],
			"TotalsGroupID": "xxx"
		},
		"OperatorLanguage": "en",
		"OperatorID": "xxx",
		"ShiftNumber": "xxx",
		"POISerialNumber": "xxx",
		"Pairing": "true or false"
	}
}
```
</p>
</details>

Attribute |Requ.| Format | Description |
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
Pairing           |  | Boolean| True if the POI ID in the MessageHeader is the PairingPOIID value from the [pairing QR code data](/docs/getting-started#pairing-qr-code) for the [QR POS Pairing](/docs/getting-started.mdx/#qr-pos-pairing)

#### Login response

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

Attribute     |Requ.| Format | Description |
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

<details><summary>Logout request</summary>
<p>

```json
{
	"LogoutRequest": {
		"MaintenanceAllowed": "true or false"
	}
}
```
</p>
</details>

Attribute     |Requ.| Format | Description |
-----------------                            |----| ------ | ----------- |
[MaintenanceAllowed](/docs/api-reference/data-model#maintenanceallowed)    |  | Boolean| Indicates if the POI Terminal can enter maintenance mode. Default to true if not present.    

#### Logout response

<details><summary>Logout response</summary>
<p>

```json
{
	"LogoutResponse": {
		"Response": "xxx",
		"ErrorCondition": "xxx",
		"AdditionalResponse": "xxx xxxx xxxx xxxx xxxx"
	}
}
```
</p>
</details>

Attribute     |Requ.| Format | Description |
-----------------                            |:----:| ------ | ----------- |
**Response**                                 | ✔ | Object | Object which represents the result of the response
 [Result](/docs/api-reference/data-model#result)                           | ✔ | String | Indicates the result of the response. Possible values are "Success" and "Failure"
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |  | String | Indicates the reason an error occurred. Only present when result is "Failure". Possible values are "MessageFormat", "Busy", "DeviceOut", "UnavailableService" and others. Note the Sale System should handle error conditions outside the ones documented in this specification.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |  | String | Provides additional error information. Only present when result is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information of possible values. 


### Payment 

The payment message is used to perform purchase, purchase + cash out, cash out only, and refund requests. 

#### Payment request

<details><summary>Payment request</summary>
<p>

```json
{
	"PaymentRequest": {
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
		"PaymentTransaction": {
			"AmountsReq": {
				"Currency": "AUD",
				"RequestedAmount": "x.xx",
				"CashBackAmount": "x.xx",
				"TipAmount": "x.xx",
				"PaidAmount": "x.xx",
				"MaximumCashBackAmount": "x.xx",
				"MinimumSplitAmount": "x.xx"
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
			"TransactionConditions": {
				"AllowedPaymentBrands": [
					"xxx",
					"xxx",
					"xxx"
				],
				"AcquirerID": [
					"xxx",
					"xxx",
					"xxx"
				],
				"DebitPreferredFlag": true,
				"ForceOnlineFlag": true,
				"MerchantCategoryCode": "xxx"
			},
			"SaleItem": [
				{
					"ItemID": "xxx",
					"ProductCode": "xxx",
					"EanUpc": "xxx",
					"UnitOfMeasure": "xxx",
					"Quantity": "xx.x",
					"UnitPrice": "xx.x",
					"ItemAmount": "xx.x",
					"TaxCode": "xxx",
					"SaleChannel": "xxx",
					"ProductLabel": "xxx",
					"AdditionalProductInfo": "xxx",
					"CostBase": "xxx",
					"Discount": "xxx",
					"Categories": [
						"xxx",
						"xxx"
					],
					"Brand": "xxx",
					"QuantityInStock": "xxx",
					"Tags": [
						"xxx",
						"xxx",
						"xxx"
					],
					"PageURL": "xxx",
					"ImageURLs": [
						"xxx",
						"xxx"
					],
					"Size": "xxx",
					"Colour": "xxx",
					"Weight": "xx.xx",
					"WeightUnitOfMeasure": "xxx"
				}
			]
		},
		"PaymentData": {
			"PaymentType": "xxx",
			"PaymentInstrumentData": {
				"PaymentInstrumentType": "xxx",
				"CardData": {
					"EntryMode": "xxx",
					"PaymentToken": {
						"TokenRequestedType": "xxx",
						"TokenValue": "xxx"
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
```
</p>
</details>

Attribute     |Requ.| Format | Description |
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
  [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)
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


Attribute     |Requ.| Format | Description |
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


### Display request

During a payment, the POI System will send status and error display requests to the Sale System, which enables the Sale System to inform the cashier of the current transaction status.

Follow the [user interface](#user-interface) guide for details on how to implement the required UI to handle display and input requests.

#### Display request

<details><summary>Display request</summary>
<p>

```json
{
	"DisplayRequest": {
		"DisplayOutput": {
			"ResponseRequiredFlag": false,
			"Device": "CashierDisplay",
			"InfoQualify": "xxx",
			"OutputContent": {
				"OutputFormat": "Text",
				"OutputText": {
					"Text": "xxx"
				}
			}
		}
	}
}
```
</p>
</details>

Attribute                  |Requ.| Format | Description |
-----------------                                         |:----:| ------ | ----------- |
**DisplayOutput**                                         | ✔ | Object | Object which represents the display 
 [ResponseRequiredFlag](/docs/api-reference/data-model#responserequiredflag)|  | Boolean | Indicates if the POI System requires a `DisplayResponse` to be sent for this `DisplayRequest`
 [Device](#device)                                        | ✔ | String | "CashierDisplay"
 [InfoQualify](/docs/api-reference/data-model#infoqualify)              | ✔ | String | "Status" or "Error". See [InfoQualify](/docs/api-reference/data-model#infoqualify)
 [OutputFormat](/docs/api-reference/data-model#outputformat)            | ✔ | String | "Text"
 [Text](#text)                                            | ✔ | String | Single line of text to display

#### Display response

<details><summary>Display response</summary>
<p>

```json
{
	"DisplayResponse": {
		"OutputResult": [
			{
				"Device": "xxx",
				"InfoQualify": "xxx",
				"Response": {
					"Result": "xxx",
					"ErrorCondition": "xxx",
					"AdditionalResponse": "xxx"
				}
			}
		]
	}
}
```
</p>
</details>

:::tip
The Sale System is expected to send a `DisplayResponse` if one or more displays in `DisplayOutput` have [ResponseRequiredFlag](/docs/api-reference/data-model#responserequiredflag) set to true.
:::

Attribute      |Requ.| Format | Description |
-----------------                             |:----:| ------ | ----------- |
*OutputResult*                                | ✔ | Object | Response for Device/InfoQualify pair where corresponding `ResponseRequiredFlag` in the `DisplayRequest` is set to true.
 [Device](#device)                            | ✔ | String | Mirrored from display request
 [InfoQualify](/docs/api-reference/data-model#infoqualify)                  | ✔ | String | Mirrored from display request
 [Result](/docs/api-reference/data-model#result)                            | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
 [ErrorCondition](/docs/api-reference/data-model#errorcondition)            |  | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
 [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)    |  | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 




### Input

:::caution
The <code>Input UI</code> elements are not currently available, and will be supported by a future Unify release. Support for these elements by the Sale System is optional.
:::


During a payment, the POI System will input requests to the Sale System if cashier interaction is required (e.g. signature approved yes/no)

Follow the [user interface](#user-interface) guide for details on how to implement the required UI to handle display and input requests.
 
#### Input request

<details><summary>Input request</summary>
<p>

```json
{
	"InputRequest": {
		"DisplayOutput": {
			"Device": "CashierDisplay",
			"InfoQualify": "POIReplication",
			"OutputContent": {
				"OutputFormat": "Text",
				"OutputText": {
					"Text": "xxx"
				}
			},
			"MenuEntry": [
				{
					"OutputFormat": "Text",
					"OutputText": {
						"Text": "xxx"
					}
				}
			]
		},
		"InputData": {
			"Device": "CashierInput",
			"InfoQualify": "xxx",
			"InputCommand": "xxx",
			"MaxInputTime": "xxx",
			"MinLength": "xxx",
			"MaxLength": "xxx",
			"MaskCharactersFlag": "true or false"
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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

<details><summary>Input response</summary>
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

Attribute      |Requ.| Format  | Description |
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

:::tip
The Sale System does not need to implement the Print request as signature receipt printing is currently managed by the POI Terminal.
:::
 
#### Print request

<details><summary>Print request</summary>
<p>

```json
{
	"PrintRequest": {
		"PrintOutput": {
			"DocumentQualifier": "CashierReceipt",
			"IntegratedPrintFlag": false,
			"RequiredSignatureFlag": true,
			"OutputContent": {
				"OutputFormat": "XHTML",
				"OutputXHTML": "xxxx"
			}
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
 **PrintOutput**                              | ✔ | Object | 
  [DocumentQualifier](#documentqualifier)     | ✔ | String | "CashierReceipt" for a merchant receipt, otherwise "SaleReceipt"
  [IntegratedPrintFlag](#integratedprintflag) |  |Boolean| True if the receipt should be included with the Sale receipt, false if the receipt should be printed now and paper cut (e.g. for a signature receipt)
  [RequiredSignatureFlag](#requiredsignatureflag) | ✔|Boolean| If true, the card holder signature is required on the merchant CashierReceipt.
  **OutputContent**                           |  | Array | Array of payment receipt objects which represent receipts to be printed
   [OutputFormat](/docs/api-reference/data-model#outputformat)              | ✔ | String | "XHTML"  
   [OutputXHTML](/docs/api-reference/data-model#outputxhtml)                | ✔ | String | The payment receipt in XHTML format but coded in BASE64 


#### Print response

<details><summary>Print response</summary>
<p>

```json
{
	"PrintResponse": {
		"DocumentQualifier": "CashierReceipt",
		"Response": {
			"Result": "xxx",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
[DocumentQualifier](#documentqualifier)       | ✔ | String | Mirrored from print request
 *Response*                                   | ✔ | Object | 
  [Result](/docs/api-reference/data-model#result)                           | ✔ | String | "Success", "Partial", or "Failure". See [Result](/docs/api-reference/data-model#result).
  [ErrorCondition](/docs/api-reference/data-model#errorcondition)           |    | String | Indicates the reason an error occurred. Only present when `Result` is "Failure". See [ErrorCondition](/docs/api-reference/data-model#errorcondition) for more information on possible values.
  [AdditionalResponse](/docs/api-reference/data-model#additionalresponse)   |    | String | Provides additional error information. Only present when `Result` is "Failure". See [AdditionalResponse](/docs/api-reference/data-model#additionalresponse) for more information on possible values. 



### Transaction status 

A transaction status request can be used to obtain the status of a previous transaction. Required for error handling. 

#### Transaction status request

<details><summary>Transaction status request</summary>
<p>

```json
{
	"TransactionStatusRequest": {
		"MessageReference": {
			"MessageCategory": "xxx",
			"ServiceID": "xxx",
			"SaleID": "xxx",
			"POIID": "xxx"
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
*MessageReference*                            |    | Object | Identification of a previous POI transaction. Present if it contains any data. 
 [MessageCategory](/docs/api-reference/data-model#messagecategory)          |    | String | "Payment"
 [ServiceID](/docs/api-reference/data-model#serviceid)                      |    | String | The [ServiceID](/docs/api-reference/data-model#serviceid) of the transaction to retrieve the status of. If not included the last payment status is returned.
 [SaleID](/docs/api-reference/data-model#saleid)                            |    | String | The [SaleID](/docs/api-reference/data-model#saleid) of the transaction to retrieve the status of. Only required if different from the [SaleID](/docs/api-reference/data-model#saleid) provided in the `MessageHeader`
 [POIID](/docs/api-reference/data-model#poiid)                              |    | String | The [POIID](/docs/api-reference/data-model#poiid) of the transaction to retrieve the status of. Only required if different from the [POIID](/docs/api-reference/data-model#poiid) provided in the `MessageHeader`


#### Transaction status response

<details><summary>Transaction status response</summary>
<p>

```json
{
	"TransactionStatusResponse": {
		"Response": {
			"Result": "xxx",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},
		"MessageReference": {
			"MessageCategory": "xxx",
			"ServiceID": "xxx",
			"SaleID": "xxx",
			"POIID": "xxx"
		},
		"RepeatedMessageResponse": {
			"MessageHeader": {},
			"RepeatedResponseMessageBody": {
				"PaymentResponse": {},
				"ReversalResponse": {}
			}
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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

<details><summary>Abort transaction request</summary>
<p>

```json
{
	"AbortRequest": {
		"MessageReference": {
			"MessageCategory": "xxx",
			"ServiceID": "xxxx",
			"SaleID": "xxx",
			"POIID": "xxx"
		},
		"AbortReason": "xxx"
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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

<details><summary>Abort transaction response </summary>
<p>

```json
{
	"EventNotification": {
		"TimeStamp": "xxx",
		"EventToNotify": "xxx",
		"EventDetails": "xxx"
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
 [TimeStamp](/docs/api-reference/data-model#timestamp)                      | ✔ | String | Time of the event on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)
 [EventToNotify](/docs/api-reference/data-model#eventtonotify)              | ✔ | String | "Reject" if the abort request cannot be accepted (e.g. message format error, `ServiceId` not found). "CompletedMessage" if payment has already completed.
 [EventDetails](/docs/api-reference/data-model#eventdetails)                | ✔ | String | Extra detail on the reason for the event


### Reconciliation

#### Reconciliation request

<details><summary>Reconciliation request</summary>
<p>

```json
{
	"ReconciliationRequest": {
		"ReconciliationType": "xxx",
		"POIReconciliationID": "xxx"
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
-----------------                             |:----:| ------ | ----------- |
[ReconciliationType](#reconciliationtype)     | ✔ | String | "SaleReconciliation" to close the current period, "PreviousReconciliation" to request the result of a previous reconciliation
[POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)   |   | String | Present if ReconciliationType is "PreviousReconciliation". See [POIReconciliationID](/docs/api-reference/data-model#poireconciliationid)


#### Reconciliation response

<details><summary>Reconciliation response</summary>
<p>

```json
{
	"ReconciliationResponse": {
		"Response": {
			"Result": "xxx",
			"ErrorCondition": "xxx",
			"AdditionalResponse": "xxx"
		},
		"ReconciliationType": "xxx",
		"POIReconciliationID": "xxx",
		"TransactionTotals": [
			{
				"PaymentInstrumentType": "xxx",
				"CardBrand": "xxx",
				"OperatorID": "xxx",
				"ShiftNumber": "xxx",
				"TotalsGroupID": "xxx",
				"PaymentCurrency": "AUD",
				"PaymentTotals": [
					{
						"TransactionType": "xxx",
						"TransactionCount": "xxx",
						"TransactionAmount": "0.00",
						"TipAmount": "0.00",
						"SurchargeAmount": "0.00"
					}
				]
			}
		]
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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

<details><summary>Card acquisition request</summary>
<p>

```json
{
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
				"SaleCapabilities": [
					"xxx",
					"xxx",
					"xxx"
				]
			},
			"TokenRequestedType": "Customer"
		},
		"CardAcquisitionTransaction": {
			"AllowedPaymentBrand": [
				"xxx",
				"xxx",
				"xxx"
			],
			"ForceEntryMode": "xxx"
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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
  [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)|  | Array  | Restricts the request to specified card brands. See [AllowedPaymentBrands](/docs/api-reference/data-model#allowedpaymentbrands)
  [ForceEntryMode](/docs/api-reference/data-model#forceentrymode)           |  | String| If present, restricts card presentment to the specified type. See [ForceEntryMode](/docs/api-reference/data-model#forceentrymode)

#### Card acquisition response

<details><summary>Card acquisition response</summary>
<p>

```json
{
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
			}
		},
		"POIData": {
			"POITransactionID": {
				"TransactionID": "xxx",
				"TimeStamp": "xxx"
			}
		},
		"PaymentInstrumentData": {
			"PaymentInstrumentType": "xxx",
			"CardData": {
				"MaskedPAN": "xxxxxx......xxxx",
				"EntryMode": "xxx"
			},
			"PaymentToken": {
				"TokenRequestedType": "xxx",
				"TokenValue": "xxx",
				"ExpiryDateTime": "xxx"
			}
		}
	}
}
```
</p>
</details>

Attribute      |Requ.| Format  | Description |
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



## Properties

### Account

Indicates a card account. Note that the list of available account names may change over time. 

- Credit 
- Cheque 
- Savings
- Default

### AdditionalProductInfo

Additional information related to the product item

### AdditionalResponse

Provides extended response detail in the event of an error which may be used for analysis or diagnostics.  

:::tip
Error conditions may be added over time. To ensure forwards compatibility any error handling in the 
Sale System should allow for a "catch all" which handles currently undefined error conditions.
:::

The possible `AdditionalResponse` values are based on the value of [ErrorCondition](#errorcondition)

When `ErrorCondition` is "MessageFormat"

- "Mandatory Data Element or Structure Absent: <Absolute Data Name\>"
- "Unexpected Data Element Value: <Absolute Data Name\> - <Expected Value(s) or Reason\>"
- "<Absolute Data Name\> Invalid Value <Value\> for the Type <Type\> [and Format <Format\>]"
- "<Absolute Data Name\> Value is not part of the Enumerated or Cluster Type <Type\>" 
- "Repeated Message: <ID Name\> - <Value\>"
- "Empty Cluster: <Absolute Data Name\>"
- "Unacceptable Value Combination: [ <Absolute Data Name\> : <Value\> ]*"

When `ErrorCondition` is "DeviceOut"

- "POI is Temporary Unavailable: <Reason\>"
- "POI is Permanently Unavailable: <Reason\>"
- "Security Alarm: <Alarm\>"
  - Alarm = The type of alarm. e.g. "crypto key unknown"


When `ErrorCondition` is "LoggedOut"

- "<SaleID\> Never Login Since Last <Event\> at <Time\>"

When `ErrorCondition` is "Busy"

- "POI <Component\> Temporary Unavailable: <Reason\>"
  - Component = "System" or "Terminal"
  - Reason = "Installation in progress", "Maintenance in progress", "Device busy"

- "POI Terminal Busy to Process another Request: <Request\>"
  - Request = 'PaymentRequest', 'LoginRequest'

When `ErrorCondition` is "UnavailableService"

- "Sale Protocol Version <Version\> Too Old. Version Implemented: <Version\>"

When `ErrorCondition` is "Cancel"

- "User Cancellation during <Status\>"
- "System Cancellation during <Status\>"

When `ErrorCondition` is "Abort"

- "Service Aborted during <Status\> - Reason: <AbortReason\> - from: <SaleID\> - MessageID: <ServiceID\>"

When `ErrorCondition` is "InvalidCard"

- "No Card Entered after <Time\> Seconds".
- "Invalid Card <Reason\>"
  - Reason = "Card Expired", "Card not allowed", "Suspicion of fraud", etc.
- "Unknown Card <BIN:val or AID:val\>


When `ErrorCondition` is "WrongPIN"

- "Wrong PIN <RetryNumber\> Retries - Remaining <RemainingRetries\>
  - Retries and RemainingRetries only if available.

When `ErrorCondition` is "UnreachableHost"

- "Host Unreachable: <Reason\>"
- "No Host Answer: <Reason\>"

When `ErrorCondition` is "Refusal"

- "Payment Refused by Acquirer: <Acquirer\> Reason: <Reason\> Code: <Code\>"
- "Payment Refused Locally - Reason: <Reason\>"

When `ErrorCondition` is "PaymentRestriction"

- "Restricted items"


### Algorithm

Defines the key algorithm. 

Set to "des-ede3-cbc"

The data encryption session key = [EncryptedKey](#encryptedkey) is 3DES CBC encrypted by an agreed KEK 3DES key which should be unique per Sale Terminal or Sale System (To be agreed).

### AllowedPaymentBrands

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

### ApplicationName

The name of the Sale System application.

DataMesh will provide a `ApplicationName` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `ApplicationName` to be included in the production build of the Sale System. 

### AuthorizedAmount

A value which indicates the total authorized amount, inclusive of all fees and charges. 

### CardBrand

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

### CashBackAmount

The amount of cash to be handed back to the customer from their account.

### Categories

`Categories` is a string array which represents the categories of a `SaleItem`

The main category is at the zero element.

For example: 

Example                         | Array
--------------------            | ----------------- 
SaleItem with a single category | `{ "categories": [ "Shirts" ] }`
SaleItem with a main and sub category | `{ "categories": [ "Food", "Mains" ] }`
SaleItem with multiple categories | `{ "categories": [ "Computers", "Accessories", "Keyboards" ] }`

### CertificationCode

Certification code for this Sale System.

DataMesh will provide a `CertificationCode` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `CertificationCode` to be included in the production build of the Sale System. 

### CustomFields
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

| <div style={{width:'180px'}}>Field Name</div> | Type | Description |
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


### DateTime

Current Sale System time, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. This will be included in receipts. e.g. "2019-09-02T09:13:51.0+01:00" 


### EanUpc

a standard unique identifier for the product. Either the UPC, EAN, or ISBN. Required for products with a UPC, EAN, or ISBN


### EncryptedData

Encryption of content = "SensitiveCardData":{…} in canonical form (i.e. without white space). 

Prior to encryption, pad the content with 80h then as many 00h bytes so that the result is a multiple of 8 bytes. 

Encrypt the result. 

Present as a string in hex.

### EncryptedKey

A double length 3DES key (i.e. 16 bytes) that is a unique Data Encryption Key which must be changed every time new sensitive data is sent and is encrypted by the KEK using the [Algorithm](#algorithm).

The key value is represented in hex (32 hex digits). For example: "F8131F320E499A1474A15B14F42F3E06".

### EntryMode

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

### ErrorCondition 

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

### EventToNotify

* **Reject** - the request cannot be accepted. For example, message format error, mandatory fields missing, or payment/reversal transaction not found.
* **CompletedMessage** - if the Payment/Reversal has already been completed.

### EventDetails

When `EventToNotify` is "Reject"

- "Message not Found, last <MessageCategory\> has ID <ServiceID\>"
- "Mandatory Data Element or Structure Absent: <Absolute Data Name\>"
- "General Parsing Error: <Absolute Data Name\>"
- "Unexpected Data Element or Structure: <Absolute Data Element\>"
- "Unexpected Data Element Value: <Absolute Data Element\> - <Expected value(s) or reason\>"
- "Repeated Message: ServiceID - <Value\>"

When `EventToNotify` is "CompletedMessage"

- "Service Not Aborted - Reason: Completed – from: <SaleID\> - MessageID: <ServiceID\>"


### ForceEntryMode

Used to restrict card presentment to the specified type

**Keyed** - A Card Not Present transaction.
**Manual** - to enter manually into the POI terminal.
**Scanned** - for QR Code scanned by the POI terminal.
**MagStripe** - for card swipes.
**ICC** - for card insertions.
**Tapped** - if card taps.
**Mobile** - if a mobile phone is used to finalise the payment. For example, a mobile phone scanning a QR Code.


### ForceOnlineFlag

Boolean.

If 'true' the transaction will only be processed in online mode, and will fail if there is no response from the Acquirer.

### InfoQualify

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

### InputCommand

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


### ItemAmount

Total amount of the item

### ItemID

A unique identifier for the sale item within the context of this purchase. e.g. a 0..n integer which increments by one for each sale item.


### KeyIdentifier

Indicates the key type. Available values: 

- "SpecV2TestDATKey" for test environment
- "SpecV2ProdDATKey" for production environment

### KeyVersion

Contains either a counter or the creation date/time of the key formatted as "YYYYMMDDHHmmss.mmm" where:

- YYYY is the 4-digit year
- MM is the 2-digit month.
- DD is the 2-digit day.
- HH is the 2-digit hour from 00 to 23.
- mm is the 2-digit minute.
- ss is the 2-digit second.
- mmm is the 3-digit millisecond.

Any new value must be > any previous value sent


### MAC

The last 8 bytes in hex (i.e. 16 hex digits) from:

1. Concatenating the preceding data in canonical form (i.e. without white spaces and line feeds in key:value form: `"MessageHeader":{...},"LoginRequest":{...})`
1. Hashing the result using SHA256. The result of the SHA256 hash is 32 bytes.
1. Append 80h 00h 00h 00h 00h 00h 00h 00h to the hash. The result has 40 bytes.
1. 3DES CBC encrypt the result by the session Message Authentication Key.


### MaintenanceAllowed

Optional. If not present, it default to true.

* If set to true, it indicates that the POI Terminal may go into maintenance mode. For example, the POI Terminal can be upgraded.
* This does not restrict the POI Terminal but is treated as an advise. The POI Terminal may present a warning for example if set to false.

### MaskedPAN

First six digits of the PAN followed by dots followed by the last 4 digits of the PAN.

The total length of the string = PAN Length.

### MerchantCategoryCode

If present, overrides the MCC used for processing the transaction if allowed. Refer to ISO 18245 for available codes.


### MessageClass
 
Informs the receiver of the class of message. Available values: 

* **Service** - A transaction message pair initiated by the Sale System, and requested to the POI System
* **Device** - A device message pair
* **Event** - An unsolicited event notification by the POI System to the Sale System.

### MessageCategory

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


### MessageType

Type of message of the Sale to POI protocol. Available values: 

* Request
* Response
* Notification


### OperatorId

An optional value sent in the [Login Request](/docs/api-reference/fusion-cloud#login) for information only. Used to identify the cashier using the Sale Terminal during the session.

If present, totals in the [ReconciliationResponse](/docs/api-reference/fusion-cloud#reconciliation) will be grouped by this value. If not present, payment transactions that do not specify a `OperatorId` will not be grouped under a `OperatorId`.

Note that different cashiers may still transact during the same login session by setting an `OperatorId` per payment. 

### OriginalPOITransaction

An object which identifies a previous POI transaction. 

For a purchase, it instructs the POI System to use the payment card details from the original transaction if available. Note that the `RequestedAmount` must be <= the original transaction `RequestedAmount`.

For a refund or completion, indicates which original transaction this should be matched to. A refund or completion may occur on a different Sale System and POI Terminal to the original transaction.


### OutputFormat

Receipt format output. Always "XHTML"
  
### OutputXHTML  
  
The payment receipt in XHTML format, coded in BASE64.


### PaymentAcquirerData.AcquirerID

The ID of the acquirer which processed the transaction

Label                | Description       
-------------------- | ----------------- 
"560251"             | NAB

<!--
"560279"             | CBA
"560254"             | ANZ
"560192"             | Westpac
-->


### PaymentBrand

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

### PaymentCurrency

Three digit currency code as defined by [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)


### PaymentTransaction.TransactionConditions.AcquirerID

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

### PaymentType

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

### POIID 

Uniquely identifies the POI Terminal. This value is provided by DataMesh.

For Sale Systems that do not need a POI Terminal, the value must be "POI Server"


### POIReconciliationID

Identification of the reconciliation period between Sale and POI, to provide the transaction totals during this period.

Allows counting of transactions by both parties in the Sale to POI reconciliation.

Returned in a [payment response](/docs/api-reference/fusion-cloud#payment-response) if [result](#result) "Success" or "Partial".

In the Reconciliation request, when [ReconciliationType](#reconciliationtype) is "PreviousReconciliation", this field allows to request the reconciliation result of a previous period of transaction.


### POISerialNumber

This last POISerialNumber returned in an earlier login response. If this is the first login from the Sale System, this field is absent.


### POITransactionID

Unique identification of a POI transaction for a [POIID](#poiid). 

Contains the following fields: 

Attribute |Requ.| Format | Description |
-----------------                        |:----:| ------ | ----------- |
[TransactionID](#transactionid)          | ✔ | String | A unique transaction id from the POI system
[TimeStamp](#timestamp)                  | ✔ | String | Time on the POI system, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)


### ProductCode

a unique identifier for the product within the merchant. For example if two card holders purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.


### ProtocolVersion

Version of the Sale to POI protocol specifications. Set to "3.1-dmg" for the API outlined in this specification.

Label                | Description       
-------------------- | ----------------- 
"3.1"                | Nexo 3.1 compliant 
"3.1-dmg"            | Nexo 3.1 with additional fields added by DataMesh which are outside the Nexo standard (e.g. surcharge)


### ProviderIdentification

The name of the company supplying the Sale System. 

DataMesh will provide a `ProviderIdentification` to be used for the UAT environment. Once the Sale System is certified, DataMesh will provide a `ProviderIdentification` to be included in the production build of the Sale System. 


### PaymentInstrumentData


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
-----------------                          | :------: | ------ | ----------- |
[PaymentInstrumentType](#paymentinstrumenttype)|  | String | Defaults to "Card". Indicates the card source for the payment. See [PaymentInstrumentType](#paymentinstrumenttype)
**CardData**                               |  | Object | 
 [EntryMode](#entrymode)                   |  | String | Only present if `PaymentInstrumentType` is "Card". "File" if a Payment Token is used, and "Keyed" for a Card Not Present transaction. 
 **ProtectedCardData**                     |  | Object | Only present if `EntryMode` is "Keyed"
  [ContentType](#contenttype)              | ✔ | String | Set to "id-envelopedData"
  **EnvelopedData**                        | ✔ | Object |  
   [Version](#version)                     | ✔ | String | Set to "v0"
    **Recipient**                          | ✔ | Object | 
     **KEK**                               | ✔ | Object | 
      [Version](#version)                  | ✔ | String | Set to "v4"
      **KEKIdentifier**                    | ✔ | Object |
       [KeyIdentifier](#keyidentifier)     | ✔ | String | "SpecV2TestDATKey" for test environment, and "SpecV2ProdDATKey" for production
       [KeyVersion](#keyversion)           | ✔ | String | An incrementing value. Either a counter or date formatted as YYYYMMDDHHmmss.mmm. See [KeyVersion](#keyversion)
      **KeyEncryptionAlgorithm**           | ✔ | Object | 
       [Algorithm](#algorithm)             | ✔ | String | Set to "des-ede3-cbc". 
      [EncryptedKey](#encryptedkey)        | ✔ | String | A double length 3DES key. See [EncryptedKey](#encryptedkey)
    **EncryptedContent**                   | ✔ | Object | 
     ContentType                           | ✔ | String | Set to "id-data"
     **ContentEncryptionAlgorithm**        | ✔ | Object | 
      Algorithm                            | ✔ | String | Set to "des-ede3-cbc"
      **Parameter**                        | ✔ | Object | 
      InitialisationVector                 | ✔ | String | An Initial Vector to use for the des-ede3-cbc encryption of the content = SensitiveCardData
     [EncryptedData](#encrypteddata)       | ✔ | String | Encrypted data. See [EncryptedData](#encrypteddata)
 **PaymentToken**                          | ✔ | Object | Only present if [EntryMode](#entrymode) is "File". Object with identifies the payment token. 
  [TokenRequestedType](#tokenrequestedtype)| ✔ | String | "Transaction" or "Customer". Must match the type of token recorded in the POI System.
  [TokenValue](#tokenvalue)                | ✔ | String | Token previously returned from the POI System in the payment, or card acquisition response 

:::caution
Never send the SensitiveCardData object in the clear. This represents the content to be encrypted and sent within the `ProtectedCardData` element
:::

**SensitiveCardData**

Attribute | Requ.  | Format | Description |
-----------------                        | :------: | ------ | ----------- |
[PAN](#pan)                              | ✔ | String | The full credit card number
[ExpiryDate](#expirydate)                | ✔ | String | The expiry date in "MMYY" format
[CCV](#ccv)                              |  | String | The 3 or 4 digit security code associated with the card 



### PaymentInstrumentType

Indicates the card source for the payment. If not present in the payment defaults to "Card". Available values:

- "Card" where the card source is defined by `EntryMode` and present in either `SensitiveCardData` or `PaymentToken`. If neither are present, then payment (card or mobile) is only accepted by the POI Terminal
- "Check" where the transaction is simply recorded
- "Cash" where the transaction is either recorded, or processed if the POI terminal has cash handling capabilities
- "Mobile" to restrict payment to Mobile only. For example, QR Code payment

### PaymentToken

An object representing a payment token. Consists of three fields: 

Attribute | Requ.  | Format | Description |
-----------------                        | :------: | ------ | ----------- |
[TokenRequestedType](#tokenrequestedtype)| ✔ | String | Mirrored from the request
[TokenValue](#tokenvalue)                | ✔ | String | The value of the token
[ExpiryDateTime](#expirydatetime)        | ✔ | String | Expiry of the token, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)


### ProductLabel

Product name of a [SaleItem](#saleitem).

The `ProductLabel` should contain a short, human readable, descriptive name of the product. 

For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 


### Quantity

Item unit quantity

### RequestedAmount

Total amount requested for authorization - (including any cash back amount and tip amount).

### ResponseRequiredFlag

Boolean. 

True if the Sale System needs to respond to this `DisplayRequest` with a `DisplayResponse`. 

False if the Sale System does not need to send a `DisplayResponse`.


### Result

Indicates the result of the response. Available values: 

Label                | Description       
-------------------- | ----------------- 
Success              | Processing OK. Information related to the result of the processing is contained in other parts of the response message.
Failure              | Processing of the request fails for various reasons. Some further processing according to the type of requested service, the context of the process, and some additional precision about the failure notified in the ErrorCondition data element.
Partial              | The transaction has been processed successfully, but the success is not complete (e.g. only a partial amount is available for the payment, the format to be displayed is not supported and was replaced by a default format).


### ReversalReason

Reason for reversing a successful payment. 

Available values:

- "CustCancel"
- "MerchantCancel"
- "Malfunction"
- "Unable2Compl",
- "SignatureDeclined",
- "Unknown"

### SaleCapabilities

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

### SaleID

Uniquely identifies the Sale System. This value is provided by DataMesh.


### SaleItem 

The `SaleItem` array defines the basket attached to this transaction. Each item is an object which defines a group of similar products in the basket.

The sum of the sale items could be more than <code>RequestedAmount</code> in case of split payment without split of the items (split basket).

:::tip
Please contact the DataMesh integrations team at <a href="mailto:integrations@datameshgroup.com">integrations@datameshgroup.com</a> to discuss how to map the Sale System basket to the SaleItem array.
:::

##### SaleItem fields

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
-----------------                          | :------: | ------ | ----------- |
[ItemID](#itemid)                          | ✔ | Integer | A unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
[ProductCode](#productcode)                | ✔ | String | A unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
[EanUpc](#eanupc)                          |  | String | A standard unique identifier for the product. Either the UPC, EAN, or ISBN. Required for products with a UPC, EAN, or ISBN
[UnitOfMeasure](#unitofmeasure)            | ✔ | String | Unit of measure of the `Quantity`. If this item has no unit of measure, set to "Other"
[Quantity](#quantity)                      | ✔ | Decimal| Sale item quantity based on `UnitOfMeasure`.
[UnitPrice](#unitprice)                    | ✔ | Decimal| Price per sale item unit. Present if `Quantity` is included.
[ItemAmount](#itemamount)                  | ✔ | Decimal| Total amount of the sale item
[TaxCode](#taxcode)                        |  | String | Type of tax associated with the sale item. Default = "GST"
[SaleChannel](#salechannel)                |  | String | Commercial or distribution channel of the sale item. Default = "Unknown"
[ProductLabel](#productlabel)              | ✔ | String | a short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
[AdditionalProductInfo](#additionalproductinfo)|  | String | Additional information, or more detailed description of the product item. 
[ParentItemID](#parentitemid)                              |  | Integer | *Required* if this item is a 'modifier' or sub-item. Contains the [ItemID](#itemid) of the parent `SaleItem`
[CostBase](#costbase)                                      |  | Decimal| Cost of the product to the merchant per unit
[Discount](#discount)                                      |  | Decimal| If applied, the amount this sale item was discounted by
[DiscountReason](#discount-reason)                         |  | String | Explains about the discount applied
[Categories](#categories)                  |  | Array  | Array of categories. Top level "main" category at categories[0]. See [Categories](#categories) for more information.
[Brand](#brand)                                            |  | String | Brand name - typically visible on the product packaging or label
[QuantityInStock](#quantityinstock)        |  | Decimal| Remaining number of this item in stock in same unit of measure as `Quantity`
[Tags](#sale-item-tags)                                    |  | Array  | String array with descriptive tags for the product
[Restricted](#restricted)                                  |  | Boolean| `true` if this is a restricted item, `false` otherwise. Defaults to `false` when field is null.
[PageURL](#productpageurl)                                 |  | String | URL link to the sale items product page
[ImageURLs](#productimageurls)                             |  | Array | String array of images URLs for this sale item
[Style](#style)                                            |  | String | Style of the sale item
[Size](#size)                                            |  | String | Size of the sale item
[Colour](#colour)                                          |  | String | Colour of the sale item
[Weight](#weight)                                          |  | Decimal | Sale item weight, based on `WeightUnitOfMeasure`
[WeightUnitOfMeasure](#unitofmeasure)      |  | String | Unit of measure of the `Weight`. 
[CustomFields](#customfields)              |  | Array  | Array of key/type/value objects containing additional information which may be used for sale processing

##### Sale items with a UPC/EAN/ISBN

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

* Items which have a UPC/EAN/ISBN must include the UPC/EAN/ISBN in the [EanUpc](#eanupc) field. 
* Both [ProductCode](#productcode) and [EanUpc](#eanupc) should be populated, even if they are the same value
* Other standard mandatory fields in sale item are still mandatory.

##### Sale items with modifiers 

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


Some sale Sale Systems do not record modifiers as individual items. For example, they are stored in a 'notes' or 'cooking instructions' field. In this case the additional notes should be included in the [AdditionalProductInfo](#additionalproductinfo) field. 


##### Item bundles

A Sale System may sell items which are bundled together. 

Examples of item "bundles":

* a "lunch special", containing a main, a dessert, and a drink
* a "Valentines day" bundle, containing flowers, and chocolates 
* a "mixed wine case", containing a selection of different wines 
* a "burger meal", containing burger, chips and a drink

The Sale System should populate the `SaleItem` array based on how the "bundle" is represented in the basket. 

If the "bundle" is represented as a unique product with a title and a price, include the "bundle" product as a `SaleItem`. Contents of the bundle can then be included either as "modifiers" associated with the bundle, or as a text description in the [AdditionalProductInfo](#additionalproductinfo) field. 

If the "bundle" is a shortcut in the Sale System which has no value associated and is simply used to add multiple products to the basket, include each product as a `SaleItem`.

Any `SaleItem` discounts associated with the "item bundle" should be included in the `Discount` field.


##### Discounts 

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
  
##### Refunds 

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

### SaleChannel

Commercial or distribution channel of the item. Default = "Unknown"

### SaleReferenceID

Mandatory for pre-authorisation and completion, otherwise optional.

A globally unique value, used to link a related series of transactions. 

For example, a pre-authorisation, followed by a pre-authorisation top-up, and then a completion all require the same `SaleReferenceID` in the request.

The Sale System must ensure the `SaleReferenceID` is unique across all [SaleID](#saleid)'s and [POIID](#poiid)'s across the merchant. If Sale Systems are not synchronised, it is recommended that this value should be a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) to ensure uniqueness.


### SaleTransactionID

Identification of a transaction for a given [SaleId](#saleid). 

Contains the following fields: 

Attribute |Requ.| Format | Description |
-----------------                        |:----:| ------ | ----------- |
[TransactionID](#transactionid)            | ✔ | String | Unique reference for this sale ticket. Not necessarily unique per payment request; for example a sale with split payments will have a number of payments with the same [TransactionID](#transactionid)
[TimeStamp](#timestamp)                    | ✔ | String | Time of initiating the payment request on the POI System, formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) DateTime. e.g. "2019-09-02T09:13:51.0+01:00"   



### ShiftNumber

An optional value sent in the [Login Request](/docs/api-reference/fusion-cloud#login) for information only. Used to identify the shift that drives the Sale Terminal during the session.

If present, totals in the [ReconciliationResponse](/docs/api-reference/fusion-cloud#reconciliation) will be grouped by this value. If not present, payment transactions that do not specify a `ShiftNumber` will not be grouped under a `ShiftNumber`.

Note that different shifts may still occur during the same login session by setting a `ShiftNumber` per payment. 


### ServiceID

The `ServiceID` is a text string between 1 and 10 characters long, which must uniquely identify a transaction between a Sale System and a POI Terminal over a short time period (e.g. one day). 

The `ServiceID` of the message response is mirrored from the `ServiceID` in the message request. This allows for duplicate message checks. 

The POI System will validate that the `ServiceID` is different from the previous request. The Sale System should validate that the `ServiceID` in the response matches the `ServiceID` sent in the request.

The `ServiceID` is used to identify a transaction to retrieve in a [transaction status](/docs/api-reference/fusion-cloud#transaction-status) request. 

### SoftwareVersion

The software version of the Sale System.

Must be the software version of the current Sale System build. 

### SplitPaymentFlag

Indicates if a payment is a split payment. Default to false. 

### SurchargeAmount

The amount of any surcharge added to the transaction

### TaxCode

Type of tax associated with the item. Default = "GST"


### TotalsGroupId

Groups transactions in a login session. 

This can be used for reconciliation purposes and may span a single day or different periods.

If not present, payment transactions will remain ungrouped. 

### TransactionType

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



### TerminalEnvironment

Available values:

* **Attended** - a cashier interface is present
* **SemiAttended** - a cashier is present but not interfaced
* **Unattended** - no cashier is present


### TimeStamp

Date and time of a transaction for the Sale System, the POI System or the Acquirer. 

Formatted as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601). e.g. "2019-09-02T09:13:51.0+01:00"

Used to ensure the uniqueness of a transaction for Sale System, the POI System or the Acquirer, or indicates the time when the event occurs in the `EventNotification` message.


### TipAmount

The Tip amount included in the transaction. POI Terminal behaviour depending on the TipAmount:

TipAmount		| FusionCloud												 | FusionSatellite 
----------------------- | ------------------------------------------------------------------------------------------------------ | ------------------
Null			| No Tip Entry screen											 | Will prompt for Tip Entry screen	
Blank			| Will prompt for Tip Entry screen									 | Value not allowed
0 or 0.00		| Will prompt for Tip Entry screen									 | No Tip Entry screen
greater than 0		| Will include TipAmount in sale, will prompt for Tip Entry screen with the requested tipAmount	value	 | Will include TipAmount in sale, will prompt for Tip Entry screen with the requested tipAmount value

:::tip
For `FusionCloud` TippingMode should be enable on the POI Terminal setting
For `FusionSatellite` FeatureTipEnabled should be turned on on the POI Terminal setting
 
Please contact the DataMesh integrations team at integrations@datameshgroup.com to set this up for you
:::

### TokenRequestedType

The `TokenRequestedType` is an optional field per transaction. Indicates if a token should be created for this sale, and if so which type of token. 

* If not present no token is created
* If set to "Transaction" a token is created which is only valid for the transaction. For example to process a subsequent Refund or Void/Reversal.
* If set to "Customer" a token is created which represents the PAN, and can be used to represent the card holder for a longer period.

:::caution
If a `Payment` is requested using a PaymentToken of the same TokenRequestedType and this JSON element is present, the existing Token is replaced. This can affect other Sale Terminals, so use with caution.
:::


### TransactionID

String.

Used to identify a transaction on the Sale System or POI System.


### UnitOfMeasure

Unit of measure of the [Quantity](#quantity)

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

### UnitPrice

Price per item unit
