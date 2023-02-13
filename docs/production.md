---
sidebar_position: 5
---

# Production

After testing and accreditation are complete, follow the production readiness checklist below:

- [Create production Sale System build](#production-create-production-sale-system-build)
- [Complete PVT](#production-complete-pvt)
- [Provide Production Support Information](#production-provide-production-support-information)
- [Organise a pilot](#production-organise-a-pilot)

## Create a production Sale System build 

- If the Sale System is using a DataMesh library, ensure it is updated to the latest version
- Update the Sale System "static" settings to the production values provided by DataMesh. Settings to be updated are listed below. See [Sale System settings](#design-your-integration-sale-system-settings) for more information.
  - `ProviderIdentification`, the name of the busniess which creates the Sale System.
  - `ApplicationName`, the name of the Sale System.
  - `CertificationCode`, a GUID which uniquly identifies the Sale System. 
  - `SoftwareVersion`, the internal build version of this Sale System. DataMesh must configure this value on Unify. 
- Ensure the Sale System is connecting to the [DataMesh production endpoint](#cloud-api-reference-endpoints).
  - The production endpoint uses a different [SSL certificate](#cloud-api-reference-security).
- If the POI Terminal will be utilising Mobile Data, please [inform DataMesh](mailto:integrations@datameshgroup.com) of any specific internet endpoint(s) that need to be available for access in production so it can be whitelisted by the SIM Card provider.

## Complete PVT

[Contact the DataMesh Integrations Team](mailto:integrations@datameshgroup.com) to orgainse a production verification testing window.

This process involves working with a DataMesh representative to pair your production Sale System build with a production POI Terminal, and running through some basic tests.

## Provide Production Support Information

Please provide the following production support information:

- POS Software Company, if applicable
- Name of the main contact person/team
- Contact details of the main contact person/team
- Alternate contact details (if the main contact is not available)
- Please describe the escalation process and provide any other useful information that we should provide when contacting the POS Software Support for the issue.  
(Our preference would be is to bypass 1st level and get direct to 2nd level.)

## Organise a pilot

Work with DataMesh to co-ordinate on a pilot site. 

- Before the pilot, ensure they have been updated to the correct Sale System version 
- If the POI Terminal will be utilising Wi-Fi, ensure it is available at all required locations in the pilot site
- Check that any network firewalls allow outgoing connections to ports 443, 4000, and 5000
- Ensure a Sale System support representative is available for the pilot 
- DataMesh will work with the customer to create the required accounts, configure and deliver terminals 
