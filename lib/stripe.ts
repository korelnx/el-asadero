import Stripe from 'stripe'

// Server-side Stripe client — never import this in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

// Price helpers
export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function toDollars(cents: number): number {
  return cents / 100
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
