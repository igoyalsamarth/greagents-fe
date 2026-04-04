import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const APP_LOGO_SRC = '/apple-touch-icon.png';

type AppBrandLinkProps = {
  to?: string;
  className?: string;
  /** Use "header" for larger title text (e.g. dashboard main area). */
  variant?: 'nav' | 'header';
};

export function AppBrandLink({
  to = '/',
  className,
  variant = 'nav',
}: AppBrandLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 font-semibold tracking-tight text-foreground',
        variant === 'nav' && 'text-sm',
        variant === 'header' && 'text-lg',
        className,
      )}
    >
      <img
        src={APP_LOGO_SRC}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-md object-contain"
      />
      <span>GreAgents</span>
    </Link>
  );
}
