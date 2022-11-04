import { jsPDF } from "jspdf";
import './NotoSansHebrew';
import autoTable from "jspdf-autotable";
import fs from 'fs';

import moment from "moment";
import { DeliveryFormController } from "../driver-sign/delivery-form.controller";
import { imgData } from "./logo";



export function createPdfDocument(controller: DeliveryFormController) {
  const d = controller;
  const doc = new jsPDF();

  const now = new Date();
  const date = parseToFullDate(now);

  doc.setFont("NotoSansHebrew");

  doc.setFontSize(14);
  doc.text('בס"ד', 200, 10, {
    isInputRtl: false,
    isOutputRtl: true,
    align: 'right'
  });

  doc.setFontSize(14);
  doc.text(date, 10, 10, {
    align: 'left'
  });

  doc.addImage(imgData, 'JPEG', 85, 10, 50, 50)

  doc.text("תעודת איסוף – היוזמה הלאומית \"מתחשבים-  ציוד תרומה ל \"מתחשבים\"", 188, 70, {
    isInputRtl: false,
    isOutputRtl: true,
    align: 'right'
  });
  doc.line(45, 72, 189, 72);
  doc.setR2L(true);
  const head = [['תאריך ביצוע האיסוף', 'עיר', 'שם הגוף', 'שם בית חולים/שם המחוז']]
  const data = [
    [doLtr(parseToFullDateStr(d.driverSign?.date!)), d.city, d.name, d.hospitalName],
  ]

  autoTable(doc, {
    head: head,
    body: data,
    startY: 80, theme: 'grid',
    styles: {
      fillColor: 250,
      font: 'NotoSansHebrew',
      halign: 'right',
      textColor: 20
    },

    didDrawCell: (data: any) => {
    },
  });

  doc.setR2L(false);
  doc.text('פריטים שנאספו בפועל:', 148, 130, {
    isInputRtl: false,
    isOutputRtl: true,
    align: 'left'
  });
  doc.setR2L(true);
  const head2 = [['כמות בפועל', 'סוג פריט']]
  const data2 = d.items.filter(item => Number(item.actualQuantity) > 0).map(item => [[doLtr(item.actualQuantity)], [item.name]])

  autoTable(doc, {
    head: head2,
    body: data2,
    startY: 140, theme: 'grid',
    styles: {
      fillColor: 250,
      font: 'NotoSansHebrew',
      halign: 'right',
      textColor: 20
    },
    didDrawCell: (data: any) => {
    },
  });

  const head3 = [['שם הנהג', 'תאריך', 'איש קשר - נציג המוסד/החברה התורם', '']]
  const data3 = [[d.driverName, doLtr(parseToFullDateStr(d.driverSign?.date!)), d.contact, 'שם מלא']]
  autoTable(doc, {
    head: head3,
    body: data3,
    startY: 210,
    theme: 'grid',
    styles: {
      fillColor: 250,
      font: 'NotoSansHebrew',
      halign: 'right',
      textColor: 20
    },

    didDrawCell: (data: any) => {
    },
  });

  doc.setR2L(false);
  doc.text('בברכה,\n' +
    '\n' +
    'מיזם מתחשבים\n', 190, 250, {
    isInputRtl: false,
    isOutputRtl: true,
    align: 'right'
  });
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
  }
  doc.save(`./tmp/${d.id}.pdf`);
}

function doLtr(str: string) {
  return str.split('').reverse().join('');
}

function parseToFullDate(date: Date): string {
  const momObj = moment(date);
  return momObj.format('DD/MM/YYYY');
}

function parseToFullDateStr(date: string): string {
  return moment(date).format('DD/MM/YYYY');
}
