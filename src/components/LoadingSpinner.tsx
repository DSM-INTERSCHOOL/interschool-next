interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  message = "Cargando...", 
  size = 'lg',
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md', 
    lg: 'loading-lg'
  };

  const content = (
    <div className="flex items-center justify-center">
      <div className={`loading loading-spinner ${sizeClasses[size]}`}></div>
      {message && <span className="ml-3">{message}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return content;
};
