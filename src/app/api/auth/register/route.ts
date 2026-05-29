import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password, name, bloodGroup, city } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Identifier and password are required' }, { status: 400 });
    }

    const isPhone = /^[\d\+\-\s]+$/.test(identifier);
    const phone = isPhone ? identifier : '';
    const username = !isPhone ? identifier : '';

    let query = supabase.from('bloodindo_profiles').select('id');
    if (isPhone) {
      const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
      query = query.like('phone', `%${normalizedPhone}`);
    } else {
      query = query.eq('username', username);
    }
    
    const { data: existingUser } = await query.single();
    
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'An account with this identifier already exists.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customUserId = 'custom_' + Date.now() + Math.floor(Math.random() * 1000);

    const { data: newUser, error: insertError } = await supabase.from('bloodindo_profiles').insert({
      id: customUserId,
      phone: phone || null,
      username: username || null,
      password_hash: passwordHash,
      name: name || (isPhone ? 'New User' : username),
      blood_group: bloodGroup || '',
      city: city || '',
      is_logged_in: true,
      streak: 0,
      points: 0,
      donations_count: 0,
      badges: []
    }).select().single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ success: false, message: 'Database error creating account: ' + insertError.message }, { status: 500 });
    }

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
