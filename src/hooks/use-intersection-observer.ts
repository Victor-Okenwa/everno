import { useEffect, useState } from "react"

interface UseIntersectionObserverProps {
  target: React.RefObject<Element>
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

export function useIntersectionObserver({
  target,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseIntersectionObserverProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const node = target?.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
          setEntry(entry)
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [target, root, rootMargin, threshold])

  return { isIntersecting, entry }
}