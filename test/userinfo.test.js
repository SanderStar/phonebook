const oCds = require("@sap/cds");

const sServiceName = "PhonebookService";
const sEntity = "Phonebooks";
const sServiceFile = "phonebook.service";
const sUnittest = `${sServiceName} - ${sEntity}`;

describe(sUnittest, () => {

    // supertest > odata request 
    describe("ODATA Protocol Level Testing", () => {
        const oApp = require("express")();
        const oRequest = require("supertest")(oApp);
        
        const sDisplayUser = "ZGlzcGxheVVzZXI6Y3JlZXRpb24="; // base64 > displayUser:creetion
        const sChangeUser  = "Y2hhbmdlVXNlcjpjcmVldGlvbg=="; // base64 > changeUser:creetion
        const sNoRolesUser  = "bm9Sb2xlc1VzZXI6Y3JlZXRpb24="; // base64 > noRolesUser:creetion

        beforeAll(async () => {
            await oCds.deploy(`${__dirname}/../srv/${sServiceFile}`).to("sqlite::memory:");
            await oCds.serve(sServiceName).from(`${__dirname}/../srv/${sServiceFile}`).in(oApp);
        });

        it("should return a $metadata document", async () => {
            // Arrange
            const sExpectedVersion = "<edmx:Edmx Version=\"4.0\" xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\">";
            const sExpectedFunctionUserInfo = `<EntitySet Name="${sEntity}" EntityType="${sServiceName}.${sEntity}"`;

            // Act
            const oResponse = await oRequest
                .get("/phonebook/$metadata")
                .set("Authorization", `Basic ${sDisplayUser}`)
                .expect("Content-Type", /^application\/xml/)
                .expect(200);

            // Assert
            const nExpectedAssertions = 2;

            expect.assertions(nExpectedAssertions);
            expect(oResponse.text.includes(sExpectedVersion)).toBeTruthy();
            expect(oResponse.text.includes(sExpectedFunctionUserInfo)).toBeTruthy();

        });
        
        it("should NOT return a $metadata document for unknown user", async () => {
            // Assert
            await oRequest
                .get("/phonebook/$metadata")
                .expect("Content-Type", /^application\/json/)
                .expect(401);
        });

        describe("Phonebook", () => {
            // SUPERTEST IN > CALL > OUT
            it("should return isMobile true when type equals 'M'", async () => {
                // Act
                const oResponse = await oRequest
                    .get("/phonebook/Phonebooks")
                    .set("Authorization", `Basic ${sDisplayUser}`)
                    .expect("Content-Type", /^application\/json/)
                    .expect(200);

                // Assert
                const aValues = oResponse.body.value;
                
                expect.assertions(aValues.length);

                aValues.forEach((oItem) => {
                    if(oItem.type === "M"){
                        expect(oItem.isMobile).toBeTruthy();
                    }else{
                        expect(oItem.isMobile).toBeFalsy();
                    }
                });
            });
        });
    });

    // JEST > individuele functions testen
    describe("CDS Service Level Testing", () => {
        let oSrv, oTx, Phonebooks;

        beforeAll(async () => {
            oSrv = await oCds.serve(sServiceName).from(`${__dirname}/../srv/${sServiceFile}`);
            ({ Phonebooks } = oSrv.entities);

            oTx = oSrv.tx({ user: new cds.User.Privileged() });
        });

        beforeEach(() => {
            // When needed...
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should have Phonebooks entity", () => {
            // Assert
            expect(Phonebooks).toBeDefined();
        });



        describe("READ Phonebooks", () => {
            it("should call and check isMobile always returns FALSE", async () => {
                // Arrange
                const aPhonebooks = [
                    { ID: 9111, name: "Woutdejong"},
                    { ID: 9112, name: "Woutdejong"},
                ]

                jest.spyOn(oSrv, "beforePhonebookCreate").mockReturnValue();
                
                await oTx.run(INSERT.into(Phonebooks).entries(aPhonebooks));

                jest.spyOn(oSrv, "getIsMobileValue").mockReturnValue(false);

                // Act
                const aResult = await oTx.run(SELECT.from(Phonebooks).where({ name: "Woutdejong" }))

                // Assert
                expect(aResult[0].isMobile).toBeFalsy();
                expect(aResult[1].isMobile).toBeFalsy();

                // Delete record
                await oTx.run(DELETE.from(Phonebooks).where({ name: "Woutdejong" }));
            });

            it("should call and check isMobile always returns TRUE", async () => {
                // Arrange
                const aPhonebooks = [
                    { ID: 9111, name: "Woutdejong"},
                    { ID: 9112, name: "Woutdejong"},
                ]

                jest.spyOn(oSrv, "beforePhonebookCreate").mockReturnValue();

                await oTx.run(INSERT.into(Phonebooks).entries(aPhonebooks));

                jest.spyOn(oSrv, "getIsMobileValue").mockReturnValue(true);

                // Act
                const aResult = await oTx.run(SELECT.from(Phonebooks).where({ name: "Woutdejong" }))

                // Assert
                expect(aResult[0].isMobile).toBeTruthy();
                expect(aResult[1].isMobile).toBeTruthy();
            });
        });

        describe("getIsMobileValue", () => {
            it("should return true when type equals mobile", () => {
                // Act
                const bActual = oTx.getIsMobileValue("M");

                // Assert
                expect(bActual).toBeTruthy();
            });
            
            it("should return false when type not equals mobile", () => {
                // Act
                const bActual = oTx.getIsMobileValue("X");

                // Assert
                expect(bActual).toBeFalsy();
            });
            
            it("should return false when type equals empty string", () => {
                // Act
                const bActual = oTx.getIsMobileValue("");

                // Assert
                expect(bActual).toBeFalsy();
            });
            
            it("should return false when type equals null", () => {
                // Act
                const bActual = oTx.getIsMobileValue(null);

                // Assert
                expect(bActual).toBeFalsy();
            });
            
            it("should return false when type equals undefined", () => {
                // Act
                const bActual = oTx.getIsMobileValue(undefined);

                // Assert
                expect(bActual).toBeFalsy();
            });
        });
    });
});