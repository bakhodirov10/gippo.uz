import { VideoProvider, VideoRoom, VideoTokenInput } from '../../../common/interfaces/video-provider.interface';
export declare class MockVideoProvider implements VideoProvider {
    createRoom(appointmentId: string): Promise<VideoRoom>;
    generateToken(input: VideoTokenInput): Promise<string>;
}
