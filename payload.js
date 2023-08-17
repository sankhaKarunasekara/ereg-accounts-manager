// send the page title as a chrome message

var details = getCompanyDetails();
chrome.runtime.sendMessage(details);


var VAT_NO = "";
var TIN_NO = "";
var COMPANY_NAME = "";
var TYPE = "";

var VAT_EXPIRY_DATE = "";
var SMS = "";
var isImp = "";
var isExp = "";
var isCha = "";
var isBOI = "";

function getCompanyDetails() {
    var TAB = ((window.location.href == 'https://ereg.customs.gov.lk/registrations/adminApplicationView') || (window.location.href == 'https://ereg.customs.gov.lk/registrations/application')) ? "COMPANY" : "OTHER"
    // var TAB = window.location.href;

    try {

        var VAT_NO = document.getElementsByName("BAS_TVP_VAT")[0].value;
        var TIN_NO = document.getElementsByName("BAS_TVP_TIN")[0].value;

        var COMPANY_NAME = document.getElementsByName("BAS_BID_NAM")[0]
            .value;

        var TYPE = "";

        var VAT_EXPIRY_DATE = document.getElementsByName("BAS_TVP_VAT_EXP")[0]
            .value;
        var SMS = document.getElementsByName("DEC_SMS_NUM")[0]
            .value;

        var isImp = document.getElementsByName("BAS_BID_PRA_IMP")[0]
            .checked

        var isExp = document.getElementsByName("BAS_BID_PRA_EXP")[0]
            .checked;

        var isCha = document.getElementsByName("BAS_BID_PRA_CCA")[0]
            .checked;

        var isBOI = document.getElementsByName("BAS_BID_PRA_BOI")[0]
            .checked;


        if (isImp) {
            TYPE = "".concat('IMPORTER')
        }

        if (isExp) {
            if (TYPE == "") {
                TYPE = "".concat('EXPORTER')
            } else {
                TYPE = TYPE.concat('/EXPORTER')
            }
        }
        if (isCha) {
            if (TYPE == "") {
                TYPE = "".concat('DECLARANT')
            } else {
                TYPE = TYPE.concat('/DECLARANT')
            }
        }

        if (isBOI) {
            if (TYPE == "") {
                TYPE = TYPE.concat('BOI')
            } else {
                TYPE = TYPE.concat('/BOI')
            }
        }

        //Email mentioned in the declaration section
        var EMAIL = document.getElementsByName("DEC_EML_DES")[0].value;

    } catch (e) {

    }

    return {
        COMPANY_NAME: COMPANY_NAME,
        TAB: TAB,
        TYPE: TYPE,
        VAT_NO: VAT_NO,
        TIN_NO: TIN_NO,
        VAT_EXPIRY_DATE: VAT_EXPIRY_DATE,
        SMS: SMS,
        EMAIL: EMAIL
    }
}