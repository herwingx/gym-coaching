import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'two-up': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        orientation?: 'horizontal' | 'vertical';
      }, HTMLElement>;
    }
  }
}
