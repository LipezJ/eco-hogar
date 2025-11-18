import * as React from "react"

/**
 * Evalúa una media query y devuelve true/false reactivo.
 * @param query cadena de media query, ej. "(max-width: 768px)".
 * @returns boolean que cambia al hacerlo el match de la media query.
 */
export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}
