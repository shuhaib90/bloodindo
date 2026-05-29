import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Identifier and password are required' }, { status: 400 });
    }

    const isPhone = /^[\d\+\-\s]+$/.test(identifier);

    let query = supabase.from('bloodindo_profiles').select('*');
    if (isPhone) {
      const normalizedPhone = identifier.replace(/\D/g, '').slice(-10);
      query = query.like('phone', `%${normalizedPhone}`);
    } else {
      query = query.eq('username', identifier);
    }
    
    const { data: user, error: fetchError } = await query.single();
    
    if (fetchError || !user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ success: false, message: 'Account requires social login or OTP.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials. Incorrect password.' }, { status: 401 });
    }

    // Update login status
    await supabase.from('bloodindo_profiles').update({ is_logged_in: true }).eq('id', user.id);

    const safeUser = { ...user, is_logged_in: true };
    delete safeUser.password_hash;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
