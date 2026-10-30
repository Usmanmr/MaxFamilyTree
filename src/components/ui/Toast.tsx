import { Toaster, toast } from 'sonner';

export { toast };

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          error: 'bg-red-100 text-red-600 border-red-200',
          success: 'bg-green-100 text-green-600 border-green-200',
          warning: 'bg-yellow-100 text-yellow-600 border-yellow-200',
          info: 'bg-blue-100 text-blue-600 border-blue-200',
        },
      }}
    />
  );
}
