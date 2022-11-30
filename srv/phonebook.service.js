const oCds = require("@sap/cds");

class PhonebookService extends oCds.ApplicationService {
    async init() {
        //const oDb = await oCds.connect.to("db");
        //const { Phonebooks } = oDb.entities;

        this.before("CREATE", "Phonebooks", (oReq) => {
            this.beforePhonebookCreate(oReq);
        });

        this.beforePhonebookCreate = (oReq) => {
            const oData = oReq.data;

            if (!oData.number) {
                oReq.reject(500, "Number is required");
            }
        }

        this.before("READ", "Phonebooks", (oReq) => {
            // PERFORM CHECKS BEFORE CALLING DATABASE
            if(oReq.user.id === "change"){
                // Do something...
                // Authorisatie checks uitvoeren op data zelf
            }
        });
    
        // DATABASE > PHONEBOOKS OPHALEN
    
        this.after("READ", "Phonebooks", (aPhoneBook, oReq) => {
            // MANIPULATE DATA AFTER RETRIEVE AND BEFORE SEND BACK TO FIORI
            const bResult = Array.isArray(aPhoneBook);
            let aResults;
            if (bResult) {
                // Read delivers array
                aResults = aPhoneBook;
            } else {
                // Create delivers object
                aResults = [ aPhoneBook ];
            }
            console.log(aResults);
            aResults.forEach((oPhone) => {
                const bIsMobile = this.getIsMobileValue(oPhone.type);
                if (bIsMobile) {
                    oPhone.isMobile = true;
                } else {
                    oPhone.isMobile = false;
                }
            })
        });

        this.getIsMobileValue = (sType) => {
            return (sType === "M");
        }
        
        this.on("getUserInfo", (oReq) => {
            const bIsDisplay = oReq.user.is("display");
            const bIsChange = oReq.user.is("change");

            return {
                userID: oReq.user.id,
                role: bIsChange ? "CHANGE" : bIsDisplay ? "DISPLAY" : null
            };
        });

        await super.init();
    }
}

module.exports = { PhonebookService };

