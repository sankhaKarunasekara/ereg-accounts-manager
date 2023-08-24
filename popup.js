
// Inject the payload.js script into the current tab after the popout has loaded
window.addEventListener('load', function (evt) {
	chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, {
		file: 'payload.js'
	});;
});

// Listen to messages from the payload.js script and write to popout.html

var isSuspended = false;
var tab = "";
var vat = "";
var tin = "";
var type = "";
var newOrOld = ""
var completedOrIncomplete = "";
var activateTill = "";
var expiryDate = "";
var company = "";
var vat_exp = "";
var sms = "";
var email = "";
var remarks = "";
var vatWithError = "";
var expiredList = [];


chrome.runtime.onMessage.addListener(function ({
	COMPANY_NAME,
	TYPE,
	VAT_NO,
	TIN_NO,
	VAT_EXPIRY_DATE,
	SMS,
	EMAIL, TAB }) {

	tab = TAB;
	vat = VAT_NO;
	tin = TIN_NO;
	company = COMPANY_NAME;
	vat_exp = VAT_EXPIRY_DATE;
	sms = SMS;
	type = TYPE;
	email = EMAIL;

	//set the version on display
	// document.getElementById('VERSION').innerHTML = "(v" + chrome.app.getDetails().version + ")";

	// var digit13Vat = vat.replace(/[^0-9]/g, '');

	//verify VAT is a old vat number in the asycuda system
	// fetch("https://ereg.customs.gov.lk/registrations/trader/checkExpStatus", {
	// 	"headers": {
	// 		"accept": "application/json, text/javascript, */*; q=0.01",
	// 		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
	// 		"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
	// 		"x-requested-with": "XMLHttpRequest"
	// 	},
	// 	"method": "GET",
	// 	"mode": "cors",
	// }).then(r => r.json()).then(result => {
	// 	// Result now contains the response text, do what you want...
	// 	const list = result.data.filter(item => item.VALID_TO == "2022-08-01");
	// 	const tableBody = document.getElementById('EXPLIST');
	// 	list.forEach((item, index) => {
	// 		const row = document.createElement('tr');
	// 		row.innerHTML = `
	// 				<td>${index}</td>
	//                 <td style="height:10px; width:30px; margin:0;">${item.DEC_COD}</td>
	//                 <td style="height:10px; width:30px; margin:0;">${item.DEC_NAM}</td>
	//                 <td style="height:10px; width:30px; margin:0;">${item.DEC_ADR}</td>
	//             `;
	// 		tableBody.appendChild(row);
	// 	});
	// });
	//IRD suspended list

	document.getElementById('COMPANY_NAME').innerHTML = company;
	document.getElementById('VAT_NO').innerHTML = vat;
	document.getElementById('ACTIVATE_TILL_DATE').value = vat_exp;
	document.getElementById('TIN_NO').innerHTML = tin;

	if (TAB == "OTHER") {
		document.getElementById("generateExpListButton").addEventListener("click", geneareteExpList);
		document.getElementById('ALL_SECTION').hidden = false
		document.getElementById('COMPANY_SECTION').hidden = true
	} else {
		document.getElementById('ALL_SECTION').hidden = true
		document.getElementById('COMPANY_SECTION').hidden = false

		if (document.getElementById("ACTIVATE_TILL_DATE") != undefined) {
			document.getElementById("ACTIVATE_TILL_DATE").addEventListener("change", geneareteExpList);
		}

		var updateButton = document.getElementById('updateButton');
		var clearButton = document.getElementById('clearButton');

		var infoMessage = document.getElementById('INFO_MESSAGE');

		updateButton.addEventListener('click', async function () {
			await delay(3000);
			document.getElementById('EXP_DATE_SET').innerHTML =
				document.getElementById('ACTIVATE_TILL_DATE').value;
			infoMessage.style.display = 'block';
		});

		clearButton.addEventListener('click', async function () {
			document.getElementById('ACTIVATE_TILL_DATE').value = undefined;
			document.getElementById('ACTIVATE_FROM_DATE').value = undefined;
			infoMessage.style.display = 'none';
		});
	}

	function setFocusToRemarks() {
		document.getElementById('REMARKS').focus()
	}

	function sendEmail() {
		var toEmail = email;

		//TODO: encording using encodeURIComponent didn't work, although it converted the text, somehow it converted back to original form in the mail
		var encodedCompany = company.replaceAll("&", "and");

		var subject = `[ACTION REQUIRED] REACTIVATE YOUR SL CUSTOMS ASYCUDA ACCOUNT, M / S.${encodedCompany}(VAT: ${vat})`;

		// %0D%0A is the fancy newline charactor <br> or \n does not work
		var emailBody = `Dear Sir / Madam,
		% 0D % 0A
	% 0D % 0A
		Your trader account in Asycuda System scheduled to be deactivated on {{}} 
		This is in relation to the Sri Lanka Customs Electronic Registration profile you created on behalf of the company M / s.${encodedCompany}(TIN: ${tin}).
		% 0D % 0A 
		Best Regards, `;

		document.location = `mailto: ${toEmail} ? subject = ${subject} & body=${emailBody}`;
	}


	function sendCompanyEmail(companyName, companyEmail, vatNumber, date) {
		var toEmail = companyEmail;

		//TODO: encording using encodeURIComponent didn't work, although it converted the text, somehow it converted back to original form in the mail
		var encodedCompany = companyName.replaceAll("&", "and");

		var subject = `[ACTION REQUIRED] REACTIVATE YOUR SL CUSTOMS ASYCUDA ACCOUNT, M / S.${encodedCompany}(VAT: ${vatNumber})`;

		// %0D%0A is the fancy newline charactor <br> or \n does not work
		var emailBody = `Dear Sir / Madam,
		%0D%0A
		%0D%0A

		Your trader account in Asycuda System scheduled to be deactivated on ${date} 
		This is in relation to the Sri Lanka Customs Electronic Registration profile you created on behalf of the company M / s.${encodedCompany} (VAT: ${vatNumber}).
		
		%0D%0A
		%0D%0A

		Best Regards, 

		%0D%0A
		%0D%0A
		
		TIN VAT Unit
		%0D%0A
		SL Customs
		`;

		document.location = `mailto:${toEmail}?subject=${subject}&body=${emailBody}`;
	}


	function geneareteExpList() {

		expiryDate = document.getElementById('GET_EXPIRY_ON').value;

		// document.getElementById('REMARKS').innerHTML = activateTill

		fetch("https://ereg.customs.gov.lk/registrations/trader/checkExpStatus", {
			"headers": {
				"accept": "application/json, text/javascript, */*; q=0.01",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"x-requested-with": "XMLHttpRequest"
			},
			"method": "GET",
			"mode": "cors",
		}).then(r => r.json()).then(result => {
			// Result now contains the response text, do what you want...
			const list = result.data.filter(item => item.VALID_TO == expiryDate);
			expiredList = list;
			const tableBody = document.getElementById('EXPLIST');
			document.getElementById('EXPLIST').innerHTML = "";

			list.forEach((item, index) => {
				const row = document.createElement('tr');
				// const companyName = item.DEC_NAM.replace(/\W/g, '')
				// const companyName = item.DEC_NAM;
				row.innerHTML = `
    <td>${index}</td>
    <td style="height:10px; width:30px; margin:0; padding:5px; border: 1px solid #ddd;">${item.DEC_COD}</td>
    <td style="height:10px; width:30px; margin:0; padding:5px; border: 1px solid #ddd;">${item.DEC_NAM}</td>
    <td style="height:10px; width:30px; margin:0; padding:5px; border: 1px solid #ddd;">${item.DEC_ADR}</td>
    <td style="padding:5px; border: 1px solid #ddd;"><button id="button-${index}" style="padding:5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
	SEND EMAIL</button></td>
`;
				tableBody.appendChild(row);
				// document.getElementById(`button-${index}`).addEventListener("click", sendCompanyEmail(item.DEC_COD, "text@gmail.com", companyName));
				document.getElementById(`button-${index}`).addEventListener("click", sendCompanyEmail.bind(null, item.DEC_NAM, "text@gmail.com", item.DEC_COD, activateTill));
			});

			// document.getElementById('EXLIST2').innerHTML = JSON.stringify(list);
		});
	}


	const delay = ms => new Promise(res => setTimeout(res, ms));


});
