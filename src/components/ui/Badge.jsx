import { cn } from '../../lib/helpers';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-cinema-card text-cinema-text-secondary',
    primary: 'bg-cinema-accent text-cinema-dark',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
