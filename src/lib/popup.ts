export interface PopupConfigOptions {
  /**
   * The number of seconds to wait for a popup response before
   * throwing a timeout error. Defaults to 300s
   */
  timeoutInSeconds?: number

  /**
   * Accepts an already-created popup window to use. If not specified, the SDK
   * will create its own. This may be useful for platforms like iOS that have
   * security restrictions around when popups can be invoked (e.g. from a user click event)
   */
  popup?: any
  type: 'auth' | 'sign'
}

const DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS = 300

export const openPopup = (url = ''): any => {
  const width = 375
  const height = 660
  const left = window.screenX + (window.innerWidth - width) / 2
  const top = window.screenY + (window.innerHeight - height) / 2

  return window.open(
    url,
    'everpay:authorize:popup',
    `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
  )
}

export const runPopup = async (
  config: PopupConfigOptions
): Promise<any> =>
  await new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let popupEventListener: any
    // eslint-disable-next-line prefer-const
    let timeoutId: any
    // Check each second if the popup is closed triggering a PopupCancelledError
    const popupTimer = setInterval(() => {
      if ((Boolean(config.popup)) && (Boolean(config.popup.closed))) {
        clearInterval(popupTimer)
        clearTimeout(timeoutId)
        window.removeEventListener('message', popupEventListener, false)
        reject(new Error('POPUP_CLOSED'))
      }
    }, 1000)

    timeoutId = setTimeout(() => {
      clearInterval(popupTimer)
      reject(new Error('AUTHORIZE_TIMEOUT'))
      window.removeEventListener('message', popupEventListener, false)
    }, (config.timeoutInSeconds != null ? config.timeoutInSeconds : DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS) * 1000)

    popupEventListener = (e: MessageEvent) => {
      if (!e.origin.includes('everpay.io') && !e.origin.includes('localhost')) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!e.data || typeof e.data !== 'string') {
        return
      }

      let data: any = {}

      try {
        data = JSON.parse(e.data)
      } catch {}

      if (data.type !== config.type) {
        return
      }

      clearTimeout(timeoutId)
      clearInterval(popupTimer)
      window.removeEventListener('message', popupEventListener, false)
      config.popup.close()

      if (data.err != null) {
        reject(new Error(data.err))
      }

      resolve(data.data)
    }

    window.addEventListener('message', popupEventListener)
  })
