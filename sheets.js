// sheets.js

const { GoogleSpreadsheet } = require('google-spreadsheet')
const creds = require('./google-creds.json')

const SHEET_ID = process.env.SHEET_ID

async function logHelpRequest({ user, device, issue, time }) {
  const doc = new GoogleSpreadsheet(SHEET_ID)
  await doc.useServiceAccountAuth(creds)
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  await sheet.addRow({ User: user, Device: device, Issue: issue, Time: time })
}

module.exports = { logHelpRequest }
