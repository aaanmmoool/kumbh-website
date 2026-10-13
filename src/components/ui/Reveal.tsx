import { m, type HTMLMotionProps } from 'motion/react'

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; y?: number }

/**
 * Fades content up once as it enters the viewport. Used sparingly: for a
 * section's opening statement, not for every element. `data-reveal` lets the
 * <noscript> style in index.html show content when JavaScript is off.
 */
export function Reveal({ delay = 0, y = 28, children, ...props }: RevealProps) {
  return (
    <m.div
      data-reveal=""
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </m.div>
  )
}

/**
 * Slides a heading up from behind a mask — the "rising from the water" move.
 * The viewport is observed on the mask itself: the moving line starts fully
 * clipped, so observing it directly would never report it as visible.
 */
export function MaskedHeading({
  as: Tag = 'h2',
  id,
  className = '',
  children,
}: {
  as?: 'h2' | 'h3'
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tag id={id} className={className}>
      <m.span
        className="block overflow-hidden pb-[0.1em]"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      >
        <m.span
          data-reveal=""
          className="block"
          variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </m.span>
      </m.span>
    </Tag>
  )
}
