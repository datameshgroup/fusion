---
sidebar_position: 4
---

# Fusion Stored Value API

The Fusion Stored Value API is an extension to the Fusion API which adds support for "gift card" transactions.

A "gift card" is a financial instrument that allows customers to store funds for future purchases.


## Gift card overview

Below is an overview of supported gift cards. If you are familiar with gift cards please skip ahead to [mandatory features](/docs/api-reference/fusion-stored-value-api#mandatory-features)


### Physical gift card format

- Physical gift cards are sold on a “hang-sell”, a branded cardboard sheet with a UPC, activation barcode, and notch at the top for hanging in the gift card display. 
- The UPC barcode represents an 11-digit UPC, followed by a check digit
- The activation barcode contains the 11-digit UPC (no check digit) followed by the 19-digit card number (PAN) left-padded with zero. 
- Some card types may have a plastic credit card embedded on the hang-sell.

![gift-card-layout](/img/giftcard-layout.png)  


### Supported gift card types

#### Third-party physical

* **Example** - iTunes Gift Card, Xbox Gift Card, Visa Gift Card
* **Supported transaction types** - Activation, Deactivation
* **Supported activation methods** - One-step

##### Overview

A **third-party physical** gift card is a type of gift card that is activated at the merchant and redeemable via a third-party store.

The card contains an activation barcode, formatted as an 11-digit UPC followed by the card number.

The activation amount on the card can be either fixed or variable.

A pre-paid gift card is a subset of third-party gift card. A pre-paid gift card is activated via the activation barcode, but redeemed via the card schemes (e.g. EFTPOS, Visa, Mastercard)

##### Card description 

- Hang-sell only
  - This gift card is made of printed cardboard with an activation barcode. It may optionally have a magnetic stripe embedded on the cardboard. A one-time redemption code, which is redeemed via the third-party store, is hidden behind a scratch panel on the back.
  - Example: iTunes cards
- Hang-sell containing plastic card
  - A plastic card with a magnetic stripe, attached to a cardboard backing with an activation barcode. The card may be closed-loop or open-loop (card schemes).
  - Example: Vanilla gift card

##### User journey - activation

- Cardholder selects the gift card to purchase from the gift card display and takes it to the counter.
- Cashier creates a sale on the POS, scans “activation barcode” on the back of the gift card to purchase. Optionally the cashier enters the gift card amount.
- Cardholder completes payment for the gift card, including any associated activation fees, using cash or card.
- Once payment is complete, the cashier initiates the gift card activation request using the “activation barcode”, along with the amount.
- The amount, along with the UPC and card number extracted from the “activation barcode” provide all the fields required for DataMesh to complete a card activation.
- DataMesh completes activation, and returns result and receipt to the POS.
- POS includes the transaction receipt in the sale receipt, and optionally prints sale receipt including all payments associated with this sale. 


#### Closed-loop physical

* **Example** - in-house branded gift card
* **Supported transaction types** - Activation, Deactivation, Redeem, Redeem void, Balance inquiry
* **Supported activation methods** - One-step, two-step

##### Overview

A **closed-loop physical gift card** is a type of gift card that is activated at the merchant and is also redeemable at the merchant via a closed-loop network.

The card typically contains an activation barcode, formatted as an 11-digit UPC followed by the card number.

The activation amount on the card can be either fixed or variable.

##### Card description 

A plastic card with a magnetic stripe, attached to a cardboard backing with an activation barcode. The magnetic stripe may be accessible to support two-step activation.

##### User journey - activation

- Cardholder selects the gift card to purchase from the gift card display and takes it to the counter.
- Cashier creates a sale on the POS, scans “activation barcode” on the back of the gift card to purchase. Optionally the cashier enters the gift card amount.
- Cardholder completes payment for the gift card, including any associated activation fees, using cash or card.
- Once payment is complete, the cashier initiates the gift card activation request using the “activation barcode”, along with the amount.
- The amount, along with the UPC and card number extracted from the “activation barcode” provide all the fields required for DataMesh to complete a card activation.
- DataMesh completes activation, and returns result and receipt to the POS.
- POS includes the transaction receipt in the sale receipt, and optionally prints sale receipt including all payments associated with this sale. 

##### User journey - redemption

- Cardholder selects items to purchase, and takes them to the counter.
- Cashier creates a sale on the POS, scans items, and initiates a purchase request. 
- DataMesh terminal displays “PRESENT CARD” screen and the cardholder swipes their gift card in the terminal
- DataMesh completes redemption, and returns result and receipt to the POS.
- POS includes the transaction receipt in the sale receipt, and optionally prints sale receipt including all payments associated with this sale. 


#### Account recharge

* **Example** - Optus recharge Telstra recharge
* **Supported transaction types** - Activation, Deactivation*
* **Supported activation methods** - One-step

##### Overview 

An **account recharge** adds funds to a customer's account. For example, topping up a pre-paid Optus or Telstra mobile phone account.

It is similar to the third-party gift card, the difference is that for an account recharge, there is no physical card. Instead of using the UPC and card number scanned from an “activation barcode”, in an account recharge the POS sends a pre-configured UPC, and the card number is scanned by the POS from the cardholder's phone. 

##### Card description

There is no physical card for an account recharge. The POS contains a database of supported UPC values.

##### User journey - activation

- POS product database is pre-configured with UPC’s for available “account recharge” products.
- Cardholder requests a phone recharge from the cashier, and indicates the type and amount required. 
- Cashier creates a sale on the POS, adds the appropriate “account recharge” product to the sale, and optionally enters the gift card amount.
- Cardholder opens the phone app on their mobile phone and presents the account recharge barcode to the cashier.
- Cashier scans the barcode, which is recorded along with the UPC and amount. 
- Cardholder completes payment for the account recharge, including any associated activation fees, using cash or card.
- Once payment is complete, the cashier initiates the gift card activation request.
- The amount, along with the pre-configured UPC and card number scanned from the customer phone, provide all the fields required for DataMesh to complete a card activation.
- DataMesh completes activation, and returns result and receipt to the POS.
- POS includes the transaction receipt in the sale receipt, and optionally prints sale receipt including all payments associated with this sale. 


#### Digital account reservation

* **Example** - Google Play, Phone account recharge
* **Supported transaction types** - Activation, Deactivation
* **Supported activation methods** - One-step

##### Overview 
	
A **digital account reservation** is used to generate an reservation code which is redeemable via a third-party store.

It is similar to the third-party gift card, the difference being:
- There is no physical card. The POS sends the product UPC based on a product selected by the cashier. 
- The activation code is returned on a receipt, which must be printed by the POS

The activation amount on the card can be either fixed or variable.

##### Card description

There is no physical card for an digital account reservation. The POS contains a database of supported UPC values.

##### User journey - activation

- POS product database is pre-configured with UPC’s for available "redemption code reservation” products.
- Cardholder requests a "digital account reservation" product from the cashier, and indicates the type and amount required. 
- Cashier creates a sale on the POS, adds the appropriate "digital account reservation" product to the sale, and optionally enters the gift card amount.
- Cardholder completes payment for the "digital account reservation", including any associated activation fees, using cash or card.
- Once payment is complete, the cashier initiates the gift card activation request.
- The amount, along with the pre-configured UPC, provide all the fields required for DataMesh to complete a card activation.
- DataMesh completes activation, and returns result and receipt containing the redemption code to the POS.
- POS **MUST** print the receipt as returned by DataMesh



### Activation methods
 
##### Physical card, one-step activation
- POS scans the “activation bar code" from the back of the card (code consists of 11-digit UPC followed by the card number)
- POS sends a stored value activation request to DataMesh, containing the activation bar code content and amount (if applicable).
- DataMesh processes the activation and sends the result back to the POS
- POS displays result to the user

##### Physical card, two-step activation 
- POS scans the UPC bar code from the back of the card (code only consists of 11-digit UPC)
- POS sends a stored value activation request to DataMesh, containing the gift card bar code and amount (if applicable).
- DataMesh terminal requests user swipe the gift card. Terminal reads the card. 
- DataMesh processes the activation and sends the result back to the POS
- POS displays result to the user


## Mandatory features 

The table below provides an overview of the mandatory integration requirements for the Fusion Gift Card API which are required for your selected integration type.

Feature                                                              | Fusion App | Fusion Satellite | Fusion Cloud |
-------------------------------------------------------------------  |   :----:   |     :------:     |   :------:   |
Activate                                                             | ✔          | ✔               | ✔            |  
Deactivate                                                           |             |                  |              |  
Purchase                                                             | ✔          | ✔               | ✔            |  
[QR code pairing](/docs/getting-started#qr-code-pairing)             |            |                  | ✔            |
[Display request handling](/docs/api-reference/fusion-cloud#display) |            |                  | ✔            |
[Input request handling](/docs/api-reference/fusion-cloud#input)     |            |                  | ✔            |
[Print request handling](/docs/api-reference/fusion-cloud#print)     |            |                  | ✔            |


## Purchase 

To perform a gift card purchase (redemption):

* Process a standard purchase request based on the Sale System integration type:
  * Fusion App - [perform a purchase](/docs/api-reference/fusion-app#perform-a-purchase-events-mode)
  * Fusion Cloud - [perform a purchase](/docs/api-reference/fusion-cloud#perform-a-purchase)
  * Fusion Satellite - [perform a purchase](/docs/api-reference/fusion-satellite#payment)
* The [payment brand id](/docs/api-reference/data-model#paymentbrandid) returned in the payment response will indicate the gift card type used


## Activate 

:::info
Only one card can be activation per request. To activate multiple cards, the Sale System must send multiple activation requets sequentially.
:::

To perform a gift card activation:

- Based on the gift card type, read the "activation barcode", and/or UPC
  - Third-party physical - scan the "activation barcode"
  - Closed-loop physical - scan the "activation barcode"
  - Account recharge - scan the cardholder account, and append, left zero padded to 19 digits, to the UPC. This becomes the "activation barcode"
  - Digital account reservation - record product UPC selected by the cashier
- Construct a [stored value](/docs/api-reference/data-model#stored-value) request
  - Set `StoredValueData[].StoredValueTransactionType` to `Activate`
  - Set `StoredValueData[].StoredValueAccountID.StoredValueAccountType` to `GiftCard`
  - Set `StoredValueData[].StoredValueAccountID.IdentificationType` to `Barcode`
  - Set `StoredValueData[].StoredValueAccountID.StoredValueID` to the UPC or "activation barcode"
  - Set `StoredValueData[].EanUpc` to the product UPC
  - Set `StoredValueData[].ItemAmount` to the activation amount (note this is required even for fixed-amount cards)
  - If applicable, set `StoredValueData[].TotalFeesAmount` to the fee associated with the card.
- Fusion Cloud only; handle [display](/docs/api-reference/fusion-cloud#display), [input](/docs/api-reference/fusion-cloud#input), and [print](/docs/api-reference/fusion-cloud#print) requests.
- Handle the [stored value](/docs/api-reference/data-model#stored-value) response
  - The `PaymentReceipt` **MUST** be printed for a digital account reservation as it contains the redemption code

<details>
<summary>
Stored value request - activate
</summary>
<p>

```json
{
	"StoredValueRequest": {		
		"SaleData": {
			"SaleTransactionID": {
                "TransactionID": "03b22d77-f050-478a-b9a8-10295bc7a957",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
			}
		},
		"StoredValueData": [
			{
			"StoredValueProvider": "",
			"StoredValueTransactionType":"Activate",
			"StoredValueAccountID": {
				"StoredValueAccountType": "GiftCard",
				"EntryMode": "Scanned",
				"IdentificationType": "BarCode",
				"StoredValueID": "111111111112222222222222222222"
			},
			"ProductCode": "001",
			"EanUpc": "11111111111",
			"ItemAmount": 100.00,			
			"TotalFeesAmount": 4.95,
			"Currency": "AUD"
			}
		]		
	}
}
```
</p>
</details>


<details>
<summary>
Stored value response - deactivate
</summary>
<p>

```json
{
    "StoredValueResponse": {
        "Response": {
            "Result": "Success"
        },
        "SaleData": {
			"SaleTransactionID": {
                "TransactionID": "03b22d77-f050-478a-b9a8-10295bc7a957",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
			}
        },
        "POIData": {
            "POITransactionID": {
                "TransactionID": "66251a5e4a74ef253c7bb9e1",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
            }
        },
        "StoredValueResult": [
            {
                "StoredValueAccountStatus": {
                    "StoredValueAccountID": {
                        "StoredValueAccountType": "GiftCard",
                        "EntryMode": "Scanned",
                        "IdentificationType": "BarCode",
                        "StoredValueID": "111111111112222222222222222222"
                    },
                    "CurrentBalance": 0
                },
                "StoredValueTransactionType": "Activate",
                "ProductCode": "001",
                "EanUpc": "11111111111",
                "ItemAmount": 100.00,
                "Currency": "AUD"
            }
        ],
        "PaymentReceipt": [
            {
                "DocumentQualifier": "SaleReceipt",
                "RequiredSignatureFlag": false,
                "OutputContent": {
                    "OutputFormat": "XHTML",
                    "OutputXHTML": "PHA+IDwvcD4KPHA+PGI+ClRvd2VyIE9uZTwvYj48L3A+CjxwPjxpPjEwMCBCYXJhbmdhcm9vPC9pPjwvcD4KPHA+PGk+QmFyYW5nYXJvbyBOU1cgMjAwMDwvaT48L3A+CjxwPjxiPgoqKiogQ1VTVE9NRVIgQ09QWSAqKio8L2I+PC9wPgo8cD4KMjEvMDQvMjAyNCAyMzo1MzozNDwvcD4KPHA+TWVyY2hhbnQgSUQ6IFBPU01lcmNoYW50PC9wPgo8cD5UZXJtaW5hbCBJRDogSU5HQ0QwMDEKPC9wPgo8cD48Yj5HaWZ0IENhcmQgQWN0aXZhdGlvbjwvYj48L3A+CjxwPkFtb3VudDokNS4wMDwvcD4KPHA+SW5jb21tOiA2Mzc1MDk3MjQ5MjY2MjQ4IChNYW51YWwpPC9wPgo8cD5EZWZhdWx0IEFjY291bnQ8L3A+CjxwPjxiPgpBcHByb3ZlZDwvYj48L3A+CjxwPlJlZmVyZW5jZTogMDAwMDAwMTYwMTc0PC9wPgo8cD5BdXRoIENvZGU6IDkxMDA4NzwvcD4KPHA+UlJOIDogMDE2NDgwNTQ5NTg1ODQyPC9wPgo8cD4KCgo8L3A+Cg==",
                    "ContentAsPlainText": "Tower One\r\n\r\n100 Barangaroo\r\n\r\nBarangaroo NSW 2000\r\n\r\n*** CUSTOMER COPY ***\r\n\r\n21/04/2024 23:53:34\r\n\r\nMerchant ID: POSMerchant\r\n\r\nTerminal ID: XXXXXXXX\r\n\r\nGift Card Activation\r\n\r\nAmount:$100.00\r\n\r\nIncomm: 2222222222222222222 (Manual)\r\n\r\nDefault Account\r\n\r\nApproved\r\n\r\nReference: 000000160174\r\n\r\nAuth Code: 910087\r\n\r\nRRN : 016480549585842\r\n\r\n\r\n"
                }
            }
        ]
    }
}
```
</p>
</details>

## Deactivate

:::warning
Whilst deactivation is supported by the Fusion Stored Value API, support for this transaction type is very limited by the gift card providers. The Sale System should always confirm payment prior to activation, minimising the requirement for deactivation.
:::

To perform a gift card deactivation:

- Construct a [stored value](/docs/api-reference/data-model#stored-value) request
  - Set `StoredValueData[].OriginalPOITransaction` to the `POIData.POITransactionID` from the original activation request
  - Set `StoredValueData[].StoredValueTransactionType` to `Reverse`
  - Set `StoredValueData[].StoredValueAccountID.StoredValueAccountType` to `GiftCard`
  - Set `StoredValueData[].StoredValueAccountID.IdentificationType` to `Barcode`
  - Set `StoredValueData[].StoredValueAccountID.StoredValueID` to the UPC or "activation barcode"
  - Set `StoredValueData[].EanUpc` to the product UPC
  - Set `StoredValueData[].ItemAmount` to the activation amount (note this is required even for fixed-amount cards)  
- Fusion Cloud only; handle [display](/docs/api-reference/fusion-cloud#display), [input](/docs/api-reference/fusion-cloud#input), and [print](/docs/api-reference/fusion-cloud#print) requests.
- Handle the [stored value](/docs/api-reference/data-model#stored-value) response

<details>
<summary>
Stored value request - deactivate
</summary>
<p>

```json
{
    "StoredValueResponse": {
        "Response": {
            "Result": "Success"
        },
        "SaleData": {
			"SaleTransactionID": {
                "TransactionID": "03b22d77-f050-478a-b9a8-10295bc7a957",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
			}
        },
        "POIData": {
            "POITransactionID": {
                "TransactionID": "66251a5e4a74ef253c7bb9e1",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
            }
        },
        "StoredValueResult": [
            {
                "StoredValueAccountStatus": {
                    "StoredValueAccountID": {
                        "StoredValueAccountType": "GiftCard",
                        "EntryMode": "Scanned",
                        "IdentificationType": "BarCode",
                        "StoredValueID": "111111111112222222222222222222"
                    },
                    "CurrentBalance": 0
                },
                "StoredValueTransactionType": "Reverse",
                "ProductCode": "001",
                "EanUpc": "11111111111",
                "ItemAmount": 100.00,
                "Currency": "AUD"
            }
        ],
        "PaymentReceipt": [
            {
                "DocumentQualifier": "SaleReceipt",
                "RequiredSignatureFlag": false,
                "OutputContent": {
                    "OutputFormat": "XHTML",
                    "OutputXHTML": "PHA+IDwvcD4KPHA+PGI+ClRvd2VyIE9uZTwvYj48L3A+CjxwPjxpPjEwMCBCYXJhbmdhcm9vPC9pPjwvcD4KPHA+PGk+QmFyYW5nYXJvbyBOU1cgMjAwMDwvaT48L3A+CjxwPjxiPgoqKiogQ1VTVE9NRVIgQ09QWSAqKio8L2I+PC9wPgo8cD4KMjEvMDQvMjAyNCAyMzo1MzozNDwvcD4KPHA+TWVyY2hhbnQgSUQ6IFBPU01lcmNoYW50PC9wPgo8cD5UZXJtaW5hbCBJRDogSU5HQ0QwMDEKPC9wPgo8cD48Yj5HaWZ0IENhcmQgQWN0aXZhdGlvbjwvYj48L3A+CjxwPkFtb3VudDokNS4wMDwvcD4KPHA+SW5jb21tOiA2Mzc1MDk3MjQ5MjY2MjQ4IChNYW51YWwpPC9wPgo8cD5EZWZhdWx0IEFjY291bnQ8L3A+CjxwPjxiPgpBcHByb3ZlZDwvYj48L3A+CjxwPlJlZmVyZW5jZTogMDAwMDAwMTYwMTc0PC9wPgo8cD5BdXRoIENvZGU6IDkxMDA4NzwvcD4KPHA+UlJOIDogMDE2NDgwNTQ5NTg1ODQyPC9wPgo8cD4KCgo8L3A+Cg==",
                    "ContentAsPlainText": "Tower One\r\n\r\n100 Barangaroo\r\n\r\nBarangaroo NSW 2000\r\n\r\n*** CUSTOMER COPY ***\r\n\r\n21/04/2024 23:53:34\r\n\r\nMerchant ID: POSMerchant\r\n\r\nTerminal ID: XXXXXXXX\r\n\r\nGift Card Activation\r\n\r\nAmount:$100.00\r\n\r\nIncomm: 2222222222222222222 (Manual)\r\n\r\nDefault Account\r\n\r\nApproved\r\n\r\nReference: 000000160174\r\n\r\nAuth Code: 910087\r\n\r\nRRN : 016480549585842\r\n\r\n\r\n"
                }
            }
        ]
    }
}
```
</p>
</details>


<details>
<summary>
Stored value response - deactivate
</summary>
<p>

```json
{
    "StoredValueResponse": {
        "Response": {
            "Result": "Success"
        },
        "SaleData": {
			"SaleTransactionID": {
                "TransactionID": "03b22d77-f050-478a-b9a8-10295bc7a957",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
			}
        },
        "POIData": {
            "POITransactionID": {
                "TransactionID": "66251a5e4a74ef253c7bb9e1",
                "TimeStamp": "2024-06-12T00:00:00+10:00"
            }
        },
        "StoredValueResult": [
            {
                "StoredValueAccountStatus": {
                    "StoredValueAccountID": {
                        "StoredValueAccountType": "GiftCard",
                        "EntryMode": "Scanned",
                        "IdentificationType": "BarCode",
                        "StoredValueID": "111111111112222222222222222222"
                    },
                    "CurrentBalance": 0
                },
                "StoredValueTransactionType": "Activate",
                "ProductCode": "001",
                "EanUpc": "11111111111",
                "ItemAmount": 100.00,
                "Currency": "AUD"
            }
        ],
        "PaymentReceipt": [
            {
                "DocumentQualifier": "SaleReceipt",
                "RequiredSignatureFlag": false,
                "OutputContent": {
                    "OutputFormat": "XHTML",
                    "OutputXHTML": "PHA+IDwvcD4KPHA+PGI+ClRvd2VyIE9uZTwvYj48L3A+CjxwPjxpPjEwMCBCYXJhbmdhcm9vPC9pPjwvcD4KPHA+PGk+QmFyYW5nYXJvbyBOU1cgMjAwMDwvaT48L3A+CjxwPjxiPgoqKiogQ1VTVE9NRVIgQ09QWSAqKio8L2I+PC9wPgo8cD4KMjEvMDQvMjAyNCAyMzo1MzozNDwvcD4KPHA+TWVyY2hhbnQgSUQ6IFBPU01lcmNoYW50PC9wPgo8cD5UZXJtaW5hbCBJRDogSU5HQ0QwMDEKPC9wPgo8cD48Yj5HaWZ0IENhcmQgQWN0aXZhdGlvbjwvYj48L3A+CjxwPkFtb3VudDokNS4wMDwvcD4KPHA+SW5jb21tOiA2Mzc1MDk3MjQ5MjY2MjQ4IChNYW51YWwpPC9wPgo8cD5EZWZhdWx0IEFjY291bnQ8L3A+CjxwPjxiPgpBcHByb3ZlZDwvYj48L3A+CjxwPlJlZmVyZW5jZTogMDAwMDAwMTYwMTc0PC9wPgo8cD5BdXRoIENvZGU6IDkxMDA4NzwvcD4KPHA+UlJOIDogMDE2NDgwNTQ5NTg1ODQyPC9wPgo8cD4KCgo8L3A+Cg==",
                    "ContentAsPlainText": "Tower One\r\n\r\n100 Barangaroo\r\n\r\nBarangaroo NSW 2000\r\n\r\n*** CUSTOMER COPY ***\r\n\r\n21/04/2024 23:53:34\r\n\r\nMerchant ID: POSMerchant\r\n\r\nTerminal ID: XXXXXXXX\r\n\r\nGift Card Activation\r\n\r\nAmount:$100.00\r\n\r\nIncomm: 2222222222222222222 (Manual)\r\n\r\nDefault Account\r\n\r\nApproved\r\n\r\nReference: 000000160174\r\n\r\nAuth Code: 910087\r\n\r\nRRN : 016480549585842\r\n\r\n\r\n"
                }
            }
        ]
    }
}
```
</p>
</details>



## Accreditation

There are an expanded set of test cases in the Fusion [accreditation](/docs/testing) to support payments via the Fusion Stored Value API. 

[Contact the DataMesh Integrations Team](mailto:integrations@datameshgroup.com) to discuss the accreditation process. 