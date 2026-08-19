export interface VideoRoom {
  roomName: string;
  accessCode: string;
  joinUrl: string;
}

export interface VideoTokenInput {
  roomName: string;
  userId: string;
  userName: string;
  isDoctor: boolean;
}

export interface VideoProvider {
  createRoom(appointmentId: string): Promise<VideoRoom>;
  generateToken(input: VideoTokenInput): Promise<string>;
}
