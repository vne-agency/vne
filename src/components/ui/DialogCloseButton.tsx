'use client'

import type { ComponentPropsWithRef } from 'react'
import { useSiteLanguage } from './SiteLanguage'
import styles from './DialogCloseButton.module.css'

type Props = Omit<ComponentPropsWithRef<'button'>, 'children' | 'className'>

export function DialogCloseButton(props: Props) {
  const { language } = useSiteLanguage()

  return (
    <button type="button" {...props} className={styles.button} data-dialog-close>
      <span>[{language === 'ru' ? 'закрыть' : 'close'}]</span>
      <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M4 4 12 12M12 4 4 12" />
      </svg>
    </button>
  )
}
