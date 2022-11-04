import { Entity, Fields, IdEntity, Remult } from 'remult';
import * as fetch from 'node-fetch';

export async function sendSms(phone: string, message: string, remult: Remult): Promise<any> {
    let un = process.env["SMS_UN"];
    let pw = process.env["SMS_PW"];
    let accid = process.env["SMS_ACCID"];
    var from = 'Mitchashvim';
    if (!accid)
      return;
    phone = phone.replace(/\D/g, '');


    var t = new Date();
    var date = t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();




    const send = async () => {

        try {
            {
                message = message.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');


                let data =
                    '<?xml version="1.0" encoding="utf-8"?>' +
                    '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
                    '<soap12:Body>' +
                    '<sendSmsToRecipients xmlns="apiItnewsletter">' +
                    '<un>' + un + '</un>' +
                    '<pw>' + pw + '</pw>' +
                    '<accid>' + accid + '</accid>' +
                    '<sysPW>' + 'itnewslettrSMS' + '</sysPW>' +
                    '<t>' + date + '</t>' +
                    '<txtUserCellular>' + from + '</txtUserCellular>' +
                    '<destination>' + phone + '</destination>' +
                    '<txtSMSmessage>' + message + '</txtSMSmessage>' +
                    '<dteToDeliver></dteToDeliver>' +
                    '<txtAddInf>jsnodetest</txtAddInf>' +
                    '</sendSmsToRecipients>' +
                    '</soap12:Body>' +
                    '</soap12:Envelope>';
                let h = new fetch.Headers();
                h.append('Content-Type', 'text/xml; charset=utf-8');
                h.append('SOAPAction', 'apiItnewsletter/sendSmsToRecipients');
                let r = await fetch.default('https://sapi.itnewsletter.co.il/webservices/webservicesms.asmx', {
                    method: 'POST',
                    headers: h,
                    body: data
                });

                let res = await r.text();
                let orig = res;
                let t = '<sendSmsToRecipientsResult>';
                let i = res.indexOf(t);
                if (i >= 0) {
                    res = res.substring(i + t.length);
                    res = res.substring(0, res.indexOf('<'));
                }
                console.log('sms response:' + res);
                return res;
            }

        }
        catch (err: any) {
            console.error('sms error ', err);
            return err;
        }
    }
    let apiResponse = await send();

    await remult.repo(SmsHistory).insert({
        apiResponse,
        message,
        phone
    });
    if (apiResponse && typeof apiResponse !== "string")
        apiResponse = JSON.stringify(apiResponse);
    console.log({ apiResponse });
    return apiResponse;
}

@Entity('SmsHistory', { allowApiCrud: false, allowApiRead: false })
export class SmsHistory extends IdEntity {
    @Fields.date()
    createDate = new Date();
    @Fields.string({})
    message = '';
    @Fields.object({ allowApiUpdate: false })
    apiResponse: any;
    @Fields.string()
    phone = '';
}
