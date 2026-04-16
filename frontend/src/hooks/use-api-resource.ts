import { startTransition, useEffect, useState } from 'react'

type ResourceState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected API error'
}

export function useApiResource<T>(loader: () => Promise<T>): ResourceState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    void loader()
      .then((result) => {
        if (!isActive) {
          return
        }
        startTransition(() => {
          setData(result)
          setError(null)
          setIsLoading(false)
        })
      })
      .catch((reason: unknown) => {
        if (!isActive) {
          return
        }
        startTransition(() => {
          setError(getErrorMessage(reason))
          setIsLoading(false)
        })
      })

    return () => {
      isActive = false
    }
  }, [loader])

  return { data, error, isLoading }
}
