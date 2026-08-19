import { Injectable } from '@nestjs/common';
import {
  VideoProvider,
  VideoRoom,
  VideoTokenInput,
} from '../../../common/interfaces/video-provider.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockVideoProvider implements VideoProvider {
  async createRoom(appointmentId: string): Promise<VideoRoom> {
    const roomName = `gippo_room_${appointmentId.slice(0, 8)}_${Date.now()}`;
    const accessCode = uuidv4().slice(0, 8);
    const joinUrl = `https://video.gippo.uz/room/${roomName}?code=${accessCode}`;

    return {
      roomName,
      accessCode,
      joinUrl,
    };
  }

  async generateToken(input: VideoTokenInput): Promise<string> {
    // Generate secure mock JWT video token for video room authentication
    const payload = Buffer.from(
      JSON.stringify({
        room: input.roomName,
        user: input.userId,
        name: input.userName,
        isDoctor: input.isDoctor,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour token
      }),
    ).toString('base64');

    return `vtoken.${payload}.sig_${uuidv4().slice(0, 8)}`;
  }
}
