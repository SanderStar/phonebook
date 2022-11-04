module.exports = (oSrv) => {

    oSrv.before("READ", "Phonebooks", (oReq) => {
        // PERFORM CHECKS BEFORE CALLING DATABASE
        if(oReq.user.id === "change"){
            // Do something...
            // Authorisatie checks uitvoeren op data zelf
        }
    });

    // DATABASE > PHONEBOOKS OPHALEN

    oSrv.after("READ", "Phonebooks", (aPhoneBook, oReq) => {
        // MANIPULATE DATA AFTER RETRIEVE AND BEFORE SEND BACK TO FIORI
        aPhoneBook.forEach((oPhone) => {
            oPhone.isMobile = (oPhone.type === "M");
        })
    });

    
    oSrv.on("getUserInfo", (oReq) => {
        const bIsDisplay = oReq.user.is("display");
        const bIsChange = oReq.user.is("change");

        return {
            userID: oReq.user.id,
            role: bIsChange ? "CHANGE" : bIsDisplay ? "DISPLAY" : null
        };
    });
};