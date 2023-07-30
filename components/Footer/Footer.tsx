'use client'

import * as React from 'react'
import cs from 'clsx'

import * as config from '@/lib/config'
import { GitHub, Twitter } from '@/icons/index'

import styles from './styles.module.css'

export const Footer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={cs(styles.footer, className)}>
      <div className={styles.copyright}>
        Copyright 2023{' '}
        <a href={config.twitterUrl0} target='_blank' rel='noopener noreferrer'>
          {config.author0}
        </a>{' '}
        and{' '}
        <a href={config.twitterUrl1} target='_blank' rel='noopener noreferrer'>
          {config.author1}
        </a>
      </div>

      <div className={styles.social}>
        <a
          className={cs(styles.twitter, styles.action)}
          href={config.twitterUrl1}
          title={`Twitter ${config.twitter1}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <Twitter />
        </a>

        <a
          className={cs(styles.github, styles.action)}
          href={config.githubRepoUrl}
          title='View source on GitHub'
          target='_blank'
          rel='noopener noreferrer'
        >
          <GitHub />
        </a>
      </div>
    </footer>
  )
}
