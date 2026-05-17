import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models/User';
import { hashPassword, verifyPassword, decrypt } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  return handlePasswordChange(req, params);
}

async function handlePasswordChange(
  req: NextRequest,
  params: Promise<{ userId: string }>,
) {
  try {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { userId } = await params;
    const { password, confirmPassword } = await req.json();

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'La contraseña y su confirmación son obligatorias' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 },
      );
    }

    if (payload.userId === userId) {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propia contraseña desde aquí' },
        { status: 403 },
      );
    }

    await connectDB();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    const isSamePassword = await verifyPassword(password, targetUser.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    await User.findByIdAndUpdate(userId, { passwordHash });

    console.info(
      JSON.stringify({
        ts: new Date().toISOString(),
        event: 'admin_password_change',
        adminId: payload.userId,
        adminUsername: payload.username,
        targetUserId: userId,
        targetUsername: targetUser.username,
      }),
    );

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
