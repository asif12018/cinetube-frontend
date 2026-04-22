import React from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "danger" | "warning" | "success";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isPending = false,
  variant = "danger"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          iconContainer: "bg-green-600/20 border-green-600/30",
          button: "bg-green-600 hover:bg-green-700 shadow-green-600/20"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          iconContainer: "bg-yellow-600/20 border-yellow-600/30",
          button: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20"
        };
      case "danger":
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          iconContainer: "bg-red-600/20 border-red-600/30",
          button: "bg-red-600 hover:bg-red-700 shadow-red-600/20"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${styles.iconContainer}`}>
          {styles.icon}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <div className="text-gray-400 mb-8">{message}</div>
        
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isPending}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold tracking-wide transition-all"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 text-white py-3 rounded-lg font-bold tracking-wide shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${styles.button}`}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
