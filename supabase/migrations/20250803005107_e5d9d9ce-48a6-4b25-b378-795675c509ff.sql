-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Insert default categories for new user
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (NEW.id, 'Salário', 'income', '#10B981'),
    (NEW.id, 'Freelance', 'income', '#059669'),
    (NEW.id, 'Vendas', 'income', '#0D9488'),
    (NEW.id, 'Alimentação', 'expense', '#EF4444'),
    (NEW.id, 'Transporte', 'expense', '#F97316'),
    (NEW.id, 'Lazer', 'expense', '#8B5CF6'),
    (NEW.id, 'Saúde', 'expense', '#EC4899'),
    (NEW.id, 'Casa', 'expense', '#6366F1'),
    (NEW.id, 'Educação', 'expense', '#06B6D4');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';