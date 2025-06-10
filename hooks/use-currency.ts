import { useState } from "react"
import { CURRENCIES } from "@/lib/constants"

export function useCurrency() {
  const [currency, setCurrency] = useState("TZS")

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  return {
    currency,
    setCurrency,
    currentCurrency,
    currencies: CURRENCIES,
  }
} 