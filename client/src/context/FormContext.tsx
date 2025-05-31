import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FormData {
  merchandise: Record<string, any>;
  transport: Record<string, any>;
  event: Record<string, any>;
  restauration: Record<string, any>;
  studyTrip: Record<string, any>;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (page: keyof FormData, data: any) => void;
}

const initialFormData: FormData = {
  merchandise: {},
  transport: {},
  event: {},
  restauration: {},
  studyTrip: {},
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(() => {
    const savedData = localStorage.getItem('formData');
    return savedData ? JSON.parse(savedData) : initialFormData;
  });

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (page: keyof FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [page]: { ...prev[page], ...data },
    }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormProvider');
  }
  return context;
}
