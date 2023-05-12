import { atom } from 'recoil'

import { UpdateStoreValues } from '@main/modules/update/stores/update.store'

export const updateStore = atom<UpdateStoreValues & { version: string }>({
  key: 'update',
  default: (async () => {
    return {
      version: await window.electron.getVersion(),
      status: await window.electron.getUpdaterStatus(),
    }
  })(),
})
