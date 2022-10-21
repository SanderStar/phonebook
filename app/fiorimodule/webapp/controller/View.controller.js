sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    function (oController, oFragment, oMessageToast, oMessageBox) {
        "use strict";
        return oController.extend("creetion.training.cap.fiorimodule.controller.View", {

            openAddPhoneDialog: async function () {
                const oModel = this.getView().getModel();
                const oContext = { ID : this.getID(), type : "M"  };
                const oEntry = oModel.createEntry("/Phonebooks", { properties: oContext } );
                const oDialog = await this.getDialog();
                oDialog.setBindingContext(oEntry);
                oDialog.open();
            },
            getID: function(){
                return Math.floor(Math.random() * 1000);
            },
            getDialog: async function () {
                this.oDialog = await oFragment.load({
                    name: "creetion.training.cap.fiorimodule.view.AddPhoneDialog",
                    controller: this
                });
                const oModel = this.getView().getModel();
                this.oDialog.attachAfterClose(() => {
                    if (oModel.hasPendingChanges()) {
                        oModel.resetChanges();
                    }
                    this.oDialog.destroy();
                    this.oDialog = null;
                });
                this.getView().addDependent(this.oDialog);
                return this.oDialog;
            },
            onSaveDialog: async function () {
                try {
                    await this.handleSaveButton();
                    this.oDialog.close();
                } catch (oError) {
                    // Do Nothing... message already displayed...
                }
            },          
            onCancelDialog: function () {
                this.handleCancelButton();
                this.oDialog.close();
            },
            handleSaveButton: async function () {
                const oDeferred = $.Deferred();
                const oModel = this.getView().getModel();
                if (oModel.hasPendingChanges()) {
                    oModel.submitChanges({
                        success: (oResponse) => {
                            try {
                                const sRegex = /(403|500|502)/;
                                if (oResponse.__batchResponses.some(oItem => oItem.response.statusCode.match(sRegex))) {
                                    oMessageToast.show("Error processing phone data");
                                    oMessageBox.show(JSON.stringify(oResponse.__batchResponses));
                                    this.byId("PhoneTableId").setBusy(false);
                                    oDeferred.reject();
                                }else{
                                    oMessageToast.show("Phone succesfull saved");
                                    oDeferred.resolve();
                                }
                            } catch (oError) {
                                oMessageToast.show("Phone succesfull saved");
                                oDeferred.resolve();
                            }
                        },
                        error: (oError) => {
                            oMessageToast.show("Error processing phone data");
                            oMessageBox.show(JSON.stringify(oError));
                            oDeferred.reject();
                        }
                    });
                } else {
                    oMessageToast.show("There are no pending changes...");
                };
                return oDeferred.promise();
            },
            handleCancelButton: function () {
                const oModel = this.getView().getModel();
                if (oModel.hasPendingChanges()) {
                    oModel.resetChanges();
                    oMessageToast.show("All changes have been undone");
                }else{
                    oMessageToast.show("There are no pending changes...");
                };
            },
            handleDeleteButton: function(oEvent){
                const sPath = oEvent.getParameters().listItem.getBindingContext().getPath();
                const oModel = this.getView().getModel();
                oModel.remove(sPath, {
                    success: () => {       
                        oMessageToast.show("Phone succesfull deleted");
                    },
                    error: (oError) => {                        
                        oMessageToast.show("Error deleting phone data");
                        oMessageBox.show(JSON.stringify(oError));
                    }
                });
            },
            formatPhoneType: function (sType) {
                const oPhone = {};
                oPhone["H"] = "sap-icon://phone";
                oPhone["M"] = "sap-icon://iphone";
                oPhone["W"] = "sap-icon://building";
                return oPhone[sType] || "sap-icon://call";
            }
        });
    });


