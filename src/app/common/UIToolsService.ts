import { Injectable, NgZone, ErrorHandler } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { YesNoQuestionComponent } from './yes-no-question/yes-no-question.component'
import {
  CommonUIElementsPluginsService,
  openDialog,
  SelectValueDialogComponent,
} from 'common-ui-elements'
import { terms } from '../terms'
import { SelectDonorArgs, UITools } from './UITools'
import { TextAreaDataControlComponent } from './textarea-data-control/textarea-data-control.component'
import { SelectDonorComponent } from '../select-donor/select-donor.component'

@Injectable()
export class UIToolsService implements UITools {
  constructor(
    zone: NgZone,
    private snackBar: MatSnackBar,
    commonUIPlugin: CommonUIElementsPluginsService,
  ) {
    this.mediaMatcher.addListener((mql) =>
      zone.run(() => /*this.mediaMatcher = mql*/ ''.toString()),
    )
    this.enhanceFieldOptionsAndDataControlOptions(commonUIPlugin)
  }

  info(info: string): any {
    this.snackBar.open(info, 'close', { duration: 4000 })
  }
  async error(err: any) {
    return await openDialog(
      YesNoQuestionComponent,
      (d) =>
        (d.args = {
          message: extractError(err),
          isAQuestion: false,
        }),
    )
  }
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: 720px)`)

  isScreenSmall() {
    return this.mediaMatcher.matches
  }
  async yesNoQuestion(question: string) {
    return await openDialog(
      YesNoQuestionComponent,
      (d) => (d.args = { message: question }),
      (d) => d.okPressed,
    )
  }
  async confirmDelete(of: string) {
    return await this.yesNoQuestion(
      terms.areYouSureYouWouldLikeToDelete + ' ' + of + '?',
    )
  }
  async selectValuesDialog<T extends { caption?: string }>(args: {
    values: T[]
    onSelect: (selected: T) => void
    title?: string
  }): Promise<void> {
    await openDialog(SelectValueDialogComponent, (x) => x.args(args))
  }
  async selectDonor(args: SelectDonorArgs) {
    await openDialog(SelectDonorComponent, (x) => (x.args = args))
  }
  private enhanceFieldOptionsAndDataControlOptions(
    commonUIPlugin: CommonUIElementsPluginsService,
  ) {
    commonUIPlugin.dataControlAugmenter = (fieldMetadata, options) => {
      if (fieldMetadata.options.clickWithUI) {
        if (!options.click) {
          options.click = (entity, fieldRef) =>
            fieldMetadata.options.clickWithUI!(this, entity, fieldRef)
        }
      }
      if (fieldMetadata.options.valueList && !options.valueList)
        options.valueList = fieldMetadata.options.valueList
      if (fieldMetadata.options.customInput) {
        fieldMetadata.options.customInput({
          textarea() {
            options.customComponent = {
              component: TextAreaDataControlComponent,
            }
          },
        })
      }
      if (fieldMetadata.options.width)
        if (options.width === undefined)
          options.width = fieldMetadata.options.width
    }
  }
}
@Injectable()
export class ShowDialogOnErrorErrorHandler extends ErrorHandler {
  constructor(private ui: UIToolsService, private zone: NgZone) {
    super()
  }
  lastErrorString = ''
  lastErrorTime!: number
  override async handleError(error: any) {
    if (
      error.message.startsWith('ExpressionChangedAfterItHasBeenCheckedError') ||
      error.message.startsWith('NG0100')
    )
      return
    super.handleError(error)
    if (
      this.lastErrorString == error.toString() &&
      new Date().valueOf() - this.lastErrorTime < 100
    )
      return
    this.lastErrorString = error.toString()
    this.lastErrorTime = new Date().valueOf()
    this.zone.run(() => {
      this.ui.error(error)
    })
  }
}

export function extractError(err: any): string {
  if (typeof err === 'string') return err
  if (err.modelState) {
    if (err.message) return err.message
    for (const key in err.modelState) {
      if (err.modelState.hasOwnProperty(key)) {
        const element = err.modelState[key]
        return key + ': ' + element
      }
    }
  }
  if (err.rejection) return extractError(err.rejection) //for promise failed errors and http errors
  if (err.message) {
    let r = err.message
    if (err.error && err.error.message) r = err.error.message
    return r
  }
  if (err.error) return extractError(err.error)

  return JSON.stringify(err)
}
