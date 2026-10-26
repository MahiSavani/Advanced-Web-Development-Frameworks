import { lazy } from 'react'

export default function lazyWithDelay(importFn, minDelay = 300) {
  return lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ]).then(([module]) => module),
  )
}