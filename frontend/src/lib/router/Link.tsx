import React, { type ReactNode, type MouseEvent } from 'react';
import { useRouter } from './context.hook';

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function Link({ href, children, className, style }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}