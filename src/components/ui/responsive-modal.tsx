import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export function ResponsiveModal({
  children,
  open,
  onOpenChange,
  title,
  description,
  trigger,
  showCloseButton = true,
  footer,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {title && <DrawerTitle className="text-left">{title}</DrawerTitle>}
                {description && (
                  <DrawerDescription className="text-left">
                    {description}
                  </DrawerDescription>
                )}
              </div>
              {showCloseButton && (
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              )}
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
          {footer && <DrawerFooter className="border-t">{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <div className="mt-6">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}