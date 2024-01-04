import { useEffect, useState } from 'react'

export const useBaseUrl = () => {
  const [origin, setOrigin] = useState('/')
  useEffect(() => {
    let url = window.location.origin
    if (url.includes('github')) {
      url = `${url}/platon`
    }
    setOrigin(url)
  }, [])
  return origin
}
