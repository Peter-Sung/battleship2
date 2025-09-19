import { createClient } from '@supabase/supabase-js';

// 중요: 이 값들을 실제 Supabase 프로젝트의 URL과 Anon Key로 교체해주세요.
// Supabase 대시보드의 'Settings' > 'API' 메뉴에서 찾을 수 있습니다.
const supabaseUrl = 'https://ntjcqmdxeipkxmzxewlg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50amNxbWR4ZWlwa3htenhld2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTg4MTMsImV4cCI6MjA3MzczNDgxM30.lwe9e7l4y8QBYedE0N_IY2-enpHeUKqQt2JEOig4IYM';

// FIX: This check is commented out because the placeholder values have been replaced,
// which was causing an unintentional type error.
/* if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase URL과 Anon Key가 설정되지 않았습니다. utils/supabase.ts 파일을 수정해주세요.');
} */

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
