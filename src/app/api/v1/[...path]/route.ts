import { ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { server } from '@/server/container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CurrentUser = { id: string; email: string; role: string };
type Context = { params: Promise<{ path: string[] }> };

const role = {
  patient: ['PATIENT'],
  doctor: ['DOCTOR'],
  admin: ['ADMIN', 'SUPER_ADMIN'],
  authenticated: ['PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
};

async function bodyOf(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const contentType = request.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? request.json() : {};
}

async function currentUser(request: NextRequest, required = false): Promise<CurrentUser | undefined> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    if (required) throw new UnauthorizedException('Authentication token required or invalid');
    return undefined;
  }

  try {
    const payload = await server.jwt.verifyAsync<{ sub: string; email: string; role: string }>(token, {
      secret: process.env.JWT_SECRET,
    });
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    if (required) throw new UnauthorizedException('Authentication token required or invalid');
    return undefined;
  }
}

function requireRole(user: CurrentUser | undefined, allowed: string[]) {
  if (!user) throw new UnauthorizedException('Authentication token required or invalid');
  if (user.role !== 'SUPER_ADMIN' && !allowed.includes(user.role)) {
    throw new ForbiddenException(`Insufficient privileges. Required role: ${allowed.join(' or ')}`);
  }
}

function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data, message: 'Operation successful', code: status }, { status });
}

function failure(error: unknown) {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    let message: string | undefined;
    let errorCode: string | undefined;

    if (typeof response === 'string') {
      message = response;
    } else if (response && typeof response === 'object') {
      const resObj = response as any;
      if (typeof resObj.error === 'object' && resObj.error?.message) {
        message = resObj.error.message;
        errorCode = resObj.error.code;
      } else if (resObj.message) {
        message = Array.isArray(resObj.message) ? resObj.message.join(', ') : resObj.message;
      }
    }

    message = message || error.message;
    return NextResponse.json(
      { success: false, data: null, message, error: errorCode || error.name, code: error.getStatus() },
      { status: error.getStatus() }
    );
  }

  console.error('API route failed', error);
  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ success: false, data: null, message, error: 'InternalServerError', code: 500 }, { status: 500 });
}

async function handle(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    const route = path.join('/');
    const query = request.nextUrl.searchParams;
    const payload = await bodyOf(request);
    const user = await currentUser(request);
    let result: unknown;
    let status = 200;

    switch (`${request.method} ${route}`) {
      case 'POST auth/register': result = await server.auth.registerPatient(payload); status = 201; break;
      case 'POST auth/register-admin':
        if (request.headers.get('x-admin-invite-secret') !== process.env.ADMIN_REGISTRATION_SECRET) throw new UnauthorizedException('Invalid admin invitation secret');
        result = await server.auth.registerAdmin(payload); status = 201; break;
      case 'POST auth/login': result = await server.auth.login(payload); break;
      case 'POST auth/refresh': result = await server.auth.refreshToken(payload); break;
      case 'POST auth/logout': requireRole(user, role.authenticated); result = await server.auth.logout(user!.id, payload.refreshToken); break;
      case 'POST auth/otp/send': result = await server.otp.sendOtp(payload.email as string, payload.type as any); break;
      case 'POST auth/otp/verify': result = await server.otp.verifyOtp(payload.email as string, payload.code as string, payload.type as any); break;
      case 'POST auth/forgot-password': result = await server.otp.forgotPassword(payload.email as string); break;
      case 'POST auth/reset-password': result = await server.otp.resetPassword(payload as any); break;
      case 'POST contact': result = await server.contact.submitMessage(payload as any); status = 201; break;

      case 'POST doctors/register': result = await server.doctors.registerDoctor(payload); status = 201; break;
      case 'GET doctors': result = await server.doctors.findPublicDoctors(query.get('specialtyId') ?? undefined, query.get('search') ?? undefined); break;
      case 'PATCH doctors/me': requireRole(user, role.doctor); result = await server.doctors.updateOwnProfile(user!.id, payload); break;
      case 'GET doctors/admin/pending': requireRole(user, role.admin); result = await server.doctors.findPendingApplications(); break;

      case 'GET appointments': requireRole(user, role.authenticated); result = await server.appointments.getUserAppointments(user!.id, user!.role); break;
      case 'POST appointments': requireRole(user, role.patient); result = await server.appointments.createAppointment(user!.id, payload); status = 201; break;
      case 'POST payments/create': requireRole(user, role.patient); result = await server.payments.createPayment(user!.id, payload); status = 201; break;
      case 'POST payments/webhook': result = await server.payments.handleWebhook(Object.fromEntries(request.headers.entries()), payload); break;
      case 'GET ledger/me': requireRole(user, role.doctor); result = await server.ledger.getDoctorLedger(user!.id); break;
      case 'POST ledger/withdraw': requireRole(user, role.doctor); result = await server.ledger.requestWithdrawal(user!.id, Number(payload.amount)); break;
      case 'POST reviews': requireRole(user, role.patient); result = await server.reviews.createReview(user!.id, payload); status = 201; break;
      case 'GET specialties': result = await server.specialties.findAll(); break;
      case 'POST specialties': requireRole(user, role.admin); result = await server.specialties.create(payload); status = 201; break;
      case 'POST ai/chat': result = await server.ai.processChat(user?.id, payload); break;
      case 'GET ai/conversations': requireRole(user, role.authenticated); result = await server.ai.getUserConversations(user!.id); break;
      case 'GET admin/analytics': requireRole(user, role.admin); result = await server.admin.getPlatformAnalytics(); break;
      case 'GET admin/users': requireRole(user, role.admin); result = await server.admin.getAllUsers(Number(query.get('page') ?? 1), Number(query.get('limit') ?? 20)); break;
      case 'GET admin/audit-logs': requireRole(user, role.admin); result = await server.auditLogs.findAll(Number(query.get('page') ?? 1), Number(query.get('limit') ?? 20)); break;
      default: result = await dynamicRoute(request, path, payload, user, query); status = request.method === 'POST' ? 201 : 200;
    }

    return ok(result, status);
  } catch (error) {
    return failure(error);
  }
}

async function dynamicRoute(request: NextRequest, path: string[], payload: Record<string, unknown>, user: CurrentUser | undefined, query: URLSearchParams) {
  const [resource, first, second, third] = path;
  if (request.method === 'GET' && resource === 'doctors' && first) return server.doctors.findPublicDoctorById(first);
  if (request.method === 'POST' && resource === 'doctors' && first === 'admin' && second && third === 'review') { requireRole(user, role.admin); return server.doctors.reviewDoctorApplication(user!.id, second, payload as never); }
  if (resource === 'appointments' && first) {
    requireRole(user, role.authenticated);
    if (request.method === 'GET') return server.appointments.getAppointmentById(first, user!.id, user!.role);
    if (request.method === 'POST' && second === 'cancel') return server.appointments.cancelAppointment(first, user!.id);
    if (request.method === 'POST' && second === 'complete') { requireRole(user, role.doctor); return server.appointments.completeAppointment(first, user!.id); }
  }
  if (request.method === 'GET' && resource === 'availability' && first === 'doctor' && second) return server.availability.getDoctorAvailability(second);
  if (request.method === 'PUT' && resource === 'availability' && first === 'me') { requireRole(user, role.doctor); return server.availability.setDoctorAvailability(user!.id, payload as never); }
  if (request.method === 'GET' && resource === 'reviews' && first === 'doctor' && second) return server.reviews.getDoctorReviews(second, Number(query.get('page') ?? 1), Number(query.get('limit') ?? 10));
  if (request.method === 'GET' && resource === 'ai' && first === 'conversations' && second) { requireRole(user, role.authenticated); return server.ai.getConversationById(second, user!.id); }
  if (request.method === 'GET' && resource === 'consultations' && first === 'appointment' && second && third === 'token') { requireRole(user, role.authenticated); return server.consultations.getSessionToken(second, user!.id); }
  if (request.method === 'GET' && resource === 'specialties' && first) return server.specialties.findOne(first);
  throw new NotFoundException('API endpoint not found');
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
