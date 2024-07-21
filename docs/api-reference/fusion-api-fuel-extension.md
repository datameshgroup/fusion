---
sidebar_position: 4
---

# Fusion API Fuel Extension

The Fusion API Fuel Extension is of features and requirements which extend the Fusion API Core which adds support for current and future fuel payment types accepted by DataMesh. (e.g. FleetCard, Shell Card, MotorPass etc)

## What is a fuel card

A fuel card is a payment card specifically designed for drivers of business vehicles to pay for their fuel. 

They can be configured to allow the purchase of only certain product categories, making it easier for business owners to track and manage fuel expenses. Fuel cards also reduce paper work, and can offer volume discounts.

Service stations accepting fuel card payments can attract more customers, especially those using company vehicles.

## Mandatory features 

The table below provides an overview of the mandatory integration requirements for the Fusion API Fuel Extension which are required for your selected integration type.

Feature                                   						| Fusion App |  Fusion Satellite | Fusion Cloud |
-----------------                         						|   :----:   |      :------:     |   :------:   |
Purchase                                  						| ✔          | ✔                 | ✔            |  
Refund                                    						| ✔          | ✔                 | ✔            |
Cashout (not supported on fuel cards)     						|            |                   |              |
[Extended SaleItem](/docs/api-reference/fusion-api-fuel-extension#extended-saleitem) fuel product fields  | ✔          | ✔                 | ✔
[Dynamic surcharge](/docs/getting-started#dynamic-surcharge)	| ✔          | ✔                 | ✔            |
[Split payments](/docs/api-reference/fusion-api-fuel-extension#split-payments) 			| ✔          | ✔                 | ✔            |
[Matched refund](/docs/getting-started#matched-refund) 			| ✔          | ✔                 | ✔            |
[QR code pairing](/docs/getting-started#qr-code-pairing)								|            |                   | ✔            |
[Display request handling](/docs/api-reference/fusion-cloud#display)	|            |                   | ✔            |
[Input request handling](/docs/api-reference/fusion-cloud#input)		|            |                   | ✔            |
[Print request handling](/docs/api-reference/fusion-cloud#print)		|            |                   | ✔            |

## Extended SaleItem

:::info
A payment through the Fusion API Fuel Extension expands the mandatory fields for a `SaleItem`.
:::

The Fusion API requires the Sale System to provide the basket items for every payment. The Fusion API Fuel Extension expands the mandatory fields required to enable fuel card purchases. 

The extra [SaleItem](/docs/api-reference/data-model#saleitem) fields required for the Fusion API Fuel Extension are as follows:
- For **every** basket item, the Sale System must populate the fuel product code(s) within CustomFields
- For fuel sale items only, the Sale System must populate  `UnitOfMeasure`, `Quantity`, `UnitPrice`, and `ItemAmount` representing the number of litres, price per litre, and total fuel price

:::success
For fuel sale items, `ItemAmount` must equal `Quantity` multiplied by `UnitPrice`, rounded up, or to the nearest cent.
:::

Fuel sale item details:

Attribute   | Requ.  | Format | Description |
-----------------                          | :------: | ------ | ----------- |
[ItemID](/docs/api-reference/data-model#itemid)                          | ✔ | [Integer(0,9999)](/docs/api-reference/data-model#data-format) | A unique identifier for the sale item within the context of this payment. e.g. a 0..n integer which increments by one for each sale item.
[ProductCode](/docs/api-reference/data-model#productcode)                | ✔ | [String(0,128)](/docs/api-reference/data-model#data-format)  | A unique identifier for the product within the merchant, such as the SKU. For example if two customers purchase the same product at two different stores owned by the merchant, both purchases should contain the same `ProductCode`.
[UnitOfMeasure](/docs/api-reference/data-model#unitofmeasure)            | ✔ | [Enum](/docs/api-reference/data-model#data-format)  | Unit of measure of the `Quantity`. Set to "Litre"
[Quantity](/docs/api-reference/data-model#quantity)                      | ✔ | [Decimal(0,999999,8)](/docs/api-reference/data-model#data-format) | Number of litres as read from the pump (decimal, maximum precision 6.8)
[UnitPrice](/docs/api-reference/data-model#unitprice)                    | ✔ | [Decimal(0,999999,8)](/docs/api-reference/data-model#data-format) | Price per litre from the pump (decimal, maximum precision 6.8)
[ItemAmount](/docs/api-reference/data-model#itemamount)                  | ✔ | [Currency(0.01,99999.99)](/docs/api-reference/data-model#data-format) | The amount of the fuel as presented to the cardholder (decimal 6.2 rounded to the nearest cent). This must equal Quantity * UnitPrice rounded up, or to the nearest cent.
[ProductLabel](/docs/api-reference/data-model#productlabel)              | ✔ | [String(0,1024)](/docs/api-reference/data-model#data-format)  | A short, human readable, descriptive name of the product.  For example, `ProductLabel` could contain the product name typically printed on the customer receipt. 
[Categories](/docs/api-reference/data-model#categories)                  |    | [Array(String)](/docs/api-reference/data-model#data-format)   | Array of categories. Top level "main" category at categories[0]. See [Categories](/docs/api-reference/data-model#categories) for more information.
[Tags](/docs/api-reference/data-model#sale-item-tags)                    |    | [Array(String)](/docs/api-reference/data-model#data-format)   | String array with descriptive tags for the product
[CustomFields](/docs/api-reference/data-model#customfields)              | ✔ | [Array(Object)](/docs/api-reference/data-model#data-format)   | Array of key/type/value objects which define the fuel product code for the item.


### Fuel product code

#### What is a fuel product code

A fuel card may be configured by the fuel card provider to allow the purchase of specific product categories (e.g. only fuel, or fuel + services, or fuel + services + shop items) 

For each item in the basket the Sale System must include a *fuel product code* which defines the product category the sale item belongs to.

This enables the fuel card provider to determine if the basket should be accepted for the fuel card presented. 

#### Setting the fuel product code

Currently, DataMesh supports the Sale System setting either `FuelProductCodeShellCard` or `FuelProductCode`. DataMesh will perform the required mapping from these codes to handle all other supported fuel card types.

The Sale System **must** populate the [CustomFields](/docs/api-reference/data-model#customfields) array with at least one *fuel product code* value for every sale item. 

:::success
**If the Sale System only supports setting one code, it should set `FuelProductCodeShellCard`**
:::

Supported product codes: 

<table>
  <thead>
    <tr>
      <th>Product code</th>
      <th>Fuel card support</th>
      <th>Supported codes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FuelProductCode</td>
      <td>BP, Shell Card, Fleet Card, Motorpass</td>
      <td>
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
      </td>
    </tr>
    <tr>
      <td>FuelProductCodeShellCard</td>
      <td>BP, Shell Card, Fleet Card, Motorpass</td>
      <td>
        <details>
          <summary>
            FuelProductCodeShellCard codes
          </summary>
          Code | Description              |
          ---- | ------------------------ |
          1    | Unleaded E10
          2    | Unleaded Petrol
          3    | Premium Unleaded
          4    | Diesel
          5    | Gogas
          6    | AdBlue
          7    | Premium Unleaded 98
          8    | V-Power
          9    | Unleaded 95
          10   | Premium Diesel
          11   | Car Parts
          12   | Car Service Labour
          13   | Auto Care Oils
          14   | Franchised Car Service
          17   | Car Tyres
          18   | Car Batteries
          19   | Car Service Opp
          20   | Car Service Other
          31   | Car Wash & Detail
          40   | GST-Free Products
          42   | Car Accessories
          43   | Car Care
          45   | Tobacco
          46   | Confectionery
          47   | Dairy & Deli
          48   | Drinks
          49   | Take Away Food
          50   | Groceries
          52   | Ice Products
          54   | Newsagency
          55   | Auto Oils
          56   | Rentals & Deposits
          57   | Travel & Leisure
          59   | Hardware
          60   | Lp Gas Bottles
          65   | Services
          66   | Kerosene
          67   | Premix
          71   | Bakery
        </details>
      </td>
    </tr>
  </tbody>
</table>


#### Supporting multiple fuel product codes

:::info
This is optional. If the Sale System only supports setting one code, it should set `FuelProductCodeShellCard`
:::

DataMesh supports the Sale System providing multiple fuel product codes for each sale item. 

If multiple fuel product codes are provided and a fuel card is presented, DataMesh will first attempt to use the fuel product codes for the card brand. If not provided, DataMesh will map from `FuelProductCodeShellCard` or `FuelProductCode`.

For example; if an Caltex StarCard is presented, DataMesh will attempt to load the fuel product code from `FuelProductCodeCaltexStarCard`. If not provied by the Sale System, DataMesh will map from `FuelProductCodeShellCard` or `FuelProductCode`.

All supported fuel product code types:

Product code                    | Fuel card         |
------------------------------- | ------            |
FuelProductCodeAmpolCard        | Ampol Card        |
FuelProductCode                 | BP Card           |
FuelProductCodeCaltexStarCard   | Caltex StarCard   |
FuelProductCodeFleetCard        | Fleet Card        | 
FuelProductCodeFreedomFuelCard  | Freedom Fuel Card |
FuelProductCodeLibertyCard      | Liberty Card      |
FuelProductCodeMotorpass        | Motorpass         |
FuelProductCodeShellCard        | Shell Card        |
FuelProductCodeTrinityFuelCard  | Trinity Fuel Card |
FuelProductCodeUnitedFuelCard   | United Fuel Card  |


### Discounts and surcharges

:::success
Fuel card payments require the amount requested to always match the sum of the items in the basket. 
:::

The Sale System must ensure that after the discount or surcharge has been applied; 
1. The amount requested matches the sum of the items in the basket.
2. `ItemAmount` equals `Quantity` multiplied by `UnitPrice`, rounded up, or to the nearest cent.

To apply a surcharge:
* Adjust the `Quantity` and/or `UnitPrice` to reflect the surcharged price, ensuring `ItemAmount` equals `Quantity` multiplied by `UnitPrice`
* Send the payment request

To apply a fuel item discount:
* Adjust the `Quantity` and/or `UnitPrice` to reflect the discounted price, ensuring `ItemAmount` equals `Quantity` multiplied by `UnitPrice`
* In the SaleItem, populate `Discount` with the discounted amount
* In the SaleItem, populate `DiscountReason` with the reason the discount was applied
* Send the payment request

<details>
	<summary> Example discounted fuel item </summary>
	<p>
	```json
	{ 
	"SaleItem": [
		{
			"ItemID": 0,
			"ProductCode": "ABX123",
			"UnitOfMeasure": "Litre",
			"Quantity": 42.252,
			"UnitPrice": 2.00,
			"ItemAmount": 84.50,
			"Discount": 6.34,
			"Discount": "Cafe + fuel discount",
			"ProductLabel": "Premium ULP",
			"Categories": ["Fuel"],
			"CustomFields": [
			{
				"Key": "FuelProductCodeShellCard",
				"Type": "String",
				"Value": "35"
			}
			]
		}
	}
	```
	</p>
</details>


### Example fuel API sale item


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
      }
    ]
  }
}
```
</p>
</details>


## Split payments

:::success
For fuel card payments, the amount requested must match the sum of the items in the basket. 
:::

For cash and scheme cards, the standard split payments user flow (described [here](/docs/getting-started#split-payments)) applies.

However, fuel card payments have unique split payment requirements:

1. **No Split for Single Fuel Purchase:** A single fuel purchase cannot be split between a fuel card and another payment option. For instance, a $100 fuel purchase cannot be split into $50 cash and $50 fuel card payments.
2. **Mandatory Basket Split for Unsupported Items:** If a fuel card is used to purchase fuel along with items not supported by the card (e.g. tobacco), the Sale System must split the basket. For example, a purchase of $100 fuel and $50 tobacco would require the Sale System to send two transactions with separate baskets. The fuel sale, with the fuel item in the basket followed by and a second sale, with the tobacco item in the basket. 

Fuel card holders are typically familiar with these operational processes. Cashiers need to understand this flow for correct POS processing.

:::info
Refer [here](/docs/getting-started#split-payments) for details on performing a split payment.
:::


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
Fusion API Fuel Extension purchase request
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
Fusion API Fuel Extension purchase response
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

:::success
All fuel card refunds must be "matched refunds". To perform a matched refund, include the `POITransactionID` from the original purchase request.
:::

To perform a fuel refund:

* Construct a refund request based on the Sale System integration type:
  * Fusion App - [perform a purchase](/docs/api-reference/fusion-app#perform-a-refund-events-mode)
  * Fusion Cloud - [perform a purchase](/docs/api-reference/fusion-cloud#perform-a-refund)
  * Fusion Satellite - [perform a purchase](/docs/api-reference/fusion-satellite#payment)
* Populate the [matched refund](/docs/getting-started#matched-refund) fields
* Populate the `SaleItem[]` array with fuel product data of the items being refunded
* Fusion Cloud only; handle [display](/docs/api-reference/fusion-cloud#display), [input](/docs/api-reference/fusion-cloud#input), and [print](/docs/api-reference/fusion-cloud#print) requests.
* Handle the payment response

<details>

<summary>
Fusion API Fuel Extension refund request
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
Fusion API Fuel Extension refund response
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

There are an expanded set of test cases in the Fusion [accreditation](/docs/testing) to support payments via the Fusion API Fuel Extension. 

[Contact the DataMesh Integrations Team](mailto:integrations@datameshgroup.com) to discuss the accreditation process. 