import { remult } from 'remult'
import { Computer } from '../computers/computer'

export function getConfig() {
  let r = remult.repo(Computer).create()
  let stored = localStorage.getItem('config')
  if (stored) {
    const obj = JSON.parse(stored)
    r.$.status.inputValue = obj.status
    r.$.employee.inputValue = obj.employee
    r.$.recipient.inputValue = obj.recipient
    r.$.palletBarcode.inputValue = obj.palletBarcode
    r.$.employee.load()
  }
  return r
}
