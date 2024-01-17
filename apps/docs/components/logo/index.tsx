import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useBaseUrl } from '../../hooks'
import LogoImg from '../../public/platon.svg'
import styles from './style.module.css'

export const Logo = () => {
  const baseUrl = useBaseUrl()
  return (
    <div className={styles.container}>
      <Link href={baseUrl}>
        <Image className={styles.logo} src={LogoImg} alt="Logo" width={48} height={48} />
      </Link>
      Documentation PLaTon
    </div>
  )
}
