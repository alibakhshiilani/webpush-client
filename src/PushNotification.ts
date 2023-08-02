export interface PushNotificationInterface {
  init: any
}

class PushNotification implements PushNotificationInterface {
  private isSupported() {
    if (!('serviceWorker' in navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      return false
    }

    if (!('PushManager' in window)) {
      // Push isn't supported on this browser, disable or hide UI.
      return false
    }

    return true
  }

  init() {
    if (this.isSupported()) {
      this.registerServiceWorker()
      this.accessPermission()
    }
  }

  private registerServiceWorker() {
    return navigator.serviceWorker
      .register('/service-worker.js')
      .then(function (registration) {
        console.log('Service worker successfully registered.')
        return registration
      })
      .catch(function (err) {
        console.error('Unable to register service worker.', err)
      })
  }

  private accessPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (result) {
        resolve(result)
      })

      if (permissionResult) {
        permissionResult.then(resolve, reject)
      }
    }).then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error("We weren't granted permission.")
      }
    })
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private subscribeUserToPush() {
    return navigator.serviceWorker
      .register('/service-worker.js')
      .then(function (registration) {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(''),
        }

        return registration.pushManager.subscribe(subscribeOptions)
      })
      .then(function (pushSubscription) {
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription))
        return pushSubscription
      })
  }
}

export default PushNotification
