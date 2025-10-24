import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils"; // helper untuk className

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = ({ className, children, ...props }) => (
    <DialogPrimitive.Portal className={cn(className)} {...props}>
        {children}
    </DialogPrimitive.Portal>
);

export const DialogOverlay = React.forwardRef(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Overlay
            ref={ref}
            className={cn(
                "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
                className
            )}
            {...props}
        />
    )
);
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed top-1/2 left-1/2 w-full max-w-lg p-6 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 focus:outline-none",
                    className
                )}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, children, ...props }) => (
    <div className={cn("mb-4", className)} {...props}>
        {children}
    </div>
);

export const DialogTitle = ({ className, children, ...props }) => (
    <DialogPrimitive.Title
        className={cn("text-lg font-semibold", className)}
        {...props}
    >
        {children}
    </DialogPrimitive.Title>
);

export const DialogDescription = ({ className, children, ...props }) => (
    <DialogPrimitive.Description
        className={cn("text-sm text-gray-500", className)}
        {...props}
    >
        {children}
    </DialogPrimitive.Description>
);

export const DialogFooter = ({ className, children, ...props }) => (
    <div
        className={cn("flex justify-end space-x-2 mt-4", className)}
        {...props}
    >
        {children}
    </div>
);
