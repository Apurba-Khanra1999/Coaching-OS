'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a production app, you might show a more user-friendly message
      // or redirect. For development in Studio, we surface the context.
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Operation ${error.context.operation} at ${error.context.path} was rejected by security rules.`,
      });
      
      // We also throw to trigger the Next.js error overlay in development
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
