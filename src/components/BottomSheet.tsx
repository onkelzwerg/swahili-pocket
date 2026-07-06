import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { T } from "@/config/translations";

export function BottomSheet({
  open,
  onClose,
  eyebrow,
  title,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="mx-auto flex h-full max-w-md flex-col"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div>
                {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
                <h2 className="font-display text-lg font-semibold">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
                aria-label={T.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {children}
            </div>

            {footer && (
              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border bg-background px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
