import * as React from 'react'

import { cn } from '../../lib/utils'

type AlertVariant = 'warning' | 'success'

const variantStyles: Record<AlertVariant, string> = {
  warning: 'alert-warning',
  success: 'alert-success',
}

export function Alert({
  className,
  variant = 'warning',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return <div role="alert" className={cn('alert-base', variantStyles[variant], className)} {...props} />
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('alert-title', className)} {...props} />
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('alert-description', className)} {...props} />
}
