---
sidebar_position: 4
---

# Fusion Fuel API

The Fusion Fuel API is an extension to the Fusion Core API which adds support for current and future fuel payment types accepted by DataMesh. (e.g. FleetCard, Shell Card, MotorPass etc)

## Mandatory features 

The table below provides an overview of the mandatory integration requirements for the Fusion Fuel API which are required for your selected integration type.

Feature                                   						| Fusion App |  Fusion Satellite | Fusion Cloud |
-----------------                         						|   :----:   |      :------:     |   :------:   |
Purchase                                  						| ✔          | ✔                 | ✔            |  
Refund                                    						| ✔          | ✔                 | ✔            |
Cashout (not supported on fuel cards)     						|            |                   |              |
[Fuel SaleItem](/docs/api-reference/fusion-fuel-api#saleitem) fields | ✔          | ✔                 | ✔
[Dynamic surcharge](/docs/getting-started#dynamic-surcharge)	| ✔          | ✔                 | ✔            |
[Split-payment](/docs/getting-started#split-payments) 			| ✔          | ✔                 | ✔            |
[Matched refund](/docs/getting-started#matched-refund) 			| ✔          | ✔                 | ✔            |
[QR code pairing](/docs/getting-started#qr-code-pairing)								|            |                   | ✔            |
[Display request handling](/docs/api-reference/fusion-cloud#display)	|            |                   | ✔            |
[Input request handling](/docs/api-reference/fusion-cloud#input)		|            |                   | ✔            |
[Print request handling](/docs/api-reference/fusion-cloud#print)		|            |                   | ✔            |

## SaleItem

:::info
A payment through the Fusion Fuel API expands the mandatory fields for a `SaleItem`.
:::

For every payment, the Sale System must populate the [SaleItem](/docs/api-reference/data-model#saleitem) with:
* For **every** item, the FuelProductCode fields within CustomFields
* For fuel sale items only, the `UnitOfMeasure`, `Quantity`, `UnitPrice`, and `ItemAmount` representing the number of litres, price per litre, and total fuel price

Fuel sale item details:

Attribute   | Requ.  | Format | Description |
-----------------                          | :------: | ------ | ----------- |
[ItemID](/docs/api-reference/data-model#itemid)                          | ✔ | [Integer(0,9999)](/docs/api-reference/data-model#data-format) | A unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
[ProductCode](/docs/api-reference/data-model#productcode)                | ✔ | [String(0,128)](/docs/api-reference/data-model#data-format)  | A unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
[UnitOfMeasure](/docs/api-reference/data-model#unitofmeasure)            | ✔ | [Enum](/docs/api-reference/data-model#data-format)  | Unit of measure of the `Quantity`. Set to "Litre"
[Quantity](/docs/api-reference/data-model#quantity)                      | ✔ | [Decimal(0,999999,8)](/docs/api-reference/data-model#data-format) | Number of litres as read from the pump (decimal, maximum precision 6.8)
[UnitPrice](/docs/api-reference/data-model#unitprice)                    | ✔ | [Currency(0.01,999999.99)](/docs/api-reference/data-model#data-format) | Price per litre from the pump (decimal, maximum precision 6.8)
[ItemAmount](/docs/api-reference/data-model#itemamount)                  | ✔ | [Currency(0.01,999999.99)](/docs/api-reference/data-model#data-format) | The amount of the fuel as presented to the cardholder (decimal 6.2 rounded to the nearest cent). This must equal Quantity * UnitPrice rounded up, or to the nearest cent.
[ProductLabel](/docs/api-reference/data-model#productlabel)              | ✔ | [String(0,1024)](/docs/api-reference/data-model#data-format)  | A short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
[Categories](/docs/api-reference/data-model#categories)                  |    | [Array(String)](/docs/api-reference/data-model#data-format)   | Array of categories. Top level "main" category at categories[0]. See [Categories](/docs/api-reference/data-model#categories) for more information.
[Tags](/docs/api-reference/data-model#sale-item-tags)                    |    | [Array(String)](/docs/api-reference/data-model#data-format)   | String array with descriptive tags for the product
[CustomFields](/docs/api-reference/data-model#customfields)              | ✔ | [Array(Object)](/docs/api-reference/data-model#data-format)   | Array of key/type/value objects which define the EFT code for the item.


### CustomFields

The Sale System must populate the [CustomFields](/docs/api-reference/data-model#customfields) array with a fuel "eft/product" code for the supported card types.

Supported CustomFields product codes: 

Product code                    | Fuel card              |
------------------------------- | ------                 |
FuelProductCode                 | Generic / BP           |
FuelProductCodeShellCard        | Shell Card             |
FuelProductCodeCaltexStarCard   | Caltex StarCard        |
FuelProductCodeFleetCard        | Fleet Card             | 
FuelProductCodeMotorpass        | Motorpass              |
FuelProductCodeUnitedFuelCard   | United Fuel Card       |
FuelProductCodeAmpolCard        | Ampol Card             |
FuelProductCodeTrinityFuelCard  | Trinity Fuel Card      |
FuelProductCodeFreedomFuelCard  | Freedom Fuel Card      |
FuelProductCodeLibertyCard      | Liberty Card           |


<!--

<details>
<summary>
FuelProductCode codes
</summary>

Code | Description              |
---- | ------------------------ |
1    | Tobacco
2    | Lottery
3    | Premium ULP
4    | Auto Gas
5    | Unleaded
6    | AdBlue Packaged
7    | Oils
8    | Services
9    | Parts
10   | Tyres
11   | Battery
12   | Repairs and Maintenance
13   | Shop
14   | Car Wash
15   | Accident and Damage
16   | Diner
17   | Diesel G50
18   | Premium Ethnl
19   | ULP Ethnl
20   | Opal
21   | Bottle
22   | No GST
23   | Coffee
24   | Ultimate
25   | Diesel 5
26   | AdBlue Pump
27   | Weigh Bridge
28   | N/A
29   | 10 Diesel
30   | ULT Diesel
99   | Cashout
</details>


<details>
<summary>
FuelProductCodeShellCard codes
</summary>

Code | Description              |
---- | ------------------------ |
1    | UNLEADED E10
2    | UNLEADED PETROL
4    | DIESEL
5    | GOGAS
6    | AdBlue
8    | PREMIUM UNLEADED 98
9    | UNLEADED 95
10   | PREMIUM DIESEL
11   | CAR PARTS
12   | CAR SERVICE LABOUR
13   | AUTO CARE OILS
14   | FRANCHISED CAR SERVICE
17   | CAR TYRES
18   | CAR BATTERIES
19   | CAR SERVICE OPP
20   | CAR SERVICE OTHER
31   | CAR WASH & DETAIL
40   | GST-FREE PRODUCTS
42   | CAR ACCESSORIES
43   | CAR CARE
45   | TOBACCO
46   | CONFECTIONERY
47   | DAIRY & DELI
48   | DRINKS
49   | TAKE AWAY FOOD
50   | GROCERIES
52   | ICE PRODUCTS
54   | NEWSAGENCY
55   | AUTO OILS
56   | RENTALS & DEPOSITS
57   | TRAVEL & LEISURE
59   | HARDWARE
60   | LP GAS BOTTLES
65   | SERVICES
66   | KEROSENE
67   | PREMIX
71   | BAKERY

</details>


<details>
<summary>
FuelProductCodeFleetCard codes
</summary>

Code | Description              |
---- | ------------------------ |
1    | Tobacco
2    | Lottery
3    | Premium ULP
4    | Auto Gas
5    | Unleaded
6    | AdBlue Packaged
7    | Oils
8    | Services
9    | Parts
10   | Tyres
11   | Battery
12   | Repairs and Maintenance
13   | Shop
14   | Car Wash
15   | Accident and Damage
16   | Diner
17   | Diesel G50
18   | Premium Ethnl
19   | ULP Ethnl
20   | Opal
21   | Bottle
22   | No GST
23   | Coffee
24   | Ultimate
25   | Diesel 5
26   | AdBlue Pump
27   | Weigh Bridge
28   | N/A
29   | 10 Diesel
30   | ULT Diesel
99   | Cashout
</details>

-->

<details>
<summary>
Example fuel API sale item
</summary>

<p>
```json
{ 
  "SaleItem": [
  {
    "ItemID": 0,
	"ProductCode": "ABX123",
	"UnitOfMeasure": "Litre",
	"Quantity": 42.252,
	"UnitPrice": 2.15,
	"ItemAmount": 90.84,
	"ProductLabel": "Premium ULP",
	"Categories": ["Fuel"],
    "CustomFields": [
      {
        "Key": "FuelProductCode", 
	    "Type": "String",
        "Value": "21"
      },
      {
        "Key": "FuelProductCodeShellCard",
	    "Type": "String",
        "Value": "35"
      },
      {
        "Key": "FuelProductCodeFleetCard",
	    "Type": "String",
        "Value": "21"
      },
      {
        "Key": "FuelProductCodeMotorpass",
	    "Type": "String",
        "Value": "4"
      }	  
    ]
  }
}
```
</p>
</details>




## Purchase 

To perform a fuel purchase:

* Construct a purchase request based on the Sale System integration type:
  * Fusion App - [perform a purchase](/docs/api-reference/fusion-app#perform-a-purchase-events-mode)
  * Fusion Cloud - [perform a purchase](/docs/api-reference/fusion-cloud#perform-a-purchase)
  * Fusion Satellite - [perform a purchase](/docs/api-reference/fusion-satellite#payment)
* Populate **every** product in the SaleItem[] array with fuel product data `CustomFields`
* Populate every **fuel** product in the SaleItem[] array with fuel product data
* Fusion Cloud only; handle [display](/docs/api-reference/fusion-cloud#display), [input](/docs/api-reference/fusion-cloud#input), and [print](/docs/api-reference/fusion-cloud#print) requests.
* Handle the payment response
  * The [PaymentBrandID](/docs/api-reference/data-model#paymentbrandid) field indicates the card type used to complete the payment

<details>

<summary>
Fusion Fuel API purchase request
</summary>

<p>

```json
{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Request",
			"ServiceID": "ec6b7b5f7330484eb533cd26a1306bb0",
			"SaleID": "INT POS",
			"POIID": "INTP9205"
		},
		"PaymentRequest": {
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "422543aba9fc4e9a9a6512517961513c",
					"TimeStamp": "2023-11-28T04:33:56.8703432Z"
				}
			},
			"PaymentTransaction": {
				"AmountsReq": {
					"Currency": "AUD",
					"RequestedAmount": 117.41
				},
				"SaleItem": [
					{
						"ItemID": 0,
						"ProductCode": "HHETDY12321",
						"UnitOfMeasure": "Litre",
						"Quantity": 57.62,
						"UnitPrice": 1.97,
						"ItemAmount": 113.51,
						"ProductLabel": "BP Unleaded 91",
						"CustomFields": [
							{
								"Key": "FuelProductCode",
								"Type": "String",
								"Value": "21"
							},
							{
								"Key": "FuelProductCodeShellCard",
								"Type": "String",
								"Value": "35"
							},
							{
								"Key": "FuelProductCodeFleetcore",
								"Type": "String",
								"Value": "21"
							}
						]
					},
					{
						"ItemID": 1,
						"ProductCode": "5000112576009",
						"EanUpc": "5000112576009",
						"UnitOfMeasure": "Other",
						"Quantity": "2",
						"UnitPrice": "1.95",
						"ItemAmount": "3.90",
						"ProductLabel": "Coca-Cola No Sugar 1.25L",
						"CostBase": "0.75",
						"Categories": [
							"Drinks",
							"Soft Drink"
						],
						"Brand": "Coca-Cola",
						"QuantityInStock": "42"
					}
				]
			},
			"PaymentData": {
				"PaymentType": "Normal"
			}
		},
		"SecurityTrailer": {}
	}
}
```
</p>
</details>


<details>
<summary>
Fusion Fuel API purchase response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Response",
			"ServiceID": "ec6b7b5f7330484eb533cd26a1306bb0",
			"SaleID": "INT POS",
			"POIID": "INTP9205"
		},
		"PaymentResponse": {
			"Response": {
				"Result": "Success"
			},
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "422543aba9fc4e9a9a6512517961513c",
					"TimeStamp": "2023-11-28T04:33:56.8703432Z"
				}
			},
			"POIData": {
				"POITransactionID": {
					"TransactionID": "65656db57a54cb8f801069ee",
					"TimeStamp": "2023-11-28T15:34:10.16+11:00"
				},
				"POIReconciliationID": "64f7f88bd677b0362581bbb5"
			},
			"PaymentResult": {
				"PaymentType": "Normal",
				"PaymentInstrumentData": {
					"PaymentInstrumentType": "Card",
					"CardData": {
						"EntryMode": "MagStripe",
						"PaymentBrand": "Shell Card",
						"PaymentBrandID": "0103",
						"PaymentBrandLabel": "Shell Card",
						"Account": "Default",
						"Expiry": "=720",
						"MaskedPAN": "7034305XXXXX2521"
					}
				},
				"AmountsResp": {
					"Currency": "AUD",
					"AuthorizedAmount": 117.41,
					"TotalFeesAmount": 0,
					"CashBackAmount": 0,
					"SurchargeAmount": 0,
					"TipAmount": 0
				},
				"OnlineFlag": true,
				"PaymentAcquirerData": {
					"AcquirerID": "560251",
					"MerchantID": "33435368",
					"AcquirerPOIID": "M3AU41",
					"AcquirerTransactionID": {
						"TransactionID": "5de73ec1454dde9d70124b5d",
						"TimeStamp": "2023-11-28T04:34:10.320Z"
					},
					"ApprovalCode": "554004",
					"ResponseCode": "00",
					"HostReconciliationID": "20231129",
					"RRN": "328132214339126"
				}
			},
			"PaymentReceipt": [
				{
					"DocumentQualifier": "SaleReceipt",
					"IntegratedPrintFlag": true,
					"RequiredSignatureFlag": false,
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "PHAgaWQ9InJlY2VpcHQtaW5mbyI+MjgvMTEvMjAyMyAxNTozNDoxMDxici8+TWVyY2hhbnQgSUQ6IFBPU01lcmNoYW50PGJyLz5UZXJtaW5hbCBJRDogSU5UUDkyMDU8L3A+PHAgaWQ9InJlY2VpcHQtZGV0YWlscyI+PGI+UHVyY2hhc2UgVHJhbnNhY3Rpb248L2I+PGJyLz5BbW91bnQ6ICQxNS4wODxici8+U2hlbGwgQ2FyZDogNDc2MTczWFhYWFhYMDExOSAoVCk8YnIvPkNyZWRpdCBBY2NvdW50PC9wPjxwIGlkPSJyZWNlaXB0LXJlc3VsdCI+PGI+QXBwcm92ZWQ8L2I+PGJyLz5SZWZlcmVuY2U6IDAwMDAgMDAxMyA0NTk4PGJyLz5BdXRoIENvZGU6IDU1NDAwNDxici8+QUlEOiBBMDAwMDAwMDAzMTAxMDxici8+QVRDOiAwMDAxPGJyLz5UVlI6IDAwMDAwMDAwMDA8YnIvPkFSUUM6IEQ5Mzc2MDIwMDgzOEQwNzM8L3A+"
					}
				}
			]
		},
		"SecurityTrailer": {}
	}
}
```
</p>
</details>

## Refund

To perform a fuel refund:

* Construct a refund request based on the Sale System integration type:
  * Fusion App - [perform a purchase](/docs/api-reference/fusion-app#perform-a-refund-events-mode)
  * Fusion Cloud - [perform a purchase](/docs/api-reference/fusion-cloud#perform-a-refund)
  * Fusion Satellite - [perform a purchase](/docs/api-reference/fusion-satellite#payment)
* When possible, populate the [matched refund](/docs/getting-started#matched-refund) fields
  * Not all fuel cards support unmatched refunds
* Populate the SaleItem[] array with fuel product data of the items being refunded
* Fusion Cloud only; handle [display](/docs/api-reference/fusion-cloud#display), [input](/docs/api-reference/fusion-cloud#input), and [print](/docs/api-reference/fusion-cloud#print) requests.
* Handle the payment response


<details>

<summary>
Fusion Fuel API refund request
</summary>

<p>

```json
{
	"SaleToPOIRequest": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Request",
			"ServiceID": "ec6b7b5f7330484eb533cd26a1306bb0",
			"SaleID": "INT POS",
			"POIID": "INTP9205"
		},
		"PaymentRequest": {
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "422543aba9fc4e9a9a6512517961513c",
					"TimeStamp": "2023-11-28T04:33:56.8703432Z"
				}
			},
			"PaymentTransaction": {
				"AmountsReq": {
					"Currency": "AUD",
					"RequestedAmount": 117.41
				},
				"OriginalPOITransaction": {
					"POITransactionID": {
						"TransactionID": "65656db57a54cb8f801069ee",
						"TimeStamp": "2023-11-28T15:34:10.16+11:00"
					},
				},
				"SaleItem": [
					{
						"ItemID": 0,
						"ProductCode": "HHETDY12321",
						"UnitOfMeasure": "Litre",
						"Quantity": 57.62,
						"UnitPrice": 1.97,
						"ItemAmount": 113.51,
						"ProductLabel": "BP Unleaded 91",
						"CustomFields": [
							{
								"Key": "FuelProductCode",
								"Type": "String",
								"Value": "21"
							},
							{
								"Key": "FuelProductCodeShellCard",
								"Type": "String",
								"Value": "35"
							},
							{
								"Key": "FuelProductCodeFleetcore",
								"Type": "String",
								"Value": "21"
							}
						]
					},
					{
						"ItemID": 1,
						"ProductCode": "5000112576009",
						"EanUpc": "5000112576009",
						"UnitOfMeasure": "Other",
						"Quantity": "2",
						"UnitPrice": "1.95",
						"ItemAmount": "3.90",
						"ProductLabel": "Coca-Cola No Sugar 1.25L",
						"CostBase": "0.75",
						"Categories": [
							"Drinks",
							"Soft Drink"
						],
						"Brand": "Coca-Cola",
						"QuantityInStock": "42"
					}
				]
			},
			"PaymentData": {
				"PaymentType": "Refund"
			}
		},
		"SecurityTrailer": {}
	}
}
```
</p>
</details>


<details>
<summary>
Fusion Fuel API refund response
</summary>

<p>

```json
{
	"SaleToPOIResponse": {
		"MessageHeader": {
			"MessageClass": "Service",
			"MessageCategory": "Payment",
			"MessageType": "Response",
			"ServiceID": "ec6b7b5f7330484eb533cd26a1306bb0",
			"SaleID": "INT POS",
			"POIID": "INTP9205"
		},
		"PaymentResponse": {
			"Response": {
				"Result": "Success"
			},
			"SaleData": {
				"SaleTransactionID": {
					"TransactionID": "422543aba9fc4e9a9a6512517961513c",
					"TimeStamp": "2023-11-28T04:33:56.8703432Z"
				}
			},
			"POIData": {
				"POITransactionID": {
					"TransactionID": "65656db57a54cb8f801069ee",
					"TimeStamp": "2023-11-28T15:34:10.16+11:00"
				},
				"POIReconciliationID": "64f7f88bd677b0362581bbb5"
			},
			"PaymentResult": {
				"PaymentType": "Normal",
				"PaymentInstrumentData": {
					"PaymentInstrumentType": "Card",
					"CardData": {
						"EntryMode": "MagStripe",
						"PaymentBrand": "Shell Card",
						"PaymentBrandID": "0103",
						"PaymentBrandLabel": "Shell Card",
						"Account": "Default",
						"Expiry": "=720",
						"MaskedPAN": "7034305XXXXX2521"
					}
				},
				"AmountsResp": {
					"Currency": "AUD",
					"AuthorizedAmount": 117.41,
					"TotalFeesAmount": 0,
					"CashBackAmount": 0,
					"SurchargeAmount": 0,
					"TipAmount": 0
				},
				"OnlineFlag": true,
				"PaymentAcquirerData": {
					"AcquirerID": "560251",
					"MerchantID": "33435368",
					"AcquirerPOIID": "M3AU41",
					"AcquirerTransactionID": {
						"TransactionID": "5de73ec1454dde9d70124b5d",
						"TimeStamp": "2023-11-28T04:34:10.320Z"
					},
					"ApprovalCode": "554004",
					"ResponseCode": "00",
					"HostReconciliationID": "20231129",
					"RRN": "328132214339126"
				}
			},
			"PaymentReceipt": [
				{
					"DocumentQualifier": "SaleReceipt",
					"IntegratedPrintFlag": true,
					"RequiredSignatureFlag": false,
					"OutputContent": {
						"OutputFormat": "XHTML",
						"OutputXHTML": "PHAgaWQ9InJlY2VpcHQtaW5mbyI+MjgvMTEvMjAyMyAxNTozNDoxMDxici8+TWVyY2hhbnQgSUQ6IFBPU01lcmNoYW50PGJyLz5UZXJtaW5hbCBJRDogSU5UUDkyMDU8L3A+PHAgaWQ9InJlY2VpcHQtZGV0YWlscyI+PGI+UHVyY2hhc2UgVHJhbnNhY3Rpb248L2I+PGJyLz5BbW91bnQ6ICQxNS4wODxici8+U2hlbGwgQ2FyZDogNDc2MTczWFhYWFhYMDExOSAoVCk8YnIvPkNyZWRpdCBBY2NvdW50PC9wPjxwIGlkPSJyZWNlaXB0LXJlc3VsdCI+PGI+QXBwcm92ZWQ8L2I+PGJyLz5SZWZlcmVuY2U6IDAwMDAgMDAxMyA0NTk4PGJyLz5BdXRoIENvZGU6IDU1NDAwNDxici8+QUlEOiBBMDAwMDAwMDAzMTAxMDxici8+QVRDOiAwMDAxPGJyLz5UVlI6IDAwMDAwMDAwMDA8YnIvPkFSUUM6IEQ5Mzc2MDIwMDgzOEQwNzM8L3A+"
					}
				}
			]
		},
		"SecurityTrailer": {}
	}
}
```
</p>
</details>


## Accreditation

There are an expanded set of test cases in the Fusion [accreditation](/docs/testing) to support payments via the Fusion Fuel API. 

[Contact the DataMesh Integrations Team](mailto:integrations@datameshgroup.com) to discuss the accreditation process. 